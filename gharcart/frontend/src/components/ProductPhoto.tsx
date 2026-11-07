import Image from "next/image";
import { productImageSrc } from "@/lib/productImage";

export function ProductPhoto({
  productSlug,
  name,
  size = "card",
}: {
  productSlug: string;
  name: string;
  size?: "card" | "detail" | "thumb";
}) {
  const frame =
    size === "detail"
      ? "mx-auto aspect-square w-56"
      : size === "thumb"
        ? "h-16 w-16 shrink-0"
        : "mx-auto aspect-square w-36";

  return (
    <span className={`relative block overflow-hidden rounded-xl bg-[#f6f1e8] ${frame}`}>
      <Image
        src={productImageSrc(productSlug)}
        alt={`${name} product photo`}
        fill
        sizes={size === "thumb" ? "64px" : size === "detail" ? "224px" : "144px"}
        className="object-contain"
      />
    </span>
  );
}
