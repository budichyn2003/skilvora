"use client";
import { GlassCard } from "@/components/ui/glass-card";

export default function InstructorStatisticsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-fg mb-2">Laporan Pendapatan</h1>
      <p className="text-muted mb-8">
        Pantau statistik penjualan kelas dan total pendapatan Anda.
      </p>
      <GlassCard className="p-12 text-center text-muted font-medium">
        Fitur grafik pendapatan sedang dalam tahap pengembangan.
      </GlassCard>
    </div>
  );
}
