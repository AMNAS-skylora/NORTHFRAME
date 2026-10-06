export type Deliverable = {
  id: number;
  slug: string;
  title: string;
  description: string;
  media: string;
  mediaType: "image" | "video";
  alt: string;
};

export const deliverables: Deliverable[] = [
  {
    id: 1,
    slug: "brand-event-design",
    title: "BRAND & EVENT DESIGN",
    description:
      "Your brand deserves to stand out. Whether it’s for a business, campaign, or event, we turn your vision into a distinctive visual identity that makes an impact. From logo design and signage to print and digital experiences, every element is crafted to work together and leave a lasting impression.",
    media: "/images/services/branding.webp",
    mediaType: "image",
    alt: "Northframe brand and event design",
  },
  {
    id: 2,
    slug: "video-photography",
    title: "VIDEO & PHOTOGRAPHY",
    description:
      "Images tell stories. We make them worth remembering. From authentic photography and compelling videos to portraits, product shoots, and promotional content, we create visuals that capture attention, communicate your story, and give your brand a voice.",
    media: "/images/services/creative-production.webp",
    mediaType: "image",
    alt: "Northframe video and photography",
  },
  {
    id: 3,
    slug: "motion-graphics",
    title: "MOTION GRAPHICS",
    description:
      "Static is fine. But motion makes brands come alive. We create engaging motion graphics, logo animations, visual effects, and dynamic content that capture attention and bring your brand to life across digital platforms.",
    media: "/images/services/creative-production.webp",
    mediaType: "image",
    alt: "Northframe motion graphics",
  },
  {
    id: 4,
    slug: "3d-graphics",
    title: "3D GRAPHICS",
    description:
      "Product visualization, architectural modeling, or lifelike impressions? A picture is worth a thousand words. It tells exactly what it needs to tell.",
    media: "/images/services/technology.webp",
    mediaType: "image",
    alt: "Northframe 3D graphics",
  },
  {
    id: 5,
    slug: "print-design-printing",
    title: "PRINT DESIGN & PRINTING",
    description:
      "Think print is old school? Think again. In a digital-first world, a well-crafted printed piece stands out. From business cards and brochures to packaging and marketing collateral, we create print designs that feel tangible, memorable, and built to leave a lasting impression.",
    media: "/images/services/strategy.webp",
    mediaType: "image",
    alt: "Northframe print design and printing",
  },
  {
    id: 6,
    slug: "web-development",
    title: "WEB DEVELOPMENT",
    description:
      "We don’t just build websites. We build digital experiences. Combining thoughtful design, seamless interactions, and smart technology, we create high-performance websites that look exceptional, feel intuitive, and help brands stand out in the digital world.",
    media: "/images/services/technology.webp",
    mediaType: "image",
    alt: "Northframe web development",
  },
  {
    id: 7,
    slug: "digital-marketing",
    title: "DIGITAL MARKETING",
    description:
      "Being seen is one thing. Being remembered is another. We create strategic digital marketing campaigns that put your brand in front of the right audience, from social media and content marketing to SEO and performance campaigns. Every move is designed to build attention, engagement, and meaningful growth.",
    media: "/images/services/digital-marketing.webp",
    mediaType: "image",
    alt: "Northframe digital marketing",
  },
];
