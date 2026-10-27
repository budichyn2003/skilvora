'use client';

import { useState } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Award, Search, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/lib/axios";

export default function PublicVerifyPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await api.get(`/enrollments/certificates/verify/${code}`);
      setResult(res.data);
    } catch (err: any) {
      setError("Sertifikat tidak ditemukan atau kode verifikasi tidak valid.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-20 max-w-3xl text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0033FF]/10 text-[#0033FF] flex items-center justify-center mb-6">
          <Award className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-[#00033D] mb-4">Verifikasi Sertifikat Resmi</h1>
        <p className="text-[#00033D]/70 mb-10 max-w-xl mx-auto">
          Masukkan kode unik sertifikat kelulusan siswa untuk memastikan keaslian dokumen yang dikeluarkan oleh Skilvora.
        </p>

        <GlassCard className="p-8 text-left mb-8 shadow-xl">
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#00033D] uppercase tracking-wider mb-2 block">Kode Verifikasi Sertifikat</label>
              <div className="flex gap-3">
                <Input 
                  required
                  placeholder="Contoh: SKV-9821-XYZ..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="h-12 text-base"
                />
                <Button type="submit" disabled={isLoading} className="h-12 px-8 bg-[#0033FF] hover:bg-[#0029CC] text-white font-bold gap-2">
                  <Search className="w-4 h-4" /> {isLoading ? "Memeriksa..." : "Cek Keaslian"}
                </Button>
              </div>
            </div>
          </form>
        </GlassCard>

        {result && (
          <GlassCard className="p-8 bg-green-50/50 border-green-200 text-left">
            <div className={`flex items-center gap-3 font-bold text-lg mb-2 ${result.isValid ? 'text-green-700' : 'text-red-600'}`}>
              {result.isValid ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              {result.isValid ? 'Sertifikat Sah & Terverifikasi' : 'Sertifikat Telah Dicabut'}
            </div>
            <p className="text-sm text-[#00033D]/80">Diterbitkan atas nama: <strong className="text-[#00033D]">{result.user?.name}</strong></p>
            <p className="text-sm text-[#00033D]/80">Untuk Kelas: <strong className="text-[#00033D]">{result.class?.title}</strong></p>
            <p className="text-xs text-[#00033D]/50 mt-4">Tanggal Terbit: {new Date(result.issuedAt).toLocaleDateString('id-ID')}</p>
            {!result.isValid && result.revokedAt && (
              <p className="text-xs text-red-600 mt-1">Tanggal pencabutan: {new Date(result.revokedAt).toLocaleDateString('id-ID')}</p>
            )}
          </GlassCard>
        )}

        {error && (
          <GlassCard className="p-6 bg-red-50/50 border-red-200 text-left flex items-center gap-4">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
            <p className="text-sm font-semibold text-red-600">{error}</p>
          </GlassCard>
        )}
      </div>
    </PublicLayout>
  );
}