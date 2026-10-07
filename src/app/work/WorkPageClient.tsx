"use client";

import Header from "@/components/navigation/Header";
import { ProjectCard } from "@/components/work/ProjectCard";
import { workDetails } from "@/data/work";

const columns = ["lg:col-start-8", "lg:col-start-1", "lg:col-start-7"];

export default function WorkPageClient() {
  return (
    <main className="min-h-screen bg-[#05070B] text-white">
      <Header />
      <header className="mx-auto max-w-[1500px] px-6 pb-16 pt-28 sm:px-10 lg:px-16">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-[#1677FF]">Work</p>
        <h1 className="text-5xl font-bold leading-none tracking-tight sm:text-7xl">Ideas in Real Life.</h1>
      </header>
      <section aria-label="Our work" className="mx-auto grid max-w-[1500px] grid-cols-1 gap-y-16 px-6 pb-28 sm:px-10 lg:grid-cols-12 lg:gap-y-20 lg:px-16">
        {workDetails.map((project, index) => (
          <ProjectCard
            key={project.slug}
            dark
            project={{ ...project, id: index + 1, alt: project.imageAlt, desktopColumn: columns[index % 3] }}
            gridClass={`lg:col-span-4 ${columns[index % 3]}`}
          />
        ))}
      </section>
    </main>
  );
}
