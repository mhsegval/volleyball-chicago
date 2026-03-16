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
      buttonClassName="rounded-xl bg-red-50 p-3 text-red-600"
      title="reverse payment"
      description={`This will deduct $${Number(amount).toFixed(2)} from ${userName || "this player"} and ask them to retry the payment.`}
      confirmLabel="reverse payment"
      onConfirm={handleReject}
    >
      <X className="h-4 w-4" />
    </ActionConfirmButton>
  );
}
