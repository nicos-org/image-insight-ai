import { cn } from "@/lib/utils";

interface ChatBubbleProps {
  message: string;
  side?: "left" | "right";
  className?: string;
}

export const ChatBubble = ({ message, side = "left", className }: ChatBubbleProps) => {
  const isRight = side === "right";

  return (
    <div className={cn("not-prose my-4 flex", isRight ? "justify-end" : "justify-start", className)}>
      <div className="relative inline-block max-w-[38rem] rounded-2xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground shadow-sm">
        <p className="m-0 leading-relaxed">{message}</p>
        <span
          aria-hidden="true"
          className={cn(
            "absolute -bottom-2 h-4 w-4 rotate-45 border-border bg-muted/40",
            isRight ? "right-8 border-l border-t" : "left-8 border-b border-r"
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "absolute -bottom-4 h-2.5 w-2.5 rounded-full border border-border bg-muted/40",
            isRight ? "right-6" : "left-6"
          )}
        />
      </div>
    </div>
  );
};
