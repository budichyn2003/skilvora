"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { AuthService } from "@/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Konfirmasi kata sandi tidak cocok!");
    }

    setIsLoading(true);
    try {
      await AuthService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.success(
        "Akun dibuat. Periksa email untuk memverifikasi akun sebelum masuk.",
      );
      router.push("/auth/login");
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(message || "Gagal mendaftar akun");
    } finally {
      setIsLoading(false);
    }
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
            01 / Buat akun
          </p>
          <h1 className="max-w-3xl font-display text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.94] tracking-[-0.06em]">
            Mulai bangun <span className="text-turbo">keahlian Anda.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Daftar untuk memilih jalur belajar dan menyimpan progres kelas Anda.
          </p>
        </section>

        <div className="flex items-center px-4 py-10 sm:px-8 lg:px-12">
          <GlassCard className="mx-auto w-full max-w-md border border-line bg-surface p-6 sm:p-8">
            <h2 className="mb-7 font-display text-2xl font-semibold tracking-tight">
              Informasi akun
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="register-name"
                  className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle"
                >
                  Nama Lengkap
                </label>
                <Input
                  id="register-name"
                  name="name"
                  placeholder="Budi Cahyono"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle"
                >
                  Email
                </label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="register-password"
                  className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle"
                >
                  Kata Sandi
                </label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="mb-2 block font-mono text-xs uppercase tracking-wider text-subtle"
                >
                  Konfirmasi Kata Sandi
                </label>
                <Input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Memproses..." : "Daftar Akun"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Sudah punya akun?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-turbo hover:text-fg hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
