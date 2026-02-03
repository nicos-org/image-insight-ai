import { useParams, Link } from "react-router-dom";
import { educationArticles } from "@/content/educationArticles";
import { ArticleBody } from "./ArticleBody";
import { Button } from "@/components/ui/button";

export const ArticleView = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const article = educationArticles.find((a) => a.id === articleId);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="text-white">Article not found.</p>
        <Button variant="outline" asChild>
          <Link to="/education">Back to articles</Link>
        </Button>
      </div>
    );
  }

  return (
    <article className="h-full overflow-auto px-4 md:px-6">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">{article.title}</h1>
      </header>
      <ArticleBody content={article.content} />
    </article>
  );
};
