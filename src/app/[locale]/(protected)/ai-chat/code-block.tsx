import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function CodeBlock({
  children,
  className,
  ...props
}: React.PropsWithChildren<
  { className?: string } & React.HTMLAttributes<HTMLElement>
>) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const isCodeBlock = match;
  const language = match ? match[1] : "text";

  const copyToClipboard = async () => {
    const text = String(children).replace(/\n$/, "");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightCode = (code: string, lang: string) => {
    if (!lang || lang === "text") return escapeHtml(code);

    const codeString = String(code);
    let highlighted = escapeHtml(codeString);

    const markers: { [key: string]: string } = {};
    let markerIndex = 0;

    const createMarker = (content: string, className: string) => {
      const marker = `__MARKER_${markerIndex++}__`;
      markers[marker] = `<span class="syntax-${className}">${content}</span>`;
      return marker;
    };

    const patterns = {
      javascript: [
        { pattern: /\/\/.*$/gm, className: "comment" },
        { pattern: /\/\*[\s\S]*?\*\//g, className: "comment" },
        { pattern: /"([^"\\]|\\.)*"/g, className: "string" },
        { pattern: /'([^'\\]|\\.)*'/g, className: "string" },
        { pattern: /`([^`\\]|\\.)*`/g, className: "string" },
        {
          pattern:
            /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|try|catch|finally)\b/g,
          className: "keyword",
        },
        { pattern: /\b(true|false|null|undefined)\b/g, className: "boolean" },
        { pattern: /\b\d+(\.\d+)?\b/g, className: "number" },
      ],
      typescript: [
        { pattern: /\/\/.*$/gm, className: "comment" },
        { pattern: /\/\*[\s\S]*?\*\//g, className: "comment" },
        { pattern: /"([^"\\]|\\.)*"/g, className: "string" },
        { pattern: /'([^'\\]|\\.)*'/g, className: "string" },
        { pattern: /`([^`\\]|\\.)*`/g, className: "string" },
        {
          pattern:
            /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|interface|type|extends|implements|async|await|try|catch|finally)\b/g,
          className: "keyword",
        },
        {
          pattern:
            /\b(string|number|boolean|any|void|never|unknown|object|Array)\b/g,
          className: "type",
        },
        { pattern: /\b(true|false|null|undefined)\b/g, className: "boolean" },
        { pattern: /\b\d+(\.\d+)?\b/g, className: "number" },
      ],
      python: [
        { pattern: /"""[\s\S]*?"""/g, className: "string" },
        { pattern: /'''[\s\S]*?'''/g, className: "string" },
        { pattern: /#.*$/gm, className: "comment" },
        { pattern: /"([^"\\]|\\.)*"/g, className: "string" },
        { pattern: /'([^'\\]|\\.)*'/g, className: "string" },
        {
          pattern:
            /\b(def|class|if|elif|else|for|while|import|from|return|try|except|finally|with|as|pass|break|continue|lambda|yield|and|or|not|in|is)\b/g,
          className: "keyword",
        },
        { pattern: /\b(True|False|None)\b/g, className: "boolean" },
        { pattern: /\b\d+(\.\d+)?\b/g, className: "number" },
      ],
      sql: [
        { pattern: /--.*$/gm, className: "comment" },
        { pattern: /\/\*[\s\S]*?\*\//g, className: "comment" },
        { pattern: /'([^'\\]|\\.)*'/g, className: "string" },
        {
          pattern:
            /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|TABLE|ALTER|DROP|INDEX|JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP|BY|ORDER|HAVING|UNION|DISTINCT|COUNT|SUM|AVG|MAX|MIN)\b/gi,
          className: "keyword",
        },
        {
          pattern:
            /\b(VARCHAR|INT|INTEGER|DECIMAL|FLOAT|DATE|DATETIME|TIMESTAMP|BOOLEAN|TEXT)\b/gi,
          className: "type",
        },
        { pattern: /\b\d+(\.\d+)?\b/g, className: "number" },
      ],
    };

    const langPatterns =
      patterns[lang as keyof typeof patterns] || patterns.javascript;

    langPatterns.forEach(({ pattern, className }) => {
      highlighted = highlighted.replace(pattern, (match) => {
        if (match.includes("__MARKER_")) {
          return match;
        }
        return createMarker(match, className);
      });
    });

    Object.keys(markers).forEach((marker) => {
      highlighted = highlighted.replace(
        new RegExp(marker, "g"),
        markers[marker],
      );
    });

    return highlighted;
  };

  const escapeHtml = (text: string) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

  if (isCodeBlock) {
    const codeElement = (
      <code
        className="text-sm font-mono"
        dangerouslySetInnerHTML={{
          __html: highlightCode(String(children), language),
        }}
      />
    );

    const styleElement = (
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .syntax-highlighter .syntax-keyword {
              color: #0066cc;
              font-weight: 600;
            }
            .syntax-highlighter .syntax-string {
              color: #cc3300;
            }
            .syntax-highlighter .syntax-number {
              color: #cc6600;
            }
            .syntax-highlighter .syntax-comment {
              color: #666666;
              font-style: italic;
            }
            .syntax-highlighter .syntax-boolean {
              color: #6600cc;
              font-weight: 600;
            }
            .syntax-highlighter .syntax-type {
              color: #0099cc;
            }

            /* Dark mode */
            .dark .syntax-highlighter .syntax-keyword {
              color: #66ccff;
            }
            .dark .syntax-highlighter .syntax-string {
              color: #ff6666;
            }
            .dark .syntax-highlighter .syntax-number {
              color: #ffcc66;
            }
            .dark .syntax-highlighter .syntax-comment {
              color: #999999;
            }
            .dark .syntax-highlighter .syntax-boolean {
              color: #cc99ff;
            }
            .dark .syntax-highlighter .syntax-type {
              color: #66ccff;
            }
          `,
        }}
      />
    );

    return (
      <div className="relative group my-4 border rounded-lg overflow-hidden bg-muted">
        <div className="flex items-center justify-between px-4 py-2 bg-muted/70  border-b">
          <span className="text-xs font-medium uppercase tracking-wide">
            {language}
          </span>
          <Button
            className="h-7 w-7 p-0 opacity-70 hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer rounded flex items-center justify-center"
            onClick={copyToClipboard}
          >
            {copied ? (
              <CheckIcon className="h-3 w-3" />
            ) : (
              <CopyIcon className="h-3 w-3" />
            )}
          </Button>
        </div>
        <pre className="overflow-x-auto p-4 text-sm bg-secondary syntax-highlighter">
          {codeElement}
        </pre>
        {styleElement}
      </div>
    );
  }

  return (
    <code
      className={`${className} border bg-secondary p-0.5 rounded-lg`}
      {...props}
    >
      {children}
    </code>
  );
}

export { CodeBlock };
