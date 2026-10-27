'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { EnrollmentService } from '@/services/enrollment.service';

type Certificate = {
  id: string;
  verificationCode: string;
  status: 'VALID' | 'REVOKED';
  issuedAt: string;
  class: { title: string };
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [downloadingId, setDownloadingId] = useState('');

  useEffect(() => {
    EnrollmentService.getMyCertificates()
      .then(setCertificates)
      .catch((error: any) => setLoadError(error.response?.data?.message || 'Gagal memuat sertifikat.'))
      .finally(() => setIsLoading(false));
  }, []);

  const download = async (certificate: Certificate) => {
    setDownloadingId(certificate.id);
    try {
      const blob = await EnrollmentService.downloadCertificate(certificate.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `skilvora-${certificate.verificationCode}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengunduh PDF sertifikat.');
    } finally {
      setDownloadingId('');
    }
  };

  if (isLoading) return <div className="animate-pulse bg-white/10 h-64 rounded-xl max-w-5xl" />;

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-[#00033D]">Sertifikat Saya</h1>
        <p className="text-[#00033D]/70">Unduh dan bagikan bukti kelulusan kelas Anda.</p>
      </div>

      {loadError ? (
        <GlassCard role="alert" className="p-8 text-center text-red-600">{loadError}</GlassCard>
      ) : certificates.length === 0 ? (
        <GlassCard className="flex flex-col items-center p-12 text-center">
          <Award className="mb-4 h-16 w-16 text-[#00033D]/20" />
          <h3 className="mb-2 text-xl font-bold text-[#00033D]">Belum ada sertifikat</h3>
          <p className="text-[#00033D]/60">Selesaikan semua modul dan lulus kuis akhir untuk mendapat sertifikat.</p>
        </GlassCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {certificates.map((certificate) => (
            <GlassCard key={certificate.id} className="flex flex-col justify-between border-l-4 border-l-[#0033FF] p-6">
              <div>
                <p className="mb-2 text-sm font-semibold text-[#00033D]/60">Kelas yang diselesaikan:</p>
                <h3 className="mb-4 text-xl font-bold text-[#00033D]">{certificate.class.title}</h3>
                <div className="mb-6 rounded-lg bg-white/50 p-4">
                  <p className="mb-1 text-xs uppercase tracking-wider text-[#00033D]/60">Kode verifikasi</p>
                  <p className="font-mono font-bold text-[#0033FF]">{certificate.verificationCode}</p>
                  <p className="mt-2 text-xs text-[#00033D]/60">
                    Diterbitkan: {new Date(certificate.issuedAt).toLocaleDateString('id-ID')}
                  </p>
                  <p className={`mt-2 text-xs font-bold ${certificate.status === 'VALID' ? 'text-green-700' : 'text-red-600'}`}>
                    {certificate.status === 'VALID' ? 'Berlaku' : 'Dicabut'}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full gap-2"
                  disabled={certificate.status !== 'VALID' || downloadingId === certificate.id}
                  onClick={() => download(certificate)}
                >
                  <Download className="h-4 w-4" />
                  {downloadingId === certificate.id ? 'Menyiapkan PDF...' : 'Unduh sertifikat PDF'}
                </Button>
                <Link
                  className="block text-center text-sm font-semibold text-[#0033FF] hover:underline"
                  href={`/verify?code=${encodeURIComponent(certificate.verificationCode)}`}
                >
                  Buka tautan verifikasi publik
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
