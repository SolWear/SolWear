import Link from "next/link";
import { headers } from "next/headers";
import { neighbors, href, groupTitle } from "@/lib/docs";
import { getDoc } from "@/lib/docs.server";

/** Renders one documentation page from its slug, or a not-found notice. */
export default async function DocView({ slug }: { slug: string }) {
  const requestHeaders = await headers();
  const host = (requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "").split(":")[0];
  const cleanRoot = host === "docs.solwear.tech";
  const doc = getDoc(slug, cleanRoot);
  const group = groupTitle(slug);

  if (!doc) {
    return (
      <article>
        <p className="t-label">DOCS / 404</p>
        <h1 className="t-h2 mt-4">Page not found</h1>
        <p className="t-body mt-4">
          That documentation page does not exist.{" "}
          <Link href={href("index", cleanRoot)} className="text-ink underline underline-offset-4">
            Back to the overview
          </Link>
          .
        </p>
      </article>
    );
  }

  const { prev, next } = neighbors(slug);

  return (
    <div className="flex gap-12">
      <article className="min-w-0 flex-1">
        <p className="t-label">{group ? `DOCS / ${group.toUpperCase()}` : "DOCS"}</p>
        <div className="docs-prose mt-6" dangerouslySetInnerHTML={{ __html: doc.html }} />

        {(prev || next) && (
          <nav
            aria-label="Pagination"
            className="rule mt-16 grid gap-4 pt-8 sm:grid-cols-2"
          >
            {prev ? (
              <Link
                href={href(prev.slug, cleanRoot)}
                className="focus-ring group flex flex-col gap-1 border border-line p-4 transition-colors hover:border-line-strong"
              >
                <span className="t-label">← PREVIOUS</span>
                <span className="t-mono text-ink">{prev.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={href(next.slug, cleanRoot)}
                className="focus-ring group flex flex-col gap-1 border border-line p-4 text-right transition-colors hover:border-line-strong sm:col-start-2"
              >
                <span className="t-label">NEXT →</span>
                <span className="t-mono text-ink">{next.title}</span>
              </Link>
            ) : null}
          </nav>
        )}
      </article>

      {doc.toc.length > 1 && (
        <aside className="hidden w-52 shrink-0 xl:block">
          <div className="sticky top-[5.5rem]">
            <p className="t-label mb-3">ON THIS PAGE</p>
            <ul className="flex flex-col gap-2 border-l border-line">
              {doc.toc.map((h) => (
                <li key={h.id} className={h.level === 3 ? "pl-6" : "pl-3"}>
                  <a
                    href={`#${h.id}`}
                    className="focus-ring t-mono block text-ink-dim transition-colors hover:text-ink"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </div>
  );
}
