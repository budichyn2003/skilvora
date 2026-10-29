"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { InstructorService } from "@/services/instructor.service";
import { getErrorMessage } from "@/lib/utils";

export default function CreateClassPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // State form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "BEGINNER",
    price: 0,
    categoryId: "", // Asumsi ID kategori "Frontend" adalah 1 sesuai seeder
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await InstructorService.createClass(formData);
      toast.success("Kelas berhasil dibuat dan disimpan sebagai Draft!");
      router.push("/dashboard/instructor/manage-classes");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Gagal membuat kelas"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="secondary" size="icon" asChild>
          <Link href="/dashboard/instructor/manage-classes">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-fg">Buat Kelas Baru</h1>
          <p className="text-muted">Lengkapi detail awal kelas Anda.</p>
        </div>
      </div>

      <GlassCard className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-fg">Judul Kelas</label>
            <Input
              required
              placeholder="Contoh: Pengenalan React.js untuk Pemula"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-fg">
              Deskripsi Singkat
            </label>
            <textarea
              required
              rows={4}
              className="w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg/40 focus:outline-none focus:ring-2 focus:ring-turbo/40"
              placeholder="Jelaskan apa yang akan dipelajari siswa di kelas ini..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-fg">
                Tingkat Kesulitan
              </label>
              <select
                className="w-full rounded-md border border-line-strong bg-surface px-3 py-2.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-turbo/40"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
              >
                <option value="BEGINNER">Pemula (Beginner)</option>
                <option value="INTERMEDIATE">Menengah (Intermediate)</option>
                <option value="ADVANCED">Mahir (Advanced)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-fg">
                Harga (Rp)
              </label>
              <Input
                type="number"
                min="0"
                required
                placeholder="0 untuk gratis"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="pt-4 border-t border-line flex justify-end">
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Save className="w-4 h-4" />
              {isLoading ? "Menyimpan..." : "Simpan & Lanjutkan"}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
