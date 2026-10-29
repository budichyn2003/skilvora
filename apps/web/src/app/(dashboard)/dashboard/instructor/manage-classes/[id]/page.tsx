"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Video,
  FileText,
  Trash2,
  Plus,
  Award,
  UploadCloud,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { InstructorService } from "@/services/instructor.service";
import { api } from "@/lib/axios";

export default function ManageClassContentPage() {
  const params = useParams();
  const classId = params.id as string;

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [newModule, setNewModule] = useState({
    title: "",
    videoUrl: "",
    content: "",
    isFreePreview: false,
  });

  const fetchCourse = async () => {
    try {
      const data = await InstructorService.getClassById(classId);
      setCourse(data);
    } catch (error) {
      toast.error("Gagal memuat detail kelas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [classId]);

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await InstructorService.createModule(classId, newModule);
      toast.success("Modul berhasil ditambahkan!");
      setNewModule({
        title: "",
        videoUrl: "",
        content: "",
        isFreePreview: false,
      });
      fetchCourse(); // Refresh daftar modul
    } catch (error) {
      toast.error("Gagal menambahkan modul");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Yakin ingin menghapus modul ini?")) return;
    try {
      await InstructorService.deleteModule(moduleId);
      toast.success("Modul berhasil dihapus");
      fetchCourse();
    } catch (error) {
      toast.error("Gagal menghapus modul");
    }
  };

  const handlePublishClass = async () => {
    if (course.modules?.length === 0) {
      return toast.error("Tidak dapat menerbitkan kelas tanpa modul.");
    }

    setIsPublishing(true);
    try {
      // Pastikan backend memiliki endpoint ini
      await api.patch(`/courses/instructor/classes/${classId}/publish`);
      toast.success("Kelas berhasil diterbitkan!");
      fetchCourse();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menerbitkan kelas");
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading)
    return (
      <div className="animate-pulse bg-surface-2 h-64 rounded-xl max-w-5xl"></div>
    );
  if (!course) return <div>Kelas tidak ditemukan.</div>;

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" asChild>
            <Link href="/dashboard/instructor/manage-classes">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-fg">{course.title}</h1>
            <p className="text-muted">
              Status:{" "}
              <span
                className={`font-semibold ${course.status === "PUBLISHED" ? "text-success" : "text-warning"}`}
              >
                {course.status}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {course.status === "DRAFT" && (
            <Button
              onClick={handlePublishClass}
              disabled={isPublishing || course.modules?.length === 0}
              className="w-full gap-2 text-ink hover:bg-turbo-hover md:w-auto"
            >
              <UploadCloud className="w-4 h-4" />{" "}
              {isPublishing ? "Memproses..." : "Terbitkan Kelas (Publish)"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Daftar Modul & Kuis */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6 border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-fg flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-turbo" /> Kuis Evaluasi Akhir
              </h3>

              {course.quizzes && course.quizzes.length > 0 ? (
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="rounded-md border border-line bg-surface-2 px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-success">
                    Kuis tersedia
                  </span>
                  <span className="text-sm font-semibold text-muted bg-surface px-2.5 py-1 rounded-md">
                    {course.quizzes[0].questions?.length || 0} Soal
                  </span>
                  <span className="text-sm font-semibold text-muted bg-surface px-2.5 py-1 rounded-md">
                    Passing Grade: {course.quizzes[0].passingGrade}%
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted mt-1">
                  Wajib ditambahkan sebagai syarat kelulusan dan penerbitan
                  sertifikat siswa.
                </p>
              )}
            </div>

            <Button
              asChild
              variant={
                course.quizzes && course.quizzes.length > 0
                  ? "secondary"
                  : "default"
              }
              className="shrink-0 gap-2 border-line"
            >
              <Link
                href={`/dashboard/instructor/manage-classes/${classId}/quiz`}
              >
                {course.quizzes && course.quizzes.length > 0 ? (
                  <Award className="w-4 h-4 text-turbo" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {course.quizzes && course.quizzes.length > 0
                  ? "Edit Kuis"
                  : "Buat Kuis"}
              </Link>
            </Button>
          </GlassCard>

          <div>
            <h2 className="text-xl font-bold text-fg mb-4">
              Daftar Modul Pembelajaran ({course.modules?.length})
            </h2>
            <div className="space-y-4">
              {course.modules?.length === 0 ? (
                <GlassCard className="p-8 text-center border-dashed border-2">
                  <p className="text-muted mb-2">Belum ada modul materi.</p>
                  <p className="text-xs text-fg/40">
                    Silakan tambahkan modul pertama melalui form di sebelah
                    kanan.
                  </p>
                </GlassCard>
              ) : (
                course.modules.map((modul: any) => (
                  <GlassCard
                    key={modul.id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-line-strong transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center text-turbo font-bold shrink-0">
                        {modul.order}
                      </div>
                      <div>
                        <h3 className="font-bold text-fg">{modul.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                          {modul.videoUrl && (
                            <span className="flex items-center gap-1">
                              <Video className="w-3 h-3" /> Video
                            </span>
                          )}
                          {modul.content && (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Teks
                            </span>
                          )}
                          {modul.isFreePreview && (
                            <span className="text-success font-semibold">
                              • Preview Gratis
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteModule(modul.id)}
                      className="text-red-400 hover:text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </GlassCard>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Tambah Modul */}
        <div>
          <GlassCard className="p-6 sticky top-24">
            <h2 className="text-lg font-bold text-fg mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-turbo" /> Tambah Modul Baru
            </h2>

            <form onSubmit={handleAddModule} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-fg">
                  Judul Materi
                </label>
                <Input
                  required
                  placeholder="Contoh: Instalasi Framework"
                  value={newModule.title}
                  onChange={(e) =>
                    setNewModule({ ...newModule, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-fg">
                  URL Video (Opsional)
                </label>
                <Input
                  placeholder="https://youtube.com/..."
                  value={newModule.videoUrl}
                  onChange={(e) =>
                    setNewModule({ ...newModule, videoUrl: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-fg">
                  Konten Teks (Markdown/HTML)
                </label>
                <textarea
                  rows={6}
                  className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-fg/40 focus:outline-none focus:ring-2 focus:ring-turbo/40"
                  placeholder="Tulis materi penjelasan di sini..."
                  value={newModule.content}
                  onChange={(e) =>
                    setNewModule({ ...newModule, content: e.target.value })
                  }
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-fg cursor-pointer bg-surface/30 p-2 rounded-lg border border-line-strong">
                <input
                  type="checkbox"
                  className="rounded border-line text-turbo focus:ring-turbo"
                  checked={newModule.isFreePreview}
                  onChange={(e) =>
                    setNewModule({
                      ...newModule,
                      isFreePreview: e.target.checked,
                    })
                  }
                />
                <span className="font-medium text-xs">
                  Jadikan Preview Gratis (Bisa dilihat tanpa beli)
                </span>
              </label>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Modul"}
              </Button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
