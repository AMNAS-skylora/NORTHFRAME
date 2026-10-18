export interface Service {
  id: number;
  slug: string;
  number: string;
  title: string;
  displayLines: string[];
  items: string[];
  description?: string;
  paragraph?: string;
  image: string;
  /** Optional homepage Services-stage video. Detail pages retain the image. */
  video?: string;
  imageAlt?: string;
  objectPosition?: string;
}

export const services: Service[] = [
  {
    id: 1,
    slug: "brand-identity",
    number: "01",
    title: "BRAND IDENTITY",
    displayLines: ["BRAND", "IDENTITY"],
    items: [
      "Logo Design",
      "Brand Books",
      "Print Design",
      "Package Design",
      "Motion Graphics",
    ],
    description:
      "Identity built with intent, so your business looks as established as it is. We bring together brand identity, logo design, packaging design and brand guidelines to create a consistent presence.",
    paragraph:
      "Identity built with intent, so your business looks as established as it is. We bring together brand identity, logo design, packaging design and brand guidelines to create a consistent presence.",
    image: "/images/wedo/branding.webp",
    video: "/videos/wedo/branding.WebM",
    imageAlt: "Brand Identity showcase with refined design identity",
    objectPosition: "center center",
  },
  {
    id: 2,
    slug: "strategy",
    number: "02",
    title: "STRATEGY",
    displayLines: ["STRATEGY"],
    items: [
      "Brand Strategy",
      "Marketing Strategy",
      "Growth Strategy",
      "Market Research",
      "Brand Positioning",
    ],
    description:
      "Clear direction before execution. Through brand strategy, marketing strategy, business growth strategy and market research, we make insight-driven decisions that give every rupee spent a purpose.",
    paragraph:
      "Clear direction before execution. Through brand strategy, marketing strategy, business growth strategy and market research, we make insight-driven decisions that give every rupee spent a purpose.",
    image: "/images/wedo/strategy.webp",
    imageAlt: "Strategy workspace with planning tools and insights",
    objectPosition: "center center",
  },
  {
    id: 3,
    slug: "digital-marketing",
    number: "03",
    title: "DIGITAL MARKETING",
    displayLines: ["DIGITAL", "MARKETING"],
    items: [
      "Social Media",
      "Content Marketing",
      "Performance Marketing",
      "Campaign Management",
      "SEO",
    ],
    description:
      "Performance-led campaigns that turn attention into real enquiries and revenue. Our work brings together social media marketing, content marketing, campaign management, performance marketing and SEO.",
    paragraph:
      "Performance-led campaigns that turn attention into real enquiries and revenue. Our work brings together social media marketing, content marketing, campaign management, performance marketing and SEO.",
    image: "/images/wedo/digital-marketing.webp",
    video: "/videos/wedo/digital-marketing.webM",
    imageAlt: "Digital marketing analytics and performance metrics",
    objectPosition: "center center",
  },
  {
    id: 4,
    slug: "web-design-digital-experiences",
    number: "04",
    title: "WEB DESIGN & DIGITAL EXPERIENCES",
    displayLines: ["WEB DESIGN", "& DIGITAL", "EXPERIENCES"],
    items: [
      "UI/UX",
      "E-commerce",
      "Landing Pages",
      "Marketing Automation",
      "AI Solutions",
    ],
    description:
      "Everything that carries your brand online, built to load fast, work on every device and turn visits into enquiries. We deliver websites, ecommerce, landing pages, marketing automation and AI solutions.",
    paragraph:
      "Everything that carries your brand online, built to load fast, work on every device and turn visits into enquiries. We deliver websites, ecommerce, landing pages, marketing automation and AI solutions.",
    image: "/images/wedo/technology.webp",
    video: "/videos/wedo/technology.webM",
    imageAlt: "Technology and website development interface",
    objectPosition: "center center",
  },
  {
    id: 5,
    slug: "creative-production",
    number: "05",
    title: "CREATIVE PRODUCTION",
    displayLines: ["CREATIVE", "PRODUCTION"],
    items: [
      "Video Production",
      "Reels Production",
      "Product Photography",
      "Model Photography",
      "Motion Graphics",
    ],
    description:
      "High-impact content produced in-house for a professional brand presence. We create TV commercials, conceptual ads, promo videos, reels and corporate videos, alongside product shoots, model shoots and motion graphics.",
    paragraph:
      "High-impact content produced in-house for a professional brand presence. We create TV commercials, conceptual ads, promo videos, reels and corporate videos, alongside product shoots, model shoots and motion graphics.",
    image: "/images/wedo/creative-production.webp",
    imageAlt: "Creative production video camera studio setting",
    objectPosition: "center center",
  },
];
