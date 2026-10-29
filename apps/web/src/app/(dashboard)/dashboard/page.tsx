"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        const role = res.data.role;
        if (role === "INSTRUCTOR") {
          router.replace("/dashboard/instructor");
        } else if (role === "ADMIN") {
          router.replace("/dashboard/admin");
        } else {
          router.replace("/dashboard/student");
        }
      })
      .catch(() => {
        router.replace("/auth/login");
      });
  }, [router]);

  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="mb-4 size-12 animate-spin rounded-full border-4 border-line border-t-turbo"></div>
        <p className="text-muted font-medium">Mengarahkan ke dasbor Anda...</p>
      </div>
    </div>
  );
}
