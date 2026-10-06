export interface WorkProject {
  id: number;
  slug: string;
  title: string;
  category: string;
  image: string;
  alt: string;
  desktopColumn: string;
  description?: string;
}

export interface EditorialWorkProject {
  num: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
  gridCols: string;
  rotation: string;
  bgLayerOffset: string;
  bgLayerRotation: string;
  imagePosition?: string;
}

export const workProjects: WorkProject[] = [
  {
    id: 1,
    slug: "brand-identity-system",
    title: "NORTHFRAME IDENTITY",
    category: "BRAND IDENTITY",
    image: "/images/work/work-01-branding.jpg",
    alt: "NORTHFRAME Brand Identity System",
    desktopColumn: "lg:col-span-4 lg:col-start-8",
    description:
      "A focused identity system exploring consistency, contrast and premium brand expression across physical and digital touchpoints.",
  },
  {
    id: 2,
    slug: "digital-marketing-campaign",
    title: "EDITORIAL CAMPAIGNS",
    category: "DIGITAL MARKETING",
    image: "/images/work/work-02-digital-marketing.jpg",
    alt: "NORTHFRAME Digital Marketing Showcase",
    desktopColumn: "lg:col-span-4 lg:col-start-1",
    description:
      "Campaign thinking shaped into a clear visual system for content, communication and performance-led digital rollout.",
  },
  {
    id: 3,
    slug: "creative-production-suite",
    title: "CREATIVE PRODUCTION",
    category: "CREATIVE PRODUCTION",
    image: "/images/work/work-03-creative-production.jpg",
    alt: "NORTHFRAME Creative Production Suite",
    desktopColumn: "lg:col-span-4 lg:col-start-7",
    description:
      "A production-led visual direction combining photography, motion and campaign-ready content into one consistent brand language.",
  },
];

export const editorialWorkProjects: EditorialWorkProject[] = [
  {
    num: "01",
    slug: "aurea",
    title: "AUREA",
    category: "BRAND IDENTITY",
    description:
      "A complete visual identity built around clarity, precision and premium positioning.",
    image: "/images/work/work-01-branding.jpg",
    imageAlt: "AUREA Luxury Brand Identity & Packaging",
    gridCols: "grid-cols-1 lg:grid-cols-[40%_60%]",
    rotation: "-1deg",
    bgLayerOffset: "top-[-12px] right-[-14px] bottom-[-10px] left-[-16px]",
    bgLayerRotation: "+0.8deg",
    imagePosition: "center center",
  },
  {
    num: "02",
    slug: "vyra",
    title: "VYRA",
    category: "BRAND & SIGNAGE",
    description:
      "Transforming spaces through bold branding and environmental design.",
    image: "/images/work/work-02-digital-marketing.jpg",
    imageAlt: "VYRA Architectural Signage & Environmental Design",
    gridCols: "grid-cols-1 lg:grid-cols-[58%_42%]",
    rotation: "+1deg",
    bgLayerOffset: "top-[-16px] right-[-10px] bottom-[-14px] left-[-12px]",
    bgLayerRotation: "-1.1deg",
    imagePosition: "center center",
  },
  {
    num: "03",
    slug: "nexon",
    title: "NEXON",
    category: "CAMPAIGN",
    description:
      "A high-impact campaign that connects brands with people.",
    image: "/images/work/work-03-creative-production.jpg",
    imageAlt: "NEXON Advertising & Digital Billboard Campaign",
    gridCols: "grid-cols-1 lg:grid-cols-[43%_57%]",
    rotation: "-1.2deg",
    bgLayerOffset: "top-[-10px] right-[-18px] bottom-[-12px] left-[-10px]",
    bgLayerRotation: "+1.2deg",
    imagePosition: "center center",
  },
  {
    num: "04",
    slug: "momentum",
    title: "MOMENTUM",
    category: "EVENT EXPERIENCE",
    description:
      "Immersive event experiences that engage, inspire and create lasting connections.",
    image: "/images/work/work-04-technology.jpg",
    imageAlt: "MOMENTUM Conference & Stage Experience",
    gridCols: "grid-cols-1 lg:grid-cols-[57%_43%]",
    rotation: "+0.8deg",
    bgLayerOffset: "top-[-14px] right-[-12px] bottom-[-16px] left-[-14px]",
    bgLayerRotation: "-0.9deg",
    imagePosition: "center center",
  },
  {
    num: "05",
    slug: "lume",
    title: "LUME",
    category: "DIGITAL EXPERIENCE",
    description:
      "Digital products that make complex ideas simple and human.",
    image: "/images/work/work-02-digital-marketing.jpg",
    imageAlt: "LUME Mobile Application & Digital Experience",
    gridCols: "grid-cols-1 lg:grid-cols-[41%_59%]",
    rotation: "-0.9deg",
    bgLayerOffset: "top-[-12px] right-[-16px] bottom-[-10px] left-[-12px]",
    bgLayerRotation: "+0.7deg",
    imagePosition: "center top",
  },
];

export interface WorkDetail {
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
}

export const workDetails: WorkDetail[] = [
  ...workProjects.map((project) => ({
    slug: project.slug,
    title: project.title,
    category: project.category,
    description:
      project.description ||
      "A NORTHFRAME project built around clear thinking, strong visual direction and purposeful execution.",
    image: project.image,
    imageAlt: project.alt,
  })),
  ...editorialWorkProjects.map((project) => ({
    slug: project.slug,
    title: project.title,
    category: project.category,
    description: project.description,
    image: project.image,
    imageAlt: project.imageAlt,
  })),
];

export function getWorkDetail(slug: string) {
  return workDetails.find((project) => project.slug === slug);
}
