import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavLink } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { educationArticles } from "@/content/educationArticles";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/education/ThemeToggle";

const EDUCATION_STORAGE_KEY = "education_unlocked";
const EDUCATION_THEME_KEY = "education_theme";
const DEFAULT_PASSWORD = "inspectra2025";

const getExpectedPassword = () =>
  import.meta.env.VITE_EDUCATION_PASSWORD ?? DEFAULT_PASSWORD;

export type EduTheme = "dark" | "light";

const Education = () => {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(EDUCATION_STORAGE_KEY) === "true"
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [eduTheme, setEduTheme] = useState<EduTheme>(
    () => (localStorage.getItem(EDUCATION_THEME_KEY) as EduTheme) || "dark"
  );

  const handleToggleTheme = () => {
    setEduTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem(EDUCATION_THEME_KEY, next);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password === getExpectedPassword()) {
      sessionStorage.setItem(EDUCATION_STORAGE_KEY, "true");
      setUnlocked(true);
    } else {
      setError("Incorrect password.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(EDUCATION_STORAGE_KEY);
    setUnlocked(false);
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-background flex flex-col",
        eduTheme === "light" && "education-light"
      )}
    >
      <Navbar
        actions={<ThemeToggle theme={eduTheme} onToggle={handleToggleTheme} />}
      />

      {unlocked ? (
        <>
          <div className="flex-1 flex flex-col min-h-0 pt-16">
            <ResizablePanelGroup
              direction="horizontal"
              className="flex-1 min-h-0"
            >
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <div className="flex flex-col h-full border-r border-border/50 bg-background">
                  <div className="flex items-center justify-between gap-2 p-4 border-b border-border/50 shrink-0">
                    <span className="font-display font-semibold">
                      Articles
                    </span>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      Log out
                    </Button>
                  </div>
                  <ScrollArea className="flex-1">
                    <nav className="p-2 space-y-0.5">
                      {educationArticles.map((article) => (
                        <NavLink
                          key={article.id}
                          to={`/education/${article.id}`}
                          className={({ isActive }) =>
                            cn(
                              "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              isActive
                                ? "bg-accent font-semibold"
                                : "hover:bg-accent/50"
                            )
                          }
                        >
                          {article.title}
                        </NavLink>
                      ))}
                    </nav>
                  </ScrollArea>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={75} minSize={50}>
                <div className="h-full overflow-hidden p-6 md:p-8 bg-background">
                  <Outlet context={{ eduTheme }} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </>
      ) : (
        <main className="container mx-auto px-6 pt-32 pb-16 flex-1">
          <div className="max-w-md mx-auto pt-16">
            <section className="glass-card rounded-2xl p-8 border border-border/50">
              <h2 className="font-display text-2xl font-semibold text-foreground mb-4 text-center">
                Enter password
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  className="w-full"
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button type="submit" variant="hero" className="w-full">
                  Submit
                </Button>
              </form>
            </section>
          </div>
        </main>
      )}

      <footer className="border-t border-border/50 py-6 shrink-0">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">
            Inspectra • Frontend Demo
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Developed by Nicolas Perez Gonzalez, Data Scientist at Swissmedic
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Education;
