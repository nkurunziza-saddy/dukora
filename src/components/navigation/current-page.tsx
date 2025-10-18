"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export function CurrentPage() {
  const pathname = usePathname();

  const generateBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.slice(1).map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const formattedSegment =
        segment.charAt(0).toUpperCase() + segment.slice(1);

      return (
        <Fragment key={segment.toString()}>
          <BreadcrumbItem key={href}>
            <BreadcrumbLink href={href}>{formattedSegment}</BreadcrumbLink>
          </BreadcrumbItem>
          {segments.length - 1 !== index + 1 && <BreadcrumbSeparator />}
        </Fragment>
      );
    });
  };

  return (
    <div className="flex justify-between items-center gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">/</BreadcrumbLink>
          </BreadcrumbItem>
          {pathname !== "/" && <BreadcrumbSeparator />}
          {generateBreadcrumbs()}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
