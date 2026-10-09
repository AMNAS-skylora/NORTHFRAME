import { publicWorks } from "@/lib/cms/works";
export const dynamic = "force-dynamic";
import WorkPageClient from "./WorkPageClient";

export const metadata = {
  title: "Work | NORTHFRAME",
  description:
    "A selection of projects that turn ideas into meaningful brand experiences.",
};

export default async function WorkPage() {
  return <WorkPageClient projects={await publicWorks()} />;
}
