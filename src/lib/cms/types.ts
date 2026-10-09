import { workDetails } from "@/data/work";
export type ManagedWork = {
  slug: string;
  title: string;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
  video: string;
  published: boolean;
  featured: number;
};
export const initialWorks: ManagedWork[] = workDetails.map((p, i) => ({
  ...p,
  video: "",
  published: true,
  featured: i < 3 ? i + 1 : 0,
}));
export function validateWorks(value: unknown): ManagedWork[] {
  if (!Array.isArray(value) || value.length > 100)
    throw new Error("Provide up to 100 works.");
  const slugs = new Set<string>(),
    slots = new Set<number>();
  const text = (v: unknown, max: number) => {
    if (typeof v !== "string" || v.length > max)
      throw new Error("Invalid text field.");
    return v.trim();
  };
  const media = (v: unknown, required: boolean) => {
    const s = text(v, 2000);
    if (!s && !required) return "";
    if (
      !/^\/images\/[\w/.-]+$/.test(s) &&
      !/^https:\/\/res\.cloudinary\.com\/[\w/.,:@%+-]+$/.test(s)
    )
      throw new Error("Use a local image or Cloudinary media URL.");
    return s;
  };
  const works = value.map((v) => {
    if (!v || typeof v !== "object") throw new Error("Invalid work.");
    const p = v as Record<string, unknown>;
    const slug = text(p.slug, 100),
      title = text(p.title, 150),
      category = text(p.category, 100),
      description = text(p.description, 8000),
      imageAlt = text(p.imageAlt, 200);
    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
      slugs.has(slug) ||
      !title ||
      !category ||
      !description ||
      !imageAlt
    )
      throw new Error(
        "Each work needs a unique slug, title, category, description and image description.",
      );
    slugs.add(slug);
    if (
      typeof p.published !== "boolean" ||
      !Number.isInteger(p.featured) ||
      Number(p.featured) < 0 ||
      Number(p.featured) > 3
    )
      throw new Error("Invalid publishing or featured slot.");
    const featured = Number(p.featured);
    if (featured && (!p.published || slots.has(featured)))
      throw new Error(
        "Featured works must be published; each slot can be used once.",
      );
    if (featured) slots.add(featured);
    return {
      slug,
      title,
      category,
      description,
      imageAlt,
      image: media(p.image, true),
      video: media(p.video, false),
      published: p.published,
      featured,
    };
  });
  if (slots.size !== 3)
    throw new Error(
      "Choose exactly three published featured works (slots 1, 2 and 3).",
    );
  return works;
}
