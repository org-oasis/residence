
import { useState, useRef, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useLocalizedHref } from "@/lib/i18n";
import {
  FaUsers,
  FaExpand,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaTelegram,
  FaPhone,
  FaImages,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFeatureIcon } from "@/lib/iconUtils";
import { useLanguage } from "@/contexts/LanguageContext";
const ApartmentDetailsDialog = lazy(() => import("./ApartmentDetailsDialog"));
const CalendarAvailability = lazy(() => import("./CalendarAvailability"));
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export interface ApartmentProps {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceeur: number;
  pricedz: number;
  capacity: number;
  size: number;
  image: string;
  images: string[];
  location: string;
  type: string;
  features: string[];
  airbnbLink?: string;
  contactPhone?: string;
}



export default function ApartmentCard({ apartment }: { apartment: ApartmentProps }) {
  const { t } = useLanguage();
  const loc = useLocalizedHref();
  const [isHovered, setIsHovered] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [showSeasonalPricing, setShowSeasonalPricing] = useState(false);
  // Use translated name and description if available
  const translatedName = t.apartmentNames[apartment.name] || apartment.name;

  const translatedDescription = t.apartmentDescriptionsShort[apartment.description] || apartment.description;

  const handleCalendarClick = () => {
    setCalendarLoading(true);
    // Simulate the time it takes to load calendar data
    setTimeout(() => {
      setCalendarLoading(false);
      setCalendarOpen(true);
    }, 800);
  };

  return (
    <div
      className="rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-xl bg-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden h-64">
        {/* Apartment Number Label */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-secondary text-secondary-foreground font-semibold text-xs px-2 py-1 rounded-full shadow-xs border border-secondary/20">
            {t.apartmentNumber[apartment.id as keyof typeof t.apartmentNumber] || `${t.apartmentNumber.appartement} ${t.apartmentNumber.numero} ${apartment.id}`}
          </div>
        </div>
        <img
          src={apartment.image}
          alt={translatedName}
          loading="lazy"
          className={cn(
            "w-full h-full object-cover transition-transform duration-700 cursor-pointer",
            isHovered ? "scale-110" : "scale-100"
          )}
          onClick={() => setIsDialogOpen(true)}
        />
        <div
          className="absolute inset-0 bg-linear-to-b from-transparent to-black/60 flex items-end p-6 cursor-pointer"
          onClick={() => setIsDialogOpen(true)}
        >
          <div>
            <h3 className="text-white text-xl font-bold mb-1">{translatedName}</h3>
            <div className="flex items-center text-white/80 text-sm mb-2">
              <FaMapMarkerAlt className="h-4 w-4 mr-1" />
              <span>{t.locations[apartment.location] || apartment.location}</span>
            </div>
            <div className="flex items-center space-x-3 text-white">
              <div className="flex items-center">
                <FaUsers className="h-4 w-4 mr-1" />
                <span>{apartment.capacity} {apartment.capacity === 1 ?
                  t.apartments.filters.guests : t.apartments.filters.guests}</span>
              </div>
              <div className="flex items-center">
                <FaExpand className="h-4 w-4 mr-1" />
                <span>{apartment.size} m²</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-muted-foreground line-clamp-2">{translatedDescription}</p>

        <div className="flex flex-wrap gap-2">
          {apartment.features.slice(0, 5).map((feature, index) => {
            const translatedFeature = t.features[feature] || feature;
            return (
              <div
                key={index}
                className="flex items-center text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full"
              >
                <span className="mr-1">
                  {getFeatureIcon(feature)}
                </span>
                <span>{translatedFeature}</span>
              </div>
            );
          })}
          {apartment.features.length > 3 && (
            <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              +{apartment.features.length - 3} {t.apartments.filters.more}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center pt-2">
          <span className="text-xl font-bold">€{apartment.priceeur}</span>
          <span className="text-muted-foreground text-sm ml-1">/ {t.booking.summary.night}</span>
          <span className="text-muted-foreground text-sm font-medium mx-6">{t.apartments.or || 'ou'}</span>
          <span className="text-xl font-bold">DZD{apartment.pricedz}</span>
          <span className="text-muted-foreground text-sm ml-1">/ {t.booking.summary.night}</span>
        </div>

        {/* Seasonal Pricing Dropdown */}
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => setShowSeasonalPricing(!showSeasonalPricing)}
            className="w-full flex items-center justify-between bg-linear-to-r from-blue-50 to-teal-50 border border-blue-100 hover:from-blue-100 hover:to-teal-100"
          >
            <span className="seasonal-pricing-title">
              {t.apartments.seasonalPricing}
            </span>
            {showSeasonalPricing ? (
              <FaChevronUp className="w-4 h-4" />
            ) : (
              <FaChevronDown className="w-4 h-4" />
            )}
          </Button>

          {/* Collapsible Content */}
          {showSeasonalPricing && (
            <div className="mt-2 p-4 bg-linear-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-100 animate-fade-in">
              {/* September 1-15 Pricing */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="seasonal-pricing-date">
                    {t.apartments.september1to15}
                  </div>
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    {t.apartments.reduced}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="seasonal-pricing-price line-through text-gray-500">
                      {apartment.pricedz} DA
                    </span>
                    <span className="seasonal-pricing-price">
                      {apartment.type === 'Studio' ? '7000 DA' :
                       apartment.type === 'F2' ? '8000 DA' :
                       apartment.type === 'F2-jacuzzi' ? '13000 DA' :
                       apartment.type === 'F3' ? '20000 DA' :
                       'N/A'} / {t.booking.summary.night}
                    </span>
                  </div>
                </div>
              </div>

              {/* September 15-End Pricing with Discount Badge */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="seasonal-pricing-date">
                    {t.apartments.september15toEnd}
                  </div>
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    {t.apartments.veryReduced}
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="seasonal-pricing-price line-through text-gray-500">
                      {apartment.type === 'Studio' ? '7000 DA' :
                       apartment.type === 'F2' ? '8000 DA' :
                       apartment.type === 'F2-jacuzzi' ? '13000 DA' :
                       apartment.type === 'F3' ? '20000 DA' :
                       'N/A'}
                    </span>
                    <span className="seasonal-pricing-price">
                      {apartment.type === 'Studio' ? '5500 DA' :
                       apartment.type === 'F2' ? '6000 DA' :
                       apartment.type === 'F2-jacuzzi' ? '12000 DA' :
                       apartment.type === 'F3' ? '17000 DA' :
                       'N/A'} / {t.booking.summary.night}
                    </span>
                  </div>
                </div>
              </div>

              {/* October Onwards Pricing */}
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="seasonal-pricing-date">
                    {t.apartments.fromOctober}
                  </div>
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    {t.apartments.extremelyReduced}
                  </div>
                </div>
                <div className="text-center">
                  <span className="seasonal-pricing-price">
                    {apartment.type === 'Studio' ? '4500 DA' :
                     apartment.type === 'F2' ? '5000 DA' :
                     apartment.type === 'F2-jacuzzi' ? '10000 DA' :
                     apartment.type === 'F3' ? '13000 DA' :
                     'N/A'} / {t.booking.summary.night}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <hr className="my-4" />
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Button
            className="btn-primary w-full sm:w-auto"
            onClick={() => setIsDialogOpen(true)}
          >
            <FaImages className="h-4 w-4 mr-2 shrink-0" />
            <span className="whitespace-nowrap">{t.apartments.filters.viewDetails}</span>
          </Button>
          <Button
            className="btn-primary bg-green-700 hover:bg-green-800 text-white w-full sm:w-auto"
            onClick={handleCalendarClick}
          >
            <FaCalendarAlt className="h-4 w-4 mr-2 shrink-0" />
            <span className="whitespace-nowrap">{t.apartments.availability || 'Availability'}</span>
          </Button>
        </div>
        <div className="flex justify-center mt-3">
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Link to={loc(`/apartments/${apartment.slug}`)}>
              <ExternalLink className="h-4 w-4 mr-2 shrink-0" />
              <span className="whitespace-nowrap">{translatedName}</span>
            </Link>
          </Button>
        </div>

        <hr className="my-4" />

        <div className="flex justify-center gap-3">
          <Button
            className="bg-[#FF5A5F] hover:bg-[#E31C5F] text-white p-3 rounded-lg transition-colors duration-200"
            onClick={() => window.open(apartment.airbnbLink || 'https://airbnb.com/fake-link-to-modify', '_blank')}
            title={t.apartments.bookOnAirbnb}
          >
            <svg className="w-5 h-5" viewBox="0 0 32 32" fill="currentColor">
              <path d="m16 1c1.4875 0 2.9145.62595 3.9012 1.83134.5711667.694075 1.2066389 1.89078194 1.6351782 2.7357169l.2559218.5095731c1.9717714 3.84974571 3.8970367 7.7351461 5.7061469 11.6001357l1.0527212 2.2755537c.2442722.5357223.6021666 1.3323778.8348388 1.8877445l.1528931.3781361c.2774.7566.433 1.5511.433 2.3787 0 3.5246-2.7857 6.4031-6.4688 6.4031-3.1835 0-5.6326-2.0802-7.504-4.1423-1.8808 2.064-4.3581 4.1423-7.50223 4.1423-3.63403 0-6.46875-2.8732-6.46875-6.4031 0-.7093714.11431837-1.3944245.32166997-2.0521364l.11686003-.3412636.14732028-.3634926c.2618125-.6248792.68216562-1.5551583.92080875-2.0755906l.07235097-.1573168c1.76840571-3.8566286 3.66459673-7.7429388 5.61889889-11.60295324l1.37212111-2.70033801c.4205438-.81613875.986775-1.84801875 1.50075-2.47264875.9868-1.20527 2.4136-1.83116 3.9011-1.83116zm0 2c-.9183 0-1.766.37994-2.3542 1.09886-.4813417.58455833-1.0996486 1.77809958-1.5368827 2.64796863l-.1189173.23717137c-1.9648629 3.8362286-3.87987673 7.7011102-5.67697329 11.5404875l-1.04713472 2.2635986c-.30124838.6608472-.75686366 1.6784306-.92972199 2.1260139-.20209.5536-.30805 1.1129-.30805 1.6828 0 2.4201 1.93403 4.4031 4.46875 4.4031 2.34253 0 4.35533-1.6269 6.18943-3.6737-.8116-1.0042-1.6517-2.1847-2.3352-3.4276-.8316-1.5123-1.4855-3.2137-1.4855-4.8487 0-1.6499.6073-2.9633 1.6053-3.8548.9801-.8754 2.2634-1.2796 3.5291-1.2796 2.5883 0 5.1344 1.8531 5.1344 5.1344 0 1.635-.6539 3.3364-1.4855 4.8487-.6836 1.2432-1.524 2.4238-2.3357 3.4282 1.8297 2.0488 3.8093 3.6731 6.1899 3.6731 2.5732 0 4.4688-1.9778 4.4688-4.4031 0-.5699-.106-1.1292-.3081-1.6828l-.1341315-.3295324c-.2684352-.6384815-.7321018-1.6613843-.9532685-2.1404676-1.7568-3.8313429-3.642098-7.6955265-5.588449-11.53984198l-1.3495182-2.65470536c-.4047703-.78632203-.8899078-1.67180016-1.2822328-2.14822266-.5902-.72139-1.4379-1.10133-2.3562-1.10133zm0 10.9156c-.8562 0-1.64.274-2.1967.7712-.5387.4812-.9377 1.2349-.9377 2.3632 0 1.1431.4727 2.4933 1.238 3.8849.5489.9982 1.2207 1.9684 1.8964 2.8305.6757-.8621 1.3475-1.8323 1.8964-2.8305.7653-1.3916 1.238-2.7418 1.238-3.8849 0-2.0124-1.4789-3.1344-3.1344-3.1344z"></path>
            </svg>
          </Button>
          <Button
            className="bg-green-700 hover:bg-green-800 text-white p-3 rounded-lg transition-colors duration-200"
            onClick={() => window.open('https://wa.me/' + (apartment.contactPhone || '213561472990') + '?text=' + encodeURIComponent((t.contact.messagePrefix || 'Hello, I\'m interested in') + ' "' + t.apartmentNames[`apartment${apartment.id}_name` as keyof typeof t.apartmentNames] + '" [N°' + apartment.id + ']'), '_blank')}
            title="WhatsApp"
          >
            <FaWhatsapp className="w-5 h-5" />
          </Button>

          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors duration-200"
            onClick={() => window.open('https://t.me/residence_oasis' + '?text=' + encodeURIComponent((t.contact.messagePrefix || 'Hello, I\'m interested in') + ' "' + t.apartmentNames[`apartment${apartment.id}_name` as keyof typeof t.apartmentNames] + '" [N°' + apartment.id + ']'), '_blank')}
            title="Telegram"
          >
            <FaTelegram className="w-5 h-5" />
          </Button>

          <Button
            className="bg-primary hover:bg-primary/90 text-white p-3 rounded-lg transition-colors duration-200"
            onClick={() => window.open('tel:+' + (apartment.contactPhone || '213561472990'), '_blank')}
            title="Appeler"
          >
            <FaPhone className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {isDialogOpen && (
        <Suspense fallback={null}>
          <ApartmentDetailsDialog
            apartment={apartment}
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        </Suspense>
      )}
      {/* Loading Overlay */}
      <Dialog open={calendarLoading} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm w-full">
          <DialogHeader>
            <DialogTitle>{t.apartments.loadingCalendar || 'Loading Calendar'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-800 mb-6"></div>
            <div className="text-gray-600 text-center">
              <div className="text-sm text-gray-500">{t.apartments.loadingData || 'Loading availabilities...'}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {(calendarLoading || calendarOpen) && (
        <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
          <DialogContent className="w-fit max-w-[95vw] p-0">
            <DialogHeader className="px-4 py-3 text-center sm:text-center">
              <DialogTitle className="text-center sm:text-center">{t.apartments.availability || 'Availability'}</DialogTitle>
            </DialogHeader>
            <div className="px-4 pb-4">
              <Suspense fallback={null}>
                <CalendarAvailability
                  apartmentId={apartment.id}
                  label={t.apartments.availability || 'Availability'}
                  availableLabel={t.apartments.available || 'Available'}
                  unavailableLabel={t.apartments.unavailable || 'Unavailable'}
                  apartmentName={t.apartmentNumber[apartment.id as keyof typeof t.apartmentNumber] || `${t.apartmentNumber.appartement} ${t.apartmentNumber.numero} ${apartment.id}`}
                />
              </Suspense>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
