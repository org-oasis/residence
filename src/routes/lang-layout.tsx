import { Navigate, Outlet, useParams } from "react-router";
import { isLang } from "@/lib/i18n";

export default function LangLayout() {
  const { lang } = useParams<{ lang?: string }>();
  if (!isLang(lang)) {
    return <Navigate to="/fr" replace />;
  }
  return <Outlet />;
}
