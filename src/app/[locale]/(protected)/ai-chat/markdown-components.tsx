import { CodeBlock } from "./code-block";

export const markdownComponents = {
  code: CodeBlock,
  p: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <p className="mb-4 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  h1: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <h1 className="text-xl font-bold mb-4 mt-6" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <h2 className="text-lg font-bold mb-3 mt-5" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <h3 className="text-md font-bold mb-3 mt-4" {...props}>
      {children}
    </h3>
  ),
  ul: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <ul className="list-disc pl-6 mb-4 space-y-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <li className="mb-1" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <blockquote className="border-l-4 border-muted pl-4 italic mb-4" {...props}>
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <div className="overflow-x-auto mb-4">
      <table
        className="min-w-full border-collapse border border-border"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <th
      className="border border-border bg-muted px-2 py-1 text-left font-medium"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <td className="border border-border px-2 py-1" {...props}>
      {children}
    </td>
  ),
  a: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href?: string }>) => (
    <a href={href} className="text-primary hover:underline" {...props}>
      {children}
    </a>
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-6 border-t border-border" {...props} />
  ),
  pre: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <pre className="mb-4" {...props}>
      {children}
    </pre>
  ),
};
