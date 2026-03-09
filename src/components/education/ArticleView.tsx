import { useParams, Link, useOutletContext } from "react-router-dom";
import { educationArticles } from "@/content/educationArticles";
import { ArticleBody } from "./ArticleBody";
import { Button } from "@/components/ui/button";
import type { EduTheme } from "@/pages/Education";

export const ArticleView = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const { eduTheme } = useOutletContext<{ eduTheme: EduTheme }>();
  const article = educationArticles.find((a) => a.id === articleId);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <p>Article not found.</p>
        <Button variant="outline" asChild>
          <Link to="/education">Back to articles</Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="h-full min-h-0 overflow-y-auto px-4 md:px-6">
      <header className="mt-28 mb-20 text-center">
        <h1 className="font-display text-3xl font-bold">{article.title}</h1>
        <p className="mt-6 text-muted-foreground">By Nicolas Löffler-Pérez on 16. Februar 2026</p>
      </header>
      <ArticleBody content={article.content} darkMode={eduTheme === "dark"} />
    </article>
  );
};
