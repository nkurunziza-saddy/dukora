"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormDialog } from "../form-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { createProduct, updateProduct } from "@/server/db/repos/product";
import type { SelectProduct } from "@/database/schema";

const formSchema = z.object({
  title: z.string().min(3, "Title is required"),
  author: z.string().min(2, "Author is required"),
  isbn: z.string().min(2, "ISBN is required"),
  category: z.string().min(2, "Category is required"),
  quantity: z.coerce.number().min(0, "Quantity must be 0 or greater"),
});

const categories = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "History",
  "Biography",
  "Literature",
  "Reference",
] as const;

export default function CreateProduct({
  product,
}: {
  product?: SelectProduct;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: product ? product.title : "",
      author: product ? product.author : "",
      isbn: product ? product.isbn : "",
      category: product ? product.category : "",
      quantity: product && product.quantity !== null ? product.quantity : 1,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const productRecord = product
        ? await updateProduct({ ...values, id: product.id })
        : await createProduct(values);
      if (productRecord) {
        toast.success(`Product has been ${product ? "updated" : "created"}`, {
          description: format(new Date(), "EEEE MM yyyy h:mm a"),
        });
        form.reset();
      }
    } catch (error) {
      toast.error(`Failed to ${product ? "update" : "create"} product`, {
        description: "Please try again",
      });
      console.error(error);
    }
  }
  const { isSubmitting } = form.formState;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., The Great Gatsby" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="author"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <FormControl>
                <Input placeholder="e.g., F. Scott Fitzgerald" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isbn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ISBN</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 978-3-16-148410-0" {...field} />
              </FormControl>
              <FormDescription>
                International Standard Product Number
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="e.g., Fiction" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input type="number" min="0" placeholder="e.g., 5" {...field} />
              </FormControl>
              <FormDescription>Number of copies available</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? `${product ? "Updating" : "Creating"} ...`
            : `${product ? "Update" : "Create"} product`}
        </Button>
      </form>
    </Form>
  );
}

export const CreateProductDialog = () => {
  return (
    <FormDialog
      title="Create New Product"
      triggerText="Create Product"
      description="Fill in the details of the new product you want to add to the library."
    >
      <CreateProduct />
    </FormDialog>
  );
};
