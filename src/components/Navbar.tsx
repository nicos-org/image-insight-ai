import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
}

export const Navbar = ({ className }: NavbarProps) => {
  return (
    <nav className={cn("fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50", className)}>
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center glow-effect">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-gradient">
            Inspectra
          </span>
        </div>
        
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            className="font-display font-medium text-foreground hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link 
            to="/why" 
            className="font-display font-medium text-foreground hover:text-primary transition-colors"
          >
            Why?
          </Link>
          <Link 
            to="/documentation" 
            className="font-display font-medium text-foreground hover:text-primary transition-colors"
          >
            Documentation
          </Link>
          <Link 
            to="/education" 
            className="font-display font-medium text-foreground hover:text-primary transition-colors"
          >
            Education
          </Link>
        </div>
      </div>
    </nav>
  );
};
