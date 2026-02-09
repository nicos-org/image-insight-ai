import { useState, useCallback } from "react";
import { Sparkles, Zap, FolderOpen, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ImageGrid } from "@/components/ImageGrid";
import { TestInsightsDisplay } from "@/components/TestInsightsDisplay";
import { Button } from "@/components/ui/button";
import { analyzeFiles } from "@/services/openaiService";
import { loadUseCaseImages, loadUseCaseGroundTruths } from "@/services/useCaseLoader";
import { useCases } from "@/content/useCases";
import { useToast } from "@/hooks/use-toast";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface FileInsight {
  id: string;
  fileName: string;
  type: "image" | "text";
  preview?: string;
  content: string;
  originalText?: string;
}

const Test = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [isLoadingUseCase, setIsLoadingUseCase] = useState(false);
  const [insights, setInsights] = useState<FileInsight[] | null>(null);
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groundTruths, setGroundTruths] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSelectUseCase = useCallback(async (useCaseId: string) => {
    const useCase = useCases.find((uc) => uc.id === useCaseId);
    if (!useCase) return;

    // Revoke old previews
    images.forEach((img) => URL.revokeObjectURL(img.preview));

    setSelectedUseCase(useCaseId);
    setIsLoadingUseCase(true);
    setImages([]);
    setInsights(null);
    setSelectedInsightId(null);
    setGroundTruths({});

    try {
      const loadedImages = await loadUseCaseImages(useCase.folder);
      setImages(loadedImages);

      const gt = await loadUseCaseGroundTruths(
        useCase.folder,
        loadedImages.map((img) => img.file.name)
      );
      setGroundTruths(gt);

      toast({
        title: "Use case loaded",
        description: `${loadedImages.length} image${loadedImages.length !== 1 ? "s" : ""} loaded from "${useCase.name}".`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load use case";
      toast({
        title: "Loading failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingUseCase(false);
    }
  }, [images, toast]);

  const handleUpdateInsightContent = useCallback((id: string, content: string) => {
    setInsights((prev) => 
      prev?.map((insight) => 
        insight.id === id ? { ...insight, content } : insight
      ) ?? null
    );
  }, []);

  const handleExtractInsights = async () => {
    if (images.length === 0) return;

    setIsLoading(true);
    setError(null);
    setInsights(null);
    setSelectedInsightId(null);

    try {
      const fileInsights = await analyzeFiles(images, []);

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
          
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 animate-slide-up">
            Test the tool with toy data
          </h1>
          
        </div>
      </section>

      {/* Step 1: Select a Use Case */}
      <section className="bg-card py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Step 1 Title */}
          <div className="py-10">
            <div className="w-full py-4 px-6 rounded-xl bg-primary/10 border border-primary/20">
              <h2 className="font-display text-2xl font-semibold text-foreground text-center">
                Select a Use Case
              </h2>
            </div>
          </div>

          {/* Use Case Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
            {useCases.map((uc) => (
              <button
                key={uc.id}
                onClick={() => handleSelectUseCase(uc.id)}
                disabled={isLoadingUseCase}
                className={`group relative rounded-2xl border-2 p-6 text-left transition-all duration-300 hover:shadow-lg ${
                  selectedUseCase === uc.id
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border/50 bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50"
                } ${isLoadingUseCase ? "opacity-70 cursor-wait" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    selectedUseCase === uc.id ? "bg-primary/20" : "bg-primary/10"
                  }`}>
                    {isLoadingUseCase && selectedUseCase === uc.id ? (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : (
                      <FolderOpen className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {uc.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Preloaded images from {uc.folder.replace("use_case_", "").replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                {selectedUseCase === uc.id && (
                  <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            ))}
          </div>

          {/* Loaded Items Preview */}
          <div className="mt-8 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <ImageGrid
              images={images}
              textNotes={[]}
              onRemoveImage={() => {}}
              onRemoveTextNote={() => {}}
            />
          </div>
        </div>
      </section>

      {/* Current Collected Statistics */}
      <section className="bg-muted/20 py-16 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="py-10">
            <div className="w-full py-4 px-6 rounded-xl bg-primary/10 border border-primary/20">
              <h2 className="font-display text-2xl font-semibold text-foreground text-center">
                Current collected statistics from all use cases
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Extract Text */}
      <section className="bg-primary/10 py-16 px-16">
        <div className="container mx-auto max-w-4xl">
          {/* Step 2 Title */}
          <div className="py-10">
            <div className="w-full py-4 px-6 rounded-xl bg-primary/20 border border-primary/30">
              <h2 className="font-display text-2xl font-semibold text-foreground text-center">
                Extract text from a specific use case
              </h2>
            </div>
          </div>

          <div className="space-y-4">
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
          </div>
        </div>

        {/* Insights Display */}
        <div className="w-full max-w-[calc(100vw-12rem)] mx-auto animate-slide-up mt-8" style={{ animationDelay: "500ms" }}>
          <TestInsightsDisplay
            insights={insights}
            isLoading={isLoading}
            error={error}
            selectedFileId={selectedInsightId}
            onSelectFile={setSelectedInsightId}
            onUpdateContent={handleUpdateInsightContent}
            groundTruthTexts={groundTruths}
          />
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

export default Test;
