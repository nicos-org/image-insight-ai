import { useState } from "react";
import { Sparkles, AlertCircle, FileText, Image, Pencil, Check, X, FileInput } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "./ui/resizable";

interface FileInsight {
  id: string;
  fileName: string;
  type: "image" | "text";
  preview?: string;
  content: string;
  originalText?: string;
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

  const isDigitalNotes = (fileName: string) => fileName.startsWith("digital_notes");

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          Extracted insights for every file
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
          <div className="space-y-6 animate-fade-in">
            {/* Horizontal Carousel - File Cards */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Analyzed Files
              </p>
              <TooltipProvider>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {insights.map((item) => (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onSelectFile(item.id)}
                          className={`flex-shrink-0 flex flex-col items-center gap-2 p-3 rounded-lg border transition-all min-w-[80px] max-w-[100px] ${
                            selectedInsight?.id === item.id
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                              : "border-border/50 bg-background/50 hover:border-border hover:bg-background"
                          }`}
                        >
                          {item.type === "image" ? (
                            item.preview ? (
                              <img
                                src={item.preview}
                                alt={item.fileName}
                                className="w-12 h-12 rounded-md object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
                                <Image className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-primary" />
                            </div>
                          )}
                          <span className="text-xs font-medium text-foreground truncate w-full text-center">
                            {item.fileName}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.fileName}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            </div>

            {/* Extracted Content Display - Resizable Panels (Desktop) / Stacked (Mobile) */}
            {/* Desktop: Resizable Panels */}
            <div className="hidden lg:block min-h-[600px]">
              <ResizablePanelGroup direction="horizontal">
                {/* Left Panel - Currently Selected Image/Text */}
                <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                  <div className="h-full flex flex-col space-y-3 pr-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Currently Selected Image/Text
                    </p>
                    <div className={`flex-1 p-4 rounded-lg border border-border/50 bg-background/50 min-h-[300px] overflow-y-auto ${
                      selectedInsight?.type === "image" && selectedInsight?.preview 
                        ? "flex items-center justify-center" 
                        : ""
                    }`}>
                      {selectedInsight ? (
                        isDigitalNotes(selectedInsight.fileName) ? (
                          <div className="flex flex-col items-center justify-center gap-3 h-full min-h-[200px]">
                            <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center">
                              <FileInput className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-muted-foreground text-sm text-center">
                              no need to extract text from digital notes - see right panel
                            </p>
                          </div>
                        ) : selectedInsight.type === "image" ? (
                          selectedInsight.preview ? (
                            <img
                              src={selectedInsight.preview}
                              alt={selectedInsight.fileName}
                              className="w-full h-auto max-h-full object-contain rounded-md"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                              <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                                <Image className="w-8 h-8 text-muted-foreground" />
                              </div>
                              <p className="text-sm">Image preview not available</p>
                            </div>
                          )
                        ) : (
                          <div className="w-full">
                            <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                              {selectedInsight.originalText || "No original text available"}
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[200px]">
                          <p className="text-muted-foreground text-sm text-center">
                            Select a file to view its original content.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </ResizablePanel>
                
                <ResizableHandle withHandle />
                
                {/* Right Panel - Extracted Content */}
                <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                  <div className="h-full flex flex-col space-y-3 pl-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Extracted Content
                      </p>
                      <div className="flex items-center gap-1">
                        {selectedInsight && !isEditing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleStartEdit(selectedInsight)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )}
                        {isEditing && (
                          <>
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
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 p-4 rounded-lg border border-border/50 bg-background/50 min-h-[300px] overflow-y-auto">
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
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>

            {/* Mobile: Stacked Layout */}
            <div className="lg:hidden space-y-6">
              {/* Left Panel - Currently Selected Image/Text */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Currently Selected Image/Text
                </p>
                <div className={`p-4 rounded-lg border border-border/50 bg-background/50 min-h-[200px] max-h-[400px] overflow-y-auto ${
                  selectedInsight?.type === "image" && selectedInsight?.preview 
                    ? "flex items-center justify-center" 
                    : ""
                }`}>
                  {selectedInsight ? (
                    isDigitalNotes(selectedInsight.fileName) ? (
                      <div className="flex flex-col items-center justify-center gap-3 h-full min-h-[200px]">
                        <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center">
                          <FileInput className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-muted-foreground text-sm text-center">
                          no need to extract text from digital notes - see right panel
                        </p>
                      </div>
                    ) : selectedInsight.type === "image" ? (
                      selectedInsight.preview ? (
                        <img
                          src={selectedInsight.preview}
                          alt={selectedInsight.fileName}
                          className="w-full h-auto max-h-[400px] object-contain rounded-md"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                            <Image className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <p className="text-sm">Image preview not available</p>
                        </div>
                      )
                    ) : (
                      <div className="w-full">
                        <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                          {selectedInsight.originalText || "No original text available"}
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[200px]">
                      <p className="text-muted-foreground text-sm text-center">
                        Select a file to view its original content.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel - Extracted Content */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Extracted Content
                  </p>
                  <div className="flex items-center gap-1">
                    {selectedInsight && !isEditing && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleStartEdit(selectedInsight)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    {isEditing && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-border/50 bg-background/50 min-h-[200px] max-h-[400px] overflow-y-auto">
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
