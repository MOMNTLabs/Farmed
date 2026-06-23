import { saveSettings } from "@/app/(admin)/admin/actions";
import { getPharmacySettings } from "@/lib/settings";

export default async function SettingsPage() {
  const settings = await getPharmacySettings();

  return (
    <div>
      <h1 className="text-3xl font-bold text-ink">Configurações da farmácia</h1>
      <form action={saveSettings} className="panel mt-6 grid gap-5 p-5 md:grid-cols-2">
        <Field label="Nome fantasia" name="tradeName" defaultValue={settings.tradeName} required />
        <Field label="Razão social" name="legalName" defaultValue={settings.legalName || ""} />
        <Field label="CNPJ" name="cnpj" defaultValue={settings.cnpj || ""} />
        <Field label="Endereço completo" name="address" defaultValue={settings.address || ""} />
        <Field label="Cidade" name="city" defaultValue={settings.city || ""} />
        <Field label="UF" name="state" defaultValue={settings.state || ""} />
        <Field label="Telefone" name="phone" defaultValue={settings.phone || ""} />
        <Field label="WhatsApp" name="whatsapp" defaultValue={settings.whatsapp || ""} />
        <Field label="E-mail" name="email" defaultValue={settings.email || ""} />
        <Field label="Horário de funcionamento" name="openingHours" defaultValue={settings.openingHours || ""} />
        <Field label="Farmacêutico responsável" name="pharmacistName" defaultValue={settings.pharmacistName || ""} />
        <Field label="CRF" name="pharmacistCrf" defaultValue={settings.pharmacistCrf || ""} />
        <Field label="Licença/Alvará sanitário" name="sanitaryLicense" defaultValue={settings.sanitaryLicense || ""} />
        <Field label="AFE" name="afe" defaultValue={settings.afe || ""} />
        <Field label="Instagram" name="instagram" defaultValue={settings.instagram || ""} />
        <Field label="Facebook" name="facebook" defaultValue={settings.facebook || ""} />
        <Area label="Texto institucional" name="institutionalText" defaultValue={settings.institutionalText} />
        <Area label="Mensagem padrão de WhatsApp" name="whatsappDefaultText" defaultValue={settings.whatsappDefaultText} />
        <Area label="Avisos sanitários exibidos no site" name="sanitaryNotice" defaultValue={settings.sanitaryNotice} />
        <label className="flex items-center gap-2 rounded-md border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700">
          <input type="checkbox" name="hideControlledPublic" defaultChecked={settings.hideControlledPublic} className="h-4 w-4" />
          Ocultar controlados da loja publica
        </label>
        <div className="md:col-span-2">
          <button className="btn-primary">Salvar configurações</button>
        </div>
      </form>
    </div>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  const { label, ...inputProps } = props;
  return (
    <div>
      <label className="label">{label}</label>
      <input {...inputProps} className="field mt-1" />
    </div>
  );
}

function Area({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string | null }) {
  return (
    <div className="md:col-span-2">
      <label className="label">{label}</label>
      <textarea name={name} defaultValue={defaultValue || ""} className="field mt-1 min-h-28" />
    </div>
  );
}
