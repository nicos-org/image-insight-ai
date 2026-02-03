import { Link } from "react-router-dom";
import { educationArticles } from "@/content/educationArticles";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export const EducationEmpty = () => {
  const firstArticle = educationArticles[0];

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <FileText className="h-12 w-12 text-white" aria-hidden />
      <div className="space-y-2">
        <p className="text-lg text-white">Select an article from the list to read.</p>
        {firstArticle && (
          <Button asChild variant="default">
            <Link to={`/education/${firstArticle.id}`}>Open {firstArticle.title}</Link>
          </Button>
        )}
      </div>
    </div>
  );
};
