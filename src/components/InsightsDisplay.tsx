import { Sparkles, AlertCircle } from "lucide-react";

interface InsightsDisplayProps {
  insights: string | null;
  isLoading: boolean;
  error: string | null;
}

export const InsightsDisplay = ({
  insights,
  isLoading,
  error,
}: InsightsDisplayProps) => {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          AI Insights
        </h3>
      </div>

      <div className="min-h-[200px] rounded-xl bg-muted/50 border border-border p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary spinner" />
            <p className="text-muted-foreground text-sm animate-pulse">
              Analyzing your images...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-destructive text-sm text-center">{error}</p>
          </div>
        ) : insights ? (
          <div className="prose prose-invert max-w-none animate-fade-in">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {insights}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground text-sm">
              Insights will appear here after analysis.
            </p>
            <p className="text-muted-foreground/60 text-xs mt-2">
              Upload images and click "Extract Insights" to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
