"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ApplicationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4 py-16 text-center">
      <div className="max-w-md">
        <span className="mx-auto mb-6 grid size-14 place-items-center rounded-xl border border-danger/20 bg-danger/10 text-danger">
          <AlertTriangle aria-hidden="true" className="size-7" />
        </span>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-turbo">
          Ada kendala
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-fg">
          Halaman belum dapat dimuat.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Terjadi masalah saat memuat halaman ini. Coba lagi, atau kembali ke
          beranda.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>Coba lagi</Button>
          <Button variant="ghost" asChild>
            <Link href="/">Kembali ke beranda</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
