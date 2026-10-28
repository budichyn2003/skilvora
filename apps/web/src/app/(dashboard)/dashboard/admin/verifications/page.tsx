"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { PaymentService } from "@/services/payment.service";

type AdminPayment = {
  id: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  proofUrl: string | null;
  hasProof: boolean;
  amount: number | string;
  enrollment: {
    user: { name: string | null; email: string };
    class: { title: string };
  };
  audits: Array<{ action: string }>;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;
}

export default function AdminVerificationsPage() {
  const paymentsEnabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState("");

  const load = async () => {
    try {
      setPayments(await PaymentService.getForAdmin());
      setLoadError("");
    } catch (error: unknown) {
      setLoadError(getErrorMessage(error, "Gagal memuat transaksi."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load remote data after mount; updates are asynchronous network results.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const review = async (id: string, approved: boolean) => {
    const reason = reasons[id] || "";
    if (!approved && !reason.trim()) {
      toast.error("Alasan penolakan wajib diisi.");
      return;
    }

    setProcessingId(id);
    try {
      await PaymentService.review(id, approved, reason);
      toast.success(
        approved
          ? "Pembayaran disetujui dan kelas diaktifkan."
          : "Bukti pembayaran ditolak.",
      );
      await load();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Gagal memproses pembayaran."));
    } finally {
      setProcessingId("");
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-[#00033D] mb-2">
        Verifikasi Pembayaran
      </h1>
      <p className="text-[#00033D]/70 mb-8">
        Periksa bukti transfer, lalu setujui atau tolak dengan alasan.
      </p>
      {!paymentsEnabled && (
        <p
          role="status"
          className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800"
        >
          Pembayaran dinonaktifkan. Jangan menyetujui transaksi uang nyata pada
          mode prototipe.
        </p>
      )}
      <GlassCard className="overflow-hidden p-0">
        {isLoading ? (
          <p className="p-8 text-[#00033D]/60">Memuat transaksi...</p>
        ) : loadError ? (
          <p role="alert" className="p-8 text-red-600">
            {loadError}
          </p>
        ) : payments.filter(
            (payment) => payment.status === "PENDING" && payment.hasProof,
          ).length === 0 ? (
          <p className="p-8 text-center text-[#00033D]/60">
            Belum ada bukti transfer yang menunggu verifikasi.
          </p>
        ) : (
          <div className="divide-y divide-[#00033D]/10">
            {payments
              .filter(
                (payment) => payment.status === "PENDING" && payment.hasProof,
              )
              .map((payment) => (
                <div key={payment.id} className="space-y-4 p-5">
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-[#00033D]">
                      {payment.enrollment.class.title}
                    </p>
                    <p className="text-sm text-[#00033D]/70">
                      {payment.enrollment.user.name ||
                        payment.enrollment.user.email}{" "}
                      · Rp {Number(payment.amount).toLocaleString("id-ID")}
                    </p>
                    <a
                      className="w-fit text-sm text-[#0033FF] underline"
                      href={payment.proofUrl || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buka bukti pembayaran
                    </a>
                  </div>
                  <Input
                    aria-label={`Alasan penolakan ${payment.id}`}
                    placeholder="Alasan jika bukti ditolak"
                    value={reasons[payment.id] || ""}
                    onChange={(event) =>
                      setReasons((current) => ({
                        ...current,
                        [payment.id]: event.target.value,
                      }))
                    }
                  />
                  <div className="flex gap-3">
                    <Button
                      disabled={!paymentsEnabled || processingId === payment.id}
                      onClick={() => review(payment.id, true)}
                    >
                      Setujui pembayaran
                    </Button>
                    <Button
                      variant="danger"
                      disabled={!paymentsEnabled || processingId === payment.id}
                      onClick={() => review(payment.id, false)}
                    >
                      Tolak
                    </Button>
                  </div>
                  {payment.audits?.length > 0 && (
                    <p className="text-xs text-[#00033D]/60">
                      Riwayat aktivitas:{" "}
                      {payment.audits
                        .map((audit: { action: string }) => audit.action)
                        .join(", ")}
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
