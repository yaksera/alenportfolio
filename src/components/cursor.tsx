"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Dot + trailing ring cursor. Only on fine pointers and when motion is allowed. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      document.documentElement.classList.add("has-custom-cursor");
      gsap.set([dot.current, ring.current], { xPercent: -50, yPercent: -50, autoAlpha: 1 });
      const dx = gsap.quickTo(dot.current, "x", { duration: 0.08 });
      const dy = gsap.quickTo(dot.current, "y", { duration: 0.08 });
      const rx = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3.out" });
      const ry = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3.out" });

      const move = (e: PointerEvent) => {
        dx(e.clientX);
        dy(e.clientY);
        rx(e.clientX);
        ry(e.clientY);
      };
      // Grow the ring over anything clickable.
      const over = (e: PointerEvent) => {
        const hit = (e.target as Element).closest("a, button, input, textarea, label");
        gsap.to(ring.current, { scale: hit ? 1.8 : 1, duration: 0.3, ease: "power3.out" });
      };
      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerover", over, { passive: true });
      return () => {
        document.documentElement.classList.remove("has-custom-cursor");
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerover", over);
      };
    });
    return () => mm.revert();
  });

  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none invisible fixed left-0 top-0 z-[100] size-9 rounded-full border-2 border-white mix-blend-difference"
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none invisible fixed left-0 top-0 z-[100] size-2 rounded-full bg-white mix-blend-difference"
      />
    </>
  );
}
