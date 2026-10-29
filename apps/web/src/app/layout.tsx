import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Skilvora",
    default: "Skilvora - Platform Belajar Coding & IT Terdepan",
  },
  description:
    "Tingkatkan keahlian programming Anda bersama Skilvora. Pelajari modul terstruktur dari praktisi terbaik dan dapatkan sertifikat industri siap kerja.",
  keywords: [
    "LMS",
    "Kursus Online",
    "Belajar Coding",
    "Programming",
    "Bootcamp IT",
    "Skilvora",
  ],
  openGraph: {
    title: "Skilvora - Platform Belajar Coding & IT",
    description:
      "Tingkatkan keahlian programming Anda dan raih sertifikat industri.",
    url: "https://skilvora-omega.vercel.app/",
    siteName: "Skilvora",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skilvora - Platform Belajar Coding & IT",
    description:
      "Tingkatkan keahlian programming Anda dan raih sertifikat industri.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${bricolage.variable} ${geist.variable} ${geistMono.variable}`}
      >
        {children}
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "var(--surface-3)",
              color: "var(--fg)",
              border: "1px solid var(--line-strong)",
              borderRadius: "8px",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "var(--success)",
                secondary: "var(--surface-3)",
              },
            },
            error: {
              iconTheme: {
                primary: "var(--danger)",
                secondary: "var(--surface-3)",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
