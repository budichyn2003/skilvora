'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { EnrollmentService } from '@/services/enrollment.service';

type AdminCertificate = {
  id: string;
  verificationCode: string;
  status: 'VALID' | 'REVOKED';
  issuedAt: string;
  user: { name: string | null; email: string };
  class: { title: string };
};

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<AdminCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [revokingId, setRevokingId] = useState('');

  const load = async () => {
    try {
      setCertificates(await EnrollmentService.getCertificatesForAdmin());
      setLoadError('');
    } catch (error: any) {
      setLoadError(error.response?.data?.message || 'Gagal memuat sertifikat.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const revoke = async (certificate: AdminCertificate) => {
    const reason = window.prompt(`Alasan pencabutan sertifikat ${certificate.verificationCode}:`);
    if (!reason?.trim()) return;

    setRevokingId(certificate.id);
    try {
      await EnrollmentService.revokeCertificate(certificate.id, reason);
      toast.success('Sertifikat dicabut dan audit tersimpan.');
      await load();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mencabut sertifikat.');
    } finally {
      setRevokingId('');
    }
  };

  return (
    <div className="max-w-6xl">
      <h1 className="mb-2 text-3xl font-bold text-[#00033D]">Sertifikat</h1>
      <p className="mb-8 text-[#00033D]/70">Tinjau penerbitan dan cabut sertifikat bila diperlukan.</p>
      <GlassCard className="overflow-hidden p-0">
        {isLoading ? (
          <p className="p-8 text-[#00033D]/60">Memuat sertifikat...</p>
        ) : loadError ? (
          <p role="alert" className="p-8 text-red-600">{loadError}</p>
        ) : certificates.length === 0 ? (
          <p className="p-8 text-center text-[#00033D]/60">Belum ada sertifikat diterbitkan.</p>
        ) : (
          <div className="divide-y divide-[#00033D]/10">
            {certificates.map((certificate) => (
              <div key={certificate.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-bold text-[#00033D]">{certificate.user.name || certificate.user.email}</p>
                  <p className="text-sm text-[#00033D]/70">{certificate.class.title}</p>
                  <p className="font-mono text-xs text-[#0033FF]">{certificate.verificationCode}</p>
                  <p className="mt-1 text-xs text-[#00033D]/60">
                    {new Date(certificate.issuedAt).toLocaleDateString('id-ID')} · {certificate.status}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  disabled={certificate.status === 'REVOKED' || revokingId === certificate.id}
                  onClick={() => revoke(certificate)}
                >
                  {certificate.status === 'REVOKED'
                    ? 'Sudah dicabut'
                    : revokingId === certificate.id
                      ? 'Memproses...'
                      : 'Cabut sertifikat'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
