import { Link, useOutletContext } from "react-router-dom";
import { educationArticles } from "@/content/educationArticles";
import { educationArticlesDe } from "@/content/educationArticles.de";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import type { EduLanguage } from "@/pages/Education";

export const EducationEmpty = () => {
  const { eduLanguage } = useOutletContext<{ eduLanguage: EduLanguage }>();
  const firstArticle = (eduLanguage === "de" ? educationArticlesDe : educationArticles)[0];

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <FileText className="h-12 w-12" aria-hidden />
      <div className="space-y-2">
        <p className="text-lg">
          {eduLanguage === "de"
            ? "Wählen Sie einen Artikel aus der Liste zum Lesen aus."
            : "Select an article from the list to read."}
        </p>
        {firstArticle && (
          <Button asChild variant="default">
            <Link to={`/education/${firstArticle.id}`}>
              {eduLanguage === "de" ? "Öffnen" : "Open"} {firstArticle.title}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
