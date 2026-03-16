"use client";

import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";

export function ProfileSaveButton({
  label = "save profile",
}: {
  label?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
      disabled={pending}
    >
      {pending ? (
        "saving..."
      ) : (
        <span className="inline-flex items-center gap-2">
          <Check className="h-4 w-4" />
          {label}
        </span>
      )}
    </button>
  );
}
