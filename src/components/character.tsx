"use client";

import { useEffect, useId, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { profile } from "@/content/profile";
import { BACK_HAIR, LOCK_LEFT, LOCK_RIGHT } from "./character-paths";

export type Mood = "neutral" | "happy" | "curious";

type Props = {
  mood?: Mood;
  className?: string;
};

/**
 * Parallax amounts (in SVG units) for a pointer at the edge of the range.
 * Layers move by different amounts so the flat drawing reads as a head turning in 3D.
 */
const RANGE = {
  head: { x: 14, y: 10, rotate: 6 },
  features: { x: 18, y: 13 },
  iris: { x: 7, y: 6 },
  bangs: { x: 7, y: 4 },
  ears: { x: -7, y: 0 },
  backHair: { x: -10, y: -5 },
  body: { x: 4, y: 0 },
};

const IDLE_AFTER_MS = 3500;

/** A code-drawn character whose head and eyes follow the pointer. */
export function Character({ mood = "neutral", className = "" }: Props) {
  const root = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, "");
  const c = profile.character;
  const long = c.hairStyle === "long";

  useGSAP(
    (_, contextSafe) => {
      const svg = root.current!;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const dur = reduce ? 0 : 0.7;

      // One quickTo per layer/axis: cheap to call on every pointer event.
      const movers = Object.entries(RANGE).flatMap(([layer, range]) =>
        Object.entries(range).map(([prop, amount]) => ({
          prop,
          amount,
          set: gsap.quickTo(svg.querySelectorAll(`[data-layer="${layer}"]`), prop, {
            duration: dur,
            ease: "power3.out",
          }),
        })),
      );
      // `y` follows the vertical offset; `x` and `rotate` follow the horizontal one.
      const lookAt = (nx: number, ny: number) => {
        movers.forEach((m) => m.set((m.prop === "y" ? ny : nx) * m.amount));
      };

      // Pointer → normalised offset from the character's face.
      let idleTimer = 0;
      let idleTl: gsap.core.Timeline | null = null;
      const stopIdle = () => {
        idleTl?.kill();
        idleTl = null;
      };
      const startIdle = () => {
        if (reduce) return;
        stopIdle();
        idleTl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
        const points = [
          [-0.6, -0.1],
          [0.1, 0.2],
          [0.7, -0.3],
          [0, 0],
        ];
        points.forEach(([x, y]) => idleTl!.call(() => lookAt(x, y)).to({}, { duration: 1.6 }));
      };

      const onMove = contextSafe!((e: PointerEvent) => {
        const box = svg.getBoundingClientRect();
        const cx = box.left + box.width / 2;
        const cy = box.top + box.height * 0.38; // roughly the eyes
        const nx = gsap.utils.clamp(-1, 1, (e.clientX - cx) / (window.innerWidth * 0.45));
        const ny = gsap.utils.clamp(-1, 1, (e.clientY - cy) / (window.innerHeight * 0.45));
        stopIdle();
        lookAt(nx, ny);
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(startIdle, IDLE_AFTER_MS);
      });

      window.addEventListener("pointermove", onMove, { passive: true });
      idleTimer = window.setTimeout(startIdle, 1500);

      // Natural, irregular blinking.
      let blinkTimer = 0;
      const blink = () => {
        if (!reduce) {
          gsap.fromTo(
            "[data-eye]",
            { scaleY: 1 },
            { scaleY: 0.08, duration: 0.07, yoyo: true, repeat: Math.random() < 0.2 ? 3 : 1, ease: "power1.in", transformOrigin: "50% 50%" },
          );
        }
        blinkTimer = window.setTimeout(blink, 2200 + Math.random() * 3200);
      };
      blinkTimer = window.setTimeout(blink, 1800);

      // Breathing.
      if (!reduce) {
        gsap.to("[data-breathe]", { y: 3, scaleY: 1.008, transformOrigin: "50% 100%", duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to("[data-strand]", { rotate: 2.5, transformOrigin: "50% 0%", duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.3 });
      }

      return () => {
        window.removeEventListener("pointermove", onMove);
        window.clearTimeout(idleTimer);
        window.clearTimeout(blinkTimer);
        stopIdle();
      };
    },
    { scope: root },
  );

  // Expressions.
  useEffect(() => {
    const svg = root.current;
    if (!svg) return;
    const q = gsap.utils.selector(svg);
    const d = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.35;
    const happy = mood === "happy";
    const curious = mood === "curious";
    gsap.to(q("[data-brow]"), { y: happy ? -7 : curious ? -4 : 0, duration: d, ease: "back.out(2)" });
    gsap.to(q("[data-brow-right]"), { rotate: curious ? -8 : 0, transformOrigin: "50% 50%", duration: d });
    gsap.to(q("[data-mouth='smile']"), { autoAlpha: happy ? 0 : 1, duration: d * 0.6 });
    gsap.to(q("[data-mouth='open']"), { autoAlpha: happy ? 1 : 0, duration: d * 0.6 });
    gsap.to(q("[data-blush]"), { opacity: happy ? 0.6 : 0.32, duration: d });
    gsap.to(q("[data-lower-lid]"), { y: happy ? -6 : 0, duration: d });
  }, [mood]);

  const eye = (cx: number, side: "l" | "r") => (
    <g data-eye>
      <clipPath id={`${uid}-eye-${side}`}>
        <ellipse cx={cx} cy={238} rx={22} ry={25} />
      </clipPath>
      <ellipse cx={cx} cy={238} rx={22} ry={25} fill="#fffaf6" />
      <g clipPath={`url(#${uid}-eye-${side})`}>
        <g data-layer="iris">
          <circle cx={cx} cy={240} r={16.5} fill={c.eyes} />
          <circle cx={cx} cy={240} r={16.5} fill={`url(#${uid}-iris)`} />
          <circle cx={cx} cy={240} r={8} fill="#1b0f0a" />
          <circle cx={cx - 6} cy={233} r={5} fill="#fff" />
          <circle cx={cx + 6} cy={246} r={2.4} fill="#fff" opacity={0.85} />
        </g>
        {/* lower lid rises when smiling */}
        <ellipse data-lower-lid cx={cx} cy={276} rx={30} ry={14} fill={c.skin} />
      </g>
      {/* upper lash line */}
      <path
        d={
          side === "l"
            ? `M ${cx - 25} 236 C ${cx - 20} 212 ${cx + 18} 208 ${cx + 25} 230`
            : `M ${cx - 25} 230 C ${cx - 18} 208 ${cx + 20} 212 ${cx + 25} 236`
        }
        stroke="#24130d"
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={side === "l" ? `M ${cx - 24} 232 L ${cx - 31} 225` : `M ${cx + 24} 232 L ${cx + 31} 225`}
        stroke="#24130d"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    </g>
  );

  return (
    <svg
      ref={root}
      viewBox="0 0 500 620"
      role="img"
      aria-label={`Illustrated portrait of ${profile.name}`}
      className={className}
    >
      <defs>
        <radialGradient id={`${uid}-iris`} cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity={0.25} />
          <stop offset="70%" stopColor="#000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000" stopOpacity={0.45} />
        </radialGradient>
        <linearGradient id={`${uid}-face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.skin} />
          <stop offset="100%" stopColor={c.skinShadow} />
        </linearGradient>
        <linearGradient id={`${uid}-hair`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c.hairShine} />
          <stop offset="55%" stopColor={c.hair} />
        </linearGradient>
        <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#3a0007" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter={`url(#${uid}-soft)`}>
        {/* Back hair (long style) — moves opposite to the face for depth */}
        {long && (
          <g data-layer="backHair">
            <path d={BACK_HAIR} fill={`url(#${uid}-hair)`} />
            <path data-strand d="M128 300 C118 350 132 390 120 430" stroke={c.hairShine} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
            <path data-strand d="M372 300 C382 350 368 390 380 430" stroke={c.hairShine} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.7} />
          </g>
        )}

        {/* Body */}
        <g data-layer="body">
          <g data-breathe>
            <path
              d="M64 620 C72 522 118 452 198 434 C222 428 236 420 240 406 L260 406 C264 420 278 428 302 434 C382 452 428 522 436 620 Z"
              fill={c.shirt}
            />
            <path d="M120 520 C132 560 136 590 134 620 L96 620 C98 580 106 548 120 520 Z" fill={c.shirtShadow} />
            <path d="M380 520 C368 560 364 590 366 620 L404 620 C402 580 394 548 380 520 Z" fill={c.shirtShadow} />
          </g>
          <path d="M226 330 L226 396 C230 428 270 428 274 396 L274 330 Z" fill={c.skin} />
          <path d="M226 336 C240 356 260 356 274 336 L274 362 C258 372 242 372 226 362 Z" fill={c.skinShadow} opacity={0.7} />
          {/* front strands resting on the shoulders */}
          {long && (
            <>
              <path data-strand d={LOCK_LEFT} fill={c.hair} />
              <path data-strand d={LOCK_RIGHT} fill={c.hair} />
            </>
          )}
        </g>

        {/* Head — pivots at the neck */}
        <g data-layer="head" style={{ transformOrigin: "250px 360px" }}>
          {/* Hair cap behind the face, moving with the head, so parallax never opens a gap to the background */}
          <path
            d="M152 230 C140 140 194 92 250 92 C306 92 360 140 348 230 C352 270 336 300 318 312 L182 312 C164 300 148 270 152 230 Z"
            fill={c.hair}
          />
          <g data-layer="ears">
            <ellipse cx={168} cy={240} rx={13} ry={20} fill={c.skinShadow} />
            <ellipse cx={332} cy={240} rx={13} ry={20} fill={c.skinShadow} />
            {long && (
              <>
                <circle cx={166} cy={266} r={6} fill="none" stroke="#e8c26a" strokeWidth={2.5} />
                <circle cx={334} cy={266} r={6} fill="none" stroke="#e8c26a" strokeWidth={2.5} />
              </>
            )}
          </g>

          <path
            d="M168 210 C168 140 205 112 250 112 C295 112 332 140 332 210 C332 262 318 300 292 328 C276 345 262 352 250 352 C238 352 224 345 208 328 C182 300 168 262 168 210 Z"
            fill={`url(#${uid}-face)`}
          />

          {/* Facial features shift furthest, selling the turn; clipped so nothing slides off the face */}
          <clipPath id={`${uid}-face-clip`}>
            <path d="M168 210 C168 140 205 112 250 112 C295 112 332 140 332 210 C332 262 318 300 292 328 C276 345 262 352 250 352 C238 352 224 345 208 328 C182 300 168 262 168 210 Z" />
          </clipPath>
          <g clipPath={`url(#${uid}-face-clip)`}>
          <g data-layer="features">
            <ellipse data-blush cx={196} cy={284} rx={16} ry={8} fill="#f07f86" opacity={0.32} />
            <ellipse data-blush cx={304} cy={284} rx={16} ry={8} fill="#f07f86" opacity={0.32} />

            <g data-brow>
              <path d="M188 200 C198 189 222 187 236 194" stroke={c.hair} strokeWidth={5.5} strokeLinecap="round" fill="none" />
              <g data-brow-right>
                <path d="M264 194 C278 187 302 189 312 200" stroke={c.hair} strokeWidth={5.5} strokeLinecap="round" fill="none" />
              </g>
            </g>

            {eye(212, "l")}
            {eye(288, "r")}

            <path d="M249 262 C246 274 244 281 253 283" stroke={c.skinShadow} strokeWidth={3} strokeLinecap="round" fill="none" />

            <path data-mouth="smile" d="M229 300 C240 316 260 316 271 300 C258 305 242 305 229 300 Z" fill={c.lips} />
            <g data-mouth="open" opacity={0}>
              <path d="M225 296 C235 326 265 326 275 296 C260 302 240 302 225 296 Z" fill="#7a2a2a" />
              <path d="M231 299 C244 304 256 304 269 299 L267 306 C256 309 244 309 233 306 Z" fill="#fff" />
              <path d="M238 318 C246 322 254 322 262 318 C256 314 244 314 238 318 Z" fill="#e0767a" />
            </g>
          </g>
          </g>

          {/* Front hair */}
          <g data-layer="bangs">
            {long ? (
              <path
                d="M160 228 C150 140 198 92 256 92 C318 92 356 140 342 230 C334 192 318 162 294 146 C280 166 244 174 206 172 C186 186 170 206 160 228 Z"
                fill={`url(#${uid}-hair)`}
              />
            ) : (
              <path
                d="M158 212 C146 124 204 82 256 86 C314 90 356 132 342 212 C334 178 320 160 300 150 C280 168 232 176 190 166 C176 180 164 196 158 212 Z"
                fill={`url(#${uid}-hair)`}
              />
            )}
            <path d="M222 112 C246 104 280 108 300 122" stroke={c.hairShine} strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.75} />
          </g>
        </g>
      </g>
    </svg>
  );
}
