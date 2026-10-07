import type { Metadata } from "next";
import MotionDiagnostics from "./MotionDiagnostics";

export const metadata: Metadata = {
  title: "Motion check | NORTHFRAME",
  robots: { index: false, follow: false },
};

export default function MotionCheckPage() {
  return <MotionDiagnostics build={process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local"} />;
}
