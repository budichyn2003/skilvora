"use client";

import { useCallback, useEffect, useState } from "react";
import { InstructorService } from "@/services/instructor.service";
import { GlassCard } from "@/components/ui/glass-card";
import { getErrorMessage } from "@/lib/utils";
import toast from "react-hot-toast";

type ClassBasic = {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  _count: { modules: number; enrollments: number };
};

type ModuleAnalytics = {
  id: string;
  title: string;
  order: number;
  completedCount: number;
  inProgressCount: number;
  completionRate: number;
  dropoffRate: number;
};

type AnalyticsData = {
  classId: string;
  classTitle: string;
  totalStudents: number;
  activeStudents: number;
  totalModules: number;
  overallCompletionRate: number;
  modules: ModuleAnalytics[];
};

export default function InstructorStatisticsPage() {
  const [classes, setClasses] = useState<ClassBasic[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const data: ClassBasic[] = await InstructorService.getMyClasses();
        const published = data.filter((c) => c.status === "PUBLISHED");
        setClasses(published);
        if (published.length > 0) {
          setSelectedClassId(published[0].id);
        }
      } catch {
        toast.error("Gagal memuat daftar kelas");
      } finally {
        setIsLoadingClasses(false);
      }
    })();
  }, []);

  const fetchAnalytics = useCallback(async (classId: string) => {
    if (!classId) return;
    setIsLoadingAnalytics(true);
    setAnalytics(null);
    try {
      const data = await InstructorService.getClassAnalytics(classId);
      setAnalytics(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Gagal memuat statistik kelas"));
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClassId) void fetchAnalytics(selectedClassId);
  }, [selectedClassId, fetchAnalytics]);

  // Hitung "entry count" dari modul pertama untuk baseline funnel
  const baselineCount =
    analytics && analytics.modules.length > 0
      ? Math.max(analytics.activeStudents, analytics.modules[0].completedCount)
      : 0;

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-fg mb-1">
          Statistik Drop-off Modul
        </h1>
        <p className="text-muted text-sm">
          Pantau persentase siswa yang menyelesaikan setiap modul di kelas Anda.
        </p>
      </div>

      {/* Selector kelas */}
      {isLoadingClasses ? (
        <div className="animate-pulse h-11 rounded-lg bg-surface-2" />
      ) : classes.length === 0 ? (
        <GlassCard className="p-8 text-center text-muted">
          Belum ada kelas yang diterbitkan. Terbitkan kelas terlebih dahulu.
        </GlassCard>
      ) : (
        <div>
          <label className="text-xs font-semibold text-muted mb-1 block">
            Pilih kelas
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="h-11 w-full max-w-sm rounded-lg border border-line bg-surface-2 px-4 text-sm text-fg transition-colors hover:border-line-strong focus:border-turbo focus:outline-none"
          >
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.title} ({cls._count.enrollments} siswa)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Statistik ringkas */}
      {isLoadingAnalytics ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse h-24 rounded-xl bg-surface-2"
            />
          ))}
        </div>
      ) : analytics ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-5">
              <p className="text-xs font-mono uppercase tracking-wider text-muted mb-2">
                Total Siswa
              </p>
              <p className="text-3xl font-bold text-fg">
                {analytics.totalStudents}
              </p>
            </GlassCard>
            <GlassCard className="p-5">
              <p className="text-xs font-mono uppercase tracking-wider text-muted mb-2">
                Siswa Aktif
              </p>
              <p className="text-3xl font-bold text-turbo">
                {analytics.activeStudents}
              </p>
            </GlassCard>
            <GlassCard className="p-5">
              <p className="text-xs font-mono uppercase tracking-wider text-muted mb-2">
                Jumlah Modul
              </p>
              <p className="text-3xl font-bold text-fg">
                {analytics.totalModules}
              </p>
            </GlassCard>
            <GlassCard className="p-5">
              <p className="text-xs font-mono uppercase tracking-wider text-muted mb-2">
                Kelulusan Kelas
              </p>
              <p className="text-3xl font-bold text-success">
                {analytics.overallCompletionRate}%
              </p>
            </GlassCard>
          </div>

          {/* Drop-off Funnel */}
          <GlassCard className="p-6">
            <h2 className="text-lg font-bold text-fg mb-1">
              Drop-off Funnel per Modul
            </h2>
            <p className="text-xs text-muted mb-6">
              Persentase siswa aktif ({analytics.activeStudents} orang) yang
              menyelesaikan tiap modul. Bar Turbo = selesai, merah = belum
              selesai.
            </p>

            {analytics.modules.length === 0 ? (
              <p className="text-center text-muted py-8">
                Kelas belum memiliki modul.
              </p>
            ) : (
              <div className="space-y-4">
                {analytics.modules.map((mod) => {
                  const funnelWidth =
                    baselineCount > 0
                      ? Math.round(
                          (mod.completedCount / baselineCount) * 100,
                        )
                      : 0;

                  return (
                    <div key={mod.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-fg flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-surface-2 text-xs font-bold text-turbo shrink-0">
                            {mod.order}
                          </span>
                          {mod.title}
                        </span>
                        <div className="flex items-center gap-3 text-xs font-mono">
                          <span className="text-success">
                            {mod.completedCount} selesai (
                            {mod.completionRate}%)
                          </span>
                          {mod.inProgressCount > 0 && (
                            <span className="text-warning">
                              {mod.inProgressCount} sedang belajar
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Bar */}
                      <div className="relative h-8 rounded-lg bg-surface-2 overflow-hidden border border-line">
                        {/* Background danger bar (100% width) */}
                        <div className="absolute inset-0 bg-danger/10" />
                        {/* Completion bar */}
                        <div
                          className="absolute inset-y-0 left-0 bg-turbo/20 border-r border-turbo/40 transition-all duration-500"
                          style={{ width: `${funnelWidth}%` }}
                        />
                        {/* Completed count label */}
                        <div className="absolute inset-0 flex items-center px-3">
                          <span className="text-xs font-bold text-turbo">
                            {funnelWidth}%
                          </span>
                          <span className="ml-auto text-xs text-muted">
                            drop-off{" "}
                            <span className="text-danger font-semibold">
                              {mod.dropoffRate}%
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </>
      ) : null}
    </div>
  );
}
