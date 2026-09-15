import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import BoardClient from "./BoardClient";
import { getSettings } from "@/lib/server/settings";
import { comingSoonFor } from "@/lib/server/maintenance";
import ComingSoon from "@/components/site/ComingSoon";

export default async function BoardPage() {
  const holding = await comingSoonFor();
  if (holding) return <ComingSoon settings={holding} />;

  const settings = getSettings();
  return (
    <>
      <SiteNav />
      <main id="main" className="flex min-h-screen flex-col pt-24">
        <BoardClient />
        <SiteFooter social={settings.social} />
      </main>
    </>
  );
}
