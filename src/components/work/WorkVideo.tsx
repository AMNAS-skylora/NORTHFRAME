"use client";
import { useEffect, useRef } from "react";
export default function WorkVideo({
  src,
  poster,
  controls = false,
  className = "",
}: {
  src: string;
  poster: string;
  controls?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden)
          video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.2 },
    );
    const visibility = () => {
      if (document.hidden) video.pause();
      else if (
        video.getBoundingClientRect().bottom > 0 &&
        video.getBoundingClientRect().top < innerHeight
      )
        video.play().catch(() => {});
    };
    observer.observe(video);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      video.pause();
    };
  }, [src]);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      controls={controls}
      muted
      loop
      playsInline
      preload="metadata"
      className={className}
    />
  );
}
