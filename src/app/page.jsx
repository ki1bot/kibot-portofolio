import { getPortfolioData } from "@/lib/portfolio-api";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import { AnimatedBackground } from "@/components/animations/AnimatedBackground";
import { BackToTop } from "@/components/animations/BackToTop";

import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { PortfolioShowcaseSection } from "@/components/sections/PortfolioShowcaseSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ContactSection } from "@/components/sections/ContactSection";

export const dynamic = "force-static";
export const revalidate = 300;
export const fetchCache = "force-cache";

export default async function HomePage() {
  const { projects, certificates, comments } = await getPortfolioData();

  return (
    <main className="min-h-screen bg-transparent">
      <AnimatedBackground />
      <BackToTop />

      <Navbar />

      <HeroSection />

      <ExperienceSection />

      <AboutSection projects={projects} certificates={certificates} />

      <PortfolioShowcaseSection
        projects={projects}
        certificates={certificates}
      />

      <ContactSection comments={comments} />

      <Footer />
    </main>
  );
}
