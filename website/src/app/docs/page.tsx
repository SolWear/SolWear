import DocView from "@/components/docs/DocView";
import { OVERVIEW_SLUG } from "@/lib/docs";

export default function DocsHome() {
  return <DocView slug={OVERVIEW_SLUG} />;
}
