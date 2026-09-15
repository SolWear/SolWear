"use client";

import { useState, type ReactNode } from "react";

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

const LONG_TEXT = /^(body|text|subheadline|description|note|seoDescription|comingSoonBody)$/;

function label(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/[_-]/g, " ").trim().toUpperCase();
}

/** Immutable set-at-path. Arrays stay arrays, objects stay objects. */
export function setAt(root: Json, path: (string | number)[], value: Json): Json {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const next = [...root];
    next[head as number] = setAt(next[head as number] ?? null, rest, value);
    return next;
  }
  const obj = (root ?? {}) as { [k: string]: Json };
  return { ...obj, [head as string]: setAt(obj[head as string] ?? null, rest, value) };
}

function Collapsible({ title, children, open: initial = false }: { title: string; children: ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(initial);
  return (
    <section className="border border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="focus-ring flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="t-label text-ink">{title}</span>
        <span className="t-mono text-ink-dim" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? <div className="flex flex-col gap-6 border-t border-line p-5">{children}</div> : null}
    </section>
  );
}

/** Blank row shaped like the previous one, so new items never render undefined. */
function blankLike(template: Json): Json {
  if (typeof template === "string") return "";
  if (template && typeof template === "object" && !Array.isArray(template)) {
    return Object.fromEntries(
      Object.entries(template).map(([k, v]) => [k, k === "status" ? "PLANNED" : blankLike(v)]),
    ) as Json;
  }
  if (Array.isArray(template)) return [];
  return "";
}

type Props = {
  value: Json;
  path: (string | number)[];
  set: (path: (string | number)[], value: Json) => void;
  depth?: number;
};

/**
 * Renders any nested content object as a form. Adding a field to the content
 * model automatically gives the admin a field for it — no UI work required.
 */
export default function ContentEditor({ value, path, set, depth = 0 }: Props) {
  const key = String(path[path.length - 1] ?? "");

  if (typeof value === "string") {
    if (key === "status") {
      return (
        <label className="flex flex-col gap-2">
          <span className="t-label">STATUS</span>
          <select value={value} onChange={(e) => set(path, e.target.value)} className="field">
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="IN DEVELOPMENT">IN DEVELOPMENT</option>
            <option value="PLANNED">PLANNED</option>
          </select>
        </label>
      );
    }
    const multiline = LONG_TEXT.test(key) || value.length > 90 || value.includes("\n");
    return (
      <label className="flex flex-col gap-2">
        <span className="t-label">{label(key)}</span>
        {multiline ? (
          <textarea
            value={value}
            rows={Math.min(7, Math.max(2, Math.ceil(value.length / 68) + value.split("\n").length - 1))}
            onChange={(e) => set(path, e.target.value)}
            className="field resize-y py-3 leading-relaxed"
          />
        ) : (
          <input value={value} onChange={(e) => set(path, e.target.value)} className="field" />
        )}
      </label>
    );
  }

  if (typeof value === "boolean") {
    return (
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => set(path, e.target.checked)}
          className="h-4 w-4 accent-white"
        />
        <span className="t-label text-ink">{label(key)}</span>
      </label>
    );
  }

  if (Array.isArray(value)) {
    const stringList = value.every((v) => typeof v === "string");
    return (
      <div className="flex flex-col gap-4">
        {value.map((item, i) => (
          <div key={i} className={stringList ? "flex items-end gap-2" : "border border-line p-4"}>
            {stringList ? (
              <>
                <div className="flex-1">
                  <ContentEditor value={item} path={[...path, i]} set={set} depth={depth + 1} />
                </div>
                <button
                  type="button"
                  onClick={() => set(path, value.filter((_, j) => j !== i))}
                  aria-label={`Remove item ${i + 1}`}
                  className="btn btn-ghost h-12 min-h-0 px-4"
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <span className="t-label">ITEM {String(i + 1).padStart(2, "0")}</span>
                  <div className="flex gap-1">
                    {i > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...value];
                          [next[i - 1], next[i]] = [next[i], next[i - 1]];
                          set(path, next);
                        }}
                        aria-label="Move up"
                        className="focus-ring t-mono px-2 text-ink-dim hover:text-ink"
                      >
                        ↑
                      </button>
                    ) : null}
                    {i < value.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...value];
                          [next[i + 1], next[i]] = [next[i], next[i + 1]];
                          set(path, next);
                        }}
                        aria-label="Move down"
                        className="focus-ring t-mono px-2 text-ink-dim hover:text-ink"
                      >
                        ↓
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => set(path, value.filter((_, j) => j !== i))}
                      aria-label="Remove item"
                      className="focus-ring t-mono px-2 text-ink-dim hover:text-red-sw"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <ContentEditor value={item} path={[...path, i]} set={set} depth={depth + 1} />
              </>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => set(path, [...value, blankLike(value[value.length - 1] ?? "")])}
          className="btn btn-ghost self-start"
        >
          + ADD ITEM
        </button>
      </div>
    );
  }

  if (value && typeof value === "object") {
    return (
      <div className="flex flex-col gap-6">
        {Object.entries(value).map(([childKey, child]) =>
          typeof child === "string" || typeof child === "boolean" ? (
            <ContentEditor key={childKey} value={child} path={[...path, childKey]} set={set} depth={depth + 1} />
          ) : (
            <Collapsible key={childKey} title={label(childKey)} open={depth === 0}>
              <ContentEditor value={child} path={[...path, childKey]} set={set} depth={depth + 1} />
            </Collapsible>
          ),
        )}
      </div>
    );
  }

  return null;
}
