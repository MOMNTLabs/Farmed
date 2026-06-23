import Image from "next/image";

type ProductImageProps = {
  src?: string | null;
  alt?: string | null;
  className?: string;
};

export function ProductImage({ src, alt, className }: ProductImageProps) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-slate-100 ${className ?? ""}`}>
      <Image
        src={src || "/images/product-placeholder.png"}
        alt={alt || "Imagem do produto"}
        fill
        sizes="(max-width: 768px) 100vw, 320px"
        className="object-cover"
      />
    </div>
  );
}
