import Image from "next/image";
import FooterUser from "./FooterUser";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/40 px-6 py-10 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2 text-white/80">
          <Image src="/solwear-logo-white.webp" alt="SolWear" width={18} height={18} />
          <span className="text-sm font-semibold">SolWear</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <a href="/pitch/" className="label-caps transition-colors hover:text-white">Pitch</a>
          <a href="/pinboard/" className="label-caps transition-colors hover:text-white">Community</a>
          <a href="https://x.com/SolWear_" target="_blank" rel="noreferrer" className="label-caps transition-colors hover:text-white">X</a>
          <a href="https://instagram.com/so1wear" target="_blank" rel="noreferrer" className="label-caps transition-colors hover:text-white">Instagram</a>
          <a href="https://tiktok.com/@so1wear" target="_blank" rel="noreferrer" className="label-caps transition-colors hover:text-white">TikTok</a>
          <a href="https://youtube.com/@so1wear" target="_blank" rel="noreferrer" className="label-caps transition-colors hover:text-white">YouTube</a>
          <a href="https://github.com/solwear/solwear" target="_blank" rel="noreferrer" className="label-caps transition-colors hover:text-white">GitHub</a>
          <a href="/thanks/" className="label-caps transition-colors hover:text-white">Thanks</a>
        </div>

        <div className="flex flex-col items-end gap-2">
          <p className="label-caps">2026 SolWear</p>
          <FooterUser />
        </div>
      </div>
    </footer>
  );
}
