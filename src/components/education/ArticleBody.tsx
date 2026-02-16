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
        "prose prose-lg max-w-prose mx-auto",
        "prose-headings:font-display prose-headings:font-semibold",
        "prose-p:leading-relaxed prose-p:mb-5",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};
