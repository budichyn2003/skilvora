"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className = "" }: MarkdownViewerProps) {
  return (
    <div className={`markdown-content text-fg ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-fg mt-6 mb-3 first:mt-0 font-display">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-fg mt-5 mb-2.5 first:mt-0 font-display">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold text-fg mt-4 mb-2 first:mt-0 font-display">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-bold text-fg mt-3 mb-1.5 first:mt-0">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-fg/90 leading-relaxed mb-4 text-sm md:text-base last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-4 space-y-1 text-fg/90 text-sm md:text-base">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-4 space-y-1 text-fg/90 text-sm md:text-base">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-turbo pl-4 py-2 my-4 text-muted italic bg-surface-2/40 rounded-r text-sm md:text-base">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-turbo underline hover:text-turbo-hover font-medium transition-colors"
            >
              {children}
            </a>
          ),
          hr: () => <hr className="border-line my-6" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 border border-line rounded-lg">
              <table className="w-full text-left text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-surface-2 border-b border-line text-xs uppercase text-muted">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-line">{children}</tbody>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 font-bold text-fg">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-fg/80">{children}</td>
          ),
          pre: ({ children }) => (
            <pre className="bg-surface-2 border border-line rounded-lg p-4 overflow-x-auto my-4 text-xs md:text-sm font-mono text-fg">
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className && typeof children === "string" && !children.includes("\n");
            if (isInline) {
              return (
                <code
                  className="bg-surface-2 text-turbo px-1.5 py-0.5 rounded text-xs md:text-sm font-mono border border-line"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

