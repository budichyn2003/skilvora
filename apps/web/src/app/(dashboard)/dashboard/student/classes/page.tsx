"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { EnrollmentService } from "@/services/enrollment.service";

export default function MyClassesPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
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
              (p: any) => p.status === "COMPLETED",
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
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-fg mb-4">
                    {course.title}
                  </h3>
                  <div className="mt-auto mb-6">
                    <div className="flex justify-between text-xs font-semibold text-muted mb-2">
                      <span>Progres Belajar</span>
                      <span>{percentage}%</span>
                    </div>
                    <div className="w-full bg-surface-2 rounded-lg h-2">
                      <div
                        className="bg-turbo h-2 rounded-lg"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <Button className="w-full gap-2" asChild>
                    <Link
                      href={`/dashboard/student/learn/${enrollment.classId}`}
                    >
                      <PlayCircle className="w-4 h-4" /> Lanjutkan Belajar
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
