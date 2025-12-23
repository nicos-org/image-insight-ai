import { Sparkles, AlertCircle, FileText, Image } from "lucide-react";

interface FileInsight {
  id: string;
  fileName: string;
  type: "image" | "text";
  preview?: string;
  content: string;
}

interface InsightsDisplayProps {
  insights: FileInsight[] | null;
  isLoading: boolean;
  error: string | null;
  selectedFileId: string | null;
  onSelectFile: (id: string) => void;
}

export const InsightsDisplay = ({
  insights,
  isLoading,
  error,
  selectedFileId,
  onSelectFile,
}: InsightsDisplayProps) => {
  const selectedInsight = insights?.find((i) => i.id === selectedFileId) || insights?.[0];

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

      <div className="min-h-[200px] rounded-xl bg-muted/50 border border-border p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 min-h-[200px]">
            <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary spinner" />
            <p className="text-muted-foreground text-sm animate-pulse">
              Analyzing your files...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 min-h-[200px]">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-destructive text-sm text-center">{error}</p>
          </div>
        ) : insights && insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {/* Left Column - File List */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Analyzed Files
              </p>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {insights.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectFile(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                      selectedInsight?.id === item.id
                        ? "border-primary bg-primary/10"
                        : "border-border/50 bg-background/50 hover:border-border hover:bg-background"
                    }`}
                  >
                    {item.type === "image" ? (
                      item.preview ? (
                        <img
                          src={item.preview}
                          alt={item.fileName}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                          <Image className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )
                    ) : (
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-foreground truncate">
                      {item.fileName}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column - Extracted Content */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Extracted Content
              </p>
              <div className="p-4 rounded-lg border border-border/50 bg-background/50 min-h-[200px] max-h-[300px] overflow-y-auto">
                {selectedInsight ? (
                  <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedInsight.content}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Select a file to view its extracted content.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center min-h-[200px]">
            <p className="text-muted-foreground text-sm">
              Insights will appear here after analysis.
            </p>
            <p className="text-muted-foreground/60 text-xs mt-2">
              Upload files and click "Extract Insights" to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
