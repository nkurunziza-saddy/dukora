import { type NextRequest, NextResponse } from "next/server";
import * as categoryService from "@/server/actions/category-actions";

export async function GET() {
  try {
    const categories = await categoryService.getCategories({});
    if (categories.error) {
      return NextResponse.json(categories.error, { status: 500 });
    }
    return NextResponse.json(categories.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to get categories", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const category = await request.json();
    const newCategory = await categoryService.upsertCategory(category);
    if (newCategory.error) {
      return NextResponse.json(newCategory.error, { status: 500 });
    }
    return NextResponse.json(newCategory.data);
  } catch (error) {
    console.error(error);
    return NextResponse.json("Failed to create category", { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { category, categoryId } = await request.json();
    const updatedCategory = await categoryService.updateCategory({
      categoryId,
      updates: category,
    });
    if (updatedCategory.error) {
      return NextResponse.json(updatedCategory.error, { status: 500 });
    }
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
    if (r.error) {
      return NextResponse.json(r.error, { status: 500 });
    }
    return NextResponse.json(r.data);
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json("Failed to delete category", { status: 500 });
  }
}
