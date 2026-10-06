import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
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

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#05070B] text-white selection:bg-[#1677FF] selection:text-white">
      <Header />

      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-8 px-[max(1rem,env(safe-area-inset-left))] pb-[max(4rem,env(safe-area-inset-bottom))] pt-[max(6.5rem,env(safe-area-inset-top))] sm:gap-10 sm:px-10 sm:pt-36 lg:px-16">
        <div className="flex items-center gap-3">
          <TransitionLink
            href="/work"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-white/60 transition-colors lg:hover:text-white"
          >
            ← Back to Work
          </TransitionLink>

          <span className="font-mono text-xs text-white/20">/</span>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1677FF]">
            {project.category}
          </span>
        </div>

        <header className="max-w-5xl">
          <h1 className="font-sans text-[clamp(2.6rem,8vw,7.5rem)] font-bold uppercase leading-[0.92] tracking-[-0.05em] text-white">
            {project.title}
          </h1>

          <p className="mt-6 max-w-3xl font-poppins text-base font-normal leading-relaxed text-white/70 sm:text-lg md:text-xl">
            {project.description}
          </p>
        </header>

        <div
          className="relative mt-2 min-h-[320px] w-full overflow-hidden bg-[#0A0C0E] sm:min-h-[520px] lg:min-h-[680px]"
          style={{
            clipPath:
              "polygon(4% 0, 100% 0, 100% 100%, 0 100%, 0 4%)",
          }}
        >
          <Image
            src={project.image}
            alt={project.imageAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1600px) 92vw, 1440px"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05070B]/45 via-transparent to-transparent" />
        </div>

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
    </main>
  );
}
