import { MessageCircle } from "lucide-react";
import { getPharmacySettings } from "@/lib/settings";
import { whatsappUrl } from "@/lib/whatsapp";

export default async function ContactPage() {
  const settings = await getPharmacySettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-ink">Contato</h1>
      <div className="panel mt-6 grid gap-4 p-6 text-sm text-slate-700 sm:grid-cols-2">
        <Info label="Endereco" value={settings.address} />
        <Info label="Cidade/UF" value={[settings.city, settings.state].filter(Boolean).join(" / ")} />
        <Info label="Telefone" value={settings.phone} />
        <Info label="WhatsApp" value={settings.whatsapp} />
        <Info label="E-mail" value={settings.email} />
        <Info label="Horario" value={settings.openingHours} />
      </div>
      <a
        href={whatsappUrl(settings.whatsapp, settings.whatsappDefaultText || "Ola, gostaria de atendimento.")}
        className="btn-primary mt-6"
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle size={18} />
        Chamar no WhatsApp
      </a>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-ink">{value}</p>
    </div>
  );
}
