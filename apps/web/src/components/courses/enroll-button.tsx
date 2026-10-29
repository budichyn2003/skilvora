"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { EnrollmentService } from "@/services/enrollment.service";

interface EnrollButtonProps {
  classId: string;
  isFree: boolean;
}

export function EnrollButton({ classId, isFree }: EnrollButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    setIsLoading(true);
    try {
      await EnrollmentService.enroll(classId);
      toast.success(
        isFree
          ? "Berhasil mendaftar kelas gratis!"
          : "Pendaftaran berhasil, silakan selesaikan pembayaran.",
      );

      // Redirect ke dashboard untuk mulai belajar atau membayar
      router.push("/dashboard/classes");
    } catch (error: unknown) {
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;
      const isUnauthorized =
        isAxiosError(error) && error.response?.status === 401;
      toast.error(
        message || "Gagal mendaftar kelas. Silakan login terlebih dahulu.",
      );

      if (isUnauthorized) {
        router.push("/auth/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      className="w-full mb-4"
      onClick={handleEnroll}
      disabled={isLoading}
    >
      {isLoading
        ? "Memproses..."
        : isFree
          ? "Daftar Kelas Gratis"
          : "Beli Kelas Sekarang"}
    </Button>
  );
}
