"use client";

import { Check } from "lucide-react";
import { approvePaymentRequest } from "@/lib/actions";
import { ActionConfirmButton } from "@/components/action-confirm-button";

export function ApprovePaymentButton({
  requestId,
  amount,
  userName,
}: {
  requestId: string;
  amount: number;
  userName?: string;
}) {
  async function handleApprove() {
    const formData = new FormData();
    formData.set("request_id", requestId);
    await approvePaymentRequest(formData);
  }

  return (
    <ActionConfirmButton
      buttonClassName="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 transition active:scale-[0.98]"
      title="confirm payment"
      description={`This confirms $${Number(amount).toFixed(2)} for ${userName || "this player"} and marks it as approved.`}
      confirmLabel="confirm payment"
      onConfirm={handleApprove}
    >
      <Check className="h-4 w-4" />
    </ActionConfirmButton>
  );
}
