"use client";

import { useState, useTransition } from "react";
import { Mail, Shield } from "lucide-react";
import { sendOtp, verifyOtp } from "@/lib/actions";

export function AuthCard() {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="w-full rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
      {step === "request" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();

            const fd = new FormData();
            fd.set("email", email);
            fd.set("name", name);

            startTransition(async () => {
              const res = await sendOtp(fd);

              if (res?.error) {
                setMessage(res.error);
                return;
              }

              setStep("verify");
              setMessage("code sent to your email");
            });
          }}
          className="space-y-4"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">
              volleyball chicago
            </p>
            <h1 className="mt-3 text-3xl font-bold">
              single sign on / sign up
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              enter your email to receive a one-time code.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              name is only required for new users.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">
              name <span className="text-slate-500">(new users only)</span>
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="your name"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">email</span>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-white outline-none"
              />
            </div>
          </label>

          <button
            disabled={pending}
            className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
          >
            {pending ? "sending..." : "send code"}
          </button>

          {message ? <p className="text-sm text-sky-200">{message}</p> : null}
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();

            const form = new FormData(e.currentTarget);
            const fd = new FormData();
            fd.set("email", email);
            fd.set("token", String(form.get("token") || ""));

            startTransition(async () => {
              const res = await verifyOtp(fd);

              if (res?.error) {
                setMessage(res.error);
              }
            });
          }}
          className="space-y-4"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-sky-300">
              verify
            </p>
            <h2 className="mt-3 text-2xl font-bold">enter your code</h2>
            <p className="mt-2 text-sm text-slate-300">
              check your email and enter the one-time code.
            </p>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">
              one-time code
            </span>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <Shield className="h-4 w-4 text-slate-400" />
              <input
                name="token"
                inputMode="numeric"
                required
                className="w-full bg-transparent text-lg tracking-[0.3em] text-white outline-none"
              />
            </div>
          </label>

          <button
            disabled={pending}
            className="w-full rounded-2xl bg-sky-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
          >
            {pending ? "verifying..." : "verify code"}
          </button>

          <button
            type="button"
            onClick={() => setStep("request")}
            className="w-full rounded-2xl bg-white/10 px-4 py-3 text-white"
          >
            go back
          </button>

          {message ? (
            <p className="text-sm text-orange-200">{message}</p>
          ) : null}
        </form>
      )}
    </div>
  );
}
