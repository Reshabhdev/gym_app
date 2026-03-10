import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="relative min-h-screen">
      <HeroGeometric
        title1="Welcome to"
        title2="Gym AI App"
      />
      {/* CTA Button placed over the Hero Section securely */}
      <div className="absolute bottom-[20%] left-0 right-0 z-20 flex justify-center">
        <Link href="/form">
          <Button size="lg" className="rounded-full px-8 py-6 text-lg tracking-wide shadow-2xl shadow-rose-500/20 bg-white text-[#030303] hover:bg-white/90 transition-all duration-300">
            Get Started Now
          </Button>
        </Link>
      </div>
    </main>
  );
}
