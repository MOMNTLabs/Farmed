import Link from "next/link";
import { getPharmacySettings } from "@/lib/settings";

export async function PublicFooter() {
  const settings = await getPharmacySettings();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-slate-600 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-bold text-ink">{settings.tradeName}</p>
          <p className="mt-2">{settings.institutionalText}</p>
        </div>
        <div>
          <p className="font-semibold text-ink">Contato</p>
          <p className="mt-2">{settings.address}</p>
          <p>{[settings.city, settings.state].filter(Boolean).join(" / ")}</p>
          <p>{settings.phone}</p>
          <p>{settings.email}</p>
        </div>
        <div>
          <p className="font-semibold text-ink">Informações sanitárias</p>
          <p className="mt-2">{settings.sanitaryNotice}</p>
          <div className="mt-4 flex gap-4 font-medium text-brand-700">
            <Link href="/sobre">Sobre</Link>
            <Link href="/contato">Contato</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
