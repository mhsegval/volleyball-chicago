import { CalendarDays, MapPin, Wallet } from "lucide-react";
import type { Run } from "@/lib/types";
import { formatRunWindow } from "@/lib/format";

export function NextRunBanner({
  run,
  estimatedRent,
}: {
  run: Run | null;
  estimatedRent: number | null;
}) {
  if (!run) {
    return (
      <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
              upcoming run
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              no active run
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              A new run has not been posted yet. Check back soon.
            </p>
          </div>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            waiting
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
            upcoming run
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {run.gym_name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {formatRunWindow(run.date, run.start_time, run.end_time)}
          </p>
        </div>

        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          live
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <CalendarDays className="h-4 w-4 text-slate-500" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              schedule
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {formatRunWindow(run.date, run.start_time, run.end_time)}
            </p>
          </div>
        </div>

        <a
          href={run.location_url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300"
        >
          <MapPin className="h-4 w-4 text-slate-500" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              location
            </p>
            <p className="mt-1 truncate text-sm font-medium text-slate-900">
              open map
            </p>
          </div>
        </a>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Wallet className="h-4 w-4 text-slate-500" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              estimated share
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              ${Number(estimatedRent ?? run.total_rent).toFixed(2)} per player
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
