"use client";

import { useState, useTransition } from "react";
import { Mail, Shield } from "lucide-react";
import { sendOtp, verifyOtp } from "@/lib/actions";

export function AuthCard() {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="w-full rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      {step === "request" ? (
        <form
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData();
            fd.set("email", email);

            startTransition(async () => {
              const res = await sendOtp(fd);

              if (res?.error) {
                setMessage(res.error);
                return;
              }

              setStep("verify");
              setMessage("A sign-in code has been sent to your email.");
            });
          }}
          className="space-y-4"
        >
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
              volleyball chicago
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">sign in</h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your email and we’ll send you a one-time sign-in code.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              email
            </span>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                name="auth_email"
                required
                autoComplete="email"
                value={email ?? ""}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-slate-900 outline-none"
              />
            </div>
          </label>

          <button
            disabled={pending}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {pending ? "sending code..." : "send code"}
          </button>

          {message ? <p className="text-sm text-sky-600">{message}</p> : null}
        </form>
      ) : (
        <form
          key={`verify-${email}`}
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const fd = new FormData();
            fd.set("email", email);
            fd.set("token", String(form.get("otp_code") || "").trim());

            startTransition(async () => {
              const res = await verifyOtp(fd);
              if (res?.error) setMessage(res.error);
            });
          }}
          className="space-y-4"
        >
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-600">
              verify
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              enter code
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Check your email and enter the one-time code below.
            </p>
          </div>

          <input
            type="text"
            name="username"
            autoComplete="username"
            defaultValue={email}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              one-time code
            </span>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <Shield className="h-4 w-4 text-slate-400" />
              <input
                name="otp_code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                defaultValue=""
                required
                className="w-full bg-transparent text-lg tracking-[0.3em] text-slate-900 outline-none"
              />
            </div>
          </label>

          <button
            disabled={pending}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {pending ? "verifying..." : "continue"}
          </button>

          <button
            type="button"
            onClick={() => setStep("request")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700"
          >
            go back
          </button>

          {message ? (
            <p className="text-sm text-orange-600">{message}</p>
          ) : null}
        </form>
      )}
    </div>
  );
}
