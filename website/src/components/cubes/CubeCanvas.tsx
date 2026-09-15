"use client";

import { useEffect, useRef } from "react";
import { mountCubeField, unmountCubeField } from "@/lib/cubes/CubeField";

/**
 * The single rendering surface for the whole site. Fixed behind everything,
 * never unmounted between routes, and skipped entirely when the visitor has
 * asked for reduced motion.
 */
export default function CubeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // The inline boot script in <head> decided whether cubes are viable at all.
    const boot = window as unknown as { __swCubesBoot?: number };
    if (boot.__swCubesBoot) {
      clearTimeout(boot.__swCubesBoot);
      boot.__swCubesBoot = undefined;
    }
    if (!document.documentElement.classList.contains("cubes-active") || !ref.current) return;

    mountCubeField(ref.current);
    return () => unmountCubeField();
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
