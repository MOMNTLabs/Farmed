"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="panel max-w-md p-8 text-center">
        <h1 className="text-2xl font-bold text-ink">Algo nao saiu como esperado</h1>
        <p className="mt-3 text-sm text-slate-600">Tente novamente. Se persistir, fale com a farmacia.</p>
        <button onClick={reset} className="btn-primary mt-6">
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
