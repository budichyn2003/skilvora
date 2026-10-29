"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { EnrollmentService } from "@/services/enrollment.service";

type StudentEnrollment = {
  id: string;
  status: "PENDING" | "ACTIVE";
  class: {
    id: string;
    title: string;
    thumbnail?: string | null;
  };
  progresses: Array<{
    id: string;
    status: string;
  }>;
};

export default function MyClassesPage() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    EnrollmentService.getMyEnrollments()
      .then(setEnrollments)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading)
    return (
      <div className="animate-pulse bg-surface-2 h-64 rounded-xl max-w-5xl"></div>
    );

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fg mb-2">Kelas Saya</h1>
        <p className="text-muted">
          Lanjutkan progres belajar Anda untuk mendapatkan sertifikat.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <GlassCard className="p-12 text-center flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold text-fg mb-2">Belum ada kelas</h3>
          <p className="text-muted mb-6">
            Anda belum mendaftar di kelas manapun.
          </p>
          <Button asChild>
            <Link href="/courses">Jelajahi Katalog</Link>
          </Button>
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enrollment) => {
            const course = enrollment.class;
            const completed = enrollment.progresses.filter(
              (p) => p.status === "COMPLETED",
            ).length;
            const total = enrollment.progresses.length;
            const percentage =
              total === 0 ? 0 : Math.round((completed / total) * 100);

            return (
              <GlassCard
                key={enrollment.id}
                className="p-0 overflow-hidden flex flex-col"
              >
                <div className="h-40 bg-surface-2 relative">
                  {course.thumbnail && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-surface/80 backdrop-blur border border-line text-fg">
                    {percentage === 100 ? "Selesai" : "Sedang Berjalan"}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="font-bold text-lg text-fg mb-4 line-clamp-2">
                      {course.title}
                    </h2>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-6">
                      <div className="flex justify-between text-xs text-muted">
                        <span>Progress Belajar</span>
                        <span className="font-bold text-fg">{percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-turbo transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <Button asChild className="w-full gap-2">
                    <Link
                      href={`/dashboard/student/learn/${course.id}`}
                      className="flex items-center justify-center"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Lanjutkan Belajar
                    </Link>
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
