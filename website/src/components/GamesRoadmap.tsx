const roadmap = [
  "NFC tap effect",
  "Wallet balance clockface",
  "Casino Slots",
  "Harmless chance mini-game",
  "Follower pinboard",
  "Transaction signing beta",
];

export default function GamesRoadmap() {
  return (
    <section className="border-y border-white/10 bg-white/[0.03] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="label-caps mb-3">what ships next</p>
            <h2 className="text-3xl font-bold md:text-5xl">Utility with a little bite.</h2>
          </div>
          <a className="focus-ring min-h-11 border border-white/20 px-5 py-3 text-sm text-white/80" href="/pinboard/">
            Open pinboard
          </a>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {roadmap.map((item, index) => (
            <div key={item} className="border border-white/10 bg-black p-5">
              <p className="font-mono text-xs text-white/35">0{index + 1}</p>
              <p className="mt-5 text-lg font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
