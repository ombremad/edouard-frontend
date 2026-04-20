"use client";

import { FormEvent, useState } from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

type PageItem = number | "ellipsis-left" | "ellipsis-right";

const COMPACT_PAGE_THRESHOLD = 7;
const ADJACENT_PAGE_COUNT = 2;

function computePages(current: number, total: number): PageItem[] {
  if (total <= COMPACT_PAGE_THRESHOLD) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items: PageItem[] = [1];
  const start = Math.max(2, current - ADJACENT_PAGE_COUNT);
  const end = Math.min(total - 1, current + ADJACENT_PAGE_COUNT);

  if (start > 2) items.push("ellipsis-left");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push("ellipsis-right");

  items.push(total);
  return items;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const [draft, setDraft] = useState("");

  if (totalPages <= 1) return null;

  const items = computePages(page, totalPages);

  function handleJump(event: FormEvent) {
    event.preventDefault();
    const parsed = Number.parseInt(draft, 10);
    if (!Number.isFinite(parsed)) return;
    const clamped = Math.min(Math.max(parsed, 1), totalPages);
    setDraft("");
    if (clamped !== page) onChange(clamped);
  }

  const pageBtn =
    "min-w-10 text-center rounded px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 disabled:opacity-40 transition-colors";
  const currentBtn =
    "min-w-10 text-center rounded px-3 py-1 bg-gray-900 text-white hover:bg-gray-900 dark:bg-white dark:text-gray-900 dark:hover:bg-white transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm w-full">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className={pageBtn}
      >
        Précédent
      </button>

      <div className="flex flex-1 items-center justify-center gap-2">
        {items.map((item) =>
          typeof item === "number" ? (
            <button
              key={item}
              onClick={() => onChange(item)}
              className={item === page ? currentBtn : pageBtn}
            >
              {item}
            </button>
          ) : (
            <span key={item} className="px-2 text-gray-500 dark:text-gray-400 select-none">…</span>
          )
        )}

        {totalPages > COMPACT_PAGE_THRESHOLD && (
          <form onSubmit={handleJump} className="flex items-center gap-1">
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Page"
              aria-label="Aller à la page"
              className="w-16 px-2 py-1 text-center bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded text-gray-900 dark:text-white focus:outline-2 focus:outline-gray-900 dark:focus:outline-white focus:outline-offset-1"
            />
            <button type="submit" className={pageBtn} disabled={draft === ""}>
              Aller
            </button>
          </form>
        )}
      </div>

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className={pageBtn}
      >
        Suivant
      </button>
    </div>
  );
}
