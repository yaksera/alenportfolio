"use client";

import { useRef, useState } from "react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/lib/gsap";

const LINKS = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

/** Floating glass pill, like the reference video. */
export function Navbar() {
  const nav = useRef<HTMLElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useGSAP(
    () => {
      // Pass elements, not "#id" strings: selector text is resolved inside `scope` (the nav).
      const triggers = LINKS.map(({ id }) =>
        ScrollTrigger.create({
          trigger: document.getElementById(id),
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => setActive((cur) => (self.isActive ? id : cur === id ? null : cur)),
        }),
      );
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(nav.current, { y: -40, autoAlpha: 0, duration: 0.9, delay: 0.6, ease: "power3.out" });
      });
      return () => {
        triggers.forEach((t) => t.kill());
        mm.revert();
      };
    },
    { scope: nav },
  );

  // Highlight pill slides under the active link.
  useGSAP(
    () => {
      const link = nav.current?.querySelector<HTMLAnchorElement>(`[data-nav="${active}"]`);
      gsap.to(pill.current, link ? { x: link.offsetLeft, width: link.offsetWidth, autoAlpha: 1, duration: 0.45, ease: "power3.out" } : { autoAlpha: 0, duration: 0.3 });
    },
    { dependencies: [active], scope: nav },
  );

  return (
    <nav
      ref={nav}
      aria-label="Primary"
      className="fixed left-1/2 top-5 z-50 -translate-x-1/2 rounded-full border border-white/25 bg-white/10 p-1.5 shadow-lg shadow-black/10 backdrop-blur-md"
    >
      <ul className="relative flex items-center">
        <span ref={pill} aria-hidden className="invisible absolute inset-y-0 left-0 w-0 rounded-full bg-white" />
        {LINKS.map(({ id, label }) => (
          <li key={id} className="relative">
            <a
              href={`#${id}`}
              data-nav={id}
              aria-current={active === id ? "true" : undefined}
              className={`block rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-ui sm:px-6 ${
                active === id ? "text-red" : "text-white hover:bg-white/15"
              }`}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
