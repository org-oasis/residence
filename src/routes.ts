import type { RouteConfig } from "@react-router/dev/routes";

export default [
  { index: true, file: "routes/root-redirect.tsx" },
  {
    path: ":lang",
    file: "routes/lang-layout.tsx",
    children: [
      { index: true, file: "pages/Index.tsx" },
      { path: "apartments", file: "pages/Apartments.tsx" },
      { path: "apartments/:slug", file: "pages/ApartmentDetail.tsx" },
      { path: "gallery", file: "pages/Gallery.tsx" },
      { path: "contact", file: "pages/Contact.tsx" },
      { path: "reglement", file: "pages/Reglement.tsx" },
      { path: "blog", file: "routes/blog-index.tsx" },
      { path: "blog/:slug", file: "routes/blog-article.tsx" },
      { path: "*", file: "pages/NotFound.tsx", id: "lang-not-found" },
    ],
  },
  { path: "*", file: "pages/NotFound.tsx", id: "root-not-found" },
] satisfies RouteConfig;
