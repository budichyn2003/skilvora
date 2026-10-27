'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, CheckCircle, Layers, PlusCircle, ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/axios';

export default function InstructorDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/instructor/my-classes')
      .then(res => setClasses(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="animate-pulse bg-[#EAEDFB] h-96 rounded-2xl"></div>;

  const totalStudents = classes.reduce((acc, curr) => acc + (curr._count?.enrollments || 0), 0);
  const publishedCount = classes.filter(c => c.status === 'PUBLISHED').length;
  const draftCount = classes.filter(c => c.status === 'DRAFT').length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      {/* Banner Instruktur */}
      <GlassCard className="p-6 md:p-8 bg-gradient-to-r from-emerald-500/10 via-[#0033FF]/5 to-transparent border border-emerald-500/20 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="bg-emerald-600 text-white px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Dasbor Instruktur
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00033D] mt-3 mb-2">
            Kelola Modul & Kursus Anda 👨‍🏫
          </h1>
          <p className="text-[#00033D]/70 text-sm md:text-base max-w-xl leading-relaxed">
            Buat kurikulum terbaik, unggah materi pembelajaran berkualitas, dan pantau perkembangan siswa Anda secara langsung.
          </p>
        </div>
        <Button asChild size="lg" className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md">
          <Link href="/dashboard/instructor/manage-classes" className="gap-2">
            <PlusCircle className="w-5 h-5" /> Buat Kelas Baru
          </Link>
        </Button>
      </GlassCard>

      {/* Grid Statistik Instruktur */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassCard className="p-6 rounded-2xl bg-white/80 border border-gray-100 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-[#0033FF]/10 text-[#0033FF] flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-[#00033D]/50 uppercase tracking-wider mb-1">Total Kelas</p>
          <h3 className="text-3xl font-extrabold text-[#00033D]">{classes.length}</h3>
        </GlassCard>

        <GlassCard className="p-6 rounded-2xl bg-white/80 border border-gray-100 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-[#00033D]/50 uppercase tracking-wider mb-1">Total Siswa</p>
          <h3 className="text-3xl font-extrabold text-[#00033D]">{totalStudents}</h3>
        </GlassCard>

        <GlassCard className="p-6 rounded-2xl bg-white/80 border border-gray-100 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-[#00033D]/50 uppercase tracking-wider mb-1">Published</p>
          <h3 className="text-3xl font-extrabold text-[#00033D]">{publishedCount}</h3>
        </GlassCard>

        <GlassCard className="p-6 rounded-2xl bg-white/80 border border-gray-100 shadow-md">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-600 flex items-center justify-center mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-[#00033D]/50 uppercase tracking-wider mb-1">Draft</p>
          <h3 className="text-3xl font-extrabold text-[#00033D]">{draftCount}</h3>
        </GlassCard>
      </div>

      {/* Daftar Kelas Instruktur */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#00033D]">Daftar Kelas yang Anda Kelola</h2>
          <Link href="/dashboard/instructor/manage-classes" className="text-sm font-bold text-[#0033FF] hover:underline flex items-center gap-1">
            Kelola Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {classes.length === 0 ? (
          <GlassCard className="p-12 text-center rounded-2xl bg-white/80">
            <p className="text-[#00033D]/60 mb-4 text-sm">Anda belum membuat kelas instruktur.</p>
            <Button asChild className="bg-[#0033FF] text-white font-bold rounded-xl">
              <Link href="/dashboard/instructor/manage-classes">Buat Kelas Pertama</Link>
            </Button>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {classes.map((cls) => (
              <GlassCard key={cls.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white/90 border border-gray-100 shadow-md hover:shadow-lg transition-shadow">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      cls.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {cls.status}
                    </span>
                    <span className="text-xs font-semibold text-[#00033D]/60">
                      Investasi: Rp {Number(cls.price).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[#00033D]">{cls.title}</h3>
                </div>
                <Button variant="secondary" asChild className="w-full sm:w-auto border-[#0033FF]/30 text-[#0033FF] hover:bg-[#0033FF]/5 font-bold rounded-xl">
                  <Link href={`/dashboard/instructor/manage-classes/${cls.id}`}>Kelola Materi & Kuis</Link>
                </Button>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}