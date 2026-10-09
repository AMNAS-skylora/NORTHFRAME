import HomeClient from "./HomeClient";
import { publicWorks } from "@/lib/cms/works";
export const dynamic = "force-dynamic";
export default async function Home() {
  const works = (await publicWorks())
    .filter((p) => p.featured)
    .sort((a, b) => a.featured - b.featured);
  return (
    <HomeClient
      projects={works.map((p, i) => ({
        ...p,
        id: i + 1,
        alt: p.imageAlt,
        desktopColumn: "",
      }))}
    />
  );
}
