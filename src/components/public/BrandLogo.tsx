import Link from "next/link";
import { BrandLogoClient } from "@/components/public/BrandLogoClient";
import { getPharmacySettings } from "@/lib/settings";

type BrandLogoProps = {
  href?: string;
  compact?: boolean;
};

export async function BrandLogo({ href = "/", compact = false }: BrandLogoProps) {
  const settings = await getPharmacySettings();
  const content = <BrandLogoClient tradeName={settings.tradeName} compact={compact} />;

  return href ? <Link href={href}>{content}</Link> : content;
}
