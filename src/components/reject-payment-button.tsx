"use client";

import { X } from "lucide-react";
import { rejectPaymentRequest } from "@/lib/actions";
import { ActionConfirmButton } from "@/components/action-confirm-button";

export function RejectPaymentButton({
  requestId,
  amount,
  userName,
}: {
  requestId: string;
  amount: number;
  userName?: string;
}) {
  async function handleReject() {
    const formData = new FormData();
    formData.set("request_id", requestId);
    await rejectPaymentRequest(formData);
  }

  return (
    <ActionConfirmButton
      buttonClassName="rounded-xl border border-red-200 bg-red-50 p-3 text-red-600 transition active:scale-[0.98]"
      title="reverse payment"
      description={`This removes $${Number(amount).toFixed(2)} from ${userName || "this player"} and lets them try again.`}
      confirmLabel="reverse payment"
      onConfirm={handleReject}
    >
      <X className="h-4 w-4" />
    </ActionConfirmButton>
  );
}
