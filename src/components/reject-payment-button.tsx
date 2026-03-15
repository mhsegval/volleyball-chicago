"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { rejectPaymentRequest } from "@/lib/actions";

export function RejectPaymentButton({
  requestId,
  amount,
  userName,
}: {
  requestId: string;
  amount: number;
  userName?: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleReject() {
    const ok = window.confirm(
      `Reject this payment for ${userName || "this user"}?\n\nThis will deduct $${Number(
        amount,
      ).toFixed(
        2,
      )} from the user's balance.\n\nPlease ask the player to retry the fund payment.`,
    );

    if (!ok) return;

    const formData = new FormData();
    formData.set("request_id", requestId);

    startTransition(async () => {
      await rejectPaymentRequest(formData);
    });
  }

  return (
    <button
      type="button"
      onClick={handleReject}
      disabled={pending}
      className="rounded-xl bg-red-50 p-3 text-red-600 disabled:opacity-60"
      title="reverse payment"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
