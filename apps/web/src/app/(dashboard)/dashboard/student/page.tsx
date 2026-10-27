'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Award, Compass, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/axios';

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/enrollments/my'),
      api.get('/enrollments/certificates/me'),
    ])
    .then(([enrollRes, certRes]) => {
      setEnrollments(enrollRes.data);
      setCertificates(certRes.data);
    })
    .catch((error) => {
      setLoadError(error.response?.data?.message || 'Gagal memuat ringkasan belajar. Coba muat ulang halaman.');
    })
    .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="animate-pulse bg-[#EAEDFB] h-96 rounded-2xl"></div>;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      {/* Banner Siswa */}
      <GlassCard className="p-6 md:p-8 bg-gradient-to-r from-[#0033FF]/10 via-purple-500/5 to-transparent border border-[#0033FF]/20 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-[#0033FF] text-white px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Dasbor Siswa
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00033D] mt-3 mb-2">
            Selamat Datang Kembali, pejuang ilmu! 🚀
          </h1>
          <p className="text-[#00033D]/70 text-sm md:text-base max-w-xl leading-relaxed">
            Lanjutkan progres belajar Anda, selesaikan modul materi, dan kumpulkan sertifikat keahlian resmi dari Skilvora.
          </p>
        </div>
        <Button asChild size="lg" className="w-full md:w-auto bg-[#0033FF] hover:bg-[#0029CC] text-white font-bold rounded-xl shadow-md">
          <Link href="/courses" className="gap-2">
            Eksplorasi Kelas Lain <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
      </GlassCard>

      {/* Grid Statistik Siswa */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <GlassCard className="p-6 rounded-2xl bg-white/80 border border-gray-100 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-[#0033FF]/10 text-[#0033FF] flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-[#00033D]/50 uppercase tracking-wider mb-1">Kelas Terdaftar</p>
          <h3 className="text-3xl font-extrabold text-[#00033D]">{enrollments.length}</h3>
        </GlassCard>

        <GlassCard className="p-6 rounded-2xl bg-white/80 border border-gray-100 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4">
            <Award className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-[#00033D]/50 uppercase tracking-wider mb-1">Sertifikat Diraih</p>
          <h3 className="text-3xl font-extrabold text-[#00033D]">{certificates.length}</h3>
        </GlassCard>

        <GlassCard className="p-6 rounded-2xl bg-white/80 border border-gray-100 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center mb-4">
            <Compass className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-[#00033D]/50 uppercase tracking-wider mb-1">Status Akun</p>
          <h3 className="text-xl font-extrabold text-green-600 flex items-center gap-2 mt-1">
            <CheckCircle2 className="w-5 h-5" /> Aktif
          </h3>
        </GlassCard>
      </div>

      {/* Daftar Kelas Saya */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#00033D]">Kelas yang Sedang Anda Ikuti</h2>
          <Link href="/dashboard/student/classes" className="text-sm font-bold text-[#0033FF] hover:underline flex items-center gap-1">
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadError ? (
          <GlassCard role="alert" className="p-8 text-center text-red-600">{loadError}</GlassCard>
        ) : enrollments.length === 0 ? (
          <GlassCard className="p-12 text-center rounded-2xl bg-white/80">
            <p className="text-[#00033D]/60 mb-4 text-sm">Anda belum mengambil kelas apa pun.</p>
            <Button asChild className="bg-[#0033FF] text-white font-bold rounded-xl">
              <Link href="/courses">Pilih Kelas Sekarang</Link>
            </Button>
          </GlassCard>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {enrollments.map((enr) => (
              <GlassCard key={enr.id} className="p-6 rounded-2xl bg-white/90 border border-gray-100 shadow-md flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[#0033FF] bg-[#0033FF]/10 px-3 py-1 rounded-full mb-3 inline-block">
                    {enr.status}
                  </span>
                  <h3 className="font-bold text-lg text-[#00033D] mb-2">{enr.class?.title}</h3>
                  <p className="text-sm text-[#00033D]/60 line-clamp-2 mb-4">{enr.class?.description}</p>
                  {enr.status === 'ACTIVE' && (
                    <div className="mb-4">
                      <div className="mb-1 flex justify-between text-xs text-[#00033D]/60">
                        <span>Progress kelas</span><span>{enr.progressPercent ?? 0}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#0033FF]/10">
                        <div className="h-full bg-[#0033FF]" style={{ width: `${enr.progressPercent ?? 0}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <Button asChild className="w-full bg-[#0033FF] hover:bg-[#0029CC] text-white font-bold rounded-xl">
                  <Link href={enr.status === 'ACTIVE' ? `/dashboard/student/learn/${enr.classId}` : '/dashboard/student/payments'}>
                    {enr.status === 'ACTIVE' ? 'Lanjutkan Belajar' : 'Selesaikan Pembayaran'}
                  </Link>
                </Button>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}