"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import AnimatedHeading from "./ui/AnimatedHeading";

export default function WatchShowcase() {
  return (
    <section className="py-28 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="label-caps mb-3">variants</p>
          <AnimatedHeading
            as="h2"
            className="text-3xl md:text-5xl font-bold tracking-tight"
            muted="One Purpose."
          >
            Two Faces.
          </AnimatedHeading>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Smoked variant */}
          <motion.div
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="glass p-10 flex justify-center w-full">
              <Image
                src="/watch-dark.png"
                alt="SolWear Dark Version"
                width={220}
                height={275}
                className="drop-shadow-2xl"
              />
            </div>
            <div className="text-center">
              <p className="text-white font-medium mb-1">solwear</p>
              <p className="label-caps">Dark Version</p>
            </div>
          </motion.div>

          {/* Clear variant — CSS filter to simulate the lighter colorway */}
          <motion.div
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="glass p-10 flex justify-center w-full">
              <Image
                src="/watch-transparent.png"
                alt="SolWear Clear Transparent"
                width={220}
                height={275}
                className="drop-shadow-2xl"
              />
            </div>
            <div className="text-center">
              <p className="text-white font-medium mb-1">solwear</p>
              <p className="label-caps">Clear Transparent</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
