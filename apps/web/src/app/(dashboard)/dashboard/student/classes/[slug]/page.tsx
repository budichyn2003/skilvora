import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

export default async function LearningSpacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: _slug } = await params;
  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl h-[calc(100vh-6rem)]">
      {/* Kolom Kiri: Video Player & Konten */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-8">
        <div className="aspect-video bg-bg rounded-xl overflow-hidden relative border border-line flex items-center justify-center">
          <span className="text-subtle font-medium">
            Video Player Placeholder
          </span>
        </div>

        <GlassCard className="p-8">
          <h1 className="text-2xl font-bold text-fg mb-2">
            1. Pengenalan Tag HTML
          </h1>
          <div className="prose prose-sm max-w-none text-fg/80">
            <p>
              Dalam modul ini, kita akan membahas struktur dasar dari dokumen
              HTML5. HTML (HyperText Markup Language) adalah kerangka dari
              setiap halaman web.
            </p>
            {/* Area untuk render Markdown nantinya */}
          </div>

          <div className="mt-8 pt-6 border-t border-line flex justify-between items-center">
            <Button variant="ghost">← Modul Sebelumnya</Button>
            <Button>Selesai & Lanjut →</Button>
          </div>
        </GlassCard>
      </div>

      {/* Kolom Kanan: Daftar Modul (Sidebar Modul) */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <h3 className="font-bold text-fg text-lg">Daftar Modul</h3>
        <div className="flex flex-col gap-2 overflow-y-auto pb-8">
          {[1, 2, 3, 4, 5].map((modul) => (
            <GlassCard
              key={modul}
              className={`p-4 flex gap-3 cursor-pointer transition-colors ${modul === 1 ? "border-turbo bg-surface" : "hover:bg-surface/40"}`}
            >
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-md border text-xs ${modul === 1 ? "border-turbo bg-turbo text-ink" : "border-line text-subtle"}`}
              >
                {modul === 1 ? "✓" : modul}
              </div>
              <div>
                <h5
                  className={`font-semibold text-sm ${modul === 1 ? "text-turbo" : "text-fg"}`}
                >
                  Pengenalan Tag HTML {modul}
                </h5>
                <p className="text-xs text-muted mt-1">12 Menit</p>
              </div>
            </GlassCard>
          ))}

          <GlassCard className="mt-4 flex gap-3 border-line bg-surface-2 p-4">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-line font-mono text-[9px] text-subtle">
              LOCK
            </span>
            <div>
              <h5 className="font-semibold text-sm text-fg">
                Kuis Akhir Kelas
              </h5>
              <p className="text-xs text-muted mt-1">Syarat Sertifikat</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
