import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AiRiskComponent } from "@/components/education/AiRiskComponent";
import { ChatBubble } from "@/components/education/ChatBubble";
import { AlertTriangle } from "lucide-react";

interface ArticleBodyProps {
  content: string;
  darkMode?: boolean;
  className?: string;
  /** Custom components for markdown elements (e.g. a, code, blockquote). */
  components?: React.ComponentProps<typeof ReactMarkdown>["components"];
}

const WARNING_MARKER = "[!WARNING]";
const CHAT_MARKER = "[!CHAT]";
const CHAT_REPLY_MARKER = "[!CHAT_REPLY]";
const CHAT_MARKERS = [CHAT_MARKER, CHAT_REPLY_MARKER] as const;
const GEEK_MODE_STORAGE_KEY = "education_geek_mode";
const LLM_DEEP_DIVE_URL =
  "https://medium.com/data-science-at-microsoft/how-large-language-models-work-91c362f5b78f";
const RISK_WARNING_PREFIX = "depending on the complexity of the task given to the language model";

const extractText = (node: React.ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }
  if (React.isValidElement(node)) {
    return extractText(node.props.children);
  }
  return "";
};

type ChatSegment = {
  side: "left" | "right";
  message: string;
};

const parseChatSegments = (text: string): ChatSegment[] => {
  const markerPattern = CHAT_MARKERS.map((marker) =>
    marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  ).join("|");
  const markerRegex = new RegExp(`(${markerPattern})`, "g");
  const matches = [...text.matchAll(markerRegex)];

  if (matches.length === 0) return [];

  return matches
    .map((match, index) => {
      const marker = match[1];
      const markerEnd = (match.index ?? 0) + match[0].length;
      const nextMarkerStart = matches[index + 1]?.index ?? text.length;
      const message = text.slice(markerEnd, nextMarkerStart).trim();

      return {
        side: marker === CHAT_REPLY_MARKER ? ("right" as const) : ("left" as const),
        message,
      };
    })
    .filter((segment) => segment.message.length > 0);
};

export const ArticleBody = ({
  content,
  darkMode = false,
  className,
  components,
}: ArticleBodyProps) => {
  const baseBlockquote = components?.blockquote;
  const baseLink = components?.a;
  const [isGeekMode, setIsGeekMode] = useState(false);

  useEffect(() => {
    try {
      setIsGeekMode(localStorage.getItem(GEEK_MODE_STORAGE_KEY) === "true");
    } catch {
      setIsGeekMode(false);
    }
  }, []);

  const handleGeekModeToggle = (checked: boolean) => {
    setIsGeekMode(checked);
    try {
      localStorage.setItem(GEEK_MODE_STORAGE_KEY, String(checked));
    } catch {
      // Keep behavior functional in restricted environments where localStorage is unavailable.
    }
  };

  const markdownComponents: React.ComponentProps<typeof ReactMarkdown>["components"] = {
    ...components,
    blockquote: ({ children, ...props }) => {
      const text = extractText(children).trim();
      const isWarning = text.startsWith(WARNING_MARKER);
      const chatSegments = parseChatSegments(text);

      if (isWarning) {
        const warningText = text.slice(WARNING_MARKER.length).trim();
        const isRiskWarning = warningText
          .toLowerCase()
          .startsWith(RISK_WARNING_PREFIX);

        return (
          <>
            <Alert
              variant="warning"
              className={cn(
                "not-prose my-6",
                darkMode &&
                  "bg-card text-foreground border-amber-400/70 [&>svg]:text-amber-300"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className={cn(darkMode && "text-amber-300 font-semibold")}>
                Warning
              </AlertTitle>
              <AlertDescription
                className={cn(darkMode && "text-foreground text-base leading-7")}
              >
                {warningText}
              </AlertDescription>
            </Alert>
            {isRiskWarning && <AiRiskComponent />}
          </>
        );
      }

      if (chatSegments.length > 0) {
        return (
          <>
            {chatSegments.map((segment, index) => (
              <ChatBubble
                key={`${segment.side}-${index}-${segment.message}`}
                message={segment.message}
                side={segment.side}
              />
            ))}
          </>
        );
      }

      if (baseBlockquote) {
        return React.createElement(baseBlockquote as React.ElementType, props, children);
      }

      return <blockquote {...props}>{children}</blockquote>;
    },
    a: ({ href, children, ...props }) => {
      const isExternal = typeof href === "string" && /^https?:\/\//.test(href);
      const isLlmDeepDive =
        typeof href === "string" &&
        (href === LLM_DEEP_DIVE_URL ||
          href.includes(
            "medium.com/data-science-at-microsoft/how-large-language-models-work"
          ));

      if (isLlmDeepDive) {
        if (!isGeekMode) {
          return (
            <div
              className={cn(
                "not-prose my-8 rounded-xl border p-4 md:p-5",
                "bg-muted/30 border-border/70"
              )}
            >
              <p className="text-sm font-medium text-foreground">
                Want the technical deep dive?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Enable Geek Mode to reveal advanced reading recommendations.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => handleGeekModeToggle(true)}
              >
                Enable Geek Mode
              </Button>
            </div>
          );
        }

        return (
          <div className="not-prose my-8">
            <Card
              className={cn(
                "overflow-hidden border-border/80",
                "bg-gradient-to-br from-primary/10 via-card to-muted/40"
              )}
            >
              <CardContent className="p-0">
                <div className="border-b border-border/60 px-5 py-3">
                  <Badge variant="secondary">For the Curious</Badge>
                </div>
                <div className="space-y-4 px-5 py-5 md:px-6 md:py-6">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Deep Dive
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold leading-tight md:text-2xl">
                      How Large Language Models Work
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Understand what happens inside an LLM, not just how to prompt it.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Medium</Badge>
                    <Badge variant="outline">Microsoft</Badge>
                    <Badge variant="outline">12 min</Badge>
                    <Badge variant="outline">Intermediate</Badge>
                  </div>
                  <Button asChild className="w-full sm:w-auto">
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label="Read the deep dive article on Medium (opens in a new tab)"
                    >
                      Read the Deep Dive
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }

      if (baseLink) {
        return React.createElement(baseLink as React.ElementType, { href, ...props }, children);
      }

      return (
        <a
          href={href}
          {...props}
          target={isExternal ? "_blank" : props.target}
          rel={isExternal ? "noreferrer noopener" : props.rel}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <div
      className={cn(
        "prose prose-lg max-w-prose mx-auto",
        darkMode && "prose-invert",
        "prose-headings:font-display prose-headings:font-semibold",
        "prose-p:leading-relaxed prose-p:mb-5",
        className
      )}
    >
      <div
        className={cn(
          "not-prose mb-8 flex items-center justify-between gap-3 rounded-xl border px-4 py-3",
          "border-border/70 bg-muted/30"
        )}
      >
        <div>
          <p className="text-sm font-semibold text-foreground">Geek Mode</p>
          <p id="geek-mode-description" className="text-xs text-muted-foreground">
            Reveal advanced technical reading
          </p>
        </div>
        <Switch
          checked={isGeekMode}
          onCheckedChange={handleGeekModeToggle}
          aria-label="Toggle Geek Mode"
          aria-describedby="geek-mode-description"
        />
      </div>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
};
