// Turns a DOM element into a set of target points for cubes to fly to.
// Text is sampled from an offscreen render of its own glyphs, so the cubes
// genuinely spell the headline before the real HTML fades in.

export type Pt = { x: number; y: number };

let scratch: HTMLCanvasElement | null = null;
function canvas(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!scratch) scratch = document.createElement("canvas");
  // Metrics only — nothing is drawn or read back.
  return scratch.getContext("2d");
}

/** Evenly thins a list down to `max` points without clustering. */
function thin(points: Pt[], max: number): Pt[] {
  if (points.length <= max) return points;
  const stride = points.length / max;
  const out: Pt[] = [];
  for (let i = 0; i < max; i++) out.push(points[Math.floor(i * stride)]);
  return out;
}

/**
 * Builds target points from the element's own text metrics — one band of points
 * per wrapped line.
 *
 * An earlier version rasterised the glyphs and read them back with getImageData.
 * That is glyph-accurate but forces a pixel readback while a WebGL context is
 * live, which stalled the main thread long enough to delay the copy itself.
 * measureText alone is effectively free and the cubes still converge into the
 * shape of the headline.
 */
export function sampleText(el: HTMLElement, rect: DOMRect, step: number, max: number): Pt[] {
  const ctx = canvas();
  const text = (el.textContent ?? "").trim();
  if (!ctx || !text) return [];

  const cs = getComputedStyle(el);
  const fontSize = parseFloat(cs.fontSize) || 16;
  const lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.1;
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${fontSize}px ${cs.fontFamily}`;

  // Wrap the way the browser did, using the element's own width.
  const lines: Array<{ text: string; width: number }> = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(candidate).width > rect.width) {
        lines.push({ text: line, width: ctx.measureText(line).width });
        line = word;
      } else {
        line = candidate;
      }
    }
    lines.push({ text: line, width: ctx.measureText(line).width });
  }

  const centred = cs.textAlign === "center";
  const bandTop = lineHeight * 0.2;
  const bandHeight = Math.max(step, lineHeight * 0.6);
  const points: Pt[] = [];

  lines.forEach((line, i) => {
    if (!line.text) return;
    const width = Math.min(line.width, rect.width);
    const x0 = rect.left + (centred ? (rect.width - width) / 2 : 0);
    const y0 = rect.top + i * lineHeight + bandTop;
    for (let y = 0; y <= bandHeight; y += step) {
      for (let x = 0; x <= width; x += step) {
        points.push({ x: x0 + x, y: y0 + y });
      }
    }
  });

  return thin(points, max);
}

/** Outlines the element's box, with denser corners so the shape reads. */
export function sampleBox(rect: DOMRect, step: number, max: number): Pt[] {
  const points: Pt[] = [];
  const { left: l, top: t, width: w, height: h } = rect;
  if (w < 2 || h < 2) return points;
  for (let x = 0; x <= w; x += step) {
    points.push({ x: l + x, y: t });
    points.push({ x: l + x, y: t + h });
  }
  for (let y = step; y < h; y += step) {
    points.push({ x: l, y: t + y });
    points.push({ x: l + w, y: t + y });
  }
  return thin(points, max);
}

/** Fills the element's box on a grid — used for solid marks like the logo. */
export function sampleFill(rect: DOMRect, step: number, max: number): Pt[] {
  const points: Pt[] = [];
  for (let y = 0; y <= rect.height; y += step) {
    for (let x = 0; x <= rect.width; x += step) {
      points.push({ x: rect.left + x, y: rect.top + y });
    }
  }
  return thin(points, max);
}
