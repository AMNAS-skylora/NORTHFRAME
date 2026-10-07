import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/work/ProjectCard";
import Header from "@/components/navigation/Header";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";
import { getWorkDetail, workDetails } from "@/data/work";

interface WorkDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return workDetails.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getWorkDetail(slug);

  if (!project) {
    return {
      title: "Work | NORTHFRAME",
    };
  }

  return {
    title: `${project.title} | NORTHFRAME`,
    description: project.description,
  };
}

export default async function WorkDetailPage({
  params,
}: WorkDetailPageProps) {
  const { slug } = await params;
  const project = getWorkDetail(slug);

  if (!project) notFound();
  const nextProject = workDetails[(workDetails.findIndex((item) => item.slug === slug) + 1) % workDetails.length];

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#05070B] text-white selection:bg-[#1677FF] selection:text-white">
      <Header />

      <section data-project-cover={project.slug} aria-label={`${project.title} project cover`} className="relative h-[100svh] min-h-[100svh] w-full overflow-hidden bg-[#0A0C0E] supports-[height:100dvh]:h-[100dvh] supports-[height:100dvh]:min-h-[100dvh]">
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/25" />
        <nav aria-label="Project navigation" className="absolute right-[max(1.1rem,env(safe-area-inset-right))] top-20 z-30 flex w-[156px] flex-col gap-2 sm:right-8 sm:top-24">
          <TransitionLink href="/work" aria-label="Back to Work" className="flex min-h-11 w-full items-center justify-center gap-2.5 bg-white px-3 py-3 font-mono text-[11px] uppercase leading-none tracking-[0.04em] text-black transition-colors hover:bg-[#1677FF] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1677FF]">
            <span aria-hidden="true" className="inline-flex w-4 shrink-0 justify-center text-base leading-none">←</span><span>Back to Work</span>
          </TransitionLink>
          <TransitionLink href={`/work/${nextProject.slug}`} className="flex min-h-11 w-full items-center justify-center gap-2.5 bg-white px-3 py-3 font-mono text-[11px] uppercase leading-none tracking-[0.04em] text-black transition-colors hover:bg-[#1677FF] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1677FF]">
            <span>Next case</span><span aria-hidden="true" className="inline-flex w-4 shrink-0 justify-center text-base leading-none">→</span>
          </TransitionLink>
        </nav>
        <header className="absolute inset-x-0 bottom-0 z-10 px-[max(1.1rem,env(safe-area-inset-left))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-10 sm:pb-12 lg:px-16 lg:pb-16">
          <span className="inline-block bg-[#1677FF] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white sm:text-xs">
            {project.category}
          </span>
          <h1 className="mt-3 max-w-6xl break-words font-sans text-[clamp(2.25rem,8vw,7.5rem)] font-bold uppercase leading-[0.95] tracking-[-0.04em] text-white">
            {project.title}
          </h1>
        </header>
      </section>

      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-10 px-[max(1.1rem,env(safe-area-inset-left))] py-12 sm:px-10 sm:py-20 lg:px-16">
        <section aria-label="Project overview" className="grid gap-5 md:grid-cols-[1fr_2fr] md:gap-12">
          <h2 className="font-mono text-xs uppercase tracking-widest text-[#1677FF]">Project overview</h2>
          <p className="max-w-3xl font-poppins text-base font-normal leading-relaxed text-white/80 sm:text-lg md:text-xl">
            {project.description}
          </p>
        </section>

        <div className="flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p className="max-w-xl font-sans text-sm leading-relaxed text-white/50 sm:text-base">
            Strategy, design and production are treated as one connected system so the final experience stays consistent across every touchpoint.
          </p>

          <TransitionLink
            href="/#contact"
            className="inline-flex min-h-[44px] items-center bg-[#1677FF] px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition-opacity lg:hover:opacity-80"
          >
            Start a project →
          </TransitionLink>
        </div>
      </div>
      <section aria-label="Next case" className="mx-auto grid w-full max-w-[1500px] gap-8 border-t border-white/10 px-6 py-20 sm:px-10 lg:grid-cols-12 lg:px-16">
        <h2 className="text-4xl font-bold uppercase lg:col-span-5">Next case →</h2>
        <ProjectCard
          key={nextProject.slug}
          dark
          project={{ ...nextProject, id: 1, alt: nextProject.imageAlt, desktopColumn: "lg:col-start-8" }}
          gridClass="lg:col-span-4 lg:col-start-8"
        />
      </section>
    </main>
  );
}
