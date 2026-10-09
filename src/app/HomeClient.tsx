"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import BrandIntro from "@/components/intro/BrandIntro";
import Header from "@/components/navigation/Header";
import Hero from "@/components/hero/Hero";
import IntroSection from "@/components/intro/IntroSection";
import WatWeDoen from "@/components/home/WatWeDoen";
import OurExpertise from "@/components/home/OurExpertise";
import SelectedWork from "@/components/home/SelectedWork";
import DeliverablesSection from "@/components/home/DeliverablesSection";
import StatementSection from "@/components/home/StatementSection";
import OurVision from "@/components/home/OurVision";
import OurUSPs from "@/components/home/OurUSPs";
import FoundedOnAVision from "@/components/home/FoundedOnAVision";
import ContactSection from "@/components/home/ContactSection";
import FloatingContactActions from "@/components/navigation/FloatingContactActions";

const Shared3DBackground = dynamic(
  () => import("@/components/hero/Shared3DBackground"),
  { ssr: false },
);

export default function Home({
  projects,
}: {
  projects: import("@/data/work").WorkProject[];
}) {
  const [introCompleted, setIntroCompleted] = useState(false);
  const [skipHeroEntrance, setSkipHeroEntrance] = useState(false);
  const [desktop3DEnabled, setDesktop3DEnabled] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    const syncDesktop3D = () => {
      setDesktop3DEnabled(desktopQuery.matches);
    };

    syncDesktop3D();

    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", syncDesktop3D);
      return () => {
        desktopQuery.removeEventListener("change", syncDesktop3D);
      };
    }

    desktopQuery.addListener(syncDesktop3D);
    return () => {
      desktopQuery.removeListener(syncDesktop3D);
    };
  }, []);

  const handleIntroComplete = (skipped: boolean) => {
    setSkipHeroEntrance(skipped);
    setIntroCompleted(true);
  };

  return (
    <main className="page relative min-h-screen text-white flex flex-col font-sans bg-transparent">
      <BrandIntro onComplete={handleIntroComplete} />

      <Header />

      <FloatingContactActions />

      <div className="global-visual-background fixed inset-0 w-full h-[100svh] lg:h-[100dvh] z-0 overflow-hidden pointer-events-none bg-[#05080B]">
        {desktop3DEnabled ? (
          <Shared3DBackground introCompleted={introCompleted} />
        ) : null}
      </div>

      <div className="foreground relative z-10 w-full flex flex-col pointer-events-none">
        <div className="shared-background-range relative w-full">
          <Hero
            introCompleted={introCompleted}
            skipEntrance={skipHeroEntrance}
          />

          <section
            id="intro"
            className="introduction relative w-full min-h-[50svh] flex flex-col justify-center pointer-events-auto bg-transparent text-white m-0 p-0"
          >
            <IntroSection />
          </section>
        </div>

        <div className="relative w-full pointer-events-auto bg-[#030508]">
          <WatWeDoen />
        </div>

        <OurExpertise />

        <SelectedWork projects={projects} />

        <DeliverablesSection />

        <StatementSection />

        <OurVision />

        <OurUSPs />

        <FoundedOnAVision />

        <ContactSection />
      </div>
    </main>
  );
}
