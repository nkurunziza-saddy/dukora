import { NextRequest, NextResponse } from "next/server";
import * as booksService from "@/server/books";

export async function GET() {
  try {
    const books = await booksService.getBooks();
    return Response.json(books);
  } catch (error) {
    console.error(error);
    return new Response("Failed to get books", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const book = await request.json();
    const newBook = await booksService.createBook(book);
    return Response.json(newBook);
  } catch (error) {
    console.error(error);
    return new Response("Failed to create book", { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    const updatedBook = await booksService.updateBookStatus(id, status);
    return Response.json(updatedBook);
  } catch (error) {
    console.error(error);
    return new Response("Failed to update book", { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { message: "Book ID is required" },
        { status: 400 }
      );
    }
    const r = await booksService.deleteBook(id);
    if (r.status === 204) return new Response(undefined, { status: r.status });
    return NextResponse.json(r.msg, { status: r.status });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json("Failed to delete book", { status: 500 });
  }
}
