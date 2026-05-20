"use client";

import { FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import type { SiteContent, SponsorLogo } from "@/lib/siteContent";

type User = { id: string; username: string; followsSolWear: boolean; isAdmin: boolean };

type Idea = {
  id: number;
  username: string;
  x_user_id?: string;
  idea: string;
  status: string;
  created_at: string;
};

type ThanksEntry = {
  id: number;
  display_name: string;
  twitter_username: string | null;
  avatar_url: string | null;
  description: string | null;
  stage: number;
  created_at: string;
};

type Achievement = {
  id: number;
  title: string;
  event_name: string;
  description: string;
  date: string;
  place: string;
  image_url: string | null;
};

const dynamicEnabled = process.env.NEXT_PUBLIC_SOLWEAR_DYNAMIC === "1";

function DropZone({ onFile, label = "Drop file here or click to browse" }: { onFile: (f: File) => void; label?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = (f: File | null | undefined) => {
    if (!f) return;
    setFileName(f.name);
    onFile(f);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
      }}
      className={`flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition ${
        dragging ? "border-emerald-400 bg-emerald-300/[0.06]" : "border-white/15 hover:border-white/30"
      }`}
    >
      <svg className="h-6 w-6 text-white/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-xs text-white/45">{fileName ?? label}</p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}

function AdminCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-sm">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload/", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

const BLANK_ACHIEVEMENT = { title: "", event_name: "", description: "", date: "", place: "1st", image_url: "" };

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentText, setContentText] = useState("");
  const [defaultText, setDefaultText] = useState("");
  const [sponsors, setSponsors] = useState<SponsorLogo[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [thanks1, setThanks1] = useState<ThanksEntry[]>([]);
  const [thanks2, setThanks2] = useState<ThanksEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  // Sponsor form
  const [sponsorForm, setSponsorForm] = useState({ name: "", logo_url: "", href: "", invert: true, brightness: 0.9, sort_order: 0 });
  const [sponsorFile, setSponsorFile] = useState<File | null>(null);
  const [sponsorUrlMode, setSponsorUrlMode] = useState(false);

  // Thanks form
  const [thanksForm, setThanksForm] = useState({ display_name: "", twitter_username: "", description: "", stage: 1 });
  const [thanksAvatarFile, setThanksAvatarFile] = useState<File | null>(null);

  // Achievement form
  const [achievementForm, setAchievementForm] = useState<typeof BLANK_ACHIEVEMENT>(BLANK_ACHIEVEMENT);
  const [achievementImageFile, setAchievementImageFile] = useState<File | null>(null);
  const [editingAchievementId, setEditingAchievementId] = useState<number | null>(null);

  const contentValid = useMemo(() => {
    try { JSON.parse(contentText); return true; } catch { return false; }
  }, [contentText]);

  useEffect(() => {
    if (!dynamicEnabled) { setLoading(false); return; }
    bootstrap();
  }, []);

  async function bootstrap() {
    try {
      const me = await fetch("/api/me/").then((r) => r.json());
      setUser(me.user ?? null);
      if (me.user?.isAdmin) await refreshAdminData();
    } finally {
      setLoading(false);
    }
  }

  async function refreshAdminData() {
    const [contentRes, sponsorsRes, ideasRes, thanksRes, achievementsRes] = await Promise.all([
      fetch("/api/admin/site-content/"),
      fetch("/api/admin/sponsors/"),
      fetch("/api/admin/pinboard/"),
      fetch("/api/thanks/"),
      fetch("/api/achievements/"),
    ]);
    if (contentRes.ok) {
      const data = (await contentRes.json()) as { content: SiteContent; defaults: SiteContent };
      setContentText(JSON.stringify(data.content, null, 2));
      setDefaultText(JSON.stringify(data.defaults, null, 2));
    }
    if (sponsorsRes.ok) { const d = await sponsorsRes.json(); setSponsors(d.sponsors); }
    if (ideasRes.ok) { const d = await ideasRes.json(); setIdeas(d.ideas); }
    if (thanksRes.ok) {
      const d = await thanksRes.json();
      setThanks1(d.stage1 ?? []); setThanks2(d.stage2 ?? []);
    }
    if (achievementsRes.ok) { const d = await achievementsRes.json(); setAchievements(d.achievements ?? []); }
  }

  async function saveContent() {
    setStatus(null);
    try {
      const content = JSON.parse(contentText) as SiteContent;
      const res = await fetch("/api/admin/site-content/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Could not save content");
      setStatus("Homepage content saved.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Content JSON is invalid.");
    }
  }

  async function saveSponsor(e: FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      let logoUrl = sponsorForm.logo_url;
      if (!sponsorUrlMode && sponsorFile) {
        logoUrl = await uploadFile(sponsorFile);
      }
      if (!logoUrl) { setStatus("Provide an image file or URL."); return; }

      const res = await fetch("/api/admin/sponsors/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sponsorForm, logo_url: logoUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus(data.error || "Could not save sponsor."); return; }
      setSponsors((prev) => [...prev.filter((s) => s.id !== data.sponsor.id), data.sponsor].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id));
      setSponsorForm({ name: "", logo_url: "", href: "", invert: true, brightness: 0.9, sort_order: 0 });
      setSponsorFile(null);
      setStatus("Sponsor saved.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed.");
    }
  }

  async function deleteSponsor(id: number) {
    await fetch("/api/admin/sponsors/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, delete: true }),
    });
    setSponsors((prev) => prev.filter((s) => s.id !== id));
  }

  async function moderateIdea(id: number, nextStatus: string) {
    const res = await fetch("/api/admin/pinboard/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus }),
    });
    if (res.ok) setIdeas((prev) => prev.map((idea) => (idea.id === id ? { ...idea, status: nextStatus } : idea)));
  }

  async function deleteIdea(id: number) {
    await fetch("/api/admin/pinboard/", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  }

  async function resetUserLimit(x_user_id: string, username: string) {
    if (!confirm(`Reset idea limit for @${username}? Their ideas will be deleted.`)) return;
    const res = await fetch("/api/admin/pinboard/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_limit", x_user_id }),
    });
    if (res.ok) {
      setIdeas((prev) => prev.filter((i) => i.x_user_id !== x_user_id));
      setStatus(`Limit reset for @${username}.`);
    }
  }

  async function addThanks(e: FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      let avatarUrl: string | undefined;
      if (thanksAvatarFile) {
        avatarUrl = await uploadFile(thanksAvatarFile);
      } else if (thanksForm.twitter_username) {
        avatarUrl = `https://unavatar.io/twitter/${thanksForm.twitter_username}`;
      }

      const res = await fetch("/api/thanks/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...thanksForm, avatar_url: avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setStatus(data.error || "Could not add thanks entry."); return; }
      if (data.entry.stage === 2) setThanks2((prev) => [...prev, data.entry]);
      else setThanks1((prev) => [...prev, data.entry]);
      setThanksForm({ display_name: "", twitter_username: "", description: "", stage: 1 });
      setThanksAvatarFile(null);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed.");
    }
  }

  async function deleteThanks(id: number) {
    const res = await fetch(`/api/thanks/${id}/`, { method: "DELETE" });
    if (res.ok) {
      setThanks1((prev) => prev.filter((e) => e.id !== id));
      setThanks2((prev) => prev.filter((e) => e.id !== id));
    }
  }

  async function saveAchievement(e: FormEvent) {
    e.preventDefault();
    setStatus(null);
    try {
      let imageUrl = achievementForm.image_url || undefined;
      if (achievementImageFile) imageUrl = await uploadFile(achievementImageFile);

      const payload = { ...achievementForm, image_url: imageUrl || null };
      let res: Response;
      if (editingAchievementId !== null) {
        res = await fetch(`/api/achievements/${editingAchievementId}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/achievements/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok) { setStatus(data.error || "Failed to save."); return; }

      if (editingAchievementId !== null) {
        setAchievements((prev) => prev.map((a) => (a.id === editingAchievementId ? data.achievement : a)));
      } else {
        setAchievements((prev) => [data.achievement, ...prev]);
      }
      setAchievementForm(BLANK_ACHIEVEMENT);
      setAchievementImageFile(null);
      setEditingAchievementId(null);
      setStatus("Achievement saved.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed.");
    }
  }

  async function deleteAchievement(id: number) {
    await fetch(`/api/achievements/${id}/`, { method: "DELETE" });
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  }

  function startEditAchievement(a: Achievement) {
    setAchievementForm({ title: a.title, event_name: a.event_name, description: a.description, date: a.date, place: a.place, image_url: a.image_url ?? "" });
    setEditingAchievementId(a.id);
    setAchievementImageFile(null);
  }

  // Group ideas by user for reset-limit view
  const userGroups = useMemo(() => {
    const map = new Map<string, { username: string; x_user_id: string; count: number }>();
    for (const idea of ideas) {
      const uid = idea.x_user_id ?? idea.username;
      const existing = map.get(uid);
      if (existing) existing.count++;
      else map.set(uid, { username: idea.username, x_user_id: uid, count: 1 });
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [ideas]);

  if (loading) return (
    <><Nav /><main className="min-h-screen px-6 py-32 text-white/60">Loading admin...</main><Footer /></>
  );

  if (!dynamicEnabled) return (
    <><Nav />
    <main className="min-h-screen px-6 py-32">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-black/40 p-8">
        <h1 className="text-3xl font-semibold">Admin is available on the Docker site.</h1>
        <p className="mt-4 text-sm leading-6 text-white/55">Static export disables live content editing.</p>
      </div>
    </main><Footer /></>
  );

  if (!user?.isAdmin) return (
    <><Nav />
    <main className="min-h-screen px-6 py-32">
      <div className="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-black/40 p-8">
        <p className="label-caps mb-3">admin</p>
        <h1 className="text-3xl font-semibold">Sign in with the SolWear X account.</h1>
        <p className="mt-4 text-sm leading-6 text-white/55">Admin access is limited to the configured SolWear X user.</p>
        <a href="/api/auth/x1/start/?returnTo=/cheremsha/"
          className="focus-ring mt-6 inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-black">
          Sign in with X
        </a>
      </div>
    </main><Footer /></>
  );

  return (
    <>
      <Nav />
      <main className="min-h-screen px-6 pb-24 pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="label-caps mb-3">admin</p>
              <h1 className="text-4xl font-semibold md:text-6xl">SolWear control panel</h1>
              <p className="mt-4 text-sm text-white/55">Signed in as @{user.username}</p>
            </div>
            <form action="/api/auth/logout/" method="post">
              <button className="focus-ring min-h-11 rounded-full border border-white/15 px-5 text-sm text-white/70">Sign out</button>
            </form>
          </div>

          {status && <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70">{status}</div>}

          <div className="grid gap-6">

            {/* ── Homepage content ───────────────────────────────────── */}
            <AdminCard title="Homepage and hero content">
              <div className="mb-5 grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-white/50">Demo video YouTube URL</label>
                  <input type="url" placeholder="https://youtube.com/watch?v=..."
                    value={(() => { try { return (JSON.parse(contentText) as SiteContent).hero.video.youtubeUrl ?? ""; } catch { return ""; } })()}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(contentText) as SiteContent;
                        parsed.hero.video.youtubeUrl = e.target.value;
                        setContentText(JSON.stringify(parsed, null, 2));
                      } catch { /* invalid JSON */ }
                    }}
                    className="min-h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Pitch video YouTube URL</label>
                  <input type="url" placeholder="https://youtube.com/watch?v=..."
                    value={(() => { try { return (JSON.parse(contentText) as SiteContent).hero.pitchVideo?.youtubeUrl ?? ""; } catch { return ""; } })()}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(contentText) as SiteContent;
                        if (!parsed.hero.pitchVideo) parsed.hero.pitchVideo = { youtubeUrl: "", title: "Pitch video", body: "" };
                        parsed.hero.pitchVideo.youtubeUrl = e.target.value;
                        setContentText(JSON.stringify(parsed, null, 2));
                      } catch { /* invalid JSON */ }
                    }}
                    className="min-h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>
              <p className="mb-3 text-sm text-white/50">Full structured landing content (JSON). Keep the shape intact.</p>
              <textarea value={contentText} onChange={(e) => setContentText(e.target.value)} spellCheck={false}
                className="h-[520px] w-full rounded-xl border border-white/10 bg-black/70 p-4 font-mono text-xs leading-5 text-white outline-none focus:border-white/30" />
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={saveContent} disabled={!contentValid}
                  className="focus-ring min-h-11 rounded-full bg-white px-5 text-sm font-semibold text-black disabled:opacity-40">
                  Save content
                </button>
                <button type="button" onClick={() => setContentText(defaultText)}
                  className="focus-ring min-h-11 rounded-full border border-white/15 px-5 text-sm text-white/70">
                  Reset editor to defaults
                </button>
              </div>
            </AdminCard>

            {/* ── Achievements ───────────────────────────────────────── */}
            <AdminCard title="Achievements">
              <form onSubmit={saveAchievement} className="mb-6 grid gap-3 md:grid-cols-2">
                <input value={achievementForm.title} onChange={(e) => setAchievementForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Title (e.g. 1st place - Dev3pak)" required
                  className="min-h-11 rounded-xl border border-white/10 bg-black px-3 text-sm outline-none" />
                <input value={achievementForm.event_name} onChange={(e) => setAchievementForm((p) => ({ ...p, event_name: e.target.value }))}
                  placeholder="Event name" required
                  className="min-h-11 rounded-xl border border-white/10 bg-black px-3 text-sm outline-none" />
                <textarea value={achievementForm.description} onChange={(e) => setAchievementForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Description" required rows={2}
                  className="rounded-xl border border-white/10 bg-black px-3 py-2 text-sm outline-none md:col-span-2 resize-none" />
                <input type="date" value={achievementForm.date} onChange={(e) => setAchievementForm((p) => ({ ...p, date: e.target.value }))}
                  required className="min-h-11 rounded-xl border border-white/10 bg-black px-3 text-sm outline-none" />
                <select value={achievementForm.place} onChange={(e) => setAchievementForm((p) => ({ ...p, place: e.target.value }))}
                  className="min-h-11 rounded-xl border border-white/10 bg-black px-3 text-sm outline-none">
                  {["1st", "2nd", "3rd", "Top 5", "Finalist", "Winner"].map((p) => <option key={p}>{p}</option>)}
                </select>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs text-white/50">Photo (optional)</label>
                  <DropZone onFile={(f) => setAchievementImageFile(f)} label="Drop achievement photo or click to browse" />
                  {achievementForm.image_url && !achievementImageFile && (
                    <p className="mt-1 text-xs text-white/35">Current: {achievementForm.image_url}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="focus-ring min-h-11 rounded-full bg-white px-5 text-sm font-semibold text-black">
                    {editingAchievementId !== null ? "Save changes" : "Add achievement"}
                  </button>
                  {editingAchievementId !== null && (
                    <button type="button" onClick={() => { setAchievementForm(BLANK_ACHIEVEMENT); setEditingAchievementId(null); }}
                      className="focus-ring min-h-11 rounded-full border border-white/15 px-5 text-sm text-white/70">
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="grid gap-3 md:grid-cols-2">
                {achievements.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    {a.image_url && (
                      <img src={a.image_url} alt={a.title} className="h-14 w-14 rounded-lg object-cover" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-white/40">{a.event_name} · {a.place} · {a.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEditAchievement(a)} className="text-xs text-white/45 hover:text-white">Edit</button>
                      <button onClick={() => deleteAchievement(a.id)} className="text-xs text-white/45 hover:text-red-400">Del</button>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>

            {/* ── Sponsor logos ──────────────────────────────────────── */}
            <AdminCard title="Sponsor logos">
              <form onSubmit={saveSponsor} className="grid gap-3">
                <div className="grid gap-3 md:grid-cols-3">
                  <input value={sponsorForm.name} onChange={(e) => setSponsorForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Sponsor name" required
                    className="min-h-11 rounded-xl border border-white/10 bg-black px-3 text-sm outline-none" />
                  <input value={sponsorForm.href} onChange={(e) => setSponsorForm((p) => ({ ...p, href: e.target.value }))}
                    placeholder="Link (https://...)"
                    className="min-h-11 rounded-xl border border-white/10 bg-black px-3 text-sm outline-none" />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-white/60">
                      <input type="checkbox" checked={sponsorUrlMode} onChange={(e) => setSponsorUrlMode(e.target.checked)} />
                      Paste URL instead of upload
                    </label>
                  </div>
                </div>

                {sponsorUrlMode ? (
                  <input value={sponsorForm.logo_url} onChange={(e) => setSponsorForm((p) => ({ ...p, logo_url: e.target.value }))}
                    placeholder="https://... or /path/to/logo.svg" required={sponsorUrlMode}
                    className="min-h-11 rounded-xl border border-white/10 bg-black px-3 text-sm outline-none" />
                ) : (
                  <DropZone onFile={(f) => setSponsorFile(f)} label="Drop sponsor logo here or click to browse" />
                )}

                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-white/60">
                    <input type="checkbox" checked={sponsorForm.invert}
                      onChange={(e) => setSponsorForm((p) => ({ ...p, invert: e.target.checked }))} />
                    Invert colors (dark bg)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white/60">
                    Brightness
                    <input type="number" step="0.1" min="0.3" max="1.5" value={sponsorForm.brightness}
                      onChange={(e) => setSponsorForm((p) => ({ ...p, brightness: Number(e.target.value) }))}
                      className="h-9 w-20 rounded-lg border border-white/10 bg-black px-2" />
                  </label>
                  <button type="submit" className="focus-ring min-h-11 rounded-full bg-white px-5 text-sm font-semibold text-black">
                    Add sponsor
                  </button>
                </div>
              </form>

              <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {sponsors.map((sponsor) => (
                  <div key={sponsor.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <img src={sponsor.logo_url} alt={sponsor.name}
                      className="h-10 w-10 rounded object-contain"
                      style={{ filter: `${sponsor.invert ? "invert(1)" : ""} brightness(${sponsor.brightness})` }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{sponsor.name}</p>
                      <p className="mt-0.5 truncate text-xs text-white/35">{sponsor.logo_url}</p>
                    </div>
                    <button onClick={() => deleteSponsor(sponsor.id)} className="text-xs text-white/45 hover:text-red-400">Del</button>
                  </div>
                ))}
              </div>
            </AdminCard>

            {/* ── Pinboard moderation + user limits ─────────────────── */}
            <AdminCard title="Pinboard moderation">
              {userGroups.length > 0 && (
                <div className="mb-5">
                  <p className="mb-2 text-xs text-white/40 uppercase tracking-widest">User idea counts</p>
                  <div className="flex flex-wrap gap-2">
                    {userGroups.map((u) => (
                      <div key={u.x_user_id} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs">
                        <span className="text-white/70">@{u.username}</span>
                        <span className="rounded-full bg-white/10 px-1.5 py-0.5 font-semibold">{u.count}</span>
                        <button onClick={() => resetUserLimit(u.x_user_id, u.username)}
                          className="text-white/40 hover:text-red-400">
                          Reset
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-3">
                {ideas.map((idea) => (
                  <div key={idea.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                      <div>
                        <p className="text-sm leading-6 text-white/80">{idea.idea}</p>
                        <p className="mt-2 text-xs text-white/40">@{idea.username} · {idea.status}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["approved", "pending", "rejected", "made"].map((next) => (
                          <button key={next} onClick={() => moderateIdea(idea.id, next)}
                            className={`focus-ring min-h-9 rounded-full border px-3 text-xs transition ${idea.status === next ? "border-white/30 text-white" : "border-white/10 text-white/50 hover:text-white"}`}>
                            {next}
                          </button>
                        ))}
                        <button onClick={() => deleteIdea(idea.id)}
                          className="focus-ring min-h-9 rounded-full border border-red-500/30 px-3 text-xs text-red-400 hover:border-red-500/60">
                          delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>

            {/* ── Thanks and team entries ────────────────────────────── */}
            <AdminCard title="Thanks and team entries">
              <form onSubmit={addThanks} className="mb-5 grid gap-3 md:grid-cols-2">
                <input value={thanksForm.display_name} onChange={(e) => setThanksForm((p) => ({ ...p, display_name: e.target.value }))}
                  placeholder="Display name" required
                  className="min-h-11 rounded-xl border border-white/10 bg-black px-3 text-sm outline-none" />
                <div>
                  <input
                    value={thanksForm.twitter_username}
                    onChange={(e) => {
                      const handle = e.target.value.replace(/^@/, "");
                      setThanksForm((p) => ({ ...p, twitter_username: handle }));
                    }}
                    placeholder="@x_handle (optional)"
                    className="min-h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-sm outline-none"
                  />
                  {thanksForm.twitter_username && !thanksAvatarFile && (
                    <p className="mt-1 text-xs text-white/35">
                      Avatar will auto-fetch from{" "}
                      <a
                        href={`https://unavatar.io/twitter/${thanksForm.twitter_username}`}
                        target="_blank" rel="noreferrer"
                        className="underline hover:text-white/60"
                      >
                        unavatar.io/twitter/{thanksForm.twitter_username}
                      </a>
                    </p>
                  )}
                </div>
                <textarea value={thanksForm.description} onChange={(e) => setThanksForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Short description (optional)" rows={2} maxLength={500}
                  className="rounded-xl border border-white/10 bg-black px-3 py-2 text-sm outline-none md:col-span-2 resize-none" />
                <div>
                  <label className="mb-1 block text-xs text-white/50">Avatar photo (optional, overrides auto-fetch)</label>
                  <DropZone onFile={(f) => setThanksAvatarFile(f)} label="Drop avatar photo or click to browse" />
                </div>
                <div className="flex items-end gap-2">
                  <select value={thanksForm.stage} onChange={(e) => setThanksForm((p) => ({ ...p, stage: Number(e.target.value) }))}
                    className="min-h-11 flex-1 rounded-xl border border-white/10 bg-black px-3 text-sm outline-none">
                    <option value={1}>Team block</option>
                    <option value={2}>Big thanks block</option>
                  </select>
                  <button type="submit" className="focus-ring min-h-11 rounded-full bg-white px-5 text-sm font-semibold text-black">
                    Add person
                  </button>
                </div>
              </form>

              <div className="grid gap-4 md:grid-cols-2">
                {([["Team", thanks1], ["Big thanks", thanks2]] as const).map(([title, entries]) => (
                  <div key={title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <h3 className="font-semibold">{title}</h3>
                    <div className="mt-3 space-y-2">
                      {entries.map((entry) => (
                        <div key={entry.id} className="flex items-start gap-2">
                          {entry.avatar_url && (
                            <img src={entry.avatar_url} alt={entry.display_name}
                              className="h-7 w-7 rounded-full object-cover" />
                          )}
                          <div className="flex-1 text-sm text-white/70">
                            <span className="font-medium">{entry.display_name}</span>
                            {entry.twitter_username ? <span className="ml-1 text-white/40">@{entry.twitter_username}</span> : null}
                            {entry.description && <p className="mt-0.5 text-xs text-white/35">{entry.description}</p>}
                          </div>
                          <button onClick={() => deleteThanks(entry.id)} className="text-xs text-white/40 hover:text-red-400">Del</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
