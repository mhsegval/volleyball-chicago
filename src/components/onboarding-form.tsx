"use client";

import { useState, useTransition } from "react";
import { completeProfile } from "@/lib/actions";
import { prepareImageForUpload } from "@/lib/image-prep";
import { ProfileSaveButton } from "@/components/profile-save-button";

export function OnboardingForm({ defaultName = "" }: { defaultName?: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const fd = new FormData(form);

    const file = fd.get("avatar");
    if (file instanceof File && file.size > 0) {
      try {
        const prepared = await prepareImageForUpload(file);
        fd.set("avatar", prepared);
      } catch {
        setError("could not process this photo. please try another image.");
        return;
      }
    }

    startTransition(async () => {
      const result = await completeProfile(fd);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4">
      <input
        name="name"
        defaultValue={defaultName}
        required
        placeholder="your name"
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
      />

      <div>
        <input
          name="avatar"
          type="file"
          accept="image/*,.heic,.heif"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none file:mr-3 file:rounded-xl file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-sky-700"
        />
        <p className="mt-2 text-xs text-slate-500">
          Large photos will be resized automatically before upload.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <ProfileSaveButton label={pending ? "saving..." : "continue"} />
    </form>
  );
}
