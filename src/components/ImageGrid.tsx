import { X, ImageOff, FileText, Camera } from "lucide-react";

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

interface ImageGridProps {
  images: ImageFile[];
  textNotes: TextNote[];
  onRemoveImage: (id: string) => void;
  onRemoveTextNote: (id: string) => void;
}

export const ImageGrid = ({ images, textNotes, onRemoveImage, onRemoveTextNote }: ImageGridProps) => {
  const totalItems = images.length + textNotes.length;

  if (totalItems === 0) {
    return (
      <div className="glass-card rounded-2xl p-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-1">
              No items loaded
            </h3>
            <p className="text-muted-foreground text-sm">
              Upload images or add text notes to get started with the analysis
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-display text-lg font-semibold text-foreground mb-4">
        Loaded Items ({totalItems})
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative aspect-square rounded-xl overflow-hidden bg-secondary/30 border border-border animate-fade-in flex flex-col items-center justify-center p-4"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <p className="text-xs text-foreground truncate font-medium text-center w-full">
              {image.file.name}
            </p>
            <button
              onClick={() => onRemoveImage(image.id)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive hover:scale-110"
            >
              <X className="w-4 h-4 text-destructive-foreground" />
            </button>
          </div>
        ))}
        {textNotes.map((note, index) => (
          <div
            key={note.id}
            className="group relative aspect-square rounded-xl overflow-hidden bg-secondary/30 border border-border animate-fade-in flex flex-col items-center justify-center p-4"
            style={{ animationDelay: `${(images.length + index) * 50}ms` }}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <p className="text-xs text-foreground truncate font-medium text-center w-full">
              {note.fileName}
            </p>
            <button
              onClick={() => onRemoveTextNote(note.id)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-destructive/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive hover:scale-110"
            >
              <X className="w-4 h-4 text-destructive-foreground" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
