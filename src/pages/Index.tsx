import { useState, useCallback } from "react";
import { Sparkles, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DropZone } from "@/components/DropZone";
import { TextInputZone } from "@/components/TextInputZone";
import { ImageGrid } from "@/components/ImageGrid";
import { InsightsDisplay } from "@/components/InsightsDisplay";
import { Button } from "@/components/ui/button";
import { analyzeImages } from "@/services/mockAnalysis";
import { useToast } from "@/hooks/use-toast";

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
}

const Index = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [textNotes, setTextNotes] = useState<TextNote[]>([]);
  const [noteCounter, setNoteCounter] = useState(1);
  const [insights, setInsights] = useState<FileInsight[] | null>(null);
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
            Upload your images and let our AI analyze them to provide detailed insights,
            descriptions, and valuable information about your visual content.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24 px-6">
        <div className="container mx-auto max-w-4xl space-y-8">
          {/* Step 1 Title */}
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground text-left">
              Step 1: Load notes (images or free text)
            </h2>

            {/* Upload Zones - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <DropZone onFilesAdded={handleFilesAdded} />
              <TextInputZone onTextSubmit={handleTextSubmit} />
            </div>
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
          <div className="space-y-4">
            <h2 className="font-display text-xl font-semibold text-foreground text-left">
              Step 2: Extract insights from already loaded images and free text
            </h2>

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
            />
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
            Connect your Python backend to enable real AI analysis
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
