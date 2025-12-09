import { Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export const Navbar = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center glow-effect">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Image Insight <span className="text-gradient">Extractor</span>
          </span>
        </div>
        <Button variant="glass" onClick={scrollToTop}>
          Home
        </Button>
      </div>
    </nav>
  );
};
