"use client";

import React from "react";
import { TransitionLink } from "@/components/navigation/PageTransitionProvider";

export interface ServiceItemData {
  id: string;
  name: string;
  href: string;
}

export const defaultServices: ServiceItemData[] = [
  { id: "strategy", name: "STRATEGY", href: "/services/strategy" },
  { id: "brand-identity", name: "BRAND IDENTITY", href: "/services/brand-identity" },
  {
    id: "digital-marketing",
    name: "DIGITAL MARKETING",
    href: "/services/digital-marketing",
  },
  {
    id: "technology",
    name: "TECHNOLOGY",
    href: "/services/web-design-digital-experiences",
  },
  {
    id: "creative-production",
    name: "CREATIVE PRODUCTION",
    href: "/services/creative-production",
  },
];

interface ServiceListProps {
  services?: ServiceItemData[];
  serviceItemsRef?: React.MutableRefObject<(HTMLAnchorElement | null)[]>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ServiceList({
  services = defaultServices,
  serviceItemsRef,
  containerRef,
}: ServiceListProps) {
  return (
    <div
      ref={containerRef}
      className="service-list pointer-events-auto select-none shrink-0"
    >
      <nav aria-label="Disciplines">
        <ul className="flex flex-col items-start gap-[3px] m-0 p-0 list-none">
          {services.map((service, idx) => (
            <li key={service.id} className="m-0 p-0">
              <TransitionLink
                ref={(element) => {
                  if (serviceItemsRef) {
                    serviceItemsRef.current[idx] = element;
                  }
                }}
                href={service.href}
                className="service-item cursor-pointer overflow-hidden"
              >
                <span className="service-item-text block will-change-transform">
                  {service.name}
                </span>
              </TransitionLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
