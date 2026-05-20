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

    // Grid constants
    const CELL = 13;      // grid cell size (block + gap)
    const BLOCK = 5;      // square side in CSS px
    const RADIUS = 130;   // mouse influence radius
    const STRENGTH = 55;  // repulsion strength
    const SPRING = 0.055; // return spring coefficient
    const DAMP = 0.70;    // velocity damping per frame

    let W = 0, H = 0;
    let mx = -9999, my = -9999;
    let rafId = 0;
    let running = false;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    let touchTimer: ReturnType<typeof setTimeout> | null = null;

    type B = {
      ox: number; oy: number;   // origin
      dx: number; dy: number;   // current displacement
      vx: number; vy: number;   // velocity
      a: number;                // base alpha
    };
    let grid: B[] = [];

    function buildGrid() {
      grid = [];
      const cols = Math.ceil(W / CELL) + 3;
      const rows = Math.ceil(H / CELL) + 3;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Deterministic pseudo-random alpha per block
          const s = Math.abs(Math.sin(r * 127.1 + c * 311.7) * 43758.5453) % 1;
          grid.push({
            ox: c * CELL - 3,
            oy: r * CELL - 3,
            dx: 0, dy: 0,
            vx: 0, vy: 0,
            a: 0.06 + s * 0.07, // 0.06–0.13, slightly brighter than before
          });
        }
      }
    }

    function drawBg() {
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, W, H);

      // Solana green — top-left
      const g1 = ctx.createRadialGradient(W * 0.08, H * 0.1, 0, W * 0.08, H * 0.1, W * 0.7);
      g1.addColorStop(0, "rgba(20,241,149,0.09)");
      g1.addColorStop(0.5, "rgba(20,241,149,0.03)");
      g1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      // Solana purple — bottom-right
      const g2 = ctx.createRadialGradient(W * 0.88, H * 0.82, 0, W * 0.88, H * 0.82, W * 0.62);
      g2.addColorStop(0, "rgba(153,69,255,0.10)");
      g2.addColorStop(0.45, "rgba(153,69,255,0.03)");
      g2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);
    }

    function drawStatic() {
      drawBg();
      for (const b of grid) {
        ctx.fillStyle = `rgba(255,255,255,${b.a})`;
        ctx.fillRect(b.ox, b.oy, BLOCK, BLOCK);
      }
    }

    function frame() {
      drawBg();
      let live = false;

      for (const b of grid) {
        const cx = b.ox + b.dx + BLOCK / 2;
        const cy = b.oy + b.dy + BLOCK / 2;
        const ddx = cx - mx;
        const ddy = cy - my;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);

        // Repulsion from mouse
        if (dist < RADIUS && dist > 0) {
          const force = (1 - dist / RADIUS) * STRENGTH;
          b.vx += (ddx / dist) * force * 0.22;
          b.vy += (ddy / dist) * force * 0.22;
        }

        // Spring toward origin
        b.vx += -b.dx * SPRING;
        b.vy += -b.dy * SPRING;

        // Damp
        b.vx *= DAMP;
        b.vy *= DAMP;

        b.dx += b.vx;
        b.dy += b.vy;

        if (Math.abs(b.dx) > 0.04 || Math.abs(b.dy) > 0.04) live = true;

        ctx.fillStyle = `rgba(255,255,255,${b.a})`;
        ctx.fillRect(b.ox + b.dx, b.oy + b.dy, BLOCK, BLOCK);
      }

      // Keep looping while blocks are displaced or mouse is active
      if (live || mx > -500) {
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

    const onResize = () => {
      resize();
      if (reduced) drawStatic();
      else if (!running) drawStatic();
    };

    const onMouse = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      startLoop();
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        mx = -9999;
        my = -9999;
      }, 3000);
    };

    const onLeave = () => {
      mx = -9999;
      my = -9999;
    };

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      mx = t.clientX;
      my = t.clientY;
      startLoop();
      if (touchTimer) clearTimeout(touchTimer);
    };

    const onTouchEnd = () => {
      touchTimer = setTimeout(() => {
        mx = -9999;
        my = -9999;
        touchTimer = null;
      }, 1500);
    };

    resize();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    // Always start with a static render; animation starts on first mouse move
    drawStatic();

    return () => {
      cancelAnimationFrame(rafId);
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
