"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token)
      return setMessage("Tautan reset tidak valid atau tidak memiliki token.");
    if (password !== confirmPassword)
      return setMessage("Konfirmasi password tidak cocok.");
    setIsLoading(true);
    setMessage("");
    try {
      await AuthService.resetPassword(token, password);
      setIsComplete(true);
      setMessage(
        "Password berhasil diperbarui. Silakan masuk dengan password baru.",
      );
    } catch (error: any) {
      setMessage(
        error.response?.data?.message ||
          "Tautan reset tidak valid atau sudah kedaluwarsa.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-4">
      <GlassCard className="w-full max-w-md p-8">
        <h1 className="mb-2 text-2xl font-bold text-fg">Atur ulang password</h1>
        <form onSubmit={submit} className="space-y-4 mt-6">
          <Input
            type="password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password baru (min. 8 karakter)"
            aria-label="Password baru"
          />
          <Input
            type="password"
            minLength={8}
            required
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Konfirmasi password baru"
            aria-label="Konfirmasi password baru"
          />
          <Button
            type="submit"
            disabled={isLoading || isComplete}
            className="w-full"
          >
            {isLoading ? "Menyimpan..." : "Simpan password baru"}
          </Button>
        </form>
        {message && (
          <p role="status" className="mt-4 text-sm text-muted">
            {message}
          </p>
        )}
        {isComplete && (
          <Link
            href="/auth/login"
            className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-turbo hover:text-fg"
          >
            Masuk
          </Link>
        )}
      </GlassCard>
    </main>
  );
}
