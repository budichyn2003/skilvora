"use client";

import { useState } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Award, Search, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/axios";

type CertificateVerification = {
  isValid: boolean;
  user?: { name?: string | null };
  class?: { title?: string };
  issuedAt: string;
  revokedAt?: string | null;
};

export default function PublicVerifyPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<CertificateVerification | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await api.get(`/enrollments/certificates/verify/${code}`);
      setResult(res.data);
    } catch {
      setError("Sertifikat tidak ditemukan atau kode verifikasi tidak valid.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
        <span className="mx-auto mb-6 grid size-14 place-items-center rounded-xl bg-surface-2 text-turbo">
          <Award aria-hidden="true" className="size-7" />
        </span>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-turbo">
          Validasi kredensial
        </p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-fg sm:text-4xl">
          Verifikasi sertifikat <span className="text-turbo">Skilvora.</span>
        </h1>
        <p className="mx-auto mb-9 mt-4 max-w-xl leading-relaxed text-muted">
          Masukkan kode unik sertifikat kelulusan siswa untuk memastikan
          keaslian dokumen yang dikeluarkan oleh Skilvora.
        </p>

        <GlassCard className="mb-6 p-5 text-left sm:p-7">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label
                htmlFor="certificate-code"
                className="mb-2 block text-sm font-semibold text-fg"
              >
                Kode verifikasi sertifikat
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  id="certificate-code"
                  required
                  placeholder="Contoh: SKV-9821-XYZ..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="min-w-0 text-base"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="shrink-0 sm:px-5"
                >
                  <Search aria-hidden="true" className="size-4" />
                  {isLoading ? "Memeriksa..." : "Cek keaslian"}
                </Button>
              </div>
            </div>
          </form>
        </GlassCard>

        {result && (
          <GlassCard
            className={`p-5 text-left sm:p-7 ${
              result.isValid
                ? "border-success/30 bg-success/10"
                : "border-danger/30 bg-danger/10"
            }`}
          >
            <div
              className={`mb-4 flex items-center gap-3 text-lg font-semibold ${result.isValid ? "text-success" : "text-danger"}`}
            >
              {result.isValid ? (
                <CheckCircle aria-hidden="true" className="size-6" />
              ) : (
                <AlertCircle aria-hidden="true" className="size-6" />
              )}
              {result.isValid
                ? "Sertifikat sah dan terverifikasi"
                : "Sertifikat telah dicabut"}
            </div>
            <p className="text-sm text-muted">
              Diterbitkan atas nama:{" "}
              <strong className="text-fg">{result.user?.name}</strong>
            </p>
            <p className="mt-2 text-sm text-muted">
              Untuk kelas:{" "}
              <strong className="text-fg">{result.class?.title}</strong>
            </p>
            <p className="mt-4 text-xs text-subtle">
              Tanggal terbit:{" "}
              {new Date(result.issuedAt).toLocaleDateString("id-ID")}
            </p>
            {!result.isValid && result.revokedAt && (
              <p className="mt-1 text-xs text-danger">
                Tanggal pencabutan:{" "}
                {new Date(result.revokedAt).toLocaleDateString("id-ID")}
              </p>
            )}
          </GlassCard>
        )}

        {error && (
          <GlassCard className="flex items-center gap-4 border-danger/30 bg-danger/10 p-5 text-left">
            <AlertCircle
              aria-hidden="true"
              className="size-6 shrink-0 text-danger"
            />
            <p role="alert" className="text-sm font-semibold text-danger">
              {error}
            </p>
          </GlassCard>
        )}
      </div>
    </PublicLayout>
  );
}
