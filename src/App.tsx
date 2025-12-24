import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const Apartments = lazy(() => import("./pages/Apartments"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

// A simple loading spinner while the new page downloads
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

const AppContent = () => {
  const { language } = useLanguage();
  return (
    <div dir={language === "ar" ? "rtl" : "ltr"} lang={language}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/apartments" element={<Apartments />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
};

const App = () => (
  <TooltipProvider>
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  </TooltipProvider>
);

export default App;
