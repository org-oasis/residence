import { ApartmentProps } from "@/components/ApartmentCard";

// Apartment data
export const allApartments: ApartmentProps[] = [
  {
    id: "1",
    name: "apartment1_name",
    description: "apartment1_description",
    priceeur: 30,
    pricedz: 8000,
    capacity: 2,
    size: 23,
    image: "/assets/1-STUDIO/01.avif",
    images: [
      "/assets/1-STUDIO/01.avif",
      "/assets/1-STUDIO/02.avif",
      "/assets/1-STUDIO/03.avif",
      "/assets/1-STUDIO/04.avif"
    ],
    location: "floor1",
    type: "Studio",
    features: ["Wi-Fi", "Kitchen", "Bathroom", "Air Conditioning", "Refrigerator", "Oven", "Stove", "Freezer", "Washing Machine"],
    airbnbLink: "https://www.airbnb.fr/rooms/1210309363040804447",
    contactPhone: "213696123800"
  },
  {
    id: "2",
    name: "apartment2_name",
    description: "apartment2_description",
    priceeur: 35,
    pricedz: 9000,
    capacity: 4,
    size: 33,
    image: "/assets/2-F2/01.avif",
    images: [
      "/assets/2-F2/01.avif",
      "/assets/2-F2/02.avif",
      "/assets/2-F2/03.avif",
      "/assets/2-F2/04.avif"
    ],
    location: "floor1",
    type: "F2",
    features: ["Wi-Fi", "Kitchen", "Bathroom", "Air Conditioning", "Refrigerator", "Oven", "Stove", "Freezer", "Washing Machine"],
    airbnbLink: "https://www.airbnb.fr/rooms/1403490902913383980",
    contactPhone: "213696123800"
  },
  {
    id: "3",
    name: "apartment3_name",
    description: "apartment3_description",
    priceeur: 50,
    pricedz: 14000,
    capacity: 4,
    size: 44,
    image: "/assets/3-F2/01.avif",
    images: [
      "/assets/3-F2/01.avif",
      "/assets/3-F2/02.avif",
      "/assets/3-F2/03.avif",
      "/assets/3-F2/04.avif",
      "/assets/3-F2/05.avif",
      "/assets/3-F2/06.avif"
    ],
    location: "floor1",
    type: "F2-jacuzzi",
    features: ["Wi-Fi", "Kitchen", "Bathroom", "Air Conditioning", "Refrigerator", "Oven", "Stove", "Freezer", "Washing Machine", "Jacuzzi"],
    airbnbLink: "https://www.airbnb.fr/rooms/1406477130010047362",
    contactPhone: "213696123800"
  },
  {
    id: "4",
    name: "apartment4_name",
    description: "apartment4_description",
    priceeur: 40,
    pricedz: 10000,
    capacity: 4,
    size: 33,
    image: "/assets/4-F2/01.avif",
    images: [
      "/assets/4-F2/01.avif",
      "/assets/4-F2/02.avif",
      "/assets/4-F2/03.avif",
      "/assets/4-F2/04.avif",
      "/assets/4-F2/05.avif",
      "/assets/4-F2/06.avif",
    ],
    location: "floor2",
    type: "F2",
    features: ["Wi-Fi", "Kitchen", "Bathroom", "Air Conditioning", "Refrigerator", "Oven", "Stove", "Freezer", "Washing Machine"],
    airbnbLink: "https://www.airbnb.fr/rooms/1466501144879461799",
    contactPhone: "213561472990"
  },
  {
    id: "5",
    name: "apartment5_name",
    description: "apartment5_description",
    priceeur: 40,
    pricedz: 10000,
    capacity: 4,
    size: 33,
    image: "/assets/5-F2/01.avif",
    images: [
      "/assets/5-F2/01.avif",
      "/assets/5-F2/02.avif",
      "/assets/5-F2/03.avif",
      "/assets/5-F2/04.avif",
      "/assets/5-F2/05.avif",
      "/assets/5-F2/06.avif",
      "/assets/5-F2/07.avif"
    ],
    location: "floor2",
    type: "F2",
    features: ["Wi-Fi", "Kitchen", "Bathroom", "Air Conditioning", "Refrigerator", "Oven", "Stove", "Freezer", "Washing Machine"],
    airbnbLink: "https://www.airbnb.fr/rooms/1459886902893228309",
    contactPhone: "213561472990"
  },
  {
    id: "6",
    name: "apartment6_name",
    description: "apartment6_description",
    priceeur: 40,
    pricedz: 10000,
    capacity: 4,
    size: 36,
    image: "/assets/6-F2/01.avif",
    images: [
      "/assets/6-F2/01.avif",
      "/assets/6-F2/02.avif",
      "/assets/6-F2/03.avif",
      "/assets/6-F2/04.avif",
      "/assets/6-F2/05.avif",
      "/assets/6-F2/06.avif"
    ],
    location: "floor2",
    type: "F2",
    features: ["Wi-Fi", "Kitchen", "Bathroom", "Air Conditioning", "Refrigerator", "Oven", "Stove", "Freezer", "Washing Machine"],
    airbnbLink: "https://www.airbnb.fr/rooms/1456024577261385927",
    contactPhone: "213561472990"
  },
  {
    id: "7",
    name: "apartment7_name",
    description: "apartment7_description",
    priceeur: 100,
    pricedz: 25000,
    capacity: 8,
    size: 132,
    image: "/assets/7-F3/01.avif",
    images: [
      "/assets/7-F3/01.avif",
      "/assets/7-F3/02.avif",
      "/assets/7-F3/03.avif",
      "/assets/7-F3/04.avif",
      "/assets/7-F3/05.avif",
      "/assets/7-F3/06.avif",
      "/assets/7-F3/07.avif",
      "/assets/7-F3/08.avif"
    ],
    location: "floor3",
    type: "F3",
    features: ["Wi-Fi", "Kitchen", "Bathroom", "Air Conditioning", "Refrigerator", "Oven", "Stove", "Freezer", "Washing Machine", "TV", "Microwave", "Terrace", "Dishwasher"],
    airbnbLink: "https://www.airbnb.fr/rooms/1476767652269208861",
    contactPhone: "213561472990"
  },
];

// Featured apartments (for homepage)
export const featuredApartments: ApartmentProps[] = [
  allApartments[2], // F2 Suite Jacuzzi
  allApartments[6], // F3 Deluxe Suite Private Terrace
];

// Gallery images data
export const galleryImages = [
  // Studio images
  { id: 1, src: '/assets/1-STUDIO/01.avif', alt: 'Studio Deluxe - Living Area', category: 'apartments', apartment: '1' },
  { id: 2, src: '/assets/1-STUDIO/02.avif', alt: 'Studio Deluxe - Kitchen', category: 'apartments', apartment: '1' },
  { id: 3, src: '/assets/1-STUDIO/03.avif', alt: 'Studio Deluxe - Bathroom', category: 'apartments', apartment: '1' },
  { id: 4, src: '/assets/1-STUDIO/04.avif', alt: 'Studio Deluxe - Bedroom Area', category: 'apartments', apartment: '1' },

  // F2 Double Classique images (Apartment 2)
  { id: 21, src: '/assets/2-F2/01.avif', alt: 'F2 Double Classique - Living Room', category: 'apartments', apartment: '2' },
  { id: 22, src: '/assets/2-F2/02.avif', alt: 'F2 Double Classique - Kitchen', category: 'apartments', apartment: '2' },
  { id: 23, src: '/assets/2-F2/03.avif', alt: 'F2 Double Classique - Bedroom', category: 'apartments', apartment: '2' },
  { id: 24, src: '/assets/2-F2/04.avif', alt: 'F2 Double Classique - Bathroom', category: 'apartments', apartment: '2' },

  // F2 Suite Jacuzzi images (Apartment 3)
  { id: 31, src: '/assets/3-F2/01.avif', alt: 'F2 Suite Jacuzzi - Living Room', category: 'apartments', apartment: '3' },
  { id: 32, src: '/assets/3-F2/02.avif', alt: 'F2 Suite Jacuzzi - Kitchen', category: 'apartments', apartment: '3' },
  { id: 33, src: '/assets/3-F2/03.avif', alt: 'F2 Suite Jacuzzi - Bedroom', category: 'apartments', apartment: '3' },
  { id: 34, src: '/assets/3-F2/04.avif', alt: 'F2 Suite Jacuzzi - Bathroom', category: 'apartments', apartment: '3' },
  { id: 35, src: '/assets/3-F2/05.avif', alt: 'F2 Suite Jacuzzi - Jacuzzi', category: 'apartments', apartment: '3' },
  { id: 36, src: '/assets/3-F2/06.avif', alt: 'F2 Suite Jacuzzi - Additional View', category: 'apartments', apartment: '3' },

  // F2 Double Classique images (Apartment 5)
  { id: 41, src: '/assets/5-F2/01.avif', alt: 'F2 Double Classique - Living Room', category: 'apartments', apartment: '5' },
  { id: 42, src: '/assets/5-F2/02.avif', alt: 'F2 Double Classique - Kitchen', category: 'apartments', apartment: '5' },
  { id: 43, src: '/assets/5-F2/03.avif', alt: 'F2 Double Classique - Bedroom', category: 'apartments', apartment: '5' },
  { id: 44, src: '/assets/5-F2/04.avif', alt: 'F2 Double Classique - Bathroom', category: 'apartments', apartment: '5' },
  { id: 45, src: '/assets/5-F2/05.avif', alt: 'F2 Double Classique - Additional View 1', category: 'apartments', apartment: '5' },
  { id: 46, src: '/assets/5-F2/06.avif', alt: 'F2 Double Classique - Additional View 2', category: 'apartments', apartment: '5' },
  { id: 47, src: '/assets/5-F2/07.avif', alt: 'F2 Double Classique - Additional View 3', category: 'apartments', apartment: '5' },

  // F2 Double Classique images (Apartment 4)
  { id: 51, src: '/assets/4-F2/01.avif', alt: 'F2 Double Classique - Chambre', category: 'apartments', apartment: '4' },

  // F2 Deluxe Double images (Apartment 6)
  { id: 61, src: '/assets/6-F2/01.avif', alt: 'F2 Deluxe Double - Living Room', category: 'apartments', apartment: '6' },
  { id: 62, src: '/assets/6-F2/02.avif', alt: 'F2 Deluxe Double - Kitchen', category: 'apartments', apartment: '6' },
  { id: 63, src: '/assets/6-F2/03.avif', alt: 'F2 Deluxe Double - Bedroom', category: 'apartments', apartment: '6' },
  { id: 64, src: '/assets/6-F2/04.avif', alt: 'F2 Deluxe Double - Bathroom', category: 'apartments', apartment: '6' },
  { id: 65, src: '/assets/6-F2/05.avif', alt: 'F2 Deluxe Double - Additional View 1', category: 'apartments', apartment: '6' },
  { id: 66, src: '/assets/6-F2/06.avif', alt: 'F2 Deluxe Double - Additional View 2', category: 'apartments', apartment: '6' },

  // F3 Deluxe Suite Private Terrace (Apartment 7)
  { id: 71, src: '/assets/7-F3/01.avif', alt: '', category: 'apartments', apartment: '7' },
  { id: 72, src: '/assets/7-F3/02.avif', alt: '', category: 'apartments', apartment: '7' },
  { id: 73, src: '/assets/7-F3/03.avif', alt: '', category: 'apartments', apartment: '7' },
  { id: 74, src: '/assets/7-F3/04.avif', alt: '', category: 'apartments', apartment: '7' },
  { id: 75, src: '/assets/7-F3/05.avif', alt: '', category: 'apartments', apartment: '7' },
  { id: 76, src: '/assets/7-F3/06.avif', alt: '', category: 'apartments', apartment: '7' },
  { id: 77, src: '/assets/7-F3/07.avif', alt: '', category: 'apartments', apartment: '7' },
  { id: 78, src: '/assets/7-F3/08.avif', alt: '', category: 'apartments', apartment: '7' },

  // Common images
  { id: 91, src: '/assets/COMMON/01.avif', alt: 'Rusica Park', category: 'proximity' },
  { id: 92, src: '/assets/COMMON/02.avif', alt: 'Plage - Jeanne d\'Arc', category: 'proximity' },
  { id: 93, src: '/assets/COMMON/03.avif', alt: 'Rusica Park - Aquaparc', category: 'proximity' },
  { id: 94, src: '/assets/COMMON/04.avif', alt: 'Rusica Park', category: 'proximity' },
  { id: 95, src: '/assets/COMMON/05.avif', alt: 'Plage - Jeanne d\'Arc', category: 'proximity' },
];

// Testimonials data
export interface Testimonial {
  id: number;
  name: string;
  location: string;
  avatar: string;
  originalContent: string;
  translatedContent: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Zakaria',
    location: 'Saint-Priest, France',
    avatar: '/assets/logo.avif',
    originalContent: 'Parfait tout l\'appartement nickel, l\'hôte très sympa merci',
    translatedContent: 'Perfect, the apartment was spotless, the host was very nice, thank you',
    rating: 5
  },
  {
    id: 2,
    name: 'Ranya',
    location: 'Monaco, France',
    avatar: '/assets/logo.avif',
    originalContent: 'Le logement était impeccable, très propre et conforme à la description ainsi qu\'aux photos. On s\'y sent tout de suite bien. L\'hôtel est très agréable, bien situé et parfaitement entretenu. Merci pour ce super séjour !',
    translatedContent: 'The accommodation was impeccable, very clean and in line with the description and photos. You feel at home right away. The hotel is very pleasant, well located and perfectly maintained. Thank you for this great stay!',
    rating: 5
  },
  {
    id: 3,
    name: 'Keltoum',
    location: 'France',
    avatar: '/assets/logo.avif',
    originalContent: 'Nous avons passé un excellent séjour dans cette location !',
    translatedContent: '',
    rating: 5
  },
];

// Contact information
export const contactInfo = {
  address: {
    street: "Villa N°17, Route Bouzaaroura",
    city: "Filfila, Skikda, 21000",
    country: "Algérie"
  },
  phone: {
    primary: "+213 5 61 47 29 90 (WhatsApp/Telegram)",
    secondary: "+213 6 96 12 38 00 (WhatsApp/Telegram)"
  },
  email: "...",
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61578022628802",
    whatsapp: "https://wa.me/213561472990",
    telegram: "https://t.me/residence_oasis"
  },
  hours: {
    reception: "24h",
  },
  map: {
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1213.5907643681207!2d7.024805984390581!3d36.894184300337336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12f1cd7a86daeb77%3A0xbfbebfabf4bdedec!2sR%C3%A9sidence%20Oasis!5e0!3m2!1sen!2sdz!4v1752252755553!5m2!1sen!2sdz"
  }
};

// Site configuration
export const siteConfig = {
  name: "Résidence Oasis",
  description: "Modern equipped apartments near the beaches, offering the perfect blend of comfort and elegance for dream vacations.",
  logo: "/assets/logo.avif",
  logoOnly: "/assets/logo-only.avif",
  heroImage: "/assets/COMMON/00-background.avif",
  heroImage2: "/assets/COMMON/02-background.avif",
  heroImage3: "/assets/COMMON/01-background.avif"
};
