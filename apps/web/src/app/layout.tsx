import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | Skilvora',
    default: 'Skilvora - Platform Belajar Coding & IT Terdepan',
  },
  description: "Tingkatkan keahlian programming Anda bersama Skilvora. Pelajari modul terstruktur dari praktisi terbaik dan dapatkan sertifikat industri siap kerja.",
  keywords: ["LMS", "Kursus Online", "Belajar Coding", "Programming", "Bootcamp IT", "Skilvora"],
  openGraph: {
    title: 'Skilvora - Platform Belajar Coding & IT',
    description: 'Tingkatkan keahlian programming Anda dan raih sertifikat industri.',
    url: 'https://skilvora-omega.vercel.app/',
    siteName: 'Skilvora',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skilvora - Platform Belajar Coding & IT',
    description: 'Tingkatkan keahlian programming Anda dan raih sertifikat industri.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={jakarta.className}>
        {children}
        <Toaster 
          position="top-center" 
          reverseOrder={false} 
          toastOptions={{
            style: {
              background: '#121214',
              color: '#FAFAFA',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#3B82F6', secondary: '#FAFAFA' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#FAFAFA' },
            },
          }}
        />
      </body>
    </html>
  );
}