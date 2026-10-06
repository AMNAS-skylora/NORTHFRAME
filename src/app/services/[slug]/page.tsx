import { notFound } from "next/navigation";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";
import Image from "next/image";
import { services } from "@/data/services";
import Header from "@/components/navigation/Header";

export function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);

  if (!service) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#05070B] text-white flex flex-col font-sans selection:bg-[#1677FF] selection:text-white relative overflow-x-hidden">
      <Header />

      <div className="w-full max-w-7xl mx-auto px-[max(1rem,env(safe-area-inset-left))] sm:px-10 lg:px-12 pt-[max(6.5rem,env(safe-area-inset-top))] sm:pt-36 pb-[max(4rem,env(safe-area-inset-bottom))] flex flex-col gap-10 sm:gap-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3">
          <TransitionLink
            href="/#wat-we-doen"
            className="font-mono text-xs text-white/60 lg:hover:text-white tracking-widest uppercase transition-colors inline-flex items-center gap-2"
          >
            ← Back to What We Do
          </TransitionLink>
          <span className="text-white/20 font-mono text-xs">/</span>
          <span className="font-mono text-xs text-[#1677FF] font-bold tracking-widest uppercase">
            {service.number}
          </span>
        </div>

        {/* Service Header Info */}
        <div className="flex flex-col gap-6 max-w-4xl">
          <h1 className="font-pixel text-4xl sm:text-6xl md:text-7xl text-white uppercase tracking-tight leading-none drop-shadow-md">
            {service.title}
          </h1>

          {(service.description || service.paragraph) && (
            <p className="font-poppins text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
              {service.description || service.paragraph}
            </p>
          )}
        </div>

        {/* Deliverables / Capabilities List */}
        {service.items && service.items.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="font-mono text-xs text-white/50 tracking-widest uppercase">
              Core Capabilities & Deliverables
            </h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {service.items.map((item, idx) => (
                <span
                  key={idx}
                  className="font-mono text-xs sm:text-sm uppercase tracking-wider text-slate-200 bg-white/5 border border-white/10 px-3.5 py-1.5 backdrop-blur-md"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Service Showcase Image */}
        {service.image && (
          <div className="relative w-full h-64 sm:h-[500px] overflow-hidden border border-white/10 bg-[#080E18] mt-4">
            <Image
              src={service.image}
              alt={service.imageAlt || service.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-transparent to-transparent opacity-60" />
          </div>
        )}
      </div>
    </main>
  );
}
