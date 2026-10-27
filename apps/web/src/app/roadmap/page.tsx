import type { Metadata } from "next";
import { PublicLayout } from "@/components/layouts/public-layout";
import { RoadmapList } from "./roadmap-list";

export const metadata: Metadata = {
  title: "Roadmap Belajar",
  description:
    "Peta jalan belajar programming dan teknologi secara terstruktur di Skilvora.",
  alternates: { canonical: "/roadmap" },
  openGraph: {
    title: "Roadmap Belajar | Skilvora",
    description:
      "Pilih jalur belajar terstruktur dan mulai dari kelas yang tepat.",
    url: "/roadmap",
    type: "website",
  },
};

async function getRoadmaps() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const response = await fetch(`${apiUrl}/roadmaps`, { cache: "no-store" });
  if (!response.ok)
    throw new Error(`Gagal memuat roadmap (${response.status})`);
  return response.json();
}

export default async function PublicRoadmapPage() {
  const roadmaps = await getRoadmaps();
  return (
    <PublicLayout>
      <RoadmapList roadmaps={roadmaps} />
    </PublicLayout>
  );
}
