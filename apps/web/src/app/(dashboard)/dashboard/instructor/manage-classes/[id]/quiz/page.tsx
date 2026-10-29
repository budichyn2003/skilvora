"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { InstructorService } from "@/services/instructor.service";

type ModuleOption = { id: string; title: string };

export default function ManageQuizPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;

  const [passingGrade, setPassingGrade] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [quizType, setQuizType] = useState<"FINAL" | "MODULE">("FINAL");
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [moduleId, setModuleId] = useState("");
  const [questions, setQuestions] = useState([
    {
      question: "",
      options: [
        { id: "A", text: "" },
        { id: "B", text: "" },
      ],
      correctAnswer: "A",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    InstructorService.getClassById(classId)
      .then((course) => {
        const classModules = course.modules || [];
        setModules(classModules);
        setModuleId((current) => current || classModules[0]?.id || "");
      })
      .catch((error: any) =>
        toast.error(
          error.response?.data?.message || "Gagal memuat modul kelas",
        ),
      );
  }, [classId]);

  useEffect(() => {
    if (quizType === "MODULE" && !moduleId) return;
    setIsFetching(true);
    InstructorService.getQuiz(
      classId,
      quizType,
      quizType === "MODULE" ? moduleId : undefined,
    )
      .then((quiz) => {
        if (!quiz) {
          setQuestions([
            {
              question: "",
              options: [
                { id: "A", text: "" },
                { id: "B", text: "" },
              ],
              correctAnswer: "A",
            },
          ]);
          setPassingGrade(70);
          setMaxAttempts(3);
          return;
        }
        setPassingGrade(quiz.passingGrade);
        setMaxAttempts(quiz.maxAttempts);
        if (quiz.questions?.length) {
          setQuestions(
            quiz.questions.map((question: any) => ({
              question: question.question,
              options:
                typeof question.options === "string"
                  ? JSON.parse(question.options)
                  : question.options,
              correctAnswer: question.correctAnswer,
            })),
          );
        } else {
          setQuestions([
            {
              question: "",
              options: [
                { id: "A", text: "" },
                { id: "B", text: "" },
              ],
              correctAnswer: "A",
            },
          ]);
        }
      })
      .catch((error: any) => {
        if (error.response?.status !== 404) {
          toast.error(error.response?.data?.message || "Gagal memuat kuis");
        }
        setQuestions([
          {
            question: "",
            options: [
              { id: "A", text: "" },
              { id: "B", text: "" },
            ],
            correctAnswer: "A",
          },
        ]);
        setPassingGrade(70);
        setMaxAttempts(3);
      })
      .finally(() => setIsFetching(false));
  }, [classId, quizType, moduleId]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: [
          { id: "A", text: "" },
          { id: "B", text: "" },
        ],
        correctAnswer: "A",
      },
    ]);
  };

  const handleAddOption = (qIndex: number) => {
    const newQuestions = [...questions];
    const newOptionId = String.fromCharCode(
      65 + newQuestions[qIndex].options.length,
    ); // A, B, C...
    newQuestions[qIndex].options.push({ id: newOptionId, text: "" });
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Backend akan melakukan UPSERT (Update jika ada, Insert jika baru)
      await InstructorService.createQuiz(classId, {
        type: quizType,
        ...(quizType === "MODULE" ? { moduleId } : {}),
        passingGrade,
        maxAttempts,
        questions,
      });
      toast.success("Kuis berhasil disimpan!");
      router.push(`/dashboard/instructor/manage-classes/${classId}`);
    } catch (error) {
      toast.error("Gagal menyimpan kuis");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching || !modules.length) {
    return (
      <div className="animate-pulse bg-surface-2 h-96 rounded-xl max-w-4xl"></div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="secondary" size="icon" asChild>
          <Link href={`/dashboard/instructor/manage-classes/${classId}`}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-fg">Kelola Kuis Evaluasi</h1>
          <p className="text-muted">Susun soal untuk syarat kelulusan siswa.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassCard className="grid gap-4 p-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-fg">
              Jenis kuis
            </label>
            <select
              value={quizType}
              onChange={(event) =>
                setQuizType(event.target.value as "FINAL" | "MODULE")
              }
              className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm"
            >
              <option value="FINAL">Kuis akhir kelas</option>
              <option value="MODULE">Kuis modul</option>
            </select>
          </div>
          {quizType === "MODULE" && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-fg">
                Modul
              </label>
              <select
                value={moduleId}
                onChange={(event) => setModuleId(event.target.value)}
                className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm"
              >
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </GlassCard>
        <GlassCard className="p-6">
          <label className="text-sm font-semibold text-fg block mb-2">
            Batas Kelulusan (Passing Grade %)
          </label>
          <Input
            type="number"
            min="1"
            max="100"
            required
            value={passingGrade}
            onChange={(e) => setPassingGrade(Number(e.target.value))}
            className="max-w-[200px]"
          />
          <label className="mt-4 block text-sm font-semibold text-fg">
            Maksimal percobaan
          </label>
          <Input
            type="number"
            min="1"
            required
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(Number(e.target.value))}
            className="mt-2 max-w-[200px]"
          />
        </GlassCard>

        {questions.map((q, qIndex) => (
          <GlassCard key={qIndex} className="p-6 border-l-4 border-l-turbo">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-fg">Soal {qIndex + 1}</h3>
              {questions.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() =>
                    setQuestions(questions.filter((_, i) => i !== qIndex))
                  }
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>

            <textarea
              required
              rows={2}
              placeholder="Tulis pertanyaan di sini..."
              className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg mb-4 focus:outline-none focus:ring-2 focus:ring-turbo/40"
              value={q.question}
              onChange={(e) => {
                const newQ = [...questions];
                newQ[qIndex].question = e.target.value;
                setQuestions(newQ);
              }}
            />

            <div className="space-y-3 mb-4">
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={q.correctAnswer === opt.id}
                    onChange={() => {
                      const newQ = [...questions];
                      newQ[qIndex].correctAnswer = opt.id;
                      setQuestions(newQ);
                    }}
                    className="text-turbo focus:ring-turbo"
                  />
                  <span className="font-bold text-fg w-6">{opt.id}.</span>
                  <Input
                    required
                    placeholder={`Opsi ${opt.id}`}
                    value={opt.text}
                    onChange={(e) => {
                      const newQ = [...questions];
                      newQ[qIndex].options[oIndex].text = e.target.value;
                      setQuestions(newQ);
                    }}
                  />
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleAddOption(qIndex)}
              className="text-xs"
            >
              + Tambah Opsi Jawaban
            </Button>
          </GlassCard>
        ))}

        <div className="flex justify-between items-center pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddQuestion}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Soal
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="w-4 h-4" />{" "}
            {isSubmitting ? "Menyimpan..." : "Simpan Kuis"}
          </Button>
        </div>
      </form>
    </div>
  );
}
