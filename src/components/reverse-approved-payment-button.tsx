"use client";

import { RotateCcw } from "lucide-react";
import { reverseApprovedPaymentRequest } from "@/lib/actions";
import { ActionConfirmButton } from "@/components/action-confirm-button";

export function ReverseApprovedPaymentButton({
  requestId,
  amount,
  userName,
}: {
  requestId: string;
  amount: number;
  userName?: string;
}) {
  async function handleReverse() {
    const formData = new FormData();
    formData.set("request_id", requestId);
    await reverseApprovedPaymentRequest(formData);
  }

  return (
    <ActionConfirmButton
      buttonClassName="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-rose-700 transition active:scale-[0.98]"
      title="reverse approved payment"
      description={`This will remove $${Number(amount).toFixed(2)} from ${userName || "this player"} and mark this payment as reversed.`}
      confirmLabel="reverse payment"
      onConfirm={handleReverse}
    >
      <RotateCcw className="h-4 w-4" />
    </ActionConfirmButton>
  );
}
