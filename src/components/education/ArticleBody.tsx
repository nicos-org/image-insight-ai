import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface ArticleBodyProps {
  content: string;
  className?: string;
  /** Custom components for markdown elements (e.g. a, code, blockquote). */
  components?: React.ComponentProps<typeof ReactMarkdown>["components"];
}

export const ArticleBody = ({ content, className, components }: ArticleBodyProps) => {
  return (
    <div
      className={cn(
        "prose prose-lg prose-invert max-w-prose mx-auto text-white",
        "prose-headings:font-display prose-headings:font-semibold prose-headings:text-white",
        "prose-p:text-white prose-p:leading-relaxed prose-p:mb-5 prose-li:text-white prose-a:text-white prose-strong:text-white prose-blockquote:text-white prose-code:text-white prose-td:text-white prose-th:text-white",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};
