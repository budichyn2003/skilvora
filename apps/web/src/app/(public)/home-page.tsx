import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Pilih arah belajar",
    detail: "Mulai dari roadmap yang sesuai dengan peran dan tujuan Anda.",
  },
  {
    number: "02",
    title: "Ikuti materi terstruktur",
    detail: "Pelajari konsep melalui modul yang disusun berurutan.",
  },
  {
    number: "03",
    title: "Buktikan kemampuan",
    detail: "Selesaikan evaluasi dan simpan sertifikat digital Anda.",
  },
];

export default function PublicHomePage() {
  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8 lg:pb-36">
        <p className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-muted">
          <span className="text-turbo">01</span>
          Belajar teknologi dengan arah
        </p>
        <h1 className="max-w-6xl font-display text-[clamp(3.5rem,10vw,8.75rem)] font-semibold leading-[0.91] tracking-[-0.07em]">
          Bangun keahlian
          <br />
          <span className="text-turbo">yang nyata.</span>
        </h1>
        <div className="mt-10 grid gap-8 border-t border-line pt-6 sm:grid-cols-[1fr_auto] sm:items-end sm:gap-12 sm:pt-8">
          <p className="max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            Belajar teknologi melalui roadmap yang terarah, kelas dengan materi
            bertahap, dan progres yang bisa Anda pantau dari satu tempat.
          </p>
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href="/roadmap">
              Temukan roadmap <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </Button>
        </div>
        <div className="mt-16 border-t border-line pt-4 font-mono text-xs uppercase tracking-[0.14em] text-subtle sm:mt-24">
          Platform belajar teknologi · Indonesia
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-10 flex flex-col gap-5 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-turbo">
                02 / Cara belajar
              </p>
              <h2 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
                Langkah jelas.{" "}
                <span className="text-muted">Progres terukur.</span>
              </h2>
            </div>
            <Link
              href="/courses"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-fg transition-colors hover:text-turbo"
            >
              Lihat semua kelas <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <ol className="border-t border-line">
            {steps.map((step) => (
              <li
                key={step.number}
                className="grid gap-3 border-b border-line py-6 sm:grid-cols-[5rem_1fr_1.2fr] sm:items-baseline sm:gap-6 sm:py-8"
              >
                <span className="font-mono text-sm text-turbo">
                  {step.number}
                </span>
                <h3 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">
                  {step.title}
                </h3>
                <p className="max-w-lg leading-relaxed text-muted">
                  {step.detail}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-turbo text-ink">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_auto] lg:items-end lg:px-8">
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em]">
              03 / Mulai dari tujuan
            </p>
            <h2 className="max-w-4xl font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl">
              Tentukan arah. Ambil langkah pertama.
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-ink/75">
              Jelajahi jalur belajar dan pilih keterampilan yang ingin Anda
              bangun berikutnya.
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            asChild
            className="w-full border-ink bg-ink text-fg hover:border-ink hover:bg-ink/90 sm:w-auto"
          >
            <Link href="/courses">
              Jelajahi kelas <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
