import { X, ImageOff } from "lucide-react";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface ImageGridProps {
  images: ImageFile[];
  onRemoveImage: (id: string) => void;
}

export const ImageGrid = ({ images, onRemoveImage }: ImageGridProps) => {
  if (images.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-1">
              No images loaded
            </h3>
            <p className="text-muted-foreground text-sm">
              Upload some images to get started with the analysis
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        Loaded Images ({images.length})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative aspect-square rounded-xl overflow-hidden bg-muted border border-border animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <img
              src={image.preview}
              alt={image.file.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <button
              onClick={() => onRemoveImage(image.id)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive hover:scale-110"
            >
              <X className="w-4 h-4 text-destructive-foreground" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-xs text-foreground truncate font-medium">
                {image.file.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
