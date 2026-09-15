import { cookies } from "next/headers";
import AdminClient from "./AdminClient";
import { createCsrfToken, getSessionFromCookie } from "@/lib/server/session";

export const dynamic = "force-dynamic";

/**
 * Server-side gate. Client state is never trusted — the admin APIs each
 * re-check the session independently.
 */
export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = getSessionFromCookie(cookieStore.get("sw_session")?.value);
  const configuredAdminId = process.env.SOLWEAR_X_USER_ID?.trim();

  if (!session?.isAdmin || !configuredAdminId || session.id !== configuredAdminId) {
    return (
      <main id="main" className="shell relative z-10 flex min-h-screen flex-col justify-center bg-ground">
        <p className="t-label">SOLWEAR</p>
        <h1 className="t-h2 mt-4">ADMIN ACCESS REQUIRED</h1>
        <p className="t-body mt-6 max-w-md">
          SIGN IN WITH THE SOLWEAR X ACCOUNT. VERIFY THROUGH THE COMMUNITY GATE FIRST.
        </p>
        <a href="/community/" className="btn btn-primary mt-8 self-start">
          GO TO SIGN IN
        </a>
      </main>
    );
  }

  return (
    <main id="main" className="min-h-screen bg-ground">
      <AdminClient csrfToken={createCsrfToken(session)} />
    </main>
  );
}
