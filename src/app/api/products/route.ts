import { NextRequest, NextResponse } from "next/server";
import * as productService from "@/server/actions/product-actions";

export async function GET() {
  try {
    const products = await productService.getProducts();
    return NextResponse.json(products.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to get products", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const product = await request.json();
    const newProduct = await productService.createProduct(product);
    return NextResponse.json(newProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to create product", { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { product, productId } = await request.json();
    const updatedProduct = await productService.updateProduct(
      productId,
      product
    );
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to update product", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const r = await productService.deleteProduct(id);
    return NextResponse.json(r);
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json("Failed to delete product", { status: 500 });
  }
}
