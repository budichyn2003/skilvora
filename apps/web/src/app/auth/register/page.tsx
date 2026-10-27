'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { AuthService } from '@/services/auth.service';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Konfirmasi kata sandi tidak cocok!');
    }

    setIsLoading(true);
    try {
      await AuthService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      toast.success('Akun dibuat. Periksa email untuk memverifikasi akun sebelum masuk.');
      router.push('/auth/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mendaftar akun');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#EAEDFB]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-bold text-3xl text-[#00033D] tracking-tight">
            Skilvora<span className="text-[#0033FF]">.</span>
          </Link>
          <p className="text-[#00033D]/70 mt-2">Mulai perjalanan karir Anda hari ini</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-[#00033D] block mb-1">Nama Lengkap</label>
              <Input 
                name="name" 
                placeholder="Budi Cahyono" 
                required 
                value={formData.name} 
                onChange={handleChange} 
              />
            </div>
            <div>
              <label className="text-sm font-bold text-[#00033D] block mb-1">Email</label>
              <Input 
                name="email" 
                type="email" 
                placeholder="nama@email.com" 
                required 
                value={formData.email} 
                onChange={handleChange} 
              />
            </div>
            <div>
              <label className="text-sm font-bold text-[#00033D] block mb-1">Kata Sandi</label>
              <Input 
                name="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                value={formData.password} 
                onChange={handleChange} 
              />
            </div>
            <div>
              <label className="text-sm font-bold text-[#00033D] block mb-1">Konfirmasi Kata Sandi</label>
              <Input 
                name="confirmPassword" 
                type="password" 
                placeholder="••••••••" 
                required 
                value={formData.confirmPassword} 
                onChange={handleChange} 
              />
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Daftar Akun'}
            </Button>
          </form>

          <p className="text-center text-sm text-[#00033D]/70 mt-6">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="font-bold text-[#0033FF] hover:underline">
              Masuk di sini
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}