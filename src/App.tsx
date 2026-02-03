import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Why from "./pages/Why";
import Documentation from "./pages/Documentation";
import Education from "./pages/Education";
import { EducationEmpty } from "./pages/education/EducationEmpty";
import { ArticleView } from "./components/education/ArticleView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/why" element={<Why />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/education" element={<Education />}>
            <Route index element={<EducationEmpty />} />
            <Route path=":articleId" element={<ArticleView />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
