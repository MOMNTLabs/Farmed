import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/public/BrandLogo";
import { getAdminUser } from "@/lib/auth";
import { loginAdmin } from "./actions";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [params, user] = await Promise.all([searchParams, getAdminUser()]);
  if (user) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form action={loginAdmin} className="panel w-full max-w-md p-8">
        <div className="mb-8 flex justify-center">
          <BrandLogo href="/" />
        </div>
        <h1 className="text-center text-2xl font-bold text-ink">Entrar no painel</h1>
        <p className="mt-2 text-center text-sm text-slate-600">Acesso administrativo da farmacia.</p>
        {params.erro && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">E-mail ou senha invalidos.</p>}
        <div className="mt-6 space-y-4">
          <div>
            <label className="label">E-mail</label>
            <input name="email" type="email" required className="field mt-1" />
          </div>
          <div>
            <label className="label">Senha</label>
            <input name="password" type="password" required className="field mt-1" />
          </div>
          <button className="btn-primary w-full">Entrar</button>
        </div>
      </form>
    </main>
  );
}
