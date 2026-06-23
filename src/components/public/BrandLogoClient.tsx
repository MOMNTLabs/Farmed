"use client";

import { useState } from "react";

type BrandLogoClientProps = {
  tradeName: string;
  compact: boolean;
};

export function BrandLogoClient({ tradeName, compact }: BrandLogoClientProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = compact ? "/brand/logo-icon.png" : "/brand/logo-horizontal.png";

  if (!imageFailed) {
    return (
      <span className="inline-flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={tradeName}
          className={compact ? "h-10 w-10 rounded-md object-contain" : "h-10 max-w-48 object-contain"}
          onError={() => setImageFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
        {tradeName.slice(0, 1).toUpperCase()}
      </span>
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span className="text-base font-bold text-ink">{tradeName}</span>
          <span className="text-xs text-slate-500">Farmacia e atendimento online</span>
        </span>
      )}
    </span>
  );
}
