"use client";

import { FormEvent, useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type ThanksEntry = {
  id: number;
  display_name: string;
  twitter_username: string | null;
  avatar_url: string | null;
  description: string | null;
  stage: number;
  created_at: string;
};

type User = {
  id: string;
  username: string;
  followsSolWear: boolean;
  isAdmin: boolean;
};

const dynamicEnabled = process.env.NEXT_PUBLIC_SOLWEAR_DYNAMIC === "1";

function Initials({ name }: { name: string }) {
  const letters = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="flex h-full w-full items-center justify-center bg-white/10 text-sm font-bold text-white/60">
      {letters}
    </div>
  );
}

function Avatar({ entry }: { entry: ThanksEntry }) {
  const [failed, setFailed] = useState(false);
  if (entry.avatar_url && !failed) {
    return (
      <img
        src={entry.avatar_url}
        alt={entry.display_name}
        onError={() => setFailed(true)}
        className="h-full w-full rounded-full object-cover"
      />
    );
  }
  return <Initials name={entry.display_name} />;
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload/", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

function AddPersonForm({ stage, onAdded }: { stage: 1 | 2; onAdded: (e: ThanksEntry) => void }) {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [description, setDescription] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      let avatarUrl: string | undefined;
      if (avatarFile) avatarUrl = await uploadFile(avatarFile);

      const res = await fetch("/api/thanks/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          twitter_username: handle,
          description,
          avatar_url: avatarUrl,
          stage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add");
      onAdded(data.entry as ThanksEntry);
      setDisplayName(""); setHandle(""); setDescription(""); setAvatarFile(null);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="focus-ring mt-4 inline-flex min-h-9 items-center gap-1 border border-white/20 px-4 py-2 text-xs text-white/60 hover:border-white/40 hover:text-white">
        + Add person
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 flex flex-col gap-2 md:max-w-lg">
      <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Display name" required maxLength={100}
        className="h-9 border border-white/20 bg-black px-3 text-xs text-white outline-none focus:border-white/50" />
      <input value={handle} onChange={(e) => setHandle(e.target.value)}
        placeholder="@twitter_handle (optional)" maxLength={50}
        className="h-9 border border-white/20 bg-black px-3 text-xs text-white outline-none focus:border-white/50" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)}
        placeholder="Short description (optional)" maxLength={500} rows={2}
        className="border border-white/20 bg-black px-3 py-2 text-xs text-white outline-none focus:border-white/50 resize-none" />
      <div>
        <label className="mb-1 block text-xs text-white/45">Avatar photo (or leave blank to fetch from X)</label>
        <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
          className="text-xs text-white/60 file:mr-3 file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white hover:file:bg-white/20" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={pending}
          className="focus-ring h-9 bg-white px-4 text-xs font-semibold text-black disabled:opacity-50">
          {pending ? "Adding…" : "Add"}
        </button>
        <button type="button" onClick={() => { setOpen(false); setError(null); }}
          className="focus-ring h-9 border border-white/20 px-4 text-xs text-white/50">
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}

function EditPersonForm({ entry, onSaved, onCancel }: { entry: ThanksEntry; onSaved: (e: ThanksEntry) => void; onCancel: () => void }) {
  const [displayName, setDisplayName] = useState(entry.display_name);
  const [handle, setHandle] = useState(entry.twitter_username ?? "");
  const [description, setDescription] = useState(entry.description ?? "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      let avatarUrl: string | undefined;
      if (avatarFile) avatarUrl = await uploadFile(avatarFile);

      const body: Record<string, unknown> = { display_name: displayName, twitter_username: handle, description };
      if (avatarUrl) body.avatar_url = avatarUrl;

      const res = await fetch(`/api/thanks/${entry.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      onSaved(data.entry as ThanksEntry);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-2 flex flex-col gap-2 text-left">
      <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={100}
        className="h-8 border border-white/20 bg-black px-2 text-xs text-white outline-none focus:border-white/50" />
      <input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@handle" maxLength={50}
        className="h-8 border border-white/20 bg-black px-2 text-xs text-white outline-none focus:border-white/50" />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" maxLength={500} rows={2}
        className="border border-white/20 bg-black px-2 py-1.5 text-xs text-white outline-none focus:border-white/50 resize-none" />
      <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
        className="text-xs text-white/50 file:mr-2 file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-xs file:text-white" />
      <div className="flex gap-1">
        <button type="submit" disabled={pending}
          className="h-7 bg-white px-3 text-xs font-semibold text-black disabled:opacity-50">
          {pending ? "Saving…" : "Save"}
        </button>
        <button type="button" onClick={onCancel}
          className="h-7 border border-white/20 px-3 text-xs text-white/50">
          Cancel
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </form>
  );
}

function ThanksCard({ entry, isAdmin, onDelete, onEdit }: {
  entry: ThanksEntry; isAdmin: boolean;
  onDelete: (id: number) => void; onEdit: (e: ThanksEntry) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Remove "${entry.display_name}"?`)) return;
    setDeleting(true);
    try { await fetch(`/api/thanks/${entry.id}/`, { method: "DELETE" }); onDelete(entry.id); }
    finally { setDeleting(false); }
  }

  if (editing) {
    return (
      <div className="border border-white/10 bg-white/[0.04] p-4">
        <EditPersonForm entry={entry} onSaved={(e) => { onEdit(e); setEditing(false); }} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col items-center gap-3 border border-white/10 bg-white/[0.04] p-5 text-center backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/[0.07]">
      <div className="relative h-14 w-14 overflow-hidden rounded-full border border-white/15">
        <Avatar entry={entry} />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{entry.display_name}</p>
        {entry.twitter_username && (
          <a href={`https://x.com/${entry.twitter_username}`} target="_blank" rel="noreferrer"
            className="mt-0.5 text-xs text-white/40 hover:text-white/70">
            @{entry.twitter_username}
          </a>
        )}
        {entry.description && (
          <p className="mt-2 text-xs leading-5 text-white/45">{entry.description}</p>
        )}
      </div>
      {isAdmin && (
        <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button type="button" onClick={() => setEditing(true)}
            className="flex h-6 w-6 items-center justify-center text-xs text-white/40 hover:text-white/80">
            ✎
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="flex h-6 w-6 items-center justify-center text-xs text-white/40 hover:text-white/80 disabled:opacity-50">
            ×
          </button>
        </div>
      )}
    </div>
  );
}

function BigThanksCard({ entry, isAdmin, onDelete, onEdit }: {
  entry: ThanksEntry; isAdmin: boolean;
  onDelete: (id: number) => void; onEdit: (e: ThanksEntry) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Remove "${entry.display_name}"?`)) return;
    setDeleting(true);
    try { await fetch(`/api/thanks/${entry.id}/`, { method: "DELETE" }); onDelete(entry.id); }
    finally { setDeleting(false); }
  }

  if (editing) {
    return (
      <div className="border border-[var(--sw-red)]/20 bg-white/[0.03] p-5">
        <EditPersonForm entry={entry} onSaved={(e) => { onEdit(e); setEditing(false); }} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col items-center gap-4 border border-[var(--sw-red)]/20 bg-white/[0.03] p-7 text-center backdrop-blur-sm transition-colors hover:border-[var(--sw-red)]/40 hover:bg-white/[0.06]">
      <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-[var(--sw-red)]/30 shadow-[0_0_20px_rgba(224,0,15,0.15)]">
        <Avatar entry={entry} />
      </div>
      <div>
        <p className="text-base font-bold text-white">{entry.display_name}</p>
        {entry.twitter_username && (
          <a href={`https://x.com/${entry.twitter_username}`} target="_blank" rel="noreferrer"
            className="mt-1 text-xs text-white/40 hover:text-white/70">
            @{entry.twitter_username}
          </a>
        )}
        {entry.description && (
          <p className="mt-3 text-sm leading-6 text-white/50">{entry.description}</p>
        )}
      </div>
      {isAdmin && (
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button type="button" onClick={() => setEditing(true)}
            className="flex h-6 w-6 items-center justify-center text-xs text-white/40 hover:text-white/80">
            ✎
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="flex h-6 w-6 items-center justify-center text-xs text-white/40 hover:text-white/80 disabled:opacity-50">
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default function ThanksPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stage1, setStage1] = useState<ThanksEntry[]>([]);
  const [stage2, setStage2] = useState<ThanksEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dynamicEnabled) { setLoading(false); return; }
    Promise.all([
      fetch("/api/me/").then((r) => r.json()),
      fetch("/api/thanks/").then((r) => r.json()),
    ])
      .then(([meData, thanksData]) => {
        setUser(meData.user ?? null);
        setStage1(thanksData.stage1 ?? []);
        setStage2(thanksData.stage2 ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function deleteEntry(id: number) {
    setStage1((p) => p.filter((e) => e.id !== id));
    setStage2((p) => p.filter((e) => e.id !== id));
  }

  function editEntry(updated: ThanksEntry) {
    const update = (arr: ThanksEntry[]) => arr.map((e) => (e.id === updated.id ? updated : e));
    setStage1(update); setStage2(update);
  }

  return (
    <>
      <Nav />
      <main>
        <section className="flex min-h-dvh flex-col items-center justify-center px-6 pb-16 pt-36">
          <div className="mx-auto w-full max-w-5xl">
            <p className="label-caps mb-3">team</p>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">SolWear team</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50">
              The builders working on SolWear hardware, firmware, mobile, and product.
            </p>
            {loading ? (
              <div className="mt-12 flex gap-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-32 w-32 animate-pulse border border-white/10 bg-white/[0.03]" />)}
              </div>
            ) : (
              <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {stage1.map((entry) => (
                  <ThanksCard key={entry.id} entry={entry} isAdmin={!!user?.isAdmin} onDelete={deleteEntry} onEdit={editEntry} />
                ))}
              </div>
            )}
            {user?.isAdmin && <AddPersonForm stage={1} onAdded={(e) => setStage1((p) => [...p, e])} />}
          </div>
        </section>

        <section className="flex min-h-dvh flex-col items-center justify-center px-6 pb-16 pt-24">
          <div className="mx-auto w-full max-w-5xl">
            <p className="label-caps mb-3" style={{ color: "var(--sw-red)" }}>big thanks to . . .</p>
            <h2 className="text-4xl font-bold leading-tight md:text-6xl">People we deeply appreciate</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50">
              Those who went above and beyond - extraordinary contributions that shaped the project.
            </p>
            {loading ? (
              <div className="mt-12 flex gap-3">
                {[1, 2].map((i) => <div key={i} className="h-40 w-40 animate-pulse border border-[var(--sw-red)]/20 bg-white/[0.02]" />)}
              </div>
            ) : (
              <div className="mt-12 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                {stage2.map((entry) => (
                  <BigThanksCard key={entry.id} entry={entry} isAdmin={!!user?.isAdmin} onDelete={deleteEntry} onEdit={editEntry} />
                ))}
              </div>
            )}
            {user?.isAdmin && <AddPersonForm stage={2} onAdded={(e) => setStage2((p) => [...p, e])} />}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
