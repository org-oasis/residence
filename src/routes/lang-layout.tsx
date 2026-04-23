import { Navigate, Outlet, useParams } from "react-router";
import { isLang } from "@/lib/i18n";
import FloatingWhatsapp from "@/components/FloatingWhatsapp";

export default function LangLayout() {
  const { lang } = useParams<{ lang?: string }>();
  if (!isLang(lang)) {
    return <Navigate to="/fr/" replace />;
  }
  // Inter-route animations are handled by the browser View Transitions API:
  // every <Link> in this layout opts in via the `viewTransition` prop.
  // No JS animation timing, no double-flash on hydration, no key-based remount.
  return (
    <>
      <Outlet />
      <FloatingWhatsapp />
    </>
  );
}
