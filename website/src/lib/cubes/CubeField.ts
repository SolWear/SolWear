// ─────────────────────────────────────────────────────────────────────────────
// SOLWEAR CUBE FIELD
//
// One WebGL2 canvas for the whole site. Two systems share it:
//
//   BACKGROUND FIELD    a persistent grid of cubes that never disappears
//   ASSEMBLY SYSTEM     cubes temporarily detach, fly forward, form a UI
//                       element, then drift back into the field
//
// Nothing animates until it is actually on screen (IntersectionObserver), the
// pointer wave fires once per idle→moving transition, and everything is one
// instanced draw call per frame.
// ─────────────────────────────────────────────────────────────────────────────

import { compile } from "./shaders";
import { sampleBox, sampleFill, sampleText, type Pt } from "./sample";

export type RevealMode = "text" | "box" | "fill";

const AMBIENT = 0;
const FLYING = 1;
const HELD = 2;
const RETURNING = 3;

type Assembly = {
  id: number;
  el: HTMLElement;
  cubes: number[];
  phase: "flying" | "held" | "returning";
  holdUntil: number;
};

type Wave = { x: number; y: number; born: number };

export type CubeEngineOptions = { color?: [number, number, number] };

export class CubeField {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private instBuffer: WebGLBuffer;
  private vao: WebGLVertexArrayObject;
  private uRes: WebGLUniformLocation | null;

  // Per-cube state, kept in typed arrays so the hot loop never allocates.
  private n = 0;
  private hx!: Float32Array;   // home position
  private hy!: Float32Array;
  private px!: Float32Array;   // current position
  private py!: Float32Array;
  private vx!: Float32Array;
  private vy!: Float32Array;
  private tx!: Float32Array;   // target, in DOCUMENT coords
  private ty!: Float32Array;
  private mode!: Uint8Array;
  private owner!: Int32Array;
  private seed!: Float32Array;
  private inst!: Float32Array; // x, y, size, alpha, shade — uploaded each frame

  private cell = 18;
  private cubeSize = 6;
  private cols = 0;
  private rows = 0;
  private width = 0;
  private height = 0;
  private dpr = 1;

  private assemblies = new Map<number, Assembly>();
  private nextAssemblyId = 1;
  private elToAssembly = new WeakMap<HTMLElement, number>();
  private pending: Array<{ el: HTMLElement; mode: RevealMode; delay: number }> = [];
  private observer: IntersectionObserver | null = null;
  private registry = new WeakMap<HTMLElement, { mode: RevealMode; delay: number; onReveal: () => void }>();
  private pendingEls = new Set<HTMLElement>();
  private revealed = new WeakSet<HTMLElement>();
  private scrollTimer: number | null = null;
  private sweepScheduled = false;

  private waves: Wave[] = [];
  private wavesSpawned = 0; // cumulative, for QA of the one-wave-per-gesture rule
  private pointerX = -9999;
  private pointerY = -9999;
  private lastPointerX = -9999;
  private lastPointerY = -9999;
  private lastPointerMove = 0;
  private pointerMoving = false;   // the idle→moving latch that gates the wave
  private pointerDirty = false;

  private raf = 0;
  private running = false;
  private lastFrame = 0;
  private clock = 0;
  private destroyed = false;
  // Adaptive quality: sustained slow frames drop cube density rather than FPS.
  private frameEma = 0.016;
  private slowFrames = 0;
  private hopelessFrames = 0;
  private downgrades = 0;
  private color: [number, number, number];

  constructor(canvas: HTMLCanvasElement, opts: CubeEngineOptions = {}) {
    this.canvas = canvas;
    this.color = opts.color ?? [0.93, 0.93, 0.91];

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      desynchronized: true,
    });
    if (!gl) throw new Error("webgl2-unavailable");
    this.gl = gl;

    const program = compile(gl);
    if (!program) throw new Error("shader-failed");
    this.program = program;

    // Unit quad, shared by every instance.
    const quad = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
    const quadBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);

    const aCorner = gl.getAttribLocation(program, "aCorner");
    gl.enableVertexAttribArray(aCorner);
    gl.vertexAttribPointer(aCorner, 2, gl.FLOAT, false, 0, 0);

    this.instBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instBuffer);
    const stride = 5 * 4;
    const aInst = gl.getAttribLocation(program, "aInst");
    gl.enableVertexAttribArray(aInst);
    gl.vertexAttribPointer(aInst, 4, gl.FLOAT, false, stride, 0);
    gl.vertexAttribDivisor(aInst, 1);
    const aShade = gl.getAttribLocation(program, "aShade");
    gl.enableVertexAttribArray(aShade);
    gl.vertexAttribPointer(aShade, 1, gl.FLOAT, false, stride, 16);
    gl.vertexAttribDivisor(aShade, 1);
    gl.bindVertexArray(null);

    gl.useProgram(program);
    this.uRes = gl.getUniformLocation(program, "uRes");
    gl.uniform3f(gl.getUniformLocation(program, "uColor"), ...this.color);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // premultiplied
    gl.clearColor(0, 0, 0, 0);

    this.resize();
    this.bindEvents();
    this.start();
  }

  // ── Field construction ────────────────────────────────────────────────────

  /** Cube density adapts to viewport and device power; identity is preserved. */
  private pickDensity(): void {
    const w = window.innerWidth;
    const cores = navigator.hardwareConcurrency ?? 4;
    const lowPower = cores <= 4 || w < 640;
    // Density is tuned for the look, not for maximum cube count: ~2.5k cubes
    // reads identically to 4k and leaves the main thread free for scrolling.
    if (w < 640) this.cell = 24;
    else if (lowPower) this.cell = 28;
    else this.cell = 22;
    // Keep any degradation already earned on this device.
    this.cell += this.downgrades * 8;
    this.cubeSize = Math.round(this.cell * 0.36);
  }

  /**
   * Sheds cubes when the device cannot hold a smooth frame rate, and switches
   * the effect off entirely if it still cannot cope. A decorative background is
   * never worth a page that will not scroll — on hardware this weak the site
   * simply renders as a clean static layout.
   */
  private adaptQuality(dt: number): void {
    this.frameEma += (dt - this.frameEma) * 0.05;

    if (this.frameEma > 0.09) {
      // Sustained sub-11fps: this device cannot afford the field at any density.
      if (++this.hopelessFrames > 45) {
        this.disable();
        return;
      }
    } else if (this.hopelessFrames > 0) {
      this.hopelessFrames--;
    }

    if (this.frameEma > 0.032 && this.downgrades < 2) {
      if (++this.slowFrames > 90) {
        this.slowFrames = 0;
        this.downgrades++;
        this.build();
        this.sweep();
      }
    } else if (this.slowFrames > 0) {
      this.slowFrames--;
    }
  }

  /** Turns the field off for good and hands the page back to plain CSS. */
  private disable(): void {
    console.info("[cubes] disabled — device cannot sustain the effect");
    // Removing the class makes every .cube-reveal visible immediately.
    document.documentElement.classList.remove("cubes-active");
    for (const el of [...this.pendingEls]) this.pendingEls.delete(el);
    const gl = this.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.canvas.style.display = "none";
    this.destroy();
  }

  private build(): void {
    this.pickDensity();
    this.cols = Math.ceil(this.width / this.cell) + 1;
    this.rows = Math.ceil(this.height / this.cell) + 1;
    const n = this.cols * this.rows;

    const grew = !this.hx || n > this.hx.length;
    if (grew) {
      this.hx = new Float32Array(n);
      this.hy = new Float32Array(n);
      this.px = new Float32Array(n);
      this.py = new Float32Array(n);
      this.vx = new Float32Array(n);
      this.vy = new Float32Array(n);
      this.tx = new Float32Array(n);
      this.ty = new Float32Array(n);
      this.mode = new Uint8Array(n);
      this.owner = new Int32Array(n);
      this.seed = new Float32Array(n);
      this.inst = new Float32Array(n * 5);
    }
    this.n = n;

    const offsetX = (this.width - (this.cols - 1) * this.cell) / 2;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const i = r * this.cols + c;
        this.hx[i] = offsetX + c * this.cell;
        this.hy[i] = r * this.cell;
        this.px[i] = this.hx[i];
        this.py[i] = this.hy[i];
        this.vx[i] = 0;
        this.vy[i] = 0;
        this.mode[i] = AMBIENT;
        this.owner[i] = -1;
        // Deterministic per-cell hash: stable twinkle that survives resizes.
        this.seed[i] = (Math.sin(c * 127.1 + r * 311.7) * 43758.5453) % 1;
      }
    }
    // A resize invalidates every in-flight assembly.
    for (const a of this.assemblies.values()) this.finishAssembly(a, true);
    this.assemblies.clear();
  }

  resize = (): void => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    // The field is low-detail by design, so it renders at 1x (or lower once
    // degraded) and is scaled up by CSS. Pixel fill rate — not cube count — is
    // what costs on weak GPUs, and this cuts it by 4x versus retina.
    this.dpr = Math.max(0.6, 1 - this.downgrades * 0.2);
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.useProgram(this.program);
    if (this.uRes) this.gl.uniform2f(this.uRes, this.width, this.height);
    this.build();
    // In-flight assemblies were invalidated by the rebuild; show their elements
    // immediately and re-sweep for anything the new viewport now exposes.
    this.pending = [];
    this.sweep();
  };

  // ── Reveal registration ───────────────────────────────────────────────────

  /**
   * Elements are revealed by a sweep rather than by the observer alone. The
   * observer is only a cheap trigger: a fast scroll or an anchor jump can move
   * an element past the viewport without ever firing an intersection, and copy
   * must never be left invisible because of an animation.
   */
  private sweep = (): void => {
    if (this.pendingEls.size === 0) return;
    const h = window.innerHeight;
    for (const el of [...this.pendingEls]) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom <= 0) {
        // Already scrolled past — show it, no animation to be seen anyway.
        // Complementary to the branch below, so no element can fall between them.
        this.pendingEls.delete(el);
        this.observer?.unobserve(el);
        this.reveal(el);
      } else if (rect.top < h * 0.96 && rect.bottom > 0) {
        const cfg = this.registry.get(el);
        this.pendingEls.delete(el);
        this.observer?.unobserve(el);
        if (!cfg) continue;
        this.pending.push({ el, mode: cfg.mode, delay: cfg.delay });
        this.armFailsafe(el, cfg.delay);
        this.start();
      }
    }
  };

  /**
   * Hard deadline on invisibility. If an element's cubes have not finished
   * within the budget — slow GPU, backgrounded tab, dropped frames — the copy
   * is shown anyway. The animation is decoration; the words are the product.
   */
  private armFailsafe(el: HTMLElement, delay: number): void {
    window.setTimeout(() => {
      if (this.destroyed || this.revealed.has(el)) return;
      const id = this.elToAssembly.get(el);
      if (id !== undefined) {
        const assembly = this.assemblies.get(id);
        if (assembly) {
          this.finishAssembly(assembly);
          this.assemblies.delete(id);
        }
      }
      this.reveal(el);
    }, delay + 1200);
  }

  private onScroll = (): void => {
    if (this.scrollTimer) clearTimeout(this.scrollTimer);
    // Debounced: a sweep per scroll event would be wasteful.
    this.scrollTimer = window.setTimeout(this.sweep, 90);
  };

  /**
   * Reveal is reported through a callback, never by mutating className — the
   * element belongs to React, and a re-render would wipe an imperative class.
   */
  private reveal(el: HTMLElement): void {
    if (this.revealed.has(el)) return;
    this.revealed.add(el);
    this.registry.get(el)?.onReveal();
  }

  register(el: HTMLElement, mode: RevealMode, delay: number, onReveal: () => void): () => void {
    this.registry.set(el, { mode, delay, onReveal });
    this.pendingEls.add(el);

    if (!this.observer) {
      this.observer = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) this.sweep();
      }, { rootMargin: "0px", threshold: 0.01 });
      window.addEventListener("scroll", this.onScroll, { passive: true });
    }
    this.observer.observe(el);

    // Reveal anything already on screen without waiting for the observer.
    if (!this.sweepScheduled) {
      this.sweepScheduled = true;
      requestAnimationFrame(() => {
        this.sweepScheduled = false;
        this.sweep();
      });
    }

    return () => {
      this.observer?.unobserve(el);
      this.registry.delete(el);
      this.pendingEls.delete(el);
    };
  }

  // ── Assembly ──────────────────────────────────────────────────────────────

  private targetsFor(el: HTMLElement, mode: RevealMode): Pt[] {
    const rect = el.getBoundingClientRect();
    if (rect.width < 4 || rect.height < 4) return [];
    const step = this.cell;
    const budget = Math.min(560, Math.floor(this.n * 0.16));
    if (mode === "text") {
      const points = sampleText(el, rect, step, budget);
      return points.length >= 8 ? points : sampleBox(rect, step, budget);
    }
    if (mode === "fill") return sampleFill(rect, step, budget);
    return sampleBox(rect, step, budget);
  }

  /**
   * Picks cubes from across the whole field. The brief calls for cubes drawn
   * from scattered parts of the background, so this is a partial Fisher-Yates
   * shuffle — O(count) — rather than the full distance sort it replaced, which
   * blocked the main thread for hundreds of milliseconds on load.
   */
  private pickCubes(count: number): number[] {
    const free: number[] = [];
    for (let i = 0; i < this.n; i++) if (this.mode[i] === AMBIENT) free.push(i);
    if (free.length <= count) return free;

    const picked: number[] = [];
    for (let k = 0; k < count; k++) {
      const j = k + ((Math.random() * (free.length - k)) | 0);
      [free[k], free[j]] = [free[j], free[k]];
      picked.push(free[k]);
    }
    return picked;
  }

  private startAssembly(el: HTMLElement, mode: RevealMode): void {
    if (this.elToAssembly.has(el)) return;
    const points = this.targetsFor(el, mode);
    if (points.length < 6) {
      this.reveal(el);
      return;
    }

    const scrollY = window.scrollY;
    const cubes = this.pickCubes(points.length);
    if (cubes.length < 6) {
      this.reveal(el);
      return;
    }

    const id = this.nextAssemblyId++;
    for (let k = 0; k < cubes.length; k++) {
      const i = cubes[k];
      const p = points[k % points.length];
      this.tx[i] = p.x;
      this.ty[i] = p.y + scrollY; // document coords survive scrolling
      this.mode[i] = FLYING;
      this.owner[i] = id;
    }
    this.assemblies.set(id, { id, el, cubes, phase: "flying", holdUntil: 0 });
    this.elToAssembly.set(el, id);
  }

  private finishAssembly(a: Assembly, immediate = false): void {
    for (const i of a.cubes) {
      if (this.owner[i] !== a.id) continue;
      this.owner[i] = -1;
      this.mode[i] = immediate ? AMBIENT : RETURNING;
      if (immediate) {
        this.px[i] = this.hx[i];
        this.py[i] = this.hy[i];
        this.vx[i] = 0;
        this.vy[i] = 0;
      }
    }
    this.reveal(a.el);
  }

  // ── Input ─────────────────────────────────────────────────────────────────

  private onPointerMove = (e: PointerEvent): void => {
    // Deliberately trivial: the state machine runs in the frame loop instead.
    this.pointerX = e.clientX;
    this.pointerY = e.clientY;
    this.pointerDirty = true;
    this.lastPointerMove = performance.now();
    this.start();
  };

  private onPointerLeave = (): void => {
    this.pointerX = -9999;
    this.pointerY = -9999;
    this.pointerMoving = false;
  };

  private onVisibility = (): void => {
    if (document.hidden) {
      this.stop();
    } else {
      this.start();
      this.sweep();
    }
  };

  private bindEvents(): void {
    window.addEventListener("resize", this.resize, { passive: true });
    window.addEventListener("pointermove", this.onPointerMove, { passive: true });
    window.addEventListener("pointerleave", this.onPointerLeave, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  /**
   * ONE wave per movement session. A wave is emitted only on the transition
   * from idle to moving; holding the pointer in motion emits nothing further.
   */
  private updatePointerState(now: number): void {
    if (this.pointerDirty) {
      const moved =
        Math.abs(this.pointerX - this.lastPointerX) + Math.abs(this.pointerY - this.lastPointerY);
      this.lastPointerX = this.pointerX;
      this.lastPointerY = this.pointerY;
      this.pointerDirty = false;
      if (!this.pointerMoving && moved > 6) {
        this.pointerMoving = true;
        this.wavesSpawned++;
        if (this.waves.length < 4) this.waves.push({ x: this.pointerX, y: this.pointerY, born: now });
      }
    } else if (this.pointerMoving && now - this.lastPointerMove > 180) {
      // Idle again — armed for the next wave.
      this.pointerMoving = false;
    }
  }

  // ── Frame ─────────────────────────────────────────────────────────────────

  private step = (now: number): void => {
    if (this.destroyed) return;

    // Cap the field at ~40fps. The animation is indistinguishable from 60 and it
    // leaves the main thread room for scrolling, input and layout on weak GPUs.
    if (now - this.lastFrame < 24) {
      this.raf = requestAnimationFrame(this.step);
      return;
    }

    const dt = Math.min(0.05, (now - this.lastFrame) / 1000 || 0.016);
    this.lastFrame = now;
    this.clock += dt;
    this.adaptQuality(dt);

    this.updatePointerState(now);

    if (this.pending.length) {
      const next = this.pending.shift()!;
      if (next.delay > 0) {
        window.setTimeout(() => {
          this.startAssembly(next.el, next.mode);
          this.start();
        }, next.delay);
      } else {
        this.startAssembly(next.el, next.mode);
      }
    }

    for (let w = this.waves.length - 1; w >= 0; w--) {
      if ((now - this.waves[w].born) / 1000 > 1.6) this.waves.splice(w, 1);
    }

    const scrollY = window.scrollY;
    const hasWaves = this.waves.length > 0;
    const cursorOn = this.pointerX > -500;
    let busy = false;

    for (let i = 0; i < this.n; i++) {
      const m = this.mode[i];
      let alpha: number;
      let shade: number;

      if (m === FLYING || m === HELD) {
        const targetX = this.tx[i];
        const targetY = this.ty[i] - scrollY;
        const k = m === FLYING ? 0.16 : 0.3;
        this.px[i] += (targetX - this.px[i]) * k;
        this.py[i] += (targetY - this.py[i]) * k;
        alpha = 0.92;
        shade = 1;
        busy = true;
      } else {
        // Ambient: spring home, with a slow drift so the field breathes.
        const s = this.seed[i];
        const driftX = Math.sin(this.clock * 0.35 + s * 11) * 1.4;
        const driftY = Math.cos(this.clock * 0.28 + s * 7) * 1.4;
        const homeX = this.hx[i] + driftX;
        const homeY = this.hy[i] + driftY;

        if (hasWaves) {
          for (const wv of this.waves) {
            const age = (now - wv.born) / 1000;
            const dx = this.px[i] - wv.x;
            const dy = this.py[i] - wv.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 1 || d > 620) continue;
            // Expanding ring: displacement peaks at the wavefront, then decays.
            const front = age * 620;
            const band = Math.exp(-((d - front) ** 2) / 5200);
            const push = band * Math.exp(-age * 1.7) * 34;
            this.vx[i] += (dx / d) * push * dt * 60 * 0.05;
            this.vy[i] += (dy / d) * push * dt * 60 * 0.05;
          }
          busy = true;
        }

        this.vx[i] += (homeX - this.px[i]) * (m === RETURNING ? 0.09 : 0.055);
        this.vy[i] += (homeY - this.py[i]) * (m === RETURNING ? 0.09 : 0.055);
        this.vx[i] *= 0.86;
        this.vy[i] *= 0.86;
        this.px[i] += this.vx[i];
        this.py[i] += this.vy[i];

        if (m === RETURNING) {
          busy = true;
          if (Math.abs(this.px[i] - homeX) < 1.5 && Math.abs(this.py[i] - homeY) < 1.5) {
            this.mode[i] = AMBIENT;
          }
        }

        alpha = 0.1 + s * 0.09 + Math.sin(this.clock * 0.5 + s * 20) * 0.025;
        shade = 0.72;

        if (cursorOn) {
          const dx = this.px[i] - this.pointerX;
          const dy = this.py[i] - this.pointerY;
          const d2 = dx * dx + dy * dy;
          if (d2 < 26000) {
            const glow = 1 - d2 / 26000;
            alpha += glow * 0.3;
            shade += glow * 0.28;
          }
        }
      }

      const o = i * 5;
      this.inst[o] = this.px[i];
      this.inst[o + 1] = this.py[i];
      this.inst[o + 2] = this.cubeSize;
      this.inst[o + 3] = alpha;
      this.inst[o + 4] = shade;
    }

    // Advance assembly phases.
    for (const a of [...this.assemblies.values()]) {
      if (a.phase === "flying") {
        let arrived = 0;
        for (const i of a.cubes) {
          if (this.owner[i] !== a.id) continue;
          const dx = this.tx[i] - this.px[i];
          const dy = this.ty[i] - scrollY - this.py[i];
          if (dx * dx + dy * dy < 9) arrived++;
        }
        if (arrived >= a.cubes.length * 0.82) {
          a.phase = "held";
          a.holdUntil = now + 150;
          for (const i of a.cubes) if (this.owner[i] === a.id) this.mode[i] = HELD;
          this.reveal(a.el); // real HTML takes over here
        }
        busy = true;
      } else if (a.phase === "held" && now >= a.holdUntil) {
        a.phase = "returning";
        this.finishAssembly(a);
        this.assemblies.delete(a.id);
        busy = true;
      }
    }

    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.instBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.inst.subarray(0, this.n * 5), gl.DYNAMIC_DRAW);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.n);
    gl.bindVertexArray(null);

    // Keep rendering while anything moves, plus a short tail so the twinkle and
    // cursor glow stay smooth; otherwise idle down to nothing.
    const idle = !busy && !cursorOn && this.pending.length === 0;
    if (idle && now - this.lastPointerMove > 4000) {
      this.running = false;
      this.raf = 0;
      return;
    }
    this.raf = requestAnimationFrame(this.step);
  };

  /** Debug snapshot — used by the QA harness, cheap enough to leave in. */
  debug() {
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < this.n; i++) counts[this.mode[i]]++;
    return {
      n: this.n,
      cell: this.cell,
      ambient: counts[0], flying: counts[1], held: counts[2], returning: counts[3],
      wavesSpawned: this.wavesSpawned,
      running: this.running,
      pending: this.pending.length,
      waitingEls: [...this.pendingEls].map((el) => {
        const r = el.getBoundingClientRect();
        return { tag: el.tagName, txt: (el.textContent ?? "").slice(0, 22), top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height) };
      }),
      assemblies: [...this.assemblies.values()].map((a) => {
        let arrived = 0;
        const sy = window.scrollY;
        for (const i of a.cubes) {
          if (this.owner[i] !== a.id) continue;
          const dx = this.tx[i] - this.px[i];
          const dy = this.ty[i] - sy - this.py[i];
          if (dx * dx + dy * dy < 9) arrived++;
        }
        return { id: a.id, phase: a.phase, cubes: a.cubes.length, arrived, tag: a.el.tagName, cls: a.el.className.slice(0, 40) };
      }),
    };
  }

  start(): void {
    if (this.running || this.destroyed || document.hidden) return;
    this.running = true;
    this.lastFrame = performance.now();
    this.raf = requestAnimationFrame(this.step);
  }

  stop(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.running = false;
  }

  destroy(): void {
    this.destroyed = true;
    this.stop();
    this.observer?.disconnect();
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerleave", this.onPointerLeave);
    window.removeEventListener("scroll", this.onScroll);
    if (this.scrollTimer) clearTimeout(this.scrollTimer);
    document.removeEventListener("visibilitychange", this.onVisibility);
  }
}

// ── Singleton wiring ────────────────────────────────────────────────────────

let field: CubeField | null = null;
const queued: Array<{ el: HTMLElement; mode: RevealMode; delay: number; onReveal: () => void; cleanup?: () => void }> = [];

export function mountCubeField(canvas: HTMLCanvasElement): CubeField | null {
  if (field) return field;
  try {
    field = new CubeField(canvas);
  } catch (error) {
    console.warn("[cubes] disabled:", (error as Error).message);
    document.documentElement.classList.remove("cubes-active");
    for (const q of queued) q.onReveal();
    queued.length = 0;
    return null;
  }
  (window as unknown as { __swCubes?: CubeField }).__swCubes = field;
  for (const q of queued) q.cleanup = field.register(q.el, q.mode, q.delay, q.onReveal);
  queued.length = 0;
  return field;
}

export function unmountCubeField(): void {
  field?.destroy();
  field = null;
}

/** Registers an element for cube assembly; safe to call before the field boots. */
export function registerReveal(
  el: HTMLElement,
  mode: RevealMode,
  delay: number,
  onReveal: () => void,
): () => void {
  if (field) return field.register(el, mode, delay, onReveal);
  const entry: { el: HTMLElement; mode: RevealMode; delay: number; onReveal: () => void; cleanup?: () => void } = {
    el, mode, delay, onReveal,
  };
  queued.push(entry);
  return () => {
    const idx = queued.indexOf(entry);
    if (idx >= 0) queued.splice(idx, 1);
    entry.cleanup?.();
  };
}
