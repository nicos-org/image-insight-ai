import { useEffect, useId, useState } from "react";
import mermaid from "mermaid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MermaidDiagramProps {
  chart: string;
  darkMode?: boolean;
  className?: string;
}

const getMermaidTheme = (darkMode: boolean) => (darkMode ? "dark" : "default");

export const MermaidDiagram = ({ chart, darkMode = false, className }: MermaidDiagramProps) => {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const diagramId = useId().replace(/[^a-zA-Z0-9-_]/g, "");

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      setError("");
      setSvg("");

      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: getMermaidTheme(darkMode),
          fontFamily: "inherit",
          flowchart: {
            htmlLabels: false,
            curve: "basis",
          },
        });

        const { svg: renderedSvg } = await mermaid.render(
          `edu-mermaid-${diagramId}`,
          chart.trim()
        );

        if (isMounted) {
          setSvg(renderedSvg);
        }
      } catch {
        if (isMounted) {
          setError("Unable to render dependency diagram.");
        }
      }
    };

    void renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, darkMode, diagramId]);

  return (
    <div
      className={cn(
        "not-prose my-8 w-full",
        "sm:relative sm:left-1/2 sm:w-[min(72rem,calc(100%+26rem))] sm:-translate-x-1/2",
        className
      )}
    >
      <Card
        className={cn(
          "overflow-hidden border-border/70",
          darkMode
            ? "bg-gradient-to-br from-slate-900/80 via-card to-card"
            : "bg-gradient-to-br from-sky-50 via-card to-muted/40"
        )}
      >
        <CardContent className="p-0">
          <div className="border-b border-border/60 px-5 py-3">
            <Badge variant="secondary">System Dependency Map</Badge>
          </div>
          <div className="overflow-x-auto px-4 py-5 md:px-6 md:py-6">
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : svg ? (
              <div
                className={cn(
                  "min-w-[760px] lg:min-w-[960px]",
                  "[&_svg]:h-auto [&_svg]:w-full [&_svg]:max-w-none",
                  "[&_svg]:mx-auto [&_svg]:font-sans"
                )}
                // SVG comes from trusted in-repo article content.
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Rendering diagram...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
