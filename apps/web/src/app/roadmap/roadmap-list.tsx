"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Compass } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { api } from "@/lib/axios";

type Roadmap = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  nodes: Array<{
    id: string;
    title: string;
    class: { title: string; slug: string };
  }>;
};

const progressLabel: Record<string, string> = {
  LOCKED: "Belum terdaftar",
  ENROLLED: "Terdaftar",
  IN_PROGRESS: "Sedang dipelajari",
  COMPLETED: "Selesai",
};

export function RoadmapList({ roadmaps }: { roadmaps: Roadmap[] }) {
  const [progress, setProgress] = useState<Record<string, string>>({});
  const [progressError, setProgressError] = useState("");

  useEffect(() => {
    api
      .get<Roadmap[]>("/roadmaps/me")
      .then(({ data }) => {
        const next: Record<string, string> = {};
        data.forEach((roadmap) =>
          roadmap.nodes.forEach((node) => {
            next[node.id] =
              (node as Roadmap["nodes"][number] & { progress?: string })
                .progress || "LOCKED";
          }),
        );
        setProgress(next);
      })
      .catch((error) => {
        if (error.response?.status !== 401 && error.response?.status !== 403) {
          setProgressError("Progress roadmap belum dapat dimuat.");
        }
      });
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="mb-10 max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-turbo">
          Jalur belajar
        </p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-fg sm:text-5xl">
          Temukan arah <span className="text-turbo">belajar Anda.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Ikuti jalur belajar terstruktur dan pantau kemajuan kelas yang sudah
          Anda ikuti.
        </p>
      </header>
      {progressError && (
        <p
          role="status"
          className="mb-6 rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning"
        >
          {progressError}
        </p>
      )}
      {roadmaps.length === 0 ? (
        <GlassCard className="p-8 text-center sm:p-10">
          <span className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-surface-2 text-turbo">
            <Compass aria-hidden="true" className="size-6" />
          </span>
          <h2 className="font-semibold text-fg">Roadmap segera hadir</h2>
          <p className="mt-2 text-sm text-muted">
            Jalur belajar baru sedang disiapkan untuk Anda.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-5">
          {roadmaps.map((roadmap) => (
            <GlassCard key={roadmap.id} className="p-5 sm:p-7">
              <div className="mb-4 flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-turbo">
                  <Compass aria-hidden="true" className="size-5" />
                </span>
                <h2 className="pt-1 text-xl font-semibold text-fg sm:text-2xl">
                  <Link
                    href={`/roadmap/${roadmap.slug}`}
                    className="rounded-sm transition-colors hover:text-turbo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turbo"
                  >
                    {roadmap.title}
                  </Link>
                </h2>
              </div>
              {roadmap.description && (
                <p className="mb-5 max-w-2xl text-sm leading-relaxed text-muted">
                  {roadmap.description}
                </p>
              )}
              <ol className="space-y-2 border-t border-line pt-4">
                {roadmap.nodes.map((node, index) => {
                  const status = progress[node.id];
                  return (
                    <li
                      key={node.id}
                      className="flex flex-col gap-2 rounded-xl p-3 transition-colors hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <Link
                        href={`/courses/${node.class.slug}`}
                        className="inline-flex min-h-11 items-center gap-2 font-semibold text-fg transition-colors hover:text-turbo"
                      >
                        <span className="text-xs font-semibold text-turbo">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {node.title}
                        <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                      <span className="inline-flex min-h-7 w-fit items-center rounded-lg bg-surface-2 px-3 text-xs font-medium text-turbo">
                        {status
                          ? progressLabel[status] || status
                          : "Lihat roadmap"}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
