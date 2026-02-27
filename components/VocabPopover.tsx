"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

const MOCK_VOCAB: Record<string, { pos: string; meaning: string; example: string }> = {
  compound: {
    pos: "verb",
    meaning: "to combine and grow; to increase by accumulating",
    example: "Small wins compound over time.",
  },
  comprehension: {
    pos: "noun",
    meaning: "the ability to understand something",
    example: "Focus on comprehension, not perfection.",
  },
  habit: {
    pos: "noun",
    meaning: "a regular practice that is hard to stop",
    example: "A tiny daily habit is powerful.",
  },
  automatic: {
    pos: "adj",
    meaning: "done without conscious thought",
    example: "Repeat until it feels automatic.",
  },
};

function normalizeToken(t: string) {
  return t.toLowerCase().replace(/[^a-z']/g, "");
}

export function VocabText({ text }: { text: string }) {
  const [open, setOpen] = useState<null | { word: string; x: number; y: number }>(null);

  const tokens = useMemo(() => {
    // keep spaces by splitting with capture group
    return text.split(/(\s+)/);
  }, [text]);

  return (
    <span className="relative">
      {tokens.map((t, i) => {
        const key = `${i}-${t}`;
        const w = normalizeToken(t);
        const entry = w ? MOCK_VOCAB[w] : null;
        if (!entry) return <span key={key}>{t}</span>;
        return (
          <button
            key={key}
            type="button"
            onClick={(e) => {
              const r = (e.target as HTMLElement).getBoundingClientRect();
              setOpen({ word: w, x: r.left + r.width / 2, y: r.bottom + 8 });
            }}
            className={clsx(
              "rounded-md px-1 py-0.5 font-semibold",
              "bg-amber-50 text-amber-800 hover:bg-amber-100",
            )}
          >
            {t}
          </button>
        );
      })}

      {open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(null)}>
          <div
            className="absolute w-[320px] -translate-x-1/2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl"
            style={{ left: open.x, top: open.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold capitalize">{open.word}</div>
                <div className="text-xs text-zinc-500">{MOCK_VOCAB[open.word].pos}</div>
              </div>
              <button
                className="rounded-lg px-2 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
                onClick={() => setOpen(null)}
              >
                Close
              </button>
            </div>
            <div className="mt-3 text-sm text-zinc-800">{MOCK_VOCAB[open.word].meaning}</div>
            <div className="mt-2 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-700">
              <div className="mb-1 font-semibold text-zinc-500">Example</div>
              “{MOCK_VOCAB[open.word].example}”
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
