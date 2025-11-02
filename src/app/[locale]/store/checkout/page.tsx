import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CartProvider } from "@/contexts/cart-context";
import { getProducts } from "@/server/actions/product-actions";
import { CheckoutForm } from "./_components/checkout-form";
import { OrderSummary } from "./_components/order-summary";

interface CheckoutPageProps {
  searchParams: {
    items?: string;
  };
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const t = await getTranslations("store.checkout");

  // Get cart items from URL params (for guest checkout)
  let cartItems: Array<{
    productId: string;
    quantity: number;
  }> = [];

  if (searchParams.items) {
    try {
      cartItems = JSON.parse(decodeURIComponent(searchParams.items));
    } catch (error) {
      console.error("Failed to parse cart items:", error);
      redirect("/store");
    }
  }

  // If no items, redirect to store
  if (cartItems.length === 0) {
    redirect("/store");
  }

  // Get product details for cart items
  const productIds = cartItems.map((item) => item.productId);
  const productsResult = await getProducts({
    page: 1,
    pageSize: 100,
    productIds,
  });

  if (productsResult.error || !productsResult.data) {
    redirect("/store");
  }

  // Match cart items with product data
  const cartProducts = cartItems
    .map((cartItem) => {
      const product = productsResult.data?.find(
        (p) => p.id === cartItem.productId
      );
      if (!product) return null;

      return {
        ...product,
        quantity: cartItem.quantity,
      };
    })
    .filter(Boolean);

  // Check stock availability
  const outOfStockItems = cartProducts.filter((item) => {
    if (!item) return true;
    const stock =
      typeof item === "object" && "quantityAvailable" in item
        ? (item as any).quantityAvailable
        : undefined;
    return (
      stock === undefined || stock === null || stock < (item as any).quantity
    );
  });

  if (outOfStockItems.length > 0) {
    redirect("/store/cart?error=out_of_stock");
  }
  return (
    <CartProvider>
      <div className="checkout-container">
        <div className="checkout-header">
          <h1 className="checkout-title">{t("store_checkout.title")}</h1>
          <p className="checkout-desc">{t("store_checkout.description")}</p>
        </div>
        <div className="checkout-content">
          <div className="checkout-form-panel">
            <CheckoutForm cartProducts={cartProducts} />
          </div>
          <div className="checkout-summary-panel">
            <OrderSummary cartProducts={cartProducts} />
          </div>
        </div>
      </div>
    </CartProvider>
  );
}
