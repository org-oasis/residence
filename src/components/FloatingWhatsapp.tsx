import { Whatsapp } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";

const DEFAULT_PHONE = "213561472990";

/**
 * Bouton WhatsApp flottant — visible sur toute page non-card.
 * Persona doc §4 : WhatsApp = canal #1 absolu (80-90% du premier contact).
 * Position end-5 (logical) pour RTL automatique.
 */
export default function FloatingWhatsapp() {
  const { t } = useLanguage();
  const message = encodeURIComponent(
    `${t.contact.messagePrefix || "Bonjour"} - Résidence Oasis`,
  );
  const href = `https://wa.me/${DEFAULT_PHONE}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 end-5 z-40 inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366] transition-all"
    >
      <Whatsapp className="h-9 w-9" aria-hidden="true" />
    </a>
  );
}
