import type { Metadata, Viewport } from "next";
import { Montserrat, Poppins, Pixelify_Sans } from "next/font/google";
import "./globals.css";
import CursorTrail from "@/components/cursor/CursorTrail";
import ScrollProgress from "@/components/scroll/ScrollProgress";
import { PageTransitionProvider } from "@/components/navigation/PageTransitionProvider";
import MotionRuntime from "@/components/motion/MotionRuntime";
import MotionPreferenceControl from "@/components/motion/MotionPreferenceControl";
import { MOTION_BOOTSTRAP } from "@/components/motion/motionPreference";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const pixelifySans = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NORTHFRAME | Built for what comes next",
  description: "Creative digital agency — strategy, design, technology, and growth.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#05070B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${montserrat.variable} ${poppins.variable} ${pixelifySans.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOTSTRAP }} />
        <link
          rel="preload"
          href="/images/brand/northframe-icon.webp"
          as="image"
          type="image/webp"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#05070B] text-white">
        <PageTransitionProvider>
          <MotionRuntime />
          <MotionPreferenceControl />
          <CursorTrail />
          <ScrollProgress />
          {children}
        </PageTransitionProvider>
      </body>
    </html>
  );
}
