"use client";
import type { ComponentProps, HTMLAttributes } from "react";
import { isValidElement, memo } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import hardenReactMarkdown from "harden-react-markdown";

const HardenedMarkdown = hardenReactMarkdown(ReactMarkdown);
export type ResponseProps = HTMLAttributes<HTMLDivElement> & {
  options?: Options;
  children: Options["children"];
  allowedImagePrefixes?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >["allowedImagePrefixes"];
  allowedLinkPrefixes?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >["allowedLinkPrefixes"];
  defaultOrigin?: ComponentProps<
    ReturnType<typeof hardenReactMarkdown>
  >["defaultOrigin"];
  parseIncompleteMarkdown?: boolean;
};
const components: Options["components"] = {
  ol: ({ node, children, className, ...props }) => (
    <ol
      className={cn(
        "list-decimal pl-5 mb-3 space-y-1 text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ node, children, className, ...props }) => (
    <li className={cn("leading-relaxed text-foreground", className)} {...props}>
      {children}
    </li>
  ),
  ul: ({ node, children, className, ...props }) => (
    <ul
      className={cn("list-disc pl-5 mb-3 space-y-1 text-foreground", className)}
      {...props}
    >
      {children}
    </ul>
  ),
  hr: ({ node, className, ...props }) => (
    <hr className={cn("my-4 border-border", className)} {...props} />
  ),
  p: ({ node, children, className, ...props }) => (
    <p
      className={cn("mb-3 leading-relaxed text-foreground", className)}
      {...props}
    >
      {children}
    </p>
  ),
  strong: ({ node, children, className, ...props }) => (
    <span className={cn("font-semibold text-foreground", className)} {...props}>
      {children}
    </span>
  ),
  a: ({ node, children, className, ...props }) => (
    <a
      className={cn("font-medium text-primary underline", className)}
      rel="noreferrer"
      target="_blank"
      {...props}
    >
      {children}
    </a>
  ),
  h1: ({ node, children, className, ...props }) => (
    <h1
      className={cn(
        "mt-4 mb-2 font-semibold text-xl text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ node, children, className, ...props }) => (
    <h2
      className={cn(
        "mt-3 mb-2 font-semibold text-lg text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ node, children, className, ...props }) => (
    <h3
      className={cn(
        "mt-2 mb-2 font-semibold text-base text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ node, children, className, ...props }) => (
    <h4
      className={cn(
        "mt-2 mb-2 font-medium text-base text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </h4>
  ),
  table: ({ node, children, className, ...props }) => (
    <div className="my-4 overflow-x-auto">
      <table
        className={cn("w-full border-collapse border border-border", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ node, children, className, ...props }) => (
    <thead className={cn("bg-muted/50", className)} {...props}>
      {children}
    </thead>
  ),
  tbody: ({ node, children, className, ...props }) => (
    <tbody className={cn("divide-y divide-border", className)} {...props}>
      {children}
    </tbody>
  ),
  tr: ({ node, children, className, ...props }) => (
    <tr className={cn("border-border border-b", className)} {...props}>
      {children}
    </tr>
  ),
  th: ({ node, children, className, ...props }) => (
    <th
      className={cn(
        "px-4 py-2 text-left font-semibold text-sm text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ node, children, className, ...props }) => (
    <td
      className={cn("px-4 py-2 text-sm text-foreground", className)}
      {...props}
    >
      {children}
    </td>
  ),
  blockquote: ({ node, children, className, ...props }) => (
    <blockquote
      className={cn(
        "my-4 border-muted-foreground/30 border-l-4 pl-4 text-muted-foreground italic",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ node, className, ...props }) => {
    const inline = node?.position?.start.line === node?.position?.end.line;
    if (!inline) {
      return <code className={className} {...props} />;
    }
    return (
      <code
        className={cn(
          "rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground",
          className
        )}
        {...props}
      />
    );
  },
  pre: ({ node, className, children }) => {
    let language = "javascript";
    if (typeof node?.properties?.className === "string") {
      language = node.properties.className.replace("language-", "");
    }
    let code = "";
    if (
      isValidElement(children) &&
      children.props &&
      typeof (children.props as Record<string, unknown>).children === "string"
    ) {
      code = (children.props as Record<string, unknown>).children as string;
    } else if (typeof children === "string") {
      code = children;
    }
    return (
      <pre
        className={cn(
          "my-4 h-auto overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-sm",
          className
        )}
      >
        <code className={`language-${language}`}>{code}</code>
      </pre>
    );
  },
};
export const Response = memo(
  ({
    className,
    options,
    children,
    allowedImagePrefixes,
    allowedLinkPrefixes,
    defaultOrigin,
    parseIncompleteMarkdown: shouldParseIncompleteMarkdown = true,
    ...props
  }: ResponseProps) => {
    return (
      <div
        className={cn(
          "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          className
        )}
        {...props}
      >
        <HardenedMarkdown
          allowedImagePrefixes={allowedImagePrefixes ?? ["*"]}
          allowedLinkPrefixes={allowedLinkPrefixes ?? ["*"]}
          components={components}
          defaultOrigin={defaultOrigin}
          rehypePlugins={[rehypeKatex]}
          remarkPlugins={[remarkGfm, remarkMath]}
          {...options}
        >
          {children}
        </HardenedMarkdown>
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
Response.displayName = "Response";
