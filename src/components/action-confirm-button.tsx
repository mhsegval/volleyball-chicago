"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function ActionConfirmButton({
  buttonClassName,
  buttonLabel,
  title,
  description,
  confirmLabel,
  onConfirm,
  children,
}: {
  buttonClassName: string;
  buttonLabel?: string;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClassName}
      >
        {children ?? buttonLabel}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              className="fixed inset-0 z-40 bg-slate-900/25"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-[32px] border border-slate-200 bg-white p-5 shadow-2xl"
            >
              <h3 className="text-xl font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{description}</p>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await onConfirm();
                      setOpen(false);
                    })
                  }
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
                >
                  {pending ? "working..." : confirmLabel}
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700"
                >
                  cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
