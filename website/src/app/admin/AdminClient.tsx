"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import ContentEditor, { setAt, type Json } from "./ContentEditor";
import type { SiteContent, SponsorLogo } from "@/lib/siteContent";
import type { SiteSettings } from "@/lib/server/settings";

type Tab = "site" | "content" | "waitlist" | "community" | "analytics" | "partners";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "site", label: "SITE" },
  { id: "content", label: "CONTENT" },
  { id: "waitlist", label: "WAITLIST" },
  { id: "community", label: "COMMUNITY" },
  { id: "analytics", label: "ANALYTICS" },
  { id: "partners", label: "PARTNERS" },
];

type WaitlistEntry = {
  id: number;
  email: string;
  created_at: string;
  source: string | null;
  x_username: string | null;
};

type CommunityRow = {
  x_user_id: string;
  username: string;
  role: string;
  status: string;
  last_seen_at: string;
  onWaitlist: boolean;
};

type Analytics = {
  days: number;
  pageViews: number;
  uniqueVisitors: number;
  visits: number;
  waitlistConversions: number;
  communityRegistrations: number;
  conversionRate: number;
  topPages: Array<{ path: string; views: number }>;
  topSources: Array<{ source: string; visits: number }>;
  daily: Array<{ day: string; views: number; visitors: number }>;
};

type ModIdea = { id: number; username: string; idea: string; status: string; created_at: string };

type Achievement = {
  id: number;
  title: string;
  event_name: string;
  description: string;
  date: string;
  place: string;
  image_url: string | null;
};

function Panel({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="border border-line">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="t-label text-ink">{title}</h2>
        {actions}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-line p-5">
      <p className="t-label">{label}</p>
      <p className="t-h2 mt-3">{value}</p>
    </div>
  );
}

export default function AdminClient({ csrfToken }: { csrfToken: string }) {
  const [tab, setTab] = useState<Tab>("site");
  const [toast, setToast] = useState<string | null>(null);

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [waitlist, setWaitlist] = useState<{ entries: WaitlistEntry[]; total: number; duplicates: Array<{ email: string; count: number }> } | null>(null);
  const [community, setCommunity] = useState<{ users: CommunityRow[]; total: number } | null>(null);
  const [ideas, setIdeas] = useState<ModIdea[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsDays, setAnalyticsDays] = useState(30);
  const [partners, setPartners] = useState<SponsorLogo[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const mutationHeaders = { "Content-Type": "application/json", "x-csrf-token": csrfToken };

  const flash = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const loadTab = useCallback(
    async (which: Tab) => {
      try {
        if (which === "site" && !settings) {
          const r = await fetch("/api/admin/settings/", { cache: "no-store" });
          setSettings((await r.json()).settings);
        }
        if (which === "content" && !content) {
          const r = await fetch("/api/admin/content/", { cache: "no-store" });
          setContent((await r.json()).content);
        }
        if (which === "waitlist") {
          const r = await fetch("/api/admin/waitlist/", { cache: "no-store" });
          setWaitlist(await r.json());
        }
        if (which === "community") {
          const [c, i] = await Promise.all([
            fetch("/api/admin/community/", { cache: "no-store" }),
            fetch("/api/admin/pinboard/", { cache: "no-store" }),
          ]);
          setCommunity(await c.json());
          setIdeas((await i.json()).ideas ?? []);
        }
        if (which === "analytics") {
          const r = await fetch(`/api/admin/analytics/?days=${analyticsDays}`, { cache: "no-store" });
          setAnalytics((await r.json()).analytics);
        }
        if (which === "partners") {
          const [p, a] = await Promise.all([
            fetch("/api/admin/sponsors/", { cache: "no-store" }),
            fetch("/api/achievements/", { cache: "no-store" }),
          ]);
          setPartners((await p.json()).sponsors ?? []);
          setAchievements((await a.json()).achievements ?? []);
        }
      } catch {
        flash("COULD NOT LOAD DATA");
      }
    },
    [settings, content, analyticsDays, flash],
  );

  useEffect(() => {
    loadTab(tab);
  }, [tab, loadTab]);

  async function saveSettings() {
    const res = await fetch("/api/admin/settings/", {
      method: "POST",
      headers: mutationHeaders,
      body: JSON.stringify({ settings }),
    });
    flash(res.ok ? "SITE SETTINGS SAVED" : "SAVE FAILED");
  }

  async function saveContent() {
    const res = await fetch("/api/admin/content/", {
      method: "POST",
      headers: mutationHeaders,
      body: JSON.stringify({ content }),
    });
    flash(res.ok ? "CONTENT SAVED — RELOAD THE SITE TO SEE IT" : "SAVE FAILED");
  }

  async function resetContent() {
    if (!window.confirm("Reset all site copy to the built-in defaults? This cannot be undone.")) return;
    const res = await fetch("/api/admin/content/", {
      method: "POST",
      headers: mutationHeaders,
      body: JSON.stringify({ reset: true }),
    });
    if (res.ok) {
      setContent((await res.json()).content);
      flash("CONTENT RESET TO DEFAULTS");
    }
  }

  async function deleteWaitlistEntry(id: number, email: string) {
    if (!window.confirm(`Remove ${email} from the waitlist?`)) return;
    await fetch(`/api/admin/waitlist/?id=${id}`, { method: "DELETE", headers: mutationHeaders });
    loadTab("waitlist");
    flash("ENTRY REMOVED");
  }

  async function moderateIdea(id: number, status: string) {
    await fetch("/api/admin/pinboard/", {
      method: "POST",
      headers: mutationHeaders,
      body: JSON.stringify({ id, status }),
    });
    loadTab("community");
    flash("IDEA UPDATED");
  }

  async function deleteIdea(id: number) {
    if (!window.confirm("Delete this idea permanently?")) return;
    await fetch("/api/admin/pinboard/", {
      method: "DELETE",
      headers: mutationHeaders,
      body: JSON.stringify({ id }),
    });
    loadTab("community");
    flash("IDEA DELETED");
  }

  async function updateMember(xUserId: string, patch: { role?: string; status?: string }) {
    await fetch("/api/admin/community/", {
      method: "PATCH",
      headers: mutationHeaders,
      body: JSON.stringify({ x_user_id: xUserId, ...patch }),
    });
    loadTab("community");
    flash("MEMBER UPDATED");
  }

  async function savePartner(form: HTMLFormElement) {
    const fd = new FormData(form);
    const res = await fetch("/api/admin/sponsors/", {
      method: "POST",
      headers: mutationHeaders,
      body: JSON.stringify({
        name: String(fd.get("name") ?? ""),
        logo_url: String(fd.get("logo_url") ?? ""),
        href: String(fd.get("href") ?? "") || null,
        sort_order: Number(fd.get("sort_order") ?? 0),
      }),
    });
    if (res.ok) {
      form.reset();
      loadTab("partners");
      flash("PARTNER SAVED");
    } else {
      flash("COULD NOT SAVE PARTNER");
    }
  }

  async function deletePartner(id: number, name: string) {
    if (!window.confirm(`Remove ${name}?`)) return;
    await fetch("/api/admin/sponsors/", {
      method: "POST",
      headers: mutationHeaders,
      body: JSON.stringify({ id, delete: true }),
    });
    loadTab("partners");
    flash("PARTNER REMOVED");
  }

  async function saveAchievement(form: HTMLFormElement) {
    const fd = new FormData(form);
    const res = await fetch("/api/achievements/", {
      method: "POST",
      headers: mutationHeaders,
      body: JSON.stringify({
        title: String(fd.get("title") ?? ""),
        event_name: String(fd.get("event_name") ?? ""),
        description: String(fd.get("description") ?? ""),
        date: String(fd.get("date") ?? ""),
        place: String(fd.get("place") ?? ""),
      }),
    });
    if (res.ok) {
      form.reset();
      loadTab("partners");
      flash("ACHIEVEMENT SAVED");
    } else {
      flash("COULD NOT SAVE ACHIEVEMENT");
    }
  }

  async function deleteAchievement(id: number, title: string) {
    if (!window.confirm(`Remove "${title}"?`)) return;
    await fetch(`/api/achievements/${id}/`, { method: "DELETE", headers: mutationHeaders });
    loadTab("partners");
    flash("ACHIEVEMENT REMOVED");
  }

  return (
    <div className="shell relative z-10 py-28">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="t-label">SOLWEAR</p>
          <h1 className="t-h2 mt-2">ADMIN</h1>
        </div>
        <a href="/" className="btn btn-ghost">
          VIEW SITE
        </a>
      </header>

      <nav aria-label="Admin sections" className="mt-10 flex flex-wrap gap-px border border-line bg-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={`focus-ring t-label flex-1 bg-ground px-4 py-4 transition-colors ${
              tab === t.id ? "bg-ink text-ground" : "hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {toast ? (
        <p role="status" className="t-label mt-6 border border-line-strong px-4 py-3 text-ink">
          {toast}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-8">
        {/* ── SITE ────────────────────────────────────────────────────────── */}
        {tab === "site" && settings ? (
          <Panel
              title="COMING SOON MODE"
              actions={
                <button type="button" onClick={saveSettings} className="btn btn-primary h-10 min-h-0">
                  SAVE
                </button>
              }
            >
              <label className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={settings.comingSoon}
                  onChange={(e) => setSettings({ ...settings, comingSoon: e.target.checked })}
                  className="h-5 w-5 accent-white"
                />
                <span>
                  <span className="t-h3 block">{settings.comingSoon ? "COMING SOON" : "SITE LIVE"}</span>
                  <span className="t-body mt-1 block">
                    WHEN ENABLED, VISITORS SEE THE COMING-SOON PAGE. SIGNED-IN ADMINS STILL SEE THE FULL SITE.
                  </span>
                </span>
              </label>
              {/* comingSoon is the checkbox above; the rest is plain text. */}
              <div className="mt-8 flex flex-col gap-6">
                <ContentEditor
                  value={
                    {
                      comingSoonHeadline: settings.comingSoonHeadline,
                      comingSoonBody: settings.comingSoonBody,
                      seoTitle: settings.seoTitle,
                      seoDescription: settings.seoDescription,
                      social: settings.social,
                    } as unknown as Json
                  }
                  path={[]}
                  set={(path, value) =>
                    setSettings(setAt(settings as unknown as Json, path, value) as unknown as SiteSettings)
                  }
                />
              </div>
          </Panel>
        ) : null}

        {/* ── CONTENT ─────────────────────────────────────────────────────── */}
        {tab === "content" && content ? (
          <Panel
            title="SITE COPY — EVERY STRING ON EVERY PAGE"
            actions={
              <div className="flex gap-2">
                <button type="button" onClick={resetContent} className="btn btn-ghost h-10 min-h-0">
                  RESET
                </button>
                <button type="button" onClick={saveContent} className="btn btn-primary h-10 min-h-0">
                  SAVE
                </button>
              </div>
            }
          >
            <ContentEditor
              value={content as unknown as Json}
              path={[]}
              set={(path, value) => setContent(setAt(content as unknown as Json, path, value) as unknown as SiteContent)}
            />
          </Panel>
        ) : null}

        {/* ── WAITLIST ────────────────────────────────────────────────────── */}
        {tab === "waitlist" && waitlist ? (
          <>
            <div className="grid gap-px bg-line sm:grid-cols-3">
              <Stat label="TOTAL SIGNUPS" value={waitlist.total} />
              <Stat label="WITH X ACCOUNT" value={waitlist.entries.filter((e) => e.x_username).length} />
              <Stat label="DUPLICATE EMAILS" value={waitlist.duplicates.length} />
            </div>
            <Panel
              title="SIGNUPS"
              actions={
                <a href="/api/admin/waitlist/?format=csv" className="btn btn-ghost h-10 min-h-0">
                  EXPORT CSV
                </a>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[46rem] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="t-label py-3 pr-4">EMAIL</th>
                      <th className="t-label py-3 pr-4">JOINED</th>
                      <th className="t-label py-3 pr-4">SOURCE</th>
                      <th className="t-label py-3 pr-4">X</th>
                      <th className="t-label py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {waitlist.entries.map((e) => (
                      <tr key={e.id} className="border-b border-line">
                        <td className="t-mono py-3 pr-4 text-ink">{e.email}</td>
                        <td className="t-mono py-3 pr-4 text-ink-dim">{e.created_at.slice(0, 10)}</td>
                        <td className="t-mono py-3 pr-4 text-ink-dim">{e.source ?? "—"}</td>
                        <td className="t-mono py-3 pr-4 text-ink-dim">{e.x_username ? `@${e.x_username}` : "—"}</td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => deleteWaitlistEntry(e.id, e.email)}
                            className="focus-ring t-label hover:text-red-sw"
                          >
                            REMOVE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {waitlist.entries.length === 0 ? <p className="t-label mt-4">NO SIGNUPS YET.</p> : null}
            </Panel>
          </>
        ) : null}

        {/* ── COMMUNITY ───────────────────────────────────────────────────── */}
        {tab === "community" && community ? (
          <Panel title={`MEMBERS — ${community.total}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th className="t-label py-3 pr-4">X ACCOUNT</th>
                    <th className="t-label py-3 pr-4">ROLE</th>
                    <th className="t-label py-3 pr-4">WAITLIST</th>
                    <th className="t-label py-3 pr-4">LAST SEEN</th>
                    <th className="t-label py-3">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {community.users.map((u) => (
                    <tr key={u.x_user_id} className="border-b border-line">
                      <td className="t-mono py-3 pr-4 text-ink">@{u.username}</td>
                      <td className="py-3 pr-4">
                        <select
                          value={u.role}
                          onChange={(e) => updateMember(u.x_user_id, { role: e.target.value })}
                          aria-label={`Role for @${u.username}`}
                          className="field h-9 min-h-0 w-32 px-2"
                        >
                          <option value="member">MEMBER</option>
                          <option value="builder">BUILDER</option>
                          <option value="admin">ADMIN</option>
                        </select>
                      </td>
                      <td className="t-mono py-3 pr-4 text-ink-dim">{u.onWaitlist ? "YES" : "NO"}</td>
                      <td className="t-mono py-3 pr-4 text-ink-dim">{u.last_seen_at.slice(0, 10)}</td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => updateMember(u.x_user_id, { status: u.status === "banned" ? "active" : "banned" })}
                          className={`focus-ring t-label ${u.status === "banned" ? "text-red-sw" : "hover:text-ink"}`}
                        >
                          {u.status === "banned" ? "BANNED — UNBAN" : "ACTIVE — BAN"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {community.users.length === 0 ? <p className="t-label mt-4">NO MEMBERS YET.</p> : null}
          </Panel>
        ) : null}

        {tab === "community" ? (
          <Panel title={`IDEA BOARD MODERATION — ${ideas.length}`}>
            <ul className="border-t border-line">
              {ideas.map((i) => (
                <li key={i.id} className="flex flex-col gap-3 border-b border-line py-4 md:flex-row md:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="t-body text-ink">{i.idea}</p>
                    <p className="t-label mt-1">
                      @{i.username} · {i.created_at.slice(0, 10)} · {i.status.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {(["approved", "made", "rejected"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => moderateIdea(i.id, status)}
                        disabled={i.status === status}
                        className="focus-ring t-label border border-line px-3 py-2 hover:text-ink disabled:opacity-40"
                      >
                        {status.toUpperCase()}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => deleteIdea(i.id)}
                      className="focus-ring t-label border border-line px-3 py-2 hover:text-red-sw"
                    >
                      DELETE
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            {ideas.length === 0 ? <p className="t-label mt-4">NO IDEAS POSTED YET.</p> : null}
          </Panel>
        ) : null}

        {/* ── ANALYTICS ───────────────────────────────────────────────────── */}
        {tab === "analytics" && analytics ? (
          <>
            <div className="flex gap-2">
              {[7, 30, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setAnalyticsDays(d);
                    fetch(`/api/admin/analytics/?days=${d}`, { cache: "no-store" })
                      .then((r) => r.json())
                      .then((data) => setAnalytics(data.analytics));
                  }}
                  className={`btn h-10 min-h-0 ${analyticsDays === d ? "btn-primary" : "btn-ghost"}`}
                >
                  {d} DAYS
                </button>
              ))}
            </div>
            <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
              <Stat label="PAGE VIEWS" value={analytics.pageViews} />
              <Stat label="UNIQUE VISITORS" value={analytics.uniqueVisitors} />
              <Stat label="VISITS" value={analytics.visits} />
              <Stat label="WAITLIST SIGNUPS" value={analytics.waitlistConversions} />
              <Stat label="COMMUNITY SIGN-INS" value={analytics.communityRegistrations} />
              <Stat label="CONVERSION RATE" value={`${analytics.conversionRate}%`} />
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              <Panel title="TOP PAGES">
                <ul className="flex flex-col">
                  {analytics.topPages.map((p) => (
                    <li key={p.path} className="flex items-center justify-between border-b border-line py-3">
                      <span className="t-mono truncate text-ink">{p.path}</span>
                      <span className="t-mono text-ink-dim">{p.views}</span>
                    </li>
                  ))}
                </ul>
                {analytics.topPages.length === 0 ? <p className="t-label">NO DATA YET.</p> : null}
              </Panel>
              <Panel title="TOP SOURCES">
                <ul className="flex flex-col">
                  {analytics.topSources.map((s) => (
                    <li key={s.source} className="flex items-center justify-between border-b border-line py-3">
                      <span className="t-mono truncate text-ink">{s.source}</span>
                      <span className="t-mono text-ink-dim">{s.visits}</span>
                    </li>
                  ))}
                </ul>
                {analytics.topSources.length === 0 ? <p className="t-label">NO DATA YET.</p> : null}
              </Panel>
            </div>
          </>
        ) : null}

        {/* ── PARTNERS & ACHIEVEMENTS ─────────────────────────────────────── */}
        {tab === "partners" ? (
          <>
            <Panel title="PARTNERS — ONLY REAL RELATIONSHIPS">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  savePartner(e.currentTarget);
                }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <label className="flex flex-col gap-2">
                  <span className="t-label">NAME</span>
                  <input name="name" required className="field" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="t-label">LOGO URL</span>
                  <input name="logo_url" required className="field" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="t-label">LINK (OPTIONAL)</span>
                  <input name="href" className="field" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="t-label">SORT ORDER</span>
                  <input name="sort_order" type="number" defaultValue={0} className="field" />
                </label>
                <button type="submit" className="btn btn-primary sm:col-span-2 sm:justify-self-start">
                  ADD PARTNER
                </button>
              </form>

              <ul className="mt-8 border-t border-line">
                {partners.map((p) => (
                  <li key={p.id} className="flex items-center justify-between border-b border-line py-3">
                    <span className="t-mono text-ink">{p.name}</span>
                    <button
                      type="button"
                      onClick={() => deletePartner(p.id, p.name)}
                      className="focus-ring t-label hover:text-red-sw"
                    >
                      REMOVE
                    </button>
                  </li>
                ))}
              </ul>
              {partners.length === 0 ? <p className="t-label mt-6">NO PARTNERS ADDED.</p> : null}
            </Panel>

            <Panel title="ACHIEVEMENTS — ONLY VERIFIABLE RESULTS">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveAchievement(e.currentTarget);
                }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <label className="flex flex-col gap-2">
                  <span className="t-label">TITLE</span>
                  <input name="title" required className="field" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="t-label">EVENT</span>
                  <input name="event_name" required className="field" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="t-label">PLACE</span>
                  <input name="place" required defaultValue="1st" className="field" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="t-label">DATE</span>
                  <input name="date" type="date" required className="field" />
                </label>
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="t-label">DESCRIPTION</span>
                  <textarea name="description" required rows={3} className="field py-3" />
                </label>
                <button type="submit" className="btn btn-primary sm:col-span-2 sm:justify-self-start">
                  ADD ACHIEVEMENT
                </button>
              </form>

              <ul className="mt-8 border-t border-line">
                {achievements.map((a) => (
                  <li key={a.id} className="flex items-center justify-between border-b border-line py-3">
                    <span className="t-mono text-ink">
                      {a.place} — {a.event_name}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteAchievement(a.id, a.title)}
                      className="focus-ring t-label hover:text-red-sw"
                    >
                      REMOVE
                    </button>
                  </li>
                ))}
              </ul>
              {achievements.length === 0 ? <p className="t-label mt-6">NO ACHIEVEMENTS ADDED.</p> : null}
            </Panel>
          </>
        ) : null}
      </div>
    </div>
  );
}
