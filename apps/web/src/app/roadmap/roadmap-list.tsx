"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Compass } from "lucide-react";
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
    <div className="container mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-extrabold text-[#00033D]">
          Roadmap Alur Belajar
        </h1>
        <p className="mx-auto max-w-2xl text-[#00033D]/70">
          Ikuti jalur belajar terstruktur dan pantau kemajuan kelas yang sudah
          Anda ikuti.
        </p>
      </header>
      {progressError && (
        <p role="status" className="mb-6 text-center text-amber-700">
          {progressError}
        </p>
      )}
      {roadmaps.length === 0 ? (
        <GlassCard className="p-8 text-center text-[#00033D]/70">
          Roadmap pembelajaran akan segera tersedia.
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {roadmaps.map((roadmap) => (
            <GlassCard
              key={roadmap.id}
              className="border-l-4 border-l-[#0033FF] p-6"
            >
              <div className="mb-3 flex items-center gap-3">
                <Compass
                  aria-hidden="true"
                  className="h-6 w-6 text-[#0033FF]"
                />
                <h2 className="text-xl font-bold text-[#00033D]">
                  <Link
                    href={`/roadmap/${roadmap.slug}`}
                    className="hover:text-[#0033FF]"
                  >
                    {roadmap.title}
                  </Link>
                </h2>
              </div>
              {roadmap.description && (
                <p className="mb-5 text-sm text-[#00033D]/70">
                  {roadmap.description}
                </p>
              )}
              <ol className="space-y-3">
                {roadmap.nodes.map((node, index) => {
                  const status = progress[node.id];
                  return (
                    <li
                      key={node.id}
                      className="flex flex-col gap-1 border-l border-[#0033FF]/20 pl-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <Link
                        href={`/courses/${node.class.slug}`}
                        className="font-semibold text-[#00033D] hover:text-[#0033FF]"
                      >
                        {index + 1}. {node.title}
                      </Link>
                      <span className="text-xs text-[#00033D]/60">
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
