"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      setError("Kode login tidak ditemukan. Silakan coba masuk kembali.");
      return;
    }

    AuthService.exchangeOAuthCode(code)
      .then((result) => {
        const isSecure = window.location.protocol === "https:";
        Cookies.set("token", result.access_token, {
          expires: 1 / 24,
          sameSite: isSecure ? "None" : "Lax",
          secure: isSecure,
        });
        router.replace("/dashboard");
      })
      .catch(() =>
        setError(
          "Login Google tidak berhasil atau tautan sudah kedaluwarsa. Silakan coba lagi.",
        ),
      );
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-4">
      <GlassCard className="w-full max-w-md p-8 text-center">
        {error ? (
          <>
            <p role="alert" className="mb-5 text-muted">
              {error}
            </p>
            <Button asChild>
              <Link href="/auth/login">Kembali ke login</Link>
            </Button>
          </>
        ) : (
          <p className="text-muted">Menyelesaikan login Google...</p>
        )}
      </GlassCard>
    </main>
  );
}
