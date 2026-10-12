"use client";

import type { RefObject } from "react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "./gsap";

/**
 * Fades/slides every `[data-reveal]` element inside `scope` into view as it scrolls in.
 * `data-reveal="left" | "right" | "scale"` picks the entrance direction (default: up).
 */
export function useReveal(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        items.forEach((el) => {
          const kind = el.dataset.reveal;
          gsap.set(el, {
            autoAlpha: 0,
            y: kind === "left" || kind === "right" || kind === "scale" ? 0 : 40,
            x: kind === "left" ? -60 : kind === "right" ? 60 : 0,
            scale: kind === "scale" ? 0.92 : 1,
          });
        });
        ScrollTrigger.batch(items, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              x: 0,
              y: 0,
              scale: 1,
              duration: 0.9,
              ease: "power3.out",
              stagger: 0.12,
              overwrite: true,
            }),
        });
      });
      return () => mm.revert();
    },
    { scope },
  );
}
