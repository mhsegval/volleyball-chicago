import { MapPin, Wallet } from "lucide-react";
import { formatRunWindow } from "@/lib/format";
import type { Run } from "@/lib/types";

export function NextRunBanner({
  run,
  estimatedRent,
}: {
  run: Run | null;
  estimatedRent: number | null;
}) {
  if (!run) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
          next run
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          no active run yet
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          an admin can create the next game from the admin page.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-600">
            next run
          </p>
          <h1 className="mt-3 text-2xl font-bold leading-tight text-slate-900">
            {run.gym_name}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {formatRunWindow(run.date, run.start_time, run.end_time)}
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
          <p className="text-xs uppercase tracking-wide text-emerald-700">
            estimated rent
          </p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            ${estimatedRent?.toFixed(2) ?? "0.00"}
          </p>
        </div>
      </div>

      <a
        href={run.location_url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <MapPin className="h-4 w-4 text-sky-600" />
        open location
      </a>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-sky-50 px-4 py-3">
        <Wallet className="h-5 w-5 text-sky-700" />
        <p className="text-sm text-slate-700">
          Rent updates dynamically as players join or leave.
        </p>
      </div>
    </section>
  );
}
