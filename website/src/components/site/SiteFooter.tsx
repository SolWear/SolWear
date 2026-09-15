import Link from "next/link";
import Wordmark from "@/components/ui/Wordmark";
import { defaultSettings } from "@/lib/server/settings";

type Props = { social?: { x: string; github: string; email: string } };

export default function SiteFooter({ social = defaultSettings.social }: Props) {
  return (
    <footer className="site-footer relative z-10 rule mt-auto">
      <div className="shell flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="focus-ring -m-2 p-2" aria-label="SolWear — home">
          <Wordmark size={16} />
        </Link>

        <ul className="flex flex-wrap items-center gap-x-7 gap-y-2">
          <li>
            <a href={social.x} target="_blank" rel="noreferrer" className="focus-ring t-label hover:text-ink">
              X
            </a>
          </li>
          <li>
            <a href={social.github} target="_blank" rel="noreferrer" className="focus-ring t-label hover:text-ink">
              GITHUB
            </a>
          </li>
          <li>
            <a href={`mailto:${social.email}`} className="focus-ring t-label hover:text-ink">
              CONTACT
            </a>
          </li>
        </ul>

        <p className="t-label">© {new Date().getFullYear()} SOLWEAR</p>
      </div>
    </footer>
  );
}
