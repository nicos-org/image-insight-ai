import { useCallback, useState } from "react";
import { Upload, Camera } from "lucide-react";
import { Button } from "./ui/button";

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
}

export const DropZone = ({ onFilesAdded }: DropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (files.length > 0) {
        onFilesAdded(files);
      }
    },
    [onFilesAdded]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) {
        onFilesAdded(files);
      }
      e.target.value = "";
    },
    [onFilesAdded]
  );

  return (
    <div
      className={`glass-card rounded-2xl p-8 border transition-all duration-300 h-full flex flex-col ${
        isDragOver
          ? "border-2 border-primary glow-effect scale-[1.01]"
          : "border-border/50 hover:border-primary/50"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
          <Camera className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          Upload your images with notes
        </h3>
      </div>

      <div
        className={`flex-1 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-6 transition-all duration-300 ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-border/50 hover:border-primary/30"
        }`}
      >
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
            isDragOver
              ? "bg-[image:var(--gradient-primary)] glow-effect"
              : "bg-muted"
          }`}
        >
          <Upload className={`w-6 h-6 ${isDragOver ? "text-primary-foreground animate-float" : "text-muted-foreground"}`} />
        </div>

        <p className="text-muted-foreground text-sm text-center">
          {isDragOver ? "Drop your images here" : "Drag and drop images here"}
        </p>

        <label>
          <Button variant="hero" size="default" asChild>
            <span className="cursor-pointer">
              Browse Files
            </span>
          </Button>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};
