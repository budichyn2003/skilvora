'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'verified' | 'invalid'>('loading');
  const [email, setEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setStatus('invalid');
      return;
    }
    AuthService.verifyEmail(token)
      .then(() => setStatus('verified'))
      .catch(() => setStatus('invalid'));
  }, []);

  const resend = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsResending(true);
    setResendMessage('');
    try {
      const result = await AuthService.resendVerification(email);
      setResendMessage(result.message);
    } catch (error) {
      setResendMessage('Email verifikasi belum dapat dikirim. Coba kembali beberapa saat lagi.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#EAEDFB] p-4">
      <GlassCard className="w-full max-w-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-[#00033D] mb-3">Verifikasi email</h1>
        {status === 'loading' && <p className="text-[#00033D]/70">Memverifikasi tautan...</p>}
        {status === 'verified' && (
          <>
            <p className="text-[#00033D]/70 mb-6">Email berhasil diverifikasi. Anda sekarang dapat masuk.</p>
            <Button asChild><Link href="/auth/login">Masuk</Link></Button>
          </>
        )}
        {status === 'invalid' && (
          <>
            <p className="text-[#00033D]/70 mb-5">Tautan tidak valid atau sudah kedaluwarsa. Minta tautan baru di bawah.</p>
            <form onSubmit={resend} className="space-y-4 text-left">
              <Input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@email.com"
                aria-label="Alamat email"
              />
              <Button type="submit" disabled={isResending} className="w-full">
                {isResending ? 'Mengirim...' : 'Kirim ulang verifikasi'}
              </Button>
            </form>
            {resendMessage && <p className="mt-4 text-sm text-[#00033D]/70">{resendMessage}</p>}
          </>
        )}
      </GlassCard>
    </main>
  );
}
