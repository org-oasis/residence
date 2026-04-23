import { Button } from "@/components/ui/button";
import { Airbnb, Phone, Telegram, Whatsapp } from "@/components/icons";
import { useLanguage } from "@/contexts/LanguageContext";

const DEFAULT_PHONE = "213561472990";

interface Props {
  apartmentId: string;
  apartmentName: string;
  airbnbLink?: string;
  contactPhone?: string;
}

export default function ContactButtons({
  apartmentId,
  apartmentName,
  airbnbLink,
  contactPhone,
}: Props) {
  const { t } = useLanguage();
  const phone = contactPhone || DEFAULT_PHONE;
  const intent = encodeURIComponent(
    `${t.contact.messagePrefix || "Hello, I'm interested in"} "${apartmentName}" [N°${apartmentId}]`,
  );

  return (
    <div className="flex justify-center gap-3">
      <Button
        className="bg-[#FF5A5F] hover:bg-[#E31C5F] text-white h-12 w-12 p-0 rounded-lg flex items-center justify-center transition-colors duration-200 [&_svg]:size-8"
        onClick={() => window.open(airbnbLink || "https://airbnb.com/fake-link-to-modify", "_blank")}
        title={t.apartments.bookOnAirbnb}
      >
        <Airbnb />
      </Button>
      <Button
        className="bg-green-700 hover:bg-green-800 text-white h-12 w-12 p-0 rounded-lg flex items-center justify-center transition-colors duration-200 [&_svg]:size-6"
        onClick={() => window.open(`https://wa.me/${phone}?text=${intent}`, "_blank")}
        title="WhatsApp"
      >
        <Whatsapp />
      </Button>
      <Button
        className="bg-blue-500 hover:bg-blue-600 text-white h-12 w-12 p-0 rounded-lg flex items-center justify-center transition-colors duration-200 [&_svg]:size-6"
        onClick={() => window.open(`https://t.me/residence_oasis?text=${intent}`, "_blank")}
        title="Telegram"
      >
        <Telegram />
      </Button>
      <Button
        className="bg-primary hover:bg-primary/90 text-white h-12 w-12 p-0 rounded-lg flex items-center justify-center transition-colors duration-200 [&_svg]:size-6"
        onClick={() => window.open(`tel:+${phone}`, "_blank")}
        title={t.contact.phone}
      >
        <Phone />
      </Button>
    </div>
  );
}
