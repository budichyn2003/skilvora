'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import Link from 'next/link';
import { api } from '@/lib/axios';
import Cookies from 'js-cookie';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Panggil endpoint authentikasi NestJS bawaan CayLabs
      const response = await api.post('/auth/login', { email, password });
      
      // Ambil token dan simpan ke cookie agar proxy.ts (middleware) mengizinkan akses
      const token = response.data.access_token || response.data.token;
      if (token) {
        const isSecure = window.location.protocol === 'https:';
        Cookies.set('token', token, {
          expires: 1 / 24,
          sameSite: isSecure ? 'None' : 'Lax',
          secure: isSecure,
        });
        toast.success('Login berhasil!');
        router.push('/dashboard');
      } else {
        toast.error('Gagal mendapatkan akses token.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Email atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Gunakan fallback URL jika env belum terbaca
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-bold text-3xl text-[#00033D] tracking-tight mb-2">
            Skilvora<span className="text-[#0033FF]">.</span>
          </Link>
          <p className="text-[#00033D]/70 font-medium">Masuk untuk melanjutkan belajar</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#00033D]">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00033D]/50" />
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com" 
                  required
                  className="pl-10" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#00033D]">Password</label>
                <Link href="/auth/forgot-password" className="text-xs font-bold text-[#0033FF] hover:text-[#0033FF]/80 transition-colors">
                  Lupa Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00033D]/50" />
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="pl-10" 
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-4"
            >
              {isLoading ? 'Memproses...' : 'Masuk ke Skilvora'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-[#00033D]/60 font-semibold backdrop-blur-md">Atau masuk dengan</span>
            </div>
          </div>

          <Button 
            onClick={handleGoogleLogin}
            variant="secondary" 
            type="button"
            className="w-full font-semibold bg-white/40 hover:bg-white/60 border-white/40"
          >
            Google
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}