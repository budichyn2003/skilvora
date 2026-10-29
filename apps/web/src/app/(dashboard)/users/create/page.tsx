"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/users", formData);
      toast.success("Berhasil menambahkan user baru!");
      router.push("/dashboard/users"); // Kembali ke tabel setelah sukses
    } catch (error: any) {
      toast.error(
        "Gagal: " + (error.response?.data?.message || "Terjadi kesalahan"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Tambah User</h1>
            <p className="text-zinc-500">Standar Form Input Core Engine</p>
          </div>
          <Button onClick={() => router.back()} variant="secondary">
            Batal
          </Button>
        </div>

        <div className="bg-surface rounded-lg border border-zinc-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                placeholder="Masukkan nama"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                placeholder="email@stackplus.studio"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-zinc-900 focus:outline-none"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Role Akses
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:ring-2 focus:ring-zinc-900 focus:outline-none bg-surface"
              >
                <option value="USER">User Reguler</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Data"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
