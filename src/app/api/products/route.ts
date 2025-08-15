import { NextRequest, NextResponse } from "next/server";
import * as productService from "@/server/actions/product-actions";
import { ErrorCode } from "@/server/constants/errors";

export async function GET() {
  try {
    const products = await productService.getProducts({});
    if (products.error) {
      return NextResponse.json(products.error, { status: 500 });
    }
    return NextResponse.json(products.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const product = await request.json();
    const newProduct = await productService.createProduct(product);
    if (newProduct.error) {
      return NextResponse.json(newProduct.error, { status: 500 });
    }
    return NextResponse.json(newProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { product, productId } = await request.json();
    const updatedProduct = await productService.updateProduct({
      productId: productId,
      updates: product,
    });
    if (updatedProduct.error) {
      return NextResponse.json(updatedProduct.error, { status: 500 });
    }
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const r = await productService.deleteProduct(id);
    if (r.error) {
      return NextResponse.json(r.error, { status: 500 });
    }
    return NextResponse.json(r.data);
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(ErrorCode.DATABASE_ERROR, { status: 500 });
  }
}
