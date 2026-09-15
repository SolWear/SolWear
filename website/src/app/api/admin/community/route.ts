import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireAdminMutation } from "@/lib/server/admin";
import { communityCount, listCommunityUsers, setCommunityRole, setCommunityStatus } from "@/lib/server/community";
import { findByXUserId } from "@/lib/server/waitlist";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { response } = requireAdmin(request);
  if (response) return response;

  const users = listCommunityUsers().map((u) => ({
    ...u,
    onWaitlist: Boolean(findByXUserId(u.x_user_id)),
  }));
  return NextResponse.json({ users, total: communityCount() });
}

export async function PATCH(request: NextRequest) {
  const { response } = requireAdminMutation(request);
  if (response) return response;

  const body = (await request.json().catch(() => null)) as {
    x_user_id?: string;
    role?: "member" | "builder" | "admin";
    status?: "active" | "banned";
  } | null;

  if (!body?.x_user_id) return NextResponse.json({ error: "x_user_id is required" }, { status: 400 });

  const roles = ["member", "builder", "admin"] as const;
  const statuses = ["active", "banned"] as const;
  if (body.role && !roles.includes(body.role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  if (body.status && !statuses.includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  if (!body.role && !body.status) return NextResponse.json({ error: "No change requested" }, { status: 400 });

  let changed = false;
  if (body.role) changed = setCommunityRole(body.x_user_id.slice(0, 32), body.role) || changed;
  if (body.status) changed = setCommunityStatus(body.x_user_id.slice(0, 32), body.status) || changed;
  return NextResponse.json({ ok: changed });
}
