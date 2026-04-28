import type { ImgHTMLAttributes } from "react";

const VARIANT_WIDTHS = [480, 768] as const;
const SOURCE_WIDTH = 1000;

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  src: string;
  alt: string;
  /** Required to let the browser pick the right variant (e.g. "(max-width: 640px) 100vw, 33vw") */
  sizes: string;
  width?: number;
  height?: number;
};

function buildSrcSet(src: string): string {
  const dot = src.lastIndexOf(".");
  if (dot === -1) return src;
  const base = src.slice(0, dot);
  const ext = src.slice(dot);
  const variants = VARIANT_WIDTHS.map((w) => `${base}-${w}w${ext} ${w}w`);
  variants.push(`${src} ${SOURCE_WIDTH}w`);
  return variants.join(", ");
}

export function ResponsiveImage({
  src,
  alt,
  sizes,
  width = 1000,
  height = 751,
  loading = "lazy",
  decoding = "async",
  ...rest
}: Props) {
  return (
    <img
      src={src}
      srcSet={buildSrcSet(src)}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      {...rest}
    />
  );
}
