"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import Link from "next/link";
import { api } from "@/lib/axios";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Panggil endpoint authentikasi NestJS bawaan CayLabs
      const response = await api.post("/auth/login", { email, password });

      // Ambil token dan simpan ke cookie agar proxy.ts (middleware) mengizinkan akses
      const token = response.data.access_token || response.data.token;
      if (token) {
        const isSecure = window.location.protocol === "https:";
        Cookies.set("token", token, {
          expires: 1 / 24,
          sameSite: isSecure ? "None" : "Lax",
          secure: isSecure,
        });
        toast.success("Login berhasil!");
        router.push("/dashboard");
      } else {
        toast.error("Gagal mendapatkan akses token.");
      }
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message || "Email atau password salah");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Gunakan fallback URL jika env belum terbaca
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1400px] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex flex-col justify-center border-b border-line px-4 py-12 sm:px-8 lg:border-b-0 lg:border-r lg:px-12 lg:py-20">
          <Link
            href="/"
            className="mb-10 inline-flex w-fit font-display text-2xl font-bold tracking-tight text-fg"
          >
            Skilvora<span className="text-turbo">.</span>
          </Link>
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-turbo">
            01 / Ruang belajar
          </p>
          <h1 className="max-w-3xl font-display text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
            Kembali ke <span className="text-turbo">progres Anda.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Masuk untuk melanjutkan kelas, melihat perkembangan, dan mengakses
            materi yang sudah Anda ikuti.
          </p>
        </section>

        <div className="flex items-center px-4 py-10 sm:px-8 lg:px-12">
          <GlassCard className="mx-auto w-full max-w-md border border-line bg-surface p-6 sm:p-8">
            <h2 className="mb-7 font-display text-2xl font-semibold tracking-tight">
              Masuk ke akun
            </h2>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="block font-mono text-xs uppercase tracking-wider text-subtle"
                >
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-subtle"
                  />
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="font-mono text-xs uppercase tracking-wider text-subtle"
                  >
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-semibold text-turbo transition-colors hover:text-fg"
                  >
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-subtle"
                  />
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4"
              >
                {isLoading ? "Memproses..." : "Masuk ke Skilvora"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-line" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-bg px-2 font-semibold text-muted">
                  Atau masuk dengan
                </span>
              </div>
            </div>

            <Button
              onClick={handleGoogleLogin}
              variant="secondary"
              type="button"
              className="w-full"
            >
              Google
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
