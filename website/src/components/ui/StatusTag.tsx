import type { Status } from "@/lib/siteContent";

const STYLES: Record<Status, string> = {
  AVAILABLE: "tag-available",
  "IN DEVELOPMENT": "tag-development",
  PLANNED: "tag-planned",
};

/** Never let a PLANNED capability read as shipped. */
export default function StatusTag({ status }: { status: Status }) {
  return (
    <span className={`tag ${STYLES[status] ?? "tag-planned"}`}>
      <span aria-hidden="true" className="inline-block h-1 w-1 rounded-full bg-current" />
      {status}
    </span>
  );
}
