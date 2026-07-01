const items = [
  ["SolWearOS", "Wallet clockface, arm/disarm hold gestures, games, and NFC sync overlays."],
  ["Mobile wallet", "Balance, wallet address, transactions, send flow, and a stronger NFC bottom sheet."],
  ["Docker site", "X login, follower-gated pinboard, notifications, and moderation on the VPS."],
  ["GitHub Pages", "Static, fast, root-domain landing page at solwear.tech."],
];

export default function SystemSection() {
  return (
    <section id="os" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="label-caps mb-3">system</p>
            <h2 className="text-3xl font-bold md:text-5xl">One prototype, four surfaces.</h2>
          </div>
          <div className="grid gap-px overflow-hidden border border-white/10 md:grid-cols-2">
            {items.map(([title, body]) => (
              <div key={title} className="bg-solwear-panel p-6">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
