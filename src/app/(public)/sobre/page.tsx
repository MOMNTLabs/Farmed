import { getPharmacySettings } from "@/lib/settings";

export default async function AboutPage() {
  const settings = await getPharmacySettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-ink">Sobre a {settings.tradeName}</h1>
      <p className="mt-5 whitespace-pre-line text-slate-700">{settings.institutionalText}</p>
      <div className="panel mt-8 grid gap-4 p-5 sm:grid-cols-2">
        <Info label="Razão social" value={settings.legalName} />
        <Info label="CNPJ" value={settings.cnpj} />
        <Info label="Responsável técnico" value={settings.pharmacistName} />
        <Info label="CRF" value={settings.pharmacistCrf} />
        <Info label="Licença sanitária" value={settings.sanitaryLicense} />
        <Info label="AFE" value={settings.afe} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
