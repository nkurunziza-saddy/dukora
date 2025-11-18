"use client";

import { createContext, useContext, useEffect, useReducer } from "react";
import { toast } from "sonner";
import type { CartItem as RawCartItem } from "@/lib/types";

type CartItem = RawCartItem & { quantity: number };

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id,
      );

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  Number(action.payload.availableStock),
                ),
              }
            : item,
        );

        return {
          ...state,
          items: updatedItems,
          totalItems: updatedItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
          ),
          totalPrice: updatedItems.reduce(
            (sum, item) => sum + Number(item.price) * item.quantity,
            0,
          ),
        };
      }

      const newItem: CartItem = {
        ...action.payload,
        quantity: 1,
      };

      const updatedItems = [...state.items, newItem];

      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce(
          (sum, item) => sum + Number(item.price) * item.quantity,
          0,
        ),
      };
    }

    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter(
        (item) => item.id !== action.payload,
      );

      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce(
          (sum, item) => sum + Number(item.price) * item.quantity,
          0,
        ),
      };
    }

    case "UPDATE_QUANTITY": {
      const updatedItems = state.items
        .map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                quantity: Math.min(
                  Math.max(action.payload.quantity, 0),
                  Number(item.availableStock),
                ),
              }
            : item,
        )
        .filter((item) => item.quantity > 0);

      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce(
          (sum, item) => sum + Number(item.price) * item.quantity,
          0,
        ),
      };
    }

    case "CLEAR_CART":
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };

    case "TOGGLE_CART":
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case "LOAD_CART": {
      const items = action.payload;
      return {
        ...state,
        items,
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: items.reduce(
          (sum, item) => sum + Number(item.price) * item.quantity,
          0,
        ),
      };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isOpen: false,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("dukora-cart");
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: "LOAD_CART", payload: cartItems });
      } catch (error) {
        console.error("Failed to load cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("dukora-cart", JSON.stringify(state.items));
  }, [state.items]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Cart actions
export function useCartActions() {
  const { dispatch } = useCart();

  const addItem = (item: Omit<CartItem, "quantity">) => {
    dispatch({ type: "ADD_ITEM", payload: item });
    toast.success("Item added to cart");
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
    toast.success("Item removed from cart");
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
    toast.success("Cart cleared");
  };

  const toggleCart = () => {
    dispatch({ type: "TOGGLE_CART" });
  };

  return {
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
  };
}
