'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BookOpen, Users, Award, ShieldCheck, User, LogOut, FileText, CheckSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.get('/auth/me').then(res => setUser(res.data)).catch(() => {
      router.push('/auth/login');
    });
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      toast.error('Sesi server tidak dapat diakhiri. Token lokal tetap dihapus.');
    } finally {
      Cookies.remove('token');
      router.replace('/auth/login');
      router.refresh();
    }
  };

  const role = user?.role; // 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'

  return (
    <div className="min-h-screen flex bg-[#EAEDFB]/40">
      {/* Sidebar */}
      <aside className="w-64 bg-[#00033D] text-white flex flex-col justify-between hidden md:flex border-r border-white/10">
        <div>
          <div className="p-6 border-b border-white/10">
            <Link href="/" className="font-bold text-2xl tracking-tight text-white">
              Skilvora<span className="text-[#0033FF]">.</span>
            </Link>
            <p className="text-xs text-white/50 uppercase tracking-widest mt-1">
              {role ? role : 'Loading...'}
            </p>
          </div>

          <nav className="p-4 space-y-2">
            {/* Menu Siswa */}
            {role === 'STUDENT' && (
              <>
                <Link href="/dashboard/student" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === '/dashboard/student' ? 'bg-[#0033FF] text-white shadow-lg shadow-[#0033FF]/30' : 'text-white/70 hover:bg-white/5'}`}>
                  <LayoutDashboard className="w-4 h-4" /> Beranda Dasbor
                </Link>
                <Link href="/dashboard/student/classes" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname.includes('/student/classes') ? 'bg-[#0033FF] text-white shadow-lg shadow-[#0033FF]/30' : 'text-white/70 hover:bg-white/5'}`}>
                  <BookOpen className="w-4 h-4" /> Kelas Saya
                </Link>
                <Link href="/dashboard/student/certificates" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname.includes('/student/certificates') ? 'bg-[#0033FF] text-white shadow-lg shadow-[#0033FF]/30' : 'text-white/70 hover:bg-white/5'}`}>
                  <Award className="w-4 h-4" /> Sertifikat
                </Link>
                <Link href="/dashboard/student/payments" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname.includes('/student/payments') ? 'bg-[#0033FF] text-white shadow-lg shadow-[#0033FF]/30' : 'text-white/70 hover:bg-white/5'}`}>
                  <FileText className="w-4 h-4" /> Tagihan Pembayaran
                </Link>
              </>
            )}

            {/* Menu Instruktur */}
            {role === 'INSTRUCTOR' && (
              <>
                <Link href="/dashboard/instructor" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === '/dashboard/instructor' ? 'bg-[#0033FF] text-white shadow-lg shadow-[#0033FF]/30' : 'text-white/70 hover:bg-white/5'}`}>
                  <LayoutDashboard className="w-4 h-4" /> Beranda Dasbor
                </Link>
                <Link href="/dashboard/instructor/manage-classes" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname.includes('/instructor/manage-classes') ? 'bg-[#0033FF] text-white shadow-lg shadow-[#0033FF]/30' : 'text-white/70 hover:bg-white/5'}`}>
                  <BookOpen className="w-4 h-4" /> Kelola Kelas
                </Link>
                <Link href="/dashboard/instructor/statistics" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname.includes('/instructor/statistics') ? 'bg-[#0033FF] text-white shadow-lg shadow-[#0033FF]/30' : 'text-white/70 hover:bg-white/5'}`}>
                  <FileText className="w-4 h-4" /> Laporan Pendapatan
                </Link>
              </>
            )}

            {/* Menu Admin */}
            {role === 'ADMIN' && (
              <>
                <Link href="/dashboard/admin" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === '/dashboard/admin' ? 'bg-[#0033FF] text-white shadow-lg shadow-[#0033FF]/30' : 'text-white/70 hover:bg-white/5'}`}>
                  <LayoutDashboard className="w-4 h-4" /> Beranda Dasbor
                </Link>
                <Link href="/dashboard/admin/roadmap" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname.includes('/admin/roadmap') ? 'bg-[#0033FF] text-white shadow-lg shadow-[#0033FF]/30' : 'text-white/70 hover:bg-white/5'}`}>
                  <FileText className="w-4 h-4" /> Kelola Roadmap
                </Link>
                <Link href="/dashboard/admin/verifications" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname.includes('/admin/verifications') ? 'bg-[#0033FF] text-white shadow-lg shadow-[#0033FF]/30' : 'text-white/70 hover:bg-white/5'}`}>
                  <CheckSquare className="w-4 h-4" /> Verifikasi Pembayaran
                </Link>
                <Link href="/dashboard/admin/users" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname.includes('/admin/users') ? 'bg-[#0033FF] text-white shadow-lg shadow-[#0033FF]/30' : 'text-white/70 hover:bg-white/5'}`}>
                  <Users className="w-4 h-4" /> Manajemen Pengguna
                </Link>
                <Link href="/dashboard/admin/certificates" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname.includes('/admin/certificates') ? 'bg-[#0033FF] text-white shadow-lg shadow-[#0033FF]/30' : 'text-white/70 hover:bg-white/5'}`}>
                  <Award className="w-4 h-4" /> Sertifikat
                </Link>
              </>
            )}

            {/* Menu Umum Semua Role */}
            <div className="pt-4 border-t border-white/10 mt-4">
              <Link href="/dashboard/profile" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname.includes('/profile') ? 'bg-[#0033FF] text-white shadow-lg shadow-[#0033FF]/30' : 'text-white/70 hover:bg-white/5'}`}>
                <User className="w-4 h-4" /> Pengaturan Profil
              </Link>
            </div>
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 w-full transition-all">
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}