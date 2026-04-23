
import { Link } from "react-router";
import { Facebook, MessageCircle, Send, Phone, MapPin } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocalizedHref } from "@/lib/i18n";
import { contactInfo, siteConfig } from "@/data/appData";

export default function Footer() {
  const { t } = useLanguage();
  const loc = useLocalizedHref();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card text-card-foreground pt-16 pb-8 border-t">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="animate-fade-in [animation-delay:100ms]">
            <h4 className="text-xl font-bold mb-4">{siteConfig.name} 🏖️</h4>
            <p className="text-muted-foreground mb-4">
              {t.footer.description}
            </p>
            <div className="flex space-x-4">
              <a target="_blank" rel="noopener noreferrer" href={contactInfo.social.facebook} className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a target="_blank" rel="noopener noreferrer" href={contactInfo.social.whatsapp} className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle size={20} />
                <span className="sr-only">WhatsApp</span>
              </a>
              <a target="_blank" rel="noopener noreferrer" href={contactInfo.social.telegram} className="text-muted-foreground hover:text-primary transition-colors">
                <Send size={20} />
                <span className="sr-only">Telegram</span>
              </a>
            </div>
          </div>

          <div className="animate-fade-in [animation-delay:200ms]">
            <h4 className="text-xl font-bold mb-4">{t.footer.quickLinks}</h4>
            <ul className="space-y-2">
              {[
                { name: t.nav.home, path: loc("/") },
                { name: t.nav.apartments, path: loc("/apartments") },
                { name: t.nav.gallery, path: loc("/gallery") },
                { name: t.nav.blog, path: loc("/blog") },
                { name: t.nav.reglement, path: loc("/reglement") },
                { name: t.nav.contact, path: loc("/contact") },
              ].map((link) => (
                <li key={link.name}>
                  <Link viewTransition
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-in [animation-delay:300ms]">
            <h4 className="text-xl font-bold mb-4">{t.footer.contact}</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="w-6 h-6 mr-2 mt-0.5 text-primary" />
                <span className="text-muted-foreground">
                  {contactInfo.address.street}<br />
                  {contactInfo.address.city}<br />
                  {contactInfo.address.country}
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="w-6 h-6 mr-2 text-primary" />
                <span className="text-muted-foreground">{contactInfo.phone.primary}</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-6 h-6 mr-2 text-primary" />
                <span className="text-muted-foreground">{contactInfo.phone.secondary}</span>
              </li>
{/*
              <li className="flex items-center">
                <Mail className="w-6 h-6 mr-2 text-primary" />
                <span className="text-muted-foreground">info@residenceoasis.com</span>
              </li>
*/}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 mt-8 text-center text-muted-foreground">
          <p>&copy; {currentYear} {siteConfig.name}. {t.footer.allRights}</p>
        </div>
      </div>
    </footer>
  );
}
