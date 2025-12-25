import { useState } from "react";
import { Sparkles, AlertCircle, FileText, Image, Pencil, Check, X } from "lucide-react";
import { Button } from "./ui/button";

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
  onUpdateContent?: (id: string, content: string) => void;
}

export const InsightsDisplay = ({
  insights,
  isLoading,
  error,
  selectedFileId,
  onSelectFile,
  onUpdateContent,
}: InsightsDisplayProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const selectedInsight = insights?.find((i) => i.id === selectedFileId) || insights?.[0];

  const handleStartEdit = (item: FileInsight) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

  const handleSaveEdit = () => {
    if (editingId && onUpdateContent) {
      onUpdateContent(editingId, editContent);
    }
    setEditingId(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const isEditing = editingId === selectedInsight?.id;

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
                  <div
                    key={item.id}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      selectedInsight?.id === item.id
                        ? "border-primary bg-primary/10"
                        : "border-border/50 bg-background/50 hover:border-border hover:bg-background"
                    }`}
                  >
                    <button
                      onClick={() => onSelectFile(item.id)}
                      className="flex items-center gap-3 flex-1 text-left"
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
                    {selectedInsight?.id === item.id && !isEditing && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleStartEdit(item)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Extracted Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Extracted Content
                </p>
                {isEditing && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleSaveEdit}
                    >
                      <Check className="w-4 h-4 text-green-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleCancelEdit}
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="p-4 rounded-lg border border-border/50 bg-background/50 min-h-[200px] max-h-[300px] overflow-y-auto">
                {selectedInsight ? (
                  isEditing ? (
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full h-full min-h-[180px] bg-transparent text-foreground text-sm leading-relaxed resize-none focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedInsight.content}
                    </p>
                  )
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
