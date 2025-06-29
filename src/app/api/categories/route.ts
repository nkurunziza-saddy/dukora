import { NextRequest, NextResponse } from "next/server";
import * as categoryService from "@/server/actions/category-actions";

export async function GET() {
  try {
    const categories = await categoryService.fetchCategories();
    return NextResponse.json(categories.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to get categories", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const category = await request.json();
    const newCategory = await categoryService.createCategory(category);
    return NextResponse.json(newCategory.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to create category", { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { category, categoryId } = await request.json();
    const updatedCategory = await categoryService.updateCategory(
      categoryId,
      category
    );
    return NextResponse.json(updatedCategory.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to update category", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const r = await categoryService.deleteCategory(id);
    return NextResponse.json(r.data);
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json("Failed to delete category", { status: 500 });
  }
}
