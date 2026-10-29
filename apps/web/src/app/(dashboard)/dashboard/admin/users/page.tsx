"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { getErrorMessage } from "@/lib/utils";

type UserSummary = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  emailVerifiedAt: string | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "INSTRUCTOR",
  });

  const loadUsers = async () => {
    try {
      const { data } = await api.get<UserSummary[]>("/users");
      setUsers(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Gagal memuat pengguna"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const createUser = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await api.post("/users", form);
      setForm({ name: "", email: "", password: "", role: "INSTRUCTOR" });
      toast.success("Akun berhasil dibuat dan diverifikasi oleh admin.");
      await loadUsers();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Gagal membuat akun"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-fg mb-2">Manajemen Pengguna</h1>
        <p className="text-muted">Lihat pengguna dan buat akun instruktur.</p>
      </div>

      <GlassCard className="p-6">
        <h2 className="text-lg font-bold text-fg mb-4">Buat akun instruktur</h2>
        <form onSubmit={createUser} className="grid gap-4 md:grid-cols-2">
          <Input
            required
            placeholder="Nama lengkap"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <Input
            required
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
          />
          <Input
            required
            minLength={8}
            type="password"
            placeholder="Password awal (min. 8 karakter)"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
          />
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Membuat..." : "Buat akun instruktur"}
          </Button>
        </form>
      </GlassCard>

      <GlassCard className="p-0 overflow-hidden">
        {isLoading ? (
          <p className="p-8 text-muted">Memuat pengguna...</p>
        ) : users.length === 0 ? (
          <p className="p-8 text-muted">Belum ada pengguna.</p>
        ) : (
          <div className="divide-y divide-line">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold text-fg">
                    {user.name || "Tanpa nama"}
                  </p>
                  <p className="text-sm text-muted">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-surface-2 px-3 py-1 text-xs font-bold text-turbo">
                    {user.role}
                  </span>
                  <span className="text-xs text-muted">
                    {user.emailVerifiedAt
                      ? "Terverifikasi"
                      : "Belum verifikasi"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
