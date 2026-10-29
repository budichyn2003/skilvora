"use client";

import { useCallback, useEffect, useState } from "react";
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
import { getErrorMessage } from "@/lib/utils";

type ModuleItem = {
  id: string;
  title: string;
  order: number;
  videoUrl?: string | null;
  content?: string | null;
  isFreePreview: boolean;
};

type CourseDetail = {
  id: string;
  title: string;
  description?: string | null;
  status: "DRAFT" | "PUBLISHED";
  modules: ModuleItem[];
  quizzes?: Array<{ id: string; type: "MODULE" | "FINAL" }>;
};

export default function ManageClassContentPage() {
  const params = useParams();
  const classId = params.id as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [newModule, setNewModule] = useState({
    title: "",
    videoUrl: "",
    content: "",
    isFreePreview: false,
  });

  const fetchCourse = useCallback(async () => {
    try {
      const data = await InstructorService.getClassById(classId);
      setCourse(data);
    } catch {
      toast.error("Gagal memuat detail kelas");
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    void fetchCourse();
  }, [fetchCourse]);

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
      await fetchCourse(); // Refresh daftar modul
    } catch {
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
      await fetchCourse();
    } catch {
      toast.error("Gagal menghapus modul");
    }
  };

  const handlePublishClass = async () => {
    if (!course || course.modules.length === 0) {
      return toast.error("Tidak dapat menerbitkan kelas tanpa modul.");
    }

    setIsPublishing(true);
    try {
      await api.patch(`/courses/instructor/classes/${classId}/publish`);
      toast.success("Kelas berhasil diterbitkan!");
      await fetchCourse();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Gagal menerbitkan kelas"));
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading)
    return (
      <div className="animate-pulse bg-surface-2 h-64 rounded-xl max-w-5xl"></div>
    );

  if (!course)
    return (
      <div className="text-center py-12">
        <p className="text-muted">Kelas tidak ditemukan.</p>
        <Button variant="secondary" asChild className="mt-4">
          <Link href="/dashboard/instructor/manage-classes">Kembali</Link>
        </Button>
      </div>
    );

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header navigasi & Aksi Publish */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/instructor/manage-classes"
            className="w-10 h-10 rounded-lg bg-surface border border-line flex items-center justify-center text-muted hover:text-fg hover:border-line-strong transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  course.status === "PUBLISHED"
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-surface-2 text-muted border border-line"
                }`}
              >
                {course.status}
              </span>
              <span className="text-xs text-muted">
                {course.modules?.length || 0} Modul
              </span>
            </div>
            <h1 className="text-2xl font-bold text-fg mt-1">{course.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" asChild>
            <Link
              href={`/dashboard/instructor/manage-classes/${classId}/quiz`}
              className="flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-turbo" />
              Kelola Kuis
            </Link>
          </Button>

          {course.status === "DRAFT" && (
            <Button
              onClick={handlePublishClass}
              disabled={isPublishing}
              className="flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              {isPublishing ? "Menerbitkan..." : "Terbitkan Kelas"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Daftar Modul yang Sudah Ada */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-fg mb-1">
              Kurikulum & Modul Belajar
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
                course.modules.map((modul) => (
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

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <button
                        onClick={() => handleDeleteModule(modul.id)}
                        className="p-2 text-muted hover:text-danger hover:bg-surface-2 rounded-lg transition-colors"
                        title="Hapus Modul"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Tambah Modul */}
        <div>
          <GlassCard className="p-6 sticky top-8">
            <h2 className="text-lg font-bold text-fg mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-turbo" />
              Tambah Modul Baru
            </h2>
            <form onSubmit={handleAddModule} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted mb-1 block">
                  Judul Modul
                </label>
                <Input
                  required
                  placeholder="Misal: Pengenalan HTML & Struktur Dokumen"
                  value={newModule.title}
                  onChange={(e) =>
                    setNewModule({ ...newModule, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted mb-1 block">
                  URL Video Pembelajaran (Opsional)
                </label>
                <Input
                  placeholder="https://www.youtube.com/embed/..."
                  value={newModule.videoUrl}
                  onChange={(e) =>
                    setNewModule({ ...newModule, videoUrl: e.target.value })
                  }
                />
                <span className="text-[10px] text-muted mt-1 block">
                  Gunakan format embed URL (YouTube/Vimeo/Cloudflare Stream).
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted mb-1 block">
                  Materi Teks / Bacaan (Markdown)
                </label>
                <textarea
                  className="w-full bg-surface-2 border border-line rounded-lg p-3 text-sm text-fg focus:outline-none focus:border-turbo min-h-[120px]"
                  placeholder="Tuliskan catatan, rangkuman, atau kode materi..."
                  value={newModule.content}
                  onChange={(e) =>
                    setNewModule({ ...newModule, content: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFreePreview"
                  checked={newModule.isFreePreview}
                  onChange={(e) =>
                    setNewModule({
                      ...newModule,
                      isFreePreview: e.target.checked,
                    })
                  }
                  className="rounded border-line bg-surface-2 text-turbo focus:ring-turbo h-4 w-4"
                />
                <label
                  htmlFor="isFreePreview"
                  className="text-xs text-fg cursor-pointer select-none"
                >
                  Jadikan modul ini sebagai preview gratis
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2"
              >
                {isSubmitting ? "Menyimpan..." : "Tambahkan Modul"}
              </Button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
