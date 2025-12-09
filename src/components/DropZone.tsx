import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
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
      className={`relative glass-card rounded-2xl p-12 transition-all duration-300 ${
        isDragOver
          ? "border-2 border-primary glow-effect scale-[1.01]"
          : "border-2 border-dashed border-border hover:border-primary/50"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center gap-6">
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isDragOver
              ? "bg-[image:var(--gradient-primary)] glow-effect"
              : "bg-muted"
          }`}
        >
          {isDragOver ? (
            <Upload className="w-10 h-10 text-primary-foreground animate-float" />
          ) : (
            <ImageIcon className="w-10 h-10 text-muted-foreground" />
          )}
        </div>

        <div className="text-center">
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            {isDragOver ? "Drop your images here" : "Upload your images"}
          </h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Drag and drop your images here, or click the button below to browse
            your files. Supports JPG, PNG, WebP formats.
          </p>
        </div>

        <label>
          <Button variant="hero" size="lg" asChild>
            <span className="cursor-pointer">
              <Upload className="w-5 h-5 mr-2" />
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
