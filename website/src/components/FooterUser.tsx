"use client";

import { useEffect, useState } from "react";

type User = { username: string; isAdmin: boolean } | null;

const dynamicEnabled = process.env.NEXT_PUBLIC_SOLWEAR_DYNAMIC === "1";

export default function FooterUser() {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    if (!dynamicEnabled) return;
    fetch("/api/me/")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => {});
  }, []);

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-white/40">
      <span>Signed in as</span>
      <span className="font-medium text-white/70">@{user.username}</span>
      {user.isAdmin && (
        <span className="text-[var(--sw-red)]">admin</span>
      )}
      <span className="text-white/20">·</span>
      <form action="/api/auth/logout/" method="post" className="inline">
        <button type="submit" className="hover:text-white/70">
          Sign out
        </button>
      </form>
    </div>
  );
}
