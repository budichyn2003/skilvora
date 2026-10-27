'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Award, CheckCircle2, Circle, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { EnrollmentService } from '@/services/enrollment.service';

type ModuleItem = {
  id: string;
  title: string;
  order: number;
  videoUrl: string | null;
  content: string | null;
  isFreePreview: boolean;
  quiz?: { id: string } | null;
};

type EnrollmentData = {
  id: string;
  status: 'ACTIVE' | 'PENDING';
  progressPercent: number;
  lastModuleId?: string;
  class: { id: string; title: string; modules: ModuleItem[] };
  progresses: Array<{ moduleId: string; status: string }>;
};

type QuizData = {
  id: string;
  passingGrade: number;
  maxAttempts: number;
  questions: Array<{
    id: string;
    question: string;
    options: Array<{ id: string; text: string }>;
  }>;
};

type QuizTarget = { type: 'MODULE'; moduleId: string } | { type: 'FINAL' };

export default function LearningRoomPage() {
  const params = useParams();
  const classId = params.classId as string;
  const [data, setData] = useState<EnrollmentData | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleItem | null>(null);
  const [quizTarget, setQuizTarget] = useState<QuizTarget | null>(null);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [quizError, setQuizError] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      const enrollment = await EnrollmentService.getEnrollmentDetails(classId);
      setData(enrollment);
      setActiveModule((current) => {
        if (current && enrollment.class.modules.some((module: ModuleItem) => module.id === current.id)) {
          return enrollment.class.modules.find((module: ModuleItem) => module.id === current.id) || current;
        }
        return (
          enrollment.class.modules.find((module: ModuleItem) => module.id === enrollment.lastModuleId) ||
          enrollment.class.modules[0] ||
          null
        );
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memuat ruang belajar');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    if (!data || data.status !== 'ACTIVE' || !activeModule) return;
    const progress = data.progresses.find((item) => item.moduleId === activeModule.id);
    if (progress?.status !== 'NOT_STARTED' && progress) return;

    EnrollmentService.updateProgress(data.id, activeModule.id, 'IN_PROGRESS')
      .then((updated) => {
        setData((current) =>
          current
            ? {
                ...current,
                progresses: [
                  ...current.progresses.filter((item) => item.moduleId !== updated.moduleId),
                  updated,
                ],
              }
            : current,
        );
      })
      .catch((error: any) => {
        toast.error(error.response?.data?.message || 'Gagal memperbarui progres belajar');
      });
  }, [activeModule, data]);

  useEffect(() => {
    if (!quizTarget) return;

    setQuizData(null);
    setQuizError('');
    setQuizResult(null);
    setAnswers({});
    const request =
      quizTarget.type === 'FINAL'
        ? EnrollmentService.getQuiz(classId)
        : EnrollmentService.getModuleQuiz(quizTarget.moduleId);
    request
      .then(setQuizData)
      .catch((error: any) => {
        setQuizError(error.response?.data?.message || 'Kuis belum tersedia.');
      });
  }, [classId, quizTarget]);

  const isCompleted = (moduleId: string) =>
    data?.progresses.some((progress) => progress.moduleId === moduleId && progress.status === 'COMPLETED') ||
    false;
  const allModulesCompleted =
    !!data?.class.modules.length && data.class.modules.every((module) => isCompleted(module.id));

  const handleMarkComplete = async () => {
    if (!data || !activeModule) return;
    try {
      await EnrollmentService.updateProgress(data.id, activeModule.id, 'COMPLETED');
      toast.success('Modul diselesaikan!');
      await fetchDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui progres');
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quizData) return;
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    setIsSubmittingQuiz(true);
    try {
      const result = await EnrollmentService.submitQuiz(quizData.id, formattedAnswers);
      setQuizResult(result);
      if (result.attempt.isPassed) {
        if (quizTarget?.type === 'MODULE' && data) {
          await EnrollmentService.updateProgress(data.id, quizTarget.moduleId, 'COMPLETED');
          await fetchDetails();
        }
        toast.success('Selamat! Anda lulus.');
      } else {
        toast.error('Anda belum lulus. Tinjau materi dan coba kembali.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengirim kuis');
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  if (isLoading) return <div className="animate-pulse bg-[#EAEDFB] h-[calc(100vh-6rem)] rounded-xl" />;
  if (!data) return <div>Data enrollment tidak ditemukan.</div>;
  if (data.status !== 'ACTIVE') {
    return (
      <GlassCard className="mx-auto max-w-2xl p-10 text-center">
        <Lock className="mx-auto mb-4 h-10 w-10 text-[#0033FF]" />
        <h1 className="mb-2 text-2xl font-bold text-[#00033D]">Pembayaran sedang menunggu</h1>
        <p className="mb-6 text-[#00033D]/70">Akses materi kelas penuh terbuka setelah pembayaran dikonfirmasi.</p>
        <Button asChild><Link href="/dashboard/student/payments">Lihat tagihan</Link></Button>
      </GlassCard>
    );
  }

  const renderQuiz = () => {
    if (quizError) return <div role="alert" className="p-8 text-center text-red-600">{quizError}</div>;
    if (!quizData) return <div className="p-8 text-center text-[#00033D]/60">Memuat kuis...</div>;

    if (quizResult) {
      return (
        <div className="mx-auto w-full max-w-2xl py-12 text-center">
          <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full ${quizResult.attempt.isPassed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            <Award className="h-12 w-12" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-[#00033D]">Skor Anda: {quizResult.attempt.score}</h1>
          <p className="mb-8 text-[#00033D]/70">
            {quizResult.attempt.isPassed
              ? quizTarget?.type === 'FINAL'
                ? 'Selamat! Anda lulus kelas dan memenuhi syarat sertifikat.'
                : 'Kuis modul lulus. Modul telah ditandai selesai.'
              : `Nilai minimum kelulusan adalah ${quizData.passingGrade}.`}
          </p>
          {quizResult.certificate?.verificationCode && (
            <GlassCard className="mb-6 border border-[#0033FF]/20 bg-[#0033FF]/5 p-6 text-left">
              <p className="mb-1 text-sm font-semibold uppercase tracking-wider text-[#00033D]/60">Kode sertifikat</p>
              <p className="font-bold text-[#0033FF]">{quizResult.certificate.verificationCode}</p>
            </GlassCard>
          )}
          <Button
            variant="secondary"
            onClick={() => {
              if (quizResult.attempt.isPassed) {
                setQuizTarget(null);
                setQuizResult(null);
              } else {
                setQuizResult(null);
                setAnswers({});
              }
            }}
          >
            {quizResult.attempt.isPassed ? 'Kembali ke materi' : 'Coba lagi'}
          </Button>
        </div>
      );
    }

    return (
      <div className="mx-auto w-full max-w-3xl pb-12">
        <h1 className="mb-2 text-3xl font-bold text-[#00033D]">
          {quizTarget?.type === 'FINAL' ? 'Kuis Akhir Evaluasi' : 'Kuis Modul'}
        </h1>
        <p className="mb-8 text-[#00033D]/70">
          Passing grade {quizData.passingGrade}% · Maksimal {quizData.maxAttempts} percobaan
        </p>
        <div className="space-y-8">
          {quizData.questions.map((question, index) => (
            <GlassCard key={question.id} className="p-6">
              <h3 className="mb-4 font-bold text-[#00033D]">{index + 1}. {question.question}</h3>
              <div className="space-y-3">
                {question.options.map((option) => (
                  <label key={option.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/40 p-3 hover:bg-white/50">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={answers[question.id] === option.id}
                      onChange={() => setAnswers((current) => ({ ...current, [question.id]: option.id }))}
                    />
                    <span className="font-semibold text-[#00033D]">{option.id}.</span>
                    <span className="text-[#00033D]">{option.text}</span>
                  </label>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
        <div className="mt-8 flex justify-end border-t border-white/20 pt-6">
          <Button
            onClick={handleSubmitQuiz}
            disabled={isSubmittingQuiz || Object.keys(answers).length !== quizData.questions.length}
          >
            {isSubmittingQuiz ? 'Memproses...' : 'Kirim Jawaban'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-6 md:flex-row">
      <GlassCard className="flex w-full shrink-0 flex-col overflow-hidden p-0 md:w-80">
        <div className="border-b border-white/20 bg-white/30 p-4">
          <Link href="/dashboard/student/classes" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#00033D]/70 hover:text-[#0033FF]">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Kelas
          </Link>
          <h2 className="line-clamp-2 font-bold text-[#00033D]">{data.class.title}</h2>
          <p className="mt-2 text-xs text-[#00033D]/60">Progress kelas: {data.progressPercent}%</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {data.class.modules.map((module) => (
            <div key={module.id} className="mb-1 rounded-lg">
              <button
                onClick={() => {
                  setQuizTarget(null);
                  setActiveModule(module);
                }}
                className={`flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors ${activeModule?.id === module.id && !quizTarget ? 'border border-[#0033FF]/20 bg-[#0033FF]/10' : 'hover:bg-white/40'}`}
              >
                {isCompleted(module.id) ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-[#00033D]/30" />
                )}
                <span className="text-sm font-semibold text-[#00033D]">{module.order}. {module.title}</span>
              </button>
              {module.quiz && (
                <button
                  onClick={() => setQuizTarget({ type: 'MODULE', moduleId: module.id })}
                  className="ml-11 rounded px-2 py-1 text-xs font-semibold text-[#0033FF] hover:bg-white/60"
                >
                  Kuis modul
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-white/20 bg-white/40 p-4">
          <button
            onClick={() => setQuizTarget({ type: 'FINAL' })}
            disabled={!allModulesCompleted}
            className="flex w-full items-center gap-3 rounded-lg bg-white/50 p-3 text-left font-bold text-[#00033D] enabled:hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            title={!allModulesCompleted ? 'Selesaikan semua modul terlebih dahulu' : undefined}
          >
            <Award className="h-5 w-5 shrink-0" />
            Kuis Akhir & Sertifikat
          </button>
        </div>
      </GlassCard>

      <GlassCard className="flex min-h-[32rem] flex-1 flex-col overflow-y-auto p-6 md:p-8">
        {quizTarget ? (
          renderQuiz()
        ) : activeModule ? (
          <div className="mx-auto w-full max-w-3xl">
            <h1 className="mb-6 text-3xl font-bold text-[#00033D]">{activeModule.title}</h1>
            {activeModule.videoUrl && (
              <div className="mb-8 aspect-video overflow-hidden rounded-xl bg-black">
                <iframe
                  className="h-full w-full"
                  src={activeModule.videoUrl.replace('watch?v=', 'embed/')}
                  title={`Video: ${activeModule.title}`}
                  allowFullScreen
                />
              </div>
            )}
            <div className="prose prose-blue mb-12 max-w-none whitespace-pre-wrap text-[#00033D]/80">
              {activeModule.content}
            </div>
            <div className="flex justify-end border-t border-white/20 pt-6">
              <Button
                onClick={handleMarkComplete}
                disabled={isCompleted(activeModule.id) || !!activeModule.quiz}
                variant={isCompleted(activeModule.id) ? 'secondary' : 'default'}
              >
                {isCompleted(activeModule.id)
                  ? 'Selesai Dipelajari'
                  : activeModule.quiz
                    ? 'Lulus kuis modul untuk menyelesaikan'
                    : 'Tandai Selesai'}
              </Button>
            </div>
          </div>
        ) : (
          <p className="m-auto text-center text-[#00033D]/60">Belum ada materi yang dapat ditampilkan.</p>
        )}
      </GlassCard>
    </div>
  );
}
