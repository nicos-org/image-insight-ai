import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";

interface TextInputZoneProps {
  onTextSubmit: (text: string) => void;
}

export const TextInputZone = ({ onTextSubmit }: TextInputZoneProps) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "In order to submit text, you need to first add some free text in the box",
        variant: "destructive",
      });
      return;
    }
    onTextSubmit(text.trim());
    setText("");
  };

  return (
    <div className="glass-card rounded-2xl p-8 border border-border/50 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          Upload your free text notes
        </h3>
      </div>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type your notes here..."
        className="flex-1 w-full min-h-[120px] p-4 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
      />
      
      <Button
        variant="hero"
        className="mt-4 w-full"
        onClick={handleSubmit}
      >
        Submit text
      </Button>
    </div>
  );
};
