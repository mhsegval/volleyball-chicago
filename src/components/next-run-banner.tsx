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
      <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
        <p className="text-sm uppercase tracking-[0.25em] text-sky-300">
          next run
        </p>
        <h1 className="mt-3 text-2xl font-bold">no active run yet</h1>
        <p className="mt-2 text-sm text-slate-300">
          an admin can create the next friday game from the admin page.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[28px] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/20 via-sky-500/10 to-orange-500/10 p-5 shadow-2xl backdrop-blur">
      <p className="text-sm uppercase tracking-[0.25em] text-emerald-300">
        next run
      </p>
      <h1 className="mt-3 text-2xl font-bold leading-tight">{run.gym_name}</h1>
      <p className="mt-2 text-sm text-slate-100">
        {formatRunWindow(run.date, run.start_time, run.end_time)}
      </p>

      <a
        href={run.location_url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center gap-2 rounded-2xl bg-white/8 px-4 py-3 text-sm text-sky-200"
      >
        <MapPin className="h-4 w-4" />
        open location
      </a>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-950/30 px-4 py-3">
        <Wallet className="h-5 w-5 text-orange-300" />
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-300">
            estimated rent / person
          </p>
          <p className="text-xl font-bold text-white">
            ${estimatedRent?.toFixed(2) ?? "0.00"}
          </p>
        </div>
      </div>
    </section>
  );
}
