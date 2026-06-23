import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="panel max-w-md p-8 text-center">
        <p className="text-sm font-semibold text-brand-700">404</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">Página não encontrada</h1>
        <p className="mt-3 text-sm text-slate-600">O endereço acessado não existe ou foi removido.</p>
        <Link href="/" className="btn-primary mt-6">
          Voltar para a loja
        </Link>
      </div>
    </main>
  );
}
