import { cookies } from 'next/headers';
import { GlassCard } from '@/components/ui/glass-card';

// Fungsi khusus fetch untuk Server Component dengan Auth
async function getUsers() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store' // Agar data user selalu fresh
  });

  if (!res.ok) throw new Error('Gagal mengambil data pengguna');
  return res.json();
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-[#00033D] mb-6">Manajemen Pengguna</h1>
      <div className="flex flex-col gap-4">
        {users.map((user: any) => (
          <GlassCard key={user.id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-bold text-[#00033D]">{user.name}</p>
              <p className="text-sm text-[#00033D]/70">{user.email}</p>
            </div>
            <span className="px-3 py-1 bg-[#0033FF]/10 text-[#0033FF] rounded-full text-xs font-bold">
              {user.role}
            </span>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}