"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const result = await AuthService.requestPasswordReset(email);
      setMessage(result.message);
    } catch {
      setMessage("Permintaan belum dapat diproses. Silakan coba kembali.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-4">
      <GlassCard className="w-full max-w-md p-8">
        <h1 className="mb-2 text-2xl font-bold text-fg">Lupa password?</h1>
        <p className="mb-6 text-sm text-muted">
          Kami akan mengirim tautan pengaturan ulang jika email terdaftar.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <Input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@email.com"
            aria-label="Alamat email"
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Mengirim..." : "Kirim tautan reset"}
          </Button>
        </form>
        {message && (
          <p role="status" className="mt-4 text-sm text-muted">
            {message}
          </p>
        )}
        <Link
          href="/auth/login"
          className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-turbo hover:text-fg"
        >
          Kembali ke login
        </Link>
      </GlassCard>
    </main>
  );
}
