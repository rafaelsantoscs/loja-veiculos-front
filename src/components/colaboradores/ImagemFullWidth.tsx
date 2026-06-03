// components/colaboradores/ImagemFullWidth.tsx
import Image from "next/image";

interface ImagemFullWidthProps {
  src: string;
  heightClass?: string;   // 👈 para controlar altura
  alt?: string;
}

export default function ImagemFullWidth({ src, heightClass = "h-[400px]", alt = "Imagem" }: ImagemFullWidthProps) {
  return (
    <div className={`relative w-full ${heightClass}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
      />
    </div>
  );
}
