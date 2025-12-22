import { useState, useCallback } from "react";
import { Sparkles, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { DropZone } from "@/components/DropZone";
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

const Index = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [insights, setInsights] = useState<string | null>(null);
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

  const handleExtractInsights = async () => {
    if (images.length === 0) return;

    setIsLoading(true);
    setError(null);
    setInsights(null);

    try {
      const result = await analyzeImages(images.map((img) => img.file));
      setInsights(result);
      toast({
        title: "Analysis complete",
        description: "Your images have been analyzed successfully.",
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
          
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 animate-slide-up">
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
          {/* Upload Zone */}
          <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
            <DropZone onFilesAdded={handleFilesAdded} />
          </div>

          {/* Image Grid */}
          <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
            <ImageGrid images={images} onRemoveImage={handleRemoveImage} />
          </div>

          {/* Extract Button */}
          <div className="flex justify-center animate-slide-up" style={{ animationDelay: "400ms" }}>
            <Button
              variant="hero"
              size="xl"
              onClick={handleExtractInsights}
              disabled={images.length === 0 || isLoading}
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

          {/* Insights Display */}
          <div className="animate-slide-up" style={{ animationDelay: "500ms" }}>
            <InsightsDisplay
              insights={insights}
              isLoading={isLoading}
              error={error}
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
