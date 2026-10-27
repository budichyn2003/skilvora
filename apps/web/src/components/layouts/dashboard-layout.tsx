'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthService, UserProfile } from "@/services/auth.service";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await AuthService.getProfile();
        setUser(profile);
      } catch (error) {
        Cookies.remove('token');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-[#00033D]">Memuat dasbor...</div>;
  }

  const isActive = (path: string) => pathname === path;
  const linkClass = (path: string) => `px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(path) ? 'bg-[#0033FF] text-white shadow-[0_4px_20px_rgba(0,51,255,0.35)]' : 'text-white/70 hover:text-white hover:bg-white/10'}`;

  // Menentukan route beranda berdasarkan role
  const homeRoute = user?.role === 'STUDENT' ? '/dashboard/student' : user?.role === 'INSTRUCTOR' ? '/dashboard/instructor' : '/dashboard/admin';

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar - Dark Glass */}
      <aside className="w-64 fixed inset-y-0 left-0 z-40 bg-[#030812]/90 backdrop-blur-2xl border-r border-white/10 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href="/" className="font-bold text-xl text-white tracking-tight">
            Skilvora<span className="text-[#0033FF]">.</span>
          </Link>
        </div>
        
        <div className="px-6 py-4 border-b border-white/10 mb-2">
          <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-1">{user?.role}</p>
          <p className="text-sm text-white font-bold truncate">{user?.name}</p>
        </div>

        <nav className="flex-1 px-4 py-4 flex flex-col gap-2 overflow-y-auto">
          <Link href={homeRoute} className={linkClass(homeRoute)}>Beranda Dasbor</Link>

          {user?.role === 'STUDENT' && (
            <>
              <Link href="/dashboard/student/classes" className={linkClass('/dashboard/student/classes')}>Kelas Saya</Link>
              <Link href="/dashboard/student/certificates" className={linkClass('/dashboard/student/certificates')}>Sertifikat</Link>
            </>
          )}

          {user?.role === 'INSTRUCTOR' && (
            <>
              <Link href="/dashboard/instructor/manage-classes" className={linkClass('/dashboard/instructor/manage-classes')}>Kelola Kelas</Link>
              <Link href="/dashboard/instructor/statistics" className={linkClass('/dashboard/instructor/statistics')}>Laporan Pendapatan</Link>
            </>
          )}

          {user?.role === 'ADMIN' && (
            <>
              <Link href="/dashboard/admin/roadmap" className={linkClass('/dashboard/admin/roadmap')}>Kelola Roadmap</Link>
              <Link href="/dashboard/admin/verifications" className={linkClass('/dashboard/admin/verifications')}>Verifikasi Pembayaran</Link>
              <Link href="/dashboard/admin/users" className={linkClass('/dashboard/admin/users')}>Manajemen Pengguna</Link>
            </>
          )}
        </nav>
        
        <div className="p-4">
          <button 
            onClick={async () => {
              try {
                await AuthService.logout();
              } catch (error) {
                toast.error('Sesi server tidak dapat diakhiri. Token lokal tetap dihapus.');
              } finally {
                Cookies.remove('token');
                router.replace('/auth/login');
                router.refresh();
              }
            }}
            className="w-full px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-colors text-left"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}