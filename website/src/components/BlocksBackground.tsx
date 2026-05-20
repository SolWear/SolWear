"use client";

import { useEffect, useRef } from "react";

export default function BlocksBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const CELL = 13;
    const BLOCK = 5;
    const RADIUS = 100;
    const STRENGTH = 18;
    const SPRING = 0.055;
    const DAMP = 0.70;

    let W = 0, H = 0;
    let mx = -9999, my = -9999;
    let rafId = 0;
    let running = false;
    let bgTime = 0;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let touchTimer: ReturnType<typeof setTimeout> | null = null;
    let bgTickId: ReturnType<typeof setTimeout> | null = null;

    type Wave = { x: number; y: number; born: number };
    const waves: Wave[] = [];

    type B = {
      ox: number; oy: number;
      dx: number; dy: number;
      vx: number; vy: number;
      a: number;
      hue: number;
      phase: number;
    };
    let grid: B[] = [];

    function buildGrid() {
      grid = [];
      const cols = Math.ceil(W / CELL) + 3;
      const rows = Math.ceil(H / CELL) + 3;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const s = Math.abs(Math.sin(r * 127.1 + c * 311.7) * 43758.5453) % 1;
          const s2 = Math.abs(Math.sin(r * 55.3 + c * 179.5) * 12345.6) % 1;
          const hue = s2 < 0.5
            ? 150 + s2 * 2 * 20
            : 260 + (s2 - 0.5) * 2 * 30;
          grid.push({
            ox: c * CELL - 3,
            oy: r * CELL - 3,
            dx: 0, dy: 0,
            vx: 0, vy: 0,
            a: 0.06 + s * 0.06,
            hue,
            phase: s * Math.PI * 2,
          });
        }
      }
    }

    function drawBg(t: number) {
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, W, H);

      const g1x = W * (0.08 + Math.sin(t * 0.12) * 0.15);
      const g1y = H * (0.10 + Math.cos(t * 0.09) * 0.12);
      const g1r = W * (0.65 + Math.sin(t * 0.15) * 0.12);
      const g1 = ctx.createRadialGradient(g1x, g1y, 0, g1x, g1y, g1r);
      g1.addColorStop(0, "rgba(20,241,149,0.10)");
      g1.addColorStop(0.5, "rgba(20,241,149,0.03)");
      g1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      const g2x = W * (0.88 + Math.cos(t * 0.08) * 0.12);
      const g2y = H * (0.82 + Math.sin(t * 0.11) * 0.15);
      const g2r = W * (0.58 + Math.cos(t * 0.13) * 0.10);
      const g2 = ctx.createRadialGradient(g2x, g2y, 0, g2x, g2y, g2r);
      g2.addColorStop(0, "rgba(153,69,255,0.11)");
      g2.addColorStop(0.45, "rgba(153,69,255,0.03)");
      g2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      const g3x = W * (0.5 + Math.cos(t * 0.07) * 0.28);
      const g3y = H * (0.5 + Math.sin(t * 0.06) * 0.28);
      const g3r = W * (0.45 + Math.sin(t * 0.10) * 0.08);
      const g3 = ctx.createRadialGradient(g3x, g3y, 0, g3x, g3y, g3r);
      g3.addColorStop(0, "rgba(224,0,15,0.06)");
      g3.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, W, H);
    }

    function drawStatic() {
      drawBg(bgTime);
      for (const b of grid) {
        ctx.fillStyle = `hsla(${b.hue},20%,90%,${b.a})`;
        ctx.fillRect(b.ox, b.oy, BLOCK, BLOCK);
      }
    }

    function frame() {
      const now = performance.now();
      drawBg(bgTime);

      let live = false;
      const t = now * 0.001;

      for (const b of grid) {
        const cx = b.ox + b.dx + BLOCK / 2;
        const cy = b.oy + b.dy + BLOCK / 2;

        const ddx = cx - mx, ddy = cy - my;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < RADIUS && dist > 0) {
          const force = (1 - dist / RADIUS) * STRENGTH;
          b.vx += (ddx / dist) * force * 0.22;
          b.vy += (ddy / dist) * force * 0.22;
        }

        for (const w of waves) {
          const dt = (now - w.born) / 1000;
          if (dt > 1.8) continue;
          const wx = cx - w.x, wy = cy - w.y;
          const wd = Math.sqrt(wx * wx + wy * wy);
          if (wd < 2) continue;
          const ripple = Math.sin(wd * 0.045 - dt * 5) * Math.exp(-dt * 1.8) * 14;
          b.vx += (wx / wd) * ripple * 0.15;
          b.vy += (wy / wd) * ripple * 0.15;
        }

        b.vx += -b.dx * SPRING;
        b.vy += -b.dy * SPRING;
        b.vx *= DAMP;
        b.vy *= DAMP;
        b.dx += b.vx;
        b.dy += b.vy;
        if (Math.abs(b.dx) > 0.04 || Math.abs(b.dy) > 0.04) live = true;

        const pulsedAlpha = b.a + Math.sin(t * 0.4 + b.phase) * 0.02;
        ctx.fillStyle = `hsla(${b.hue},22%,90%,${pulsedAlpha})`;
        ctx.fillRect(b.ox + b.dx, b.oy + b.dy, BLOCK, BLOCK);
      }

      const cutoff = now - 1800;
      while (waves.length && waves[0].born < cutoff) waves.shift();

      if (live || mx > -500 || waves.length > 0) {
        rafId = requestAnimationFrame(frame);
      } else {
        running = false;
        rafId = 0;
      }
    }

    function startLoop() {
      if (!running && !reduced) {
        running = true;
        rafId = requestAnimationFrame(frame);
      }
    }

    function bgTick() {
      bgTime += 1 / 15;
      if (!running) drawStatic();
      bgTickId = setTimeout(bgTick, 1000 / 15);
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      buildGrid();
    }

    const onResize = () => { resize(); drawStatic(); };

    const onMouse = (e: MouseEvent) => {
      const prevMx = mx, prevMy = my;
      mx = e.clientX;
      my = e.clientY;
      if (Math.abs(mx - prevMx) + Math.abs(my - prevMy) > 8) {
        if (waves.length < 6) waves.push({ x: mx, y: my, born: performance.now() });
      }
      startLoop();
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { mx = -9999; my = -9999; }, 3000);
    };

    const onLeave = () => { mx = -9999; my = -9999; };

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      mx = t.clientX;
      my = t.clientY;
      if (waves.length < 6) waves.push({ x: mx, y: my, born: performance.now() });
      startLoop();
      if (touchTimer) clearTimeout(touchTimer);
    };

    const onTouchEnd = () => {
      touchTimer = setTimeout(() => { mx = -9999; my = -9999; touchTimer = null; }, 1500);
    };

    resize();
    bgTick();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    drawStatic();

    return () => {
      cancelAnimationFrame(rafId);
      if (bgTickId) clearTimeout(bgTickId);
      if (idleTimer) clearTimeout(idleTimer);
      if (touchTimer) clearTimeout(touchTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[-1]"
    />
  );
}
