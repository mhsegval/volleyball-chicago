"use client";

import { useTransition } from "react";
import { deleteActiveRun } from "@/lib/actions";

export function DeleteRunButton() {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete the current run?\n\nThis will remove all signed up players and they will need to register again.",
    );

    if (!confirmed) return;

    const secondConfirm = window.confirm(
      "Please confirm again: delete this run and clear all signups?",
    );

    if (!secondConfirm) return;

    startTransition(async () => {
      await deleteActiveRun();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="w-full rounded-2xl bg-red-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
    >
      {pending ? "deleting..." : "delete active run"}
    </button>
  );
}
