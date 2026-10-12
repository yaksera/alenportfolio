/**
 * Everything personal on the site lives here. Replace the placeholder values with your own.
 */

export type HairStyle = "long" | "short";

export const profile = {
  name: "Alex",
  fullName: "Alex Rivera",
  role: "Full-Stack Developer",
  tagline: "Crafting modern full-stack web experiences with clean code, creative motion, and scalable digital architecture.",
  location: "Kathmandu, Nepal",
  email: "hello@example.com",
  /** Put your PDF at public/resume.pdf (or point this at any URL). */
  resumeUrl: "/resume.pdf",
  available: true,

  socials: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
    { label: "Instagram", href: "https://www.instagram.com/" },
  ],

  /** Colours for the code-drawn character in the hero. */
  character: {
    hairStyle: "long" as HairStyle,
    skin: "#f5c7a6",
    skinShadow: "#e3a685",
    hair: "#3b2219",
    hairShine: "#6b3f2c",
    eyes: "#5a3520",
    lips: "#d9706b",
    shirt: "#fdf6ee",
    shirtShadow: "#e9ddd0",
  },

  about: [
    "I'm a developer who loves the space where engineering meets design. I build fast, accessible products end to end, from database schemas and APIs to the last pixel of an interaction.",
    "Lately I've been focused on React, Next.js and Django, and on adding motion that makes interfaces feel alive without getting in the way.",
  ],

  stats: [
    { value: 3, suffix: "+", label: "Years building for the web" },
    { value: 25, suffix: "+", label: "Projects shipped" },
    { value: 12, suffix: "", label: "Happy clients" },
  ],

  skills: [
    "TypeScript", "React", "Next.js", "Node.js", "Python", "Django", "REST APIs", "PostgreSQL",
    "Tailwind CSS", "GSAP", "Framer Motion", "Figma", "Docker", "Git", "Vercel", "AWS",
  ],

  experience: [
    {
      period: "2024 — Present",
      title: "Full-Stack Developer",
      company: "Freelance",
      summary: "Designing and building marketing sites, dashboards and booking systems for startups and local businesses.",
    },
    {
      period: "2023 — 2024",
      title: "Frontend Developer",
      company: "Studio Name",
      summary: "Shipped animated landing pages and a component library used across six client products.",
    },
    {
      period: "2022 — 2023",
      title: "Web Development Intern",
      company: "Company Name",
      summary: "Built internal tools with React and Django REST Framework and improved Lighthouse scores by 30%.",
    },
  ],

  projects: [
    {
      title: "Pocket Ledger",
      kind: "Fintech landing page",
      description: "A landing site for a bookkeeping app for Nepali shops, with a Django API for early-access sign-ups and scroll-driven GSAP storytelling.",
      tags: ["Next.js", "Django REST", "GSAP"],
      href: "https://github.com/yaksera/pocketledger",
      accent: "#2f6f62",
    },
    {
      title: "Brew House",
      kind: "Café website",
      description: "Menu filtering with GSAP Flip, table reservations with pre-orders, and an admin for the café team.",
      tags: ["Next.js", "Django REST", "GSAP Flip"],
      href: "https://github.com/yaksera/brewhouse",
      accent: "#7a5236",
    },
    {
      title: "Project Three",
      kind: "SaaS dashboard",
      description: "Describe a project you're proud of: the problem, what you built, and the result.",
      tags: ["React", "Charts", "PostgreSQL"],
      href: "#",
      accent: "#5b4bb7",
    },
    {
      title: "Project Four",
      kind: "Mobile-first web app",
      description: "Another highlight. Keep it to one or two sentences and link to the live site or repo.",
      tags: ["TypeScript", "PWA", "Node.js"],
      href: "#",
      accent: "#c2410c",
    },
  ],
};

export type Profile = typeof profile;
export type Project = Profile["projects"][number];
