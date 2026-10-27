'use client';

import { useEffect, useState } from 'react';
import { User, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/axios';

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profilePicture: '',
    role: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => {
        setProfile({
          name: res.data.name || '',
          email: res.data.email || '',
          role: res.data.role || '',
          profilePicture: res.data.profilePicture || '',
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.patch('/auth/profile', {
        name: profile.name,
        profilePicture: profile.profilePicture,
      });
      toast.success('Profil berhasil diperbarui!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan profil');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="animate-pulse bg-[#EAEDFB] h-96 rounded-xl"></div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#00033D] mb-2">Pengaturan Profil</h1>
        <p className="text-[#00033D]/70">Kelola nama dan foto profil akun Anda.</p>
      </div>

      <GlassCard className="p-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Bagian Foto Profil */}
          <div className="flex items-center gap-6 pb-6 border-b border-[#00033D]/10">
            <div className="w-20 h-20 rounded-full bg-[#EAEDFB] flex items-center justify-center overflow-hidden border-2 border-[#0033FF]/30 relative group">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-[#00033D]/40" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-[#00033D] mb-1">Foto Profil</h3>
              <p className="text-xs text-[#00033D]/60 mb-3">Masukkan URL gambar profil Anda.</p>
              <Input 
                name="profilePicture" 
                placeholder="https://example.com/foto.jpg" 
                value={profile.profilePicture} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-bold text-[#00033D] block mb-2">Nama Lengkap</label>
              <Input 
                name="name" 
                value={profile.name} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[#00033D] block mb-2">Email Akun (Tidak dapat diubah)</label>
              <Input 
                value={profile.email} 
                disabled 
                className="bg-gray-100 text-gray-500 cursor-not-allowed" 
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[#00033D] block mb-2">Role Akun</label>
              <Input 
                value={profile.role} 
                disabled 
                className="bg-gray-100 text-gray-500 cursor-not-allowed uppercase font-bold" 
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSaving} className="gap-2 px-8">
              <Save className="w-4 h-4" /> {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}