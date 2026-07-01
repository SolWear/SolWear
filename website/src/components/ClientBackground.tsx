"use client";

import dynamic from "next/dynamic";

const BlocksBackground = dynamic(() => import("./BlocksBackground"), { ssr: false });

export default function ClientBackground() {
  return <BlocksBackground />;
}
