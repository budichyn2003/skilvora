"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "verified" | "invalid">(
    "loading",
  );
  const [email, setEmail] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      const timer = setTimeout(() => setStatus("invalid"), 0);
      return () => clearTimeout(timer);
    }
    AuthService.verifyEmail(token)
      .then(() => setStatus("verified"))
      .catch(() => setStatus("invalid"));
  }, []);

  const resend = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsResending(true);
    setResendMessage("");
    try {
      const result = await AuthService.resendVerification(email);
      setResendMessage(result.message);
    } catch {
      setResendMessage(
        "Email verifikasi belum dapat dikirim. Coba kembali beberapa saat lagi.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-4">
      <GlassCard className="w-full max-w-lg p-8 text-center">
        <h1 className="mb-3 text-2xl font-bold text-fg">Verifikasi email</h1>
        {status === "loading" && (
          <p className="text-muted">Memverifikasi tautan...</p>
        )}
        {status === "verified" && (
          <>
            <p className="mb-6 text-muted">
              Email berhasil diverifikasi. Anda sekarang dapat masuk.
            </p>
            <Button asChild>
              <Link href="/auth/login">Masuk</Link>
            </Button>
          </>
        )}
        {status === "invalid" && (
          <div className="space-y-6">
            <p role="alert" className="text-danger">
              Tautan verifikasi tidak valid atau sudah kedaluwarsa.
            </p>
            <form onSubmit={resend} className="space-y-4 text-left">
              <label
                htmlFor="resend-email"
                className="font-mono text-xs uppercase tracking-[0.12em] text-subtle"
              >
                Kirim ulang tautan verifikasi
              </label>
              <Input
                id="resend-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@email.com"
              />
              <Button type="submit" className="w-full" disabled={isResending}>
                {isResending ? "Mengirim..." : "Kirim ulang verifikasi"}
              </Button>
            </form>
            {resendMessage && (
              <p className="text-sm text-muted">{resendMessage}</p>
            )}
            <div>
              <Link
                href="/auth/login"
                className="text-sm text-turbo hover:underline"
              >
                Kembali ke halaman login
              </Link>
            </div>
          </div>
        )}
      </GlassCard>
    </main>
  );
}
