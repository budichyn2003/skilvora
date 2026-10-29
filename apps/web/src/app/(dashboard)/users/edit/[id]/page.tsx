import { cookies } from "next/headers";
import { notFound } from "next/navigation";

async function getUser(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-fg mb-6">Edit {user.name}</h1>
      {/* Form edit user di sini */}
    </div>
  );
}
