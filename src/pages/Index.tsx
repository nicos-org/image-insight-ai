import { useState, useCallback } from "react";
import { Sparkles, Zap, ChevronDown, Pencil, Check, FileText, FileDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Navbar } from "@/components/Navbar";
import { DropZone } from "@/components/DropZone";
import { TextInputZone } from "@/components/TextInputZone";
import { ImageGrid } from "@/components/ImageGrid";
import { InsightsDisplay } from "@/components/InsightsDisplay";
import { Button } from "@/components/ui/button";
import { analyzeImages } from "@/services/mockAnalysis";
import { useToast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface TextNote {
  id: string;
  content: string;
  fileName: string;
}

interface FileInsight {
  id: string;
  fileName: string;
  type: "image" | "text";
  preview?: string;
  content: string;
  originalText?: string;
}

const Index = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [textNotes, setTextNotes] = useState<TextNote[]>([]);
  const [noteCounter, setNoteCounter] = useState(1);
  const [insights, setInsights] = useState<FileInsight[] | null>(null);
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const { toast } = useToast();

  const DEMO_FALLBACK_TEXT = "This is the demo text in case some error in the pipeline is happening. No worries! Our engineers are working on it ;)";

  const handleFilesAdded = useCallback((files: File[]) => {
    const newImages = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    toast({
      title: "Images added",
      description: `${files.length} image${files.length > 1 ? "s" : ""} added successfully.`,
    });
  }, [toast]);

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const handleTextSubmit = useCallback((text: string) => {
    const fileName = `digital_notes_${String(noteCounter).padStart(2, '0')}.txt`;
    const newNote: TextNote = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: text,
      fileName,
    };
    setTextNotes((prev) => [...prev, newNote]);
    setNoteCounter((prev) => prev + 1);
    toast({
      title: "Text added",
      description: `${fileName} has been created successfully.`,
    });
  }, [toast, noteCounter]);

  const handleRemoveTextNote = useCallback((id: string) => {
    setTextNotes((prev) => prev.filter((note) => note.id !== id));
  }, []);

  const handleUpdateInsightContent = useCallback((id: string, content: string) => {
    setInsights((prev) => 
      prev?.map((insight) => 
        insight.id === id ? { ...insight, content } : insight
      ) ?? null
    );
  }, []);

  const handleExtractInsights = async () => {
    if (images.length === 0 && textNotes.length === 0) return;

    setIsLoading(true);
    setError(null);
    setInsights(null);
    setSelectedInsightId(null);

    try {
      // Simulate a brief processing delay for demo effect
      await new Promise(resolve => setTimeout(resolve, 800));

      const fileInsights: FileInsight[] = [];

      // Add text notes as insights
      textNotes.forEach((note) => {
        fileInsights.push({
          id: note.id,
          fileName: note.fileName,
          type: "text",
          content: note.content,
          originalText: note.content,
        });
      });

      // Add images with mock analysis
      images.forEach((img) => {
        fileInsights.push({
          id: img.id,
          fileName: img.file.name,
          type: "image",
          preview: img.preview,
          content: `[Demo] Analysis of ${img.file.name}: This image contains visual content that would be analyzed by the AI backend.`,
          originalText: `[Image: ${img.file.name}]`,
        });
      });

      setInsights(fileInsights);
      if (fileInsights.length > 0) {
        setSelectedInsightId(fileInsights[0].id);
      }

      toast({
        title: "Analysis complete",
        description: `${fileInsights.length} file(s) have been analyzed.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Analysis failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section id="top" className="pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Analysis</span>
          </div>
          
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 animate-slide-up">
            Extract <span className="text-gradient">Insights</span> from Your Notes at Swissmedic
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: "100ms" }}>
            Upload your images and free text from inspections and let our Inspectra analyze them to provide detailed insights & descriptions for further workflows.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24 px-6">
        <div className="container mx-auto max-w-4xl space-y-8">
          {/* Step 1 Title */}
          <div className="py-10">
            <div className="w-full py-4 px-6 rounded-xl bg-primary/10 border border-primary/20">
              <h2 className="font-display text-2xl font-semibold text-foreground text-center">
                Step 1: Load notes (images or free text)
              </h2>
            </div>
          </div>

          {/* Upload Zones - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <DropZone onFilesAdded={handleFilesAdded} />
            <TextInputZone onTextSubmit={handleTextSubmit} />
          </div>

          {/* Items Grid */}
          <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
            <ImageGrid 
              images={images} 
              textNotes={textNotes}
              onRemoveImage={handleRemoveImage} 
              onRemoveTextNote={handleRemoveTextNote}
            />
          </div>

          {/* Step 2 Title and Extract Button */}
          <div className="py-10">
            <div className="w-full py-4 px-6 rounded-xl bg-primary/10 border border-primary/20">
              <h2 className="font-display text-2xl font-semibold text-foreground text-center">
                Step 2: Extract insights from already loaded images and free text
              </h2>
            </div>
          </div>

          <div className="space-y-4">

            <div className="flex justify-center animate-slide-up" style={{ animationDelay: "400ms" }}>
              <Button
                variant="hero"
                size="xl"
                onClick={handleExtractInsights}
                disabled={(images.length === 0 && textNotes.length === 0) || isLoading}
                className="min-w-[280px]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground spinner" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Extract Insights from Images
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Insights Display */}
          <div className="animate-slide-up" style={{ animationDelay: "500ms" }}>
            <InsightsDisplay
              insights={insights}
              isLoading={isLoading}
              error={error}
              selectedFileId={selectedInsightId}
              onSelectFile={setSelectedInsightId}
              onUpdateContent={handleUpdateInsightContent}
            />
          </div>

          {/* Step 3 - Summarize */}
          <div className="py-10">
            <div className="w-full py-4 px-6 rounded-xl bg-primary/10 border border-primary/20">
              <h2 className="font-display text-2xl font-semibold text-foreground text-center">
                Step 3: Summarize all notes into a single document
              </h2>
            </div>
          </div>

          <div className="space-y-4 animate-slide-up" style={{ animationDelay: "600ms" }}>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors group">
                <ChevronDown className="w-5 h-5 transition-transform group-data-[state=open]:rotate-180" />
                Current prompt
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                  <p className="text-sm text-foreground">
                    Summarize all files in a single document with a maximum of 500 pages
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex justify-center">
              <Button
                variant="hero"
                size="xl"
                className="min-w-[280px]"
                disabled={isSummaryLoading}
                onClick={async () => {
                  setIsSummaryLoading(true);
                  try {
                    // Simulate API call - replace with actual API call when connected
                    await new Promise((_, reject) => setTimeout(() => reject(new Error("API not connected")), 1000));
                  } catch (err) {
                    // Fallback to demo text on any error
                    setSummary(DEMO_FALLBACK_TEXT);
                    toast({
                      title: "Demo mode",
                      description: "Showing demo content as the API is not connected.",
                    });
                  } finally {
                    setIsSummaryLoading(false);
                  }
                }}
              >
                {isSummaryLoading ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground spinner" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate summary
                  </>
                )}
              </Button>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="min-h-[150px] rounded-xl bg-muted/50 border border-border p-4 relative">
                {summary ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() => setIsEditingSummary(!isEditingSummary)}
                    >
                      {isEditingSummary ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Pencil className="h-4 w-4" />
                      )}
                    </Button>
                    {isEditingSummary ? (
                      <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="w-full h-full min-h-[130px] bg-transparent border-none resize-none focus:outline-none text-foreground text-sm"
                      />
                    ) : (
                      <p className="text-foreground text-sm whitespace-pre-wrap pr-10">
                        {summary}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[130px]">
                    <p className="text-muted-foreground text-sm text-center">
                      Once you generate the summary it will be displayed here
                    </p>
                  </div>
                )}
              </div>

              {/* Export Buttons */}
              {summary && (
                <div className="flex justify-center gap-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const doc = new jsPDF();
                      const pageWidth = doc.internal.pageSize.getWidth();
                      const margin = 20;
                      const maxWidth = pageWidth - margin * 2;
                      const lines = doc.splitTextToSize(summary, maxWidth);
                      doc.setFontSize(12);
                      doc.text(lines, margin, margin);
                      doc.save("summary.pdf");
                      toast({
                        title: "PDF exported",
                        description: "Your summary has been downloaded as a PDF.",
                      });
                    }}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const doc = new Document({
                        sections: [
                          {
                            properties: {},
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: summary,
                                    size: 24,
                                  }),
                                ],
                              }),
                            ],
                          },
                        ],
                      });
                      const blob = await Packer.toBlob(doc);
                      saveAs(blob, "summary.docx");
                      toast({
                        title: "Word document exported",
                        description: "Your summary has been downloaded as a Word document.",
                      });
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export as Word
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/50">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="text-sm text-muted-foreground">
            Inspectra • Frontend Demo
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Developed by Nicolas Perez Gonzalez, Data Scientist at Swissmedic
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
