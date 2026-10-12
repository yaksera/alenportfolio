import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Cursor } from "@/components/cursor";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { Navbar } from "@/components/navbar";
import { Work } from "@/components/work";

export default function Home() {
  return (
    <>
      <Cursor />
      <Navbar />
      <main className="flex-1 overflow-x-clip">
        <Hero />
        <Work />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
