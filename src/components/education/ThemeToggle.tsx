import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThemeToggleProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onToggle}
    className="gap-2"
    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
  >
    {theme === "dark" ? (
      <>
        <Sun className="h-4 w-4" />
        <span className="text-sm font-medium">Light mode</span>
      </>
    ) : (
      <>
        <Moon className="h-4 w-4" />
        <span className="text-sm font-medium">Dark mode</span>
      </>
    )}
  </Button>
);
