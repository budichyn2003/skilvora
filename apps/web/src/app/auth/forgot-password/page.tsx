'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AuthService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      const result = await AuthService.requestPasswordReset(email);
      setMessage(result.message);
    } catch {
      setMessage('Permintaan belum dapat diproses. Silakan coba kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#EAEDFB] p-4">
      <GlassCard className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-[#00033D] mb-2">Lupa password?</h1>
        <p className="text-sm text-[#00033D]/70 mb-6">Kami akan mengirim tautan pengaturan ulang jika email terdaftar.</p>
        <form onSubmit={submit} className="space-y-4">
          <Input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@email.com"
            aria-label="Alamat email"
          />
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Mengirim...' : 'Kirim tautan reset'}
          </Button>
        </form>
        {message && <p role="status" className="mt-4 text-sm text-[#00033D]/70">{message}</p>}
        <Link href="/auth/login" className="block mt-6 text-sm font-bold text-[#0033FF]">Kembali ke login</Link>
      </GlassCard>
    </main>
  );
}
