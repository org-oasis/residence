/**
 * SVG icon registry — single source of truth.
 * Paths are adapted from open-source sets (Lucide MIT, Bootstrap Icons MIT,
 * Material Symbols Apache 2.0, Simple Icons CC0) and inlined to avoid any
 * runtime icon-library dependency.
 *
 * Usage: <Wifi className="h-4 w-4" />
 * All icons accept className / size / title for a11y.
 */
import type { ReactElement, SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  size?: number | string;
  title?: string;
}

type IconFactory = (props: IconProps) => ReactElement;

/** Outline icon (Lucide-style, stroke currentColor). viewBox 24×24.
 *  Width/height are SVG attributes (overridable by Tailwind h-X w-X classes). */
const strokeIcon = (body: ReactElement): IconFactory =>
  function StrokeIcon({ size = "1em", title, className, ...rest }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        shapeRendering="geometricPrecision"
        focusable="false"
        className={className}
        role={title ? "img" : "presentation"}
        aria-hidden={title ? undefined : true}
        aria-label={title}
        {...rest}
      >
        {title ? <title>{title}</title> : null}
        {body}
      </svg>
    );
  };

/** Filled icon (Bootstrap/Material style, fill currentColor). viewBox 16×16 by default. */
const fillIcon = (body: ReactElement, viewBox = "0 0 16 16"): IconFactory =>
  function FillIcon({ size = "1em", title, className, ...rest }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox={viewBox}
        fill="currentColor"
        shapeRendering="geometricPrecision"
        focusable="false"
        className={className}
        role={title ? "img" : "presentation"}
        aria-hidden={title ? undefined : true}
        aria-label={title}
        {...rest}
      >
        {title ? <title>{title}</title> : null}
        {body}
      </svg>
    );
  };

// ───────────── UI / Navigation (Lucide outline) ─────────────

export const ArrowLeft = strokeIcon(
  <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>
);
export const ArrowRight = strokeIcon(
  <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>
);
export const ChevronLeft = strokeIcon(<path d="m15 18-6-6 6-6" />);
export const ChevronRight = strokeIcon(<path d="m9 18 6-6-6-6" />);
export const ChevronUp = strokeIcon(<path d="m18 15-6-6-6 6" />);
export const ChevronDown = strokeIcon(<path d="m6 9 6 6 6-6" />);
export const X = strokeIcon(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>);
export const Menu = strokeIcon(
  <><path d="M4 12h16" /><path d="M4 6h16" /><path d="M4 18h16" /></>
);
export const Check = strokeIcon(<path d="M20 6 9 17l-5-5" />);
export const Maximize2 = strokeIcon(
  <>
    <path d="M15 3h6v6" />
    <path d="M9 21H3v-6" />
    <path d="m21 3-7 7" />
    <path d="m3 21 7-7" />
  </>
);
export const MoreHorizontal = strokeIcon(
  <>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </>
);
export const Info = strokeIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </>
);
export const Filter = strokeIcon(
  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
);
export const Star = strokeIcon(
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
);

// ───────────── Meta / UI filled ─────────────

export const Users = fillIcon(
  <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
);
export const Expand = strokeIcon(
  <>
    <path d="M10 15v-3"/>
    <path d="M14 15v-3"/>
    <path d="M18 15v-3"/>
    <path d="M2 8V4"/>
    <path d="M22 6H2"/>
    <path d="M22 8V4"/>
    <path d="M6 15v-3"/><rect x="2" y="12" width="20" height="8" rx="2"/>
  </>
);
export const MapPin = strokeIcon(
  <>
    <path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </>
);
export const Home = strokeIcon(
  <>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </>
);
export const Building = strokeIcon(
  <>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
    <path d="M10 6h4" />
    <path d="M10 10h4" />
    <path d="M10 14h4" />
    <path d="M10 18h4" />
  </>
);
export const Price = strokeIcon(
  <>
    <path d="M4 10h12"/>
    <path d="M4 14h9"/>
    <path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/>
  </>
);
export const Clock = strokeIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>
);
export const Mail = strokeIcon(
  <>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-10 5L2 7" />
  </>
);
export const FileCheck = strokeIcon(
  <>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="m9 15 2 2 4-4" />
  </>
);
export const Wrench = strokeIcon(
  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
);
export const Shield = strokeIcon(
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
);
export const Volume2 = strokeIcon(
  <>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </>
);
export const PawPrint = strokeIcon(
  <>
    <circle cx="11" cy="4" r="2" />
    <circle cx="18" cy="8" r="2" />
    <circle cx="4" cy="8" r="2" />
    <circle cx="8.5" cy="14" r="2" />
    <path d="M14.5 14A2.5 2.5 0 0 0 17 16.5 2.5 2.5 0 0 0 19.5 19c0 1.5-1.5 2.5-3 2.5s-2-1-3-1c-1.5 0-2 1-3 1s-3-1-3-2.5A2.5 2.5 0 0 0 11 16.5 2.5 2.5 0 0 0 13.5 14Z" />
  </>
);
export const Cigarette = strokeIcon(
  <>
    <path d="M17 12H3v4h14" />
    <path d="M18 8c0-2.5-2-2.5-2-5" />
    <path d="M22 8c0-2.5-2-2.5-2-5" />
    <path d="M21 12v4" />
    <path d="M18 12v4" />
  </>
);

// ───────────── Feature icons — filled ─────────────

export const Wifi = strokeIcon(
  <>
    <path d="M2 8.82a15 15 0 0 1 20 0" />
    <path d="M5 12.859a10 10 0 0 1 14 0" />
    <path d="M8.5 16.429a5 5 0 0 1 7 0" />
    <line x1="12" x2="12.01" y1="20" y2="20" />
  </>
);
export const Tv = strokeIcon(
  <>
    <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
    <polyline points="17 2 12 7 7 2" />
  </>
);
export const Bath = strokeIcon(
  <>
    <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5" />
    <line x1="10" x2="8" y1="5" y2="7" />
    <line x1="2" x2="22" y1="12" y2="12" />
    <line x1="7" x2="7" y1="19" y2="21" />
    <line x1="17" x2="17" y1="19" y2="21" />
  </>
);
export const Utensils = strokeIcon(
  <>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
  </>
);
export const CookingPot = strokeIcon(
  <>
    <path d="M2 12h20" />
    <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
    <path d="m4 8 16-4" />
    <path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.44l.98-.24a2 2 0 0 1 2.43 1.46l.45 1.8" />
  </>
);
export const Snowflake = strokeIcon(
  <>
    <line x1="2" x2="22" y1="12" y2="12" />
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="m20 16-4-4 4-4" />
    <path d="m4 8 4 4-4 4" />
    <path d="m16 4-4 4-4-4" />
    <path d="m8 20 4-4 4 4" />
  </>
);
export const Refrigerator = strokeIcon(
  <>
    <path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z" />
    <path d="M5 10h14" />
    <path d="M15 7v-1" />
    <path d="M15 14v-1" />
  </>
);
export const Oven = strokeIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <rect x="6" y="11" width="12" height="7" rx="1" />
    <circle cx="8" cy="7" r=".75" fill="currentColor" />
    <circle cx="12" cy="7" r=".75" fill="currentColor" />
    <circle cx="16" cy="7" r=".75" fill="currentColor" />
  </>
);
export const Stove = strokeIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8" cy="8" r="2" />
    <circle cx="16" cy="8" r="2" />
    <circle cx="8" cy="16" r="2" />
    <circle cx="16" cy="16" r="2" />
  </>
);
export const WashingMachine = strokeIcon(
  <>
    <rect x="3" y="2" width="18" height="20" rx="2" />
    <path d="M6 6h.01" />
    <path d="M10 6h.01" />
    <circle cx="12" cy="14" r="5" />
    <path d="M12 9.5A2.5 2.5 0 0 1 14.5 12" />
  </>
);
export const Microwave = strokeIcon(
  <>
    <rect width="20" height="15" x="2" y="4" rx="2" />
    <rect width="8" height="7" x="6" y="8" rx="1" />
    <path d="M18 8v7" />
    <path d="M6 19v2" />
    <path d="M18 19v2" />
  </>
);
export const Dishwasher = strokeIcon(
  <>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <line x1="4" y1="9" x2="20" y2="9" />
    <circle cx="8" cy="6" r=".5" fill="currentColor" />
    <circle cx="11" cy="6" r=".5" fill="currentColor" />
    <path d="M8 13c1.3 1.3 2.7 1.3 4 0s2.7-1.3 4 0" />
    <path d="M8 17c1.3 1.3 2.7 1.3 4 0s2.7-1.3 4 0" />
  </>
);
export const Balcony = strokeIcon(
  <>
    <path d="M3 10h18v3H3z" />
    <path d="M5 13v8" />
    <path d="M9 13v8" />
    <path d="M15 13v8" />
    <path d="M19 13v8" />
    <path d="M3 21h18" />
    <path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
  </>
);
export const Blinds = strokeIcon(
  <>
    <path d="M3 3h18" />
    <path d="M20 7H8" />
    <path d="M20 11H8" />
    <path d="M10 19h10" />
    <path d="M8 15h12" />
    <path d="M4 3v14a2 2 0 0 0 2 2h0" />
    <circle cx="4" cy="21" r="1" />
  </>
);
export const HotTub = strokeIcon(
  <>
    <path d="M4 11V6a2 2 0 0 1 2-2c1 0 1.5.5 2 1l1 1" />
    <rect x="2" y="11" width="20" height="6" rx="2" />
    <path d="M6 17v2" />
    <path d="M18 17v2" />
    <path d="M8 7c1 0 1 1 2 1s1-1 2-1 1 1 2 1 1-1 2-1" />
  </>
);
export const Sauna = strokeIcon(
  <>
    <path d="M3 21h18" />
    <path d="M5 21V8l7-4 7 4v13" />
    <path d="M9 13c1-1 1-2 0-3s-1-2 0-3" />
    <path d="M12 13c1-1 1-2 0-3s-1-2 0-3" />
    <path d="M15 13c1-1 1-2 0-3s-1-2 0-3" />
  </>
);
export const Parking = strokeIcon(
  <>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
  </>
);
export const Waves = strokeIcon(
  <>
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2" />
    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1" />
    <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1" />
  </>
);
export const LifeBuoy = strokeIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="m4.93 4.93 4.24 4.24" />
    <path d="m14.83 9.17 4.24-4.24" />
    <path d="m14.83 14.83 4.24 4.24" />
    <path d="m9.17 14.83-4.24 4.24" />
    <circle cx="12" cy="12" r="4" />
  </>
);

// ───────────── Actions / Brand ─────────────

export const Phone = strokeIcon(
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
);
export const Calendar = strokeIcon(
  <>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </>
);
export const Images = strokeIcon(
  <>
    <path d="M18 22H4a2 2 0 0 1-2-2V6" />
    <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" />
    <circle cx="12" cy="8" r="2" />
    <rect width="16" height="16" x="6" y="2" rx="2" />
  </>
);
export const MessageCircle = strokeIcon(
  <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
);
export const Send = strokeIcon(
  <>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </>
);
export const Facebook = strokeIcon(
  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
);

export const Car = strokeIcon(
  <>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </>,
);

// Brand icons — Simple Icons CC0, viewBox 0 0 24 24 filled
export const Whatsapp = fillIcon(
  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.465 3.488" />,
  "0 0 24 24"
);
export const Telegram = fillIcon(
  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />,
  "0 0 24 24"
);
export const Airbnb = fillIcon(
  <path d="m16 1c1.4875 0 2.9145.62595 3.9012 1.83134.5711667.694075 1.2066389 1.89078194 1.6351782 2.7357169l.2559218.5095731c1.9717714 3.84974571 3.8970367 7.7351461 5.7061469 11.6001357l1.0527212 2.2755537c.2442722.5357223.6021666 1.3323778.8348388 1.8877445l.1528931.3781361c.2774.7566.433 1.5511.433 2.3787 0 3.5246-2.7857 6.4031-6.4688 6.4031-3.1835 0-5.6326-2.0802-7.504-4.1423-1.8808 2.064-4.3581 4.1423-7.50223 4.1423-3.63403 0-6.46875-2.8732-6.46875-6.4031 0-.7093714.11431837-1.3944245.32166997-2.0521364l.11686003-.3412636.14732028-.3634926c.2618125-.6248792.68216562-1.5551583.92080875-2.0755906l.07235097-.1573168c1.76840571-3.8566286 3.66459673-7.7429388 5.61889889-11.60295324l1.37212111-2.70033801c.4205438-.81613875.986775-1.84801875 1.50075-2.47264875.9868-1.20527 2.4136-1.83116 3.9011-1.83116zm0 2c-.9183 0-1.766.37994-2.3542 1.09886-.4813417.58455833-1.0996486 1.77809958-1.5368827 2.64796863l-.1189173.23717137c-1.9648629 3.8362286-3.87987673 7.7011102-5.67697329 11.5404875l-1.04713472 2.2635986c-.30124838.6608472-.75686366 1.6784306-.92972199 2.1260139-.20209.5536-.30805 1.1129-.30805 1.6828 0 2.4201 1.93403 4.4031 4.46875 4.4031 2.34253 0 4.35533-1.6269 6.18943-3.6737-.8116-1.0042-1.6517-2.1847-2.3352-3.4276-.8316-1.5123-1.4855-3.2137-1.4855-4.8487 0-1.6499.6073-2.9633 1.6053-3.8548.9801-.8754 2.2634-1.2796 3.5291-1.2796 2.5883 0 5.1344 1.8531 5.1344 5.1344 0 1.635-.6539 3.3364-1.4855 4.8487-.6836 1.2432-1.524 2.4238-2.3357 3.4282 1.8297 2.0488 3.8093 3.6731 6.1899 3.6731 2.5732 0 4.4688-1.9778 4.4688-4.4031 0-.5699-.106-1.1292-.3081-1.6828l-.1341315-.3295324c-.2684352-.6384815-.7321018-1.6613843-.9532685-2.1404676-1.7568-3.8313429-3.642098-7.6955265-5.588449-11.53984198l-1.3495182-2.65470536c-.4047703-.78632203-.8899078-1.67180016-1.2822328-2.14822266-.5902-.72139-1.4379-1.10133-2.3562-1.10133zm0 10.9156c-.8562 0-1.64.274-2.1967.7712-.5387.4812-.9377 1.2349-.9377 2.3632 0 1.1431.4727 2.4933 1.238 3.8849.5489.9982 1.2207 1.9684 1.8964 2.8305.6757-.8621 1.3475-1.8323 1.8964-2.8305.7653-1.3916 1.238-2.7418 1.238-3.8849 0-2.0124-1.4789-3.1344-3.1344-3.1344z" />,
  "0 0 32 32"
);
