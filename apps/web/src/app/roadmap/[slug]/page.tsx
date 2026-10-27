import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicLayout } from "@/components/layouts/public-layout";
import { GlassCard } from "@/components/ui/glass-card";

type RoadmapData = {
  title: string;
  slug: string;
  description: string | null;
  nodes: Array<{
    id: string;
    title: string;
    order: number;
    class: {
      title: string;
      slug: string;
      description: string | null;
      level: string;
    };
  }>;
};

async function getRoadmap(slug: string): Promise<RoadmapData | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const response = await fetch(
    `${apiUrl}/roadmaps/${encodeURIComponent(slug)}`,
    { cache: "no-store" },
  );
  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(`Gagal memuat roadmap (${response.status})`);
  return response.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = await getRoadmap(slug);
  if (!roadmap) return { title: "Roadmap tidak ditemukan" };
  return {
    title: roadmap.title,
    description:
      roadmap.description ||
      `Ikuti jalur belajar ${roadmap.title} di Skilvora.`,
    alternates: { canonical: `/roadmap/${roadmap.slug}` },
    openGraph: {
      title: roadmap.title,
      description:
        roadmap.description ||
        `Ikuti jalur belajar ${roadmap.title} di Skilvora.`,
      url: `/roadmap/${roadmap.slug}`,
      type: "article",
    },
  };
}

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roadmap = await getRoadmap(slug);
  if (!roadmap) notFound();

  return (
    <PublicLayout>
      <article className="container mx-auto max-w-4xl px-6 py-16">
        <header className="mb-10">
          <Link
            href="/roadmap"
            className="mb-4 inline-block text-sm font-semibold text-[#0033FF]"
          >
            ← Semua roadmap
          </Link>
          <h1 className="mb-3 text-4xl font-extrabold text-[#00033D]">
            {roadmap.title}
          </h1>
          {roadmap.description && (
            <p className="text-lg text-[#00033D]/70">{roadmap.description}</p>
          )}
        </header>
        <ol className="space-y-4">
          {roadmap.nodes.map((node) => (
            <li key={node.id}>
              <GlassCard className="flex gap-4 p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0033FF]/10 font-bold text-[#0033FF]">
                  {node.order}
                </span>
                <div>
                  <h2 className="font-bold text-[#00033D]">{node.title}</h2>
                  <p className="mt-1 text-sm text-[#00033D]/60">
                    {node.class.level} · {node.class.title}
                  </p>
                  {node.class.description && (
                    <p className="mt-2 text-sm text-[#00033D]/70">
                      {node.class.description}
                    </p>
                  )}
                  <Link
                    href={`/courses/${node.class.slug}`}
                    className="mt-3 inline-block text-sm font-semibold text-[#0033FF]"
                  >
                    Lihat kelas →
                  </Link>
                </div>
              </GlassCard>
            </li>
          ))}
        </ol>
      </article>
    </PublicLayout>
  );
}
