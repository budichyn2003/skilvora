'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { EnrollmentService } from '@/services/enrollment.service';

export function EnrollButton({ classId, isFree }: { classId: string, isFree: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    setIsLoading(true);
    try {
      const res = await EnrollmentService.enroll(classId);
      
      if (res.status === 'ACTIVE') {
        toast.success('Berhasil mendaftar kelas!');
        router.push(`/dashboard/learn/${classId}`); // Langsung ke ruang belajar jika gratis
      } else {
        toast.success('Pendaftaran berhasil. Silakan selesaikan pembayaran.');
        router.push(`/dashboard/payments`); // Ke halaman tagihan jika berbayar
      }
    } catch (error: unknown) {
      const isUnauthorized = isAxiosError(error) && error.response?.status === 401;
      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      if (isUnauthorized) {
        toast.error('Silakan login terlebih dahulu untuk mendaftar');
        router.push('/auth/login');
      } else {
        toast.error(message || 'Gagal mendaftar kelas');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      className="w-full" 
      size="lg" 
      onClick={handleEnroll} 
      disabled={isLoading}
    >
      {isLoading ? 'Memproses...' : (isFree ? 'Daftar Kelas Gratis' : 'Beli Kelas Sekarang')}
    </Button>
  );
}