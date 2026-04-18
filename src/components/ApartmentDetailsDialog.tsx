import {
  FaUsers, 
  FaExpand, 
  FaMapMarkerAlt,
  FaHome
} from "react-icons/fa";
import ImageSlideshow from "./ImageSlideshow";
import CalendarAvailability from "./CalendarAvailability";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getFeatureIcon } from "@/lib/iconUtils";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApartmentProps } from "./ApartmentCard";
import { useState } from "react";

interface ApartmentDetailsDialogProps {
  apartment: ApartmentProps | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}



export default function ApartmentDetailsDialog({
  apartment,
  isOpen,
  onOpenChange
}: ApartmentDetailsDialogProps) {
  const { t } = useLanguage();
  const [calendarOpen, setCalendarOpen] = useState(false);

  if (!apartment) return null;

  // Use translated name and description if available
  const translatedName = t.apartmentNames[apartment.name] || apartment.name;

  const translatedDescription = t.apartmentDescriptionsShort[apartment.description] || apartment.description;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <DialogTitle className="text-lg md:text-2xl font-bold flex-1 min-w-0 text-left">
              {translatedName}
            </DialogTitle>
            <Badge variant="secondary" className="text-sm md:text-lg font-semibold px-2 md:px-4 py-1 md:py-2 shrink-0 mr-4">
              {t.apartmentNumber[apartment.id as keyof typeof t.apartmentNumber] || `${t.apartmentNumber.appartement} ${t.apartmentNumber.numero} ${apartment.id}`}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">

          {/* Image Slideshow */}
          <ImageSlideshow
            images={apartment.images}
            alt={translatedName}
          />

          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <FaUsers className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{t.apartments.filters.guests}</p>
                <p className="font-semibold">{apartment.capacity}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <FaExpand className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{t.apartments.filters.size}</p>
                <p className="font-semibold">{apartment.size} m²</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <FaHome className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{t.labels.type}</p>
                <p className="font-semibold">{t.apartmentTypes[apartment.type] || apartment.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <FaMapMarkerAlt className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{t.apartments.filters.location}</p>
                <p className="font-semibold">{t.locations[apartment.location] || apartment.location}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t.labels.description}</h3>
            <p className="text-muted-foreground leading-relaxed">{translatedDescription}</p>
          </div>

          <Separator />

          {/* Features & Amenities */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t.apartments.featuresAndAmenities}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {apartment.features.map((feature, index) => {
                const translatedFeature = t.features[feature] || feature;
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className="text-primary">
                      {getFeatureIcon(feature, "h-4 w-4")}
                    </div>
                    <span className="font-medium">{translatedFeature}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="bg-linear-to-r from-primary/10 to-secondary/10 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">{t.apartments.pricing}</h3>
                <p className="text-muted-foreground">{t.apartments.pricingPerNight}</p>
              </div>
              <div className="text-right">
                <div className="items-baseline space-x-1">
                  <span className="text-3xl font-bold text-primary">€{apartment.priceeur}</span>
                  <span className="text-muted-foreground">/ {t.booking.summary.night}</span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-primary">DZD{apartment.pricedz}</span>
                  <span className="text-muted-foreground">/ {t.booking.summary.night}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
      {/* Calendar Popup Dialog */}
      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>{t.apartments.availability || 'Availability'}</DialogTitle>
          </DialogHeader>
          <CalendarAvailability 
            apartmentId={apartment.id} 
            label={t.apartments.availability || 'Availability'}
            availableLabel={t.apartments.available || 'Available'}
            unavailableLabel={t.apartments.unavailable || 'Unavailable'}
            apartmentName={t.apartmentNumber[apartment.id as keyof typeof t.apartmentNumber] || `${t.apartmentNumber.appartement} ${t.apartmentNumber.numero} ${apartment.id}`}
          />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}