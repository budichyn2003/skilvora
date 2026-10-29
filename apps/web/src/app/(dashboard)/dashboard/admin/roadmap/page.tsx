"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/axios";

type RoadmapNode = { classId: string; title: string; order: number };
type Roadmap = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED";
  nodes: Array<
    RoadmapNode & { id: string; class: { id: string; title: string } }
  >;
};
type ClassOption = { id: string; title: string; slug: string; level: string };

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  status: "DRAFT" as "DRAFT" | "PUBLISHED",
  nodes: [] as RoadmapNode[],
};

function getErrorMessage(error: unknown, fallback: string): string {
  return isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;
}

export default function AdminRoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    try {
      const [roadmapResponse, classesResponse] = await Promise.all([
        api.get<Roadmap[]>("/roadmaps/admin"),
        api.get<ClassOption[]>("/roadmaps/admin/classes"),
      ]);
      setRoadmaps(roadmapResponse.data);
      setClasses(classesResponse.data);
      setLoadError("");
    } catch (error: unknown) {
      setLoadError(getErrorMessage(error, "Gagal memuat data roadmap."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load remote data after mount; updates are asynchronous network results.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const startEdit = (roadmap: Roadmap) => {
    setEditingId(roadmap.id);
    setForm({
      title: roadmap.title,
      slug: roadmap.slug,
      description: roadmap.description || "",
      status: roadmap.status,
      nodes: roadmap.nodes.map((node) => ({
        title: node.title,
        classId: node.classId,
        order: node.order,
      })),
    });
  };

  const addNode = (classId: string) => {
    const course = classes.find((item) => item.id === classId);
    if (!course || form.nodes.some((node) => node.classId === classId)) return;
    setForm((current) => ({
      ...current,
      nodes: [
        ...current.nodes,
        { classId, title: course.title, order: current.nodes.length + 1 },
      ],
    }));
  };

  const moveNode = (index: number, offset: number) => {
    const target = index + offset;
    if (target < 0 || target >= form.nodes.length) return;
    const nodes = [...form.nodes];
    [nodes[index], nodes[target]] = [nodes[target], nodes[index]];
    setForm((current) => ({
      ...current,
      nodes: nodes.map((node, nodeIndex) => ({
        ...node,
        order: nodeIndex + 1,
      })),
    }));
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        nodes: form.nodes.map((node, index) => ({ ...node, order: index + 1 })),
      };
      if (editingId) {
        await api.patch(`/roadmaps/admin/${editingId}`, payload);
      } else {
        await api.post("/roadmaps/admin", payload);
      }
      toast.success("Roadmap berhasil disimpan.");
      setForm(emptyForm);
      setEditingId("");
      await load();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Gagal menyimpan roadmap."));
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async (roadmap: Roadmap) => {
    if (!window.confirm(`Hapus roadmap "${roadmap.title}"?`)) return;
    try {
      await api.delete(`/roadmaps/admin/${roadmap.id}`);
      toast.success("Roadmap dihapus.");
      if (editingId === roadmap.id) {
        setEditingId("");
        setForm(emptyForm);
      }
      await load();
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(
          error,
          "Roadmap published harus dibatalkan publikasinya sebelum dihapus.",
        ),
      );
    }
  };

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-fg">
          Kelola Roadmap Pembelajaran
        </h1>
        <p className="text-muted">
          Susun node dari kelas published; urutan dapat diubah sebelum disimpan.
        </p>
      </div>

      <GlassCard className="p-6">
        <h2 className="mb-5 text-xl font-bold text-fg">
          {editingId ? "Edit roadmap" : "Buat roadmap"}
        </h2>
        <form className="space-y-4" onSubmit={save}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              required
              aria-label="Judul roadmap"
              placeholder="Judul roadmap"
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
            />
            <Input
              aria-label="Slug roadmap"
              placeholder="slug-roadmap (opsional, otomatis dari judul)"
              value={form.slug}
              onChange={(event) =>
                setForm({ ...form, slug: event.target.value })
              }
            />
          </div>
          <textarea
            aria-label="Deskripsi roadmap"
            className="min-h-24 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm"
            placeholder="Deskripsi"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              aria-label="Status roadmap"
              className="h-11 rounded-xl border border-line bg-surface px-3 text-sm"
              value={form.status}
              onChange={(event) =>
                setForm({
                  ...form,
                  status: event.target.value as "DRAFT" | "PUBLISHED",
                })
              }
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
            <select
              aria-label="Tambahkan kelas ke roadmap"
              className="h-11 flex-1 rounded-xl border border-line bg-surface px-3 text-sm"
              value=""
              onChange={(event) => addNode(event.target.value)}
            >
              <option value="">Tambah kelas published...</option>
              {classes
                .filter(
                  (course) =>
                    !form.nodes.some((node) => node.classId === course.id),
                )
                .map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
            </select>
          </div>
          {form.nodes.length > 0 && (
            <ol className="space-y-2">
              {form.nodes.map((node, index) => (
                <li
                  key={node.classId}
                  className="flex flex-wrap items-center gap-2 rounded-xl bg-surface p-3"
                >
                  <span className="w-7 text-sm font-bold text-turbo">
                    {index + 1}.
                  </span>
                  <Input
                    aria-label={`Nama node ${index + 1}`}
                    className="min-w-40 flex-1"
                    value={node.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        nodes: current.nodes.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, title: event.target.value }
                            : item,
                        ),
                      }))
                    }
                  />
                  <span className="text-xs text-muted">
                    {classes.find((course) => course.id === node.classId)
                      ?.title || node.classId}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={index === 0}
                    onClick={() => moveNode(index, -1)}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={index === form.nodes.length - 1}
                    onClick={() => moveNode(index, 1)}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        nodes: current.nodes
                          .filter((_, itemIndex) => itemIndex !== index)
                          .map((item, itemIndex) => ({
                            ...item,
                            order: itemIndex + 1,
                          })),
                      }))
                    }
                  >
                    Hapus node
                  </Button>
                </li>
              ))}
            </ol>
          )}
          <div className="flex gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan roadmap"}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingId("");
                  setForm(emptyForm);
                }}
              >
                Batal edit
              </Button>
            )}
          </div>
        </form>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        {isLoading ? (
          <p className="p-6 text-muted">Memuat roadmap...</p>
        ) : loadError ? (
          <p role="alert" className="p-6 text-danger">
            {loadError}
          </p>
        ) : roadmaps.length === 0 ? (
          <p className="p-6 text-muted">Belum ada roadmap.</p>
        ) : (
          <div className="divide-y divide-line">
            {roadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold text-fg">{roadmap.title}</p>
                  <p className="text-sm text-muted">
                    /{roadmap.slug} · {roadmap.status} · {roadmap.nodes.length}{" "}
                    node
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => startEdit(roadmap)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => remove(roadmap)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
