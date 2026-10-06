"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { createNorthframeGeometry } from "@/components/three/NorthframeGeometry";

if (typeof window !== "undefined") {
  const _warn = console.warn;
  console.warn = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Clock: This module has been deprecated")
    ) {
      return;
    }
    _warn.apply(console, args);
  };
}

function MobileFrameScheduler({
  active,
  targetFps = 30,
}: {
  active: boolean;
  targetFps?: number;
}) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    let lastPaint = 0;
    const frameInterval = 1000 / targetFps;

    const tick = (time: number) => {
      if (time - lastPaint >= frameInterval) {
        lastPaint = time;
        invalidate();
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [active, invalidate, targetFps]);

  return null;
}

function LivingStudioLighting({
  isHidden,
  isMobile,
  canHover,
  reducedMotion,
}: {
  isHidden: boolean;
  isMobile: boolean;
  canHover: boolean;
  reducedMotion: boolean;
}) {
  const leftRimRef = useRef<THREE.DirectionalLight>(null);
  const rightRimRef = useRef<THREE.DirectionalLight>(null);

  const elapsedTimeRef = useRef(0);

  useFrame((state, delta) => {
    if (isHidden) return;

    elapsedTimeRef.current += delta;
    const pointerX = !isMobile && canHover ? state.pointer.x : 0;
    const sweep = reducedMotion ? 0 : Math.sin(elapsedTimeRef.current * 0.48);
    const rightBoost = Math.max(0, -pointerX) * 0.05;
    const leftBoost = Math.max(0, pointerX) * 0.05;

    if (leftRimRef.current) {
      leftRimRef.current.intensity +=
        (0.9 + leftBoost + sweep * 0.14 - leftRimRef.current.intensity) * 0.035;
    }

    if (rightRimRef.current) {
      rightRimRef.current.intensity +=
        (1.2 + rightBoost - sweep * 0.14 - rightRimRef.current.intensity) * 0.035;
    }
  });

  return (
    <>
      <ambientLight intensity={isMobile ? 0.07 : 0.05} color="#ffffff" />

      <directionalLight
        position={[-3, 4, 4]}
        intensity={isMobile ? 2.25 : 2.6}
        color="#e2e8f0"
      />

      <directionalLight
        ref={leftRimRef}
        position={[-5, 1.5, -1.5]}
        intensity={0.9}
        color="#1677FF"
      />

      <directionalLight
        ref={rightRimRef}
        position={[5, 1.5, -1.5]}
        intensity={1.2}
        color="#1677FF"
      />
    </>
  );
}

function createFloorAlphaMap(size = 256): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) return null;

  const center = size / 2;
  const gradient = context.createRadialGradient(
    center,
    center,
    0,
    center,
    center,
    center
  );

  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.3, "rgba(255,255,255,0.62)");
  gradient.addColorStop(0.62, "rgba(255,255,255,0.12)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function AnimatedModel({
  isMobile,
  isTablet,
  isHidden,
  canHover,
  reducedMotion,
}: {
  isMobile: boolean;
  isTablet: boolean;
  isHidden: boolean;
  canHover: boolean;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const heroHeightRef = useRef(1);
  const geometry = useMemo(() => createNorthframeGeometry(), []);

  useEffect(() => {
    let lastWidth = window.innerWidth;

    const measureHero = () => {
      heroHeightRef.current =
        document.querySelector<HTMLElement>(".hero")?.offsetHeight ||
        window.innerHeight;
    };

    const handleWidthResize = () => {
      const nextWidth = window.innerWidth;
      if (Math.abs(nextWidth - lastWidth) < 2) return;
      lastWidth = nextWidth;
      measureHero();
    };

    const handleOrientation = () => {
      lastWidth = window.innerWidth;
      measureHero();
    };

    measureHero();
    window.addEventListener("orientationchange", handleOrientation);
    window.addEventListener("resize", handleWidthResize, { passive: true });

    return () => {
      window.removeEventListener("orientationchange", handleOrientation);
      window.removeEventListener("resize", handleWidthResize);
    };
  }, []);

  const frontMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#020407"),
        metalness: 0.92,
        roughness: 0.24,
        clearcoat: 0.5,
        clearcoatRoughness: 0.2,
      }),
    []
  );

  const sideMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#070B10"),
        metalness: 0.95,
        roughness: 0.16,
        clearcoat: 0.75,
        clearcoatRoughness: 0.12,
      }),
    []
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      frontMaterial.dispose();
      sideMaterial.dispose();
    };
  }, [frontMaterial, geometry, sideMaterial]);

  const responsiveScale = isMobile ? 0.7 : isTablet ? 0.84 : 1;
  const baseRotX = THREE.MathUtils.degToRad(-2.5);
  const baseRotY = THREE.MathUtils.degToRad(4.5);
  const baseY = isMobile ? 0.26 : isTablet ? 0.1 : 0;

  const elapsedTimeRef = useRef(0);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group || isHidden) return;

    elapsedTimeRef.current += delta;

    if (reducedMotion) {
      group.rotation.x += (baseRotX - group.rotation.x) * 0.08;
      group.rotation.y += (baseRotY - group.rotation.y) * 0.08;
      group.position.x += (0 - group.position.x) * 0.08;
      group.position.y += (baseY - group.position.y) * 0.08;
      group.position.z += (0 - group.position.z) * 0.08;
      group.scale.setScalar(group.scale.x + (responsiveScale - group.scale.x) * 0.08);
      return;
    }

    // A slow, automatic orbit and float make the sculpture feel alive even on
    // touch screens. The limited angles preserve the original A silhouette.
    const time = elapsedTimeRef.current;
    const orbit = Math.sin(time * 0.48);
    const float = Math.sin(time * 0.72);
    const scrollProgress = Math.min(1, Math.max(0, window.scrollY / heroHeightRef.current));

    const floatRotX = float * THREE.MathUtils.degToRad(isMobile ? 0.9 : 1.3);
    const floatRotY = orbit * THREE.MathUtils.degToRad(isMobile ? 2.3 : 3.5);
    const floatY = float * (isMobile ? 0.045 : 0.065);

    let targetRotX = baseRotX + floatRotX;
    let targetRotY = baseRotY + floatRotY + scrollProgress * THREE.MathUtils.degToRad(isMobile ? 5 : 7);
    let targetX = 0;
    let targetY = baseY + floatY + scrollProgress * (isMobile ? 0.18 : 0.24);
    let targetZ = (orbit + 1) * (isMobile ? 0.018 : 0.035) + scrollProgress * 0.12;

    if (!isMobile && canHover) {
      const pointerX = state.pointer.x;
      const pointerY = state.pointer.y;

      targetRotY += pointerX * THREE.MathUtils.degToRad(0.7);
      targetRotX -= pointerY * THREE.MathUtils.degToRad(0.5);
      targetX = pointerX * 0.015;
      targetY += pointerY * 0.012;
      targetZ += (Math.abs(pointerX) + Math.abs(pointerY)) * 0.005;
    }

    // Time-based damping keeps the pace consistent at 30, 60 and 120 fps.
    const lerp = 1 - Math.exp(-(isMobile ? 1.4 : 1.7) * Math.min(delta, 0.05));

    group.rotation.x += (targetRotX - group.rotation.x) * lerp;
    group.rotation.y += (targetRotY - group.rotation.y) * lerp;
    group.position.x += (targetX - group.position.x) * lerp;
    group.position.y += (targetY - group.position.y) * lerp;
    group.position.z += (targetZ - group.position.z) * lerp;
    const targetScale = responsiveScale * (1 + scrollProgress * 0.06);
    group.scale.setScalar(group.scale.x + (targetScale - group.scale.x) * lerp);
  });

  return (
    <group
      ref={groupRef}
      position={[0, baseY, 0]}
      scale={[responsiveScale, responsiveScale, responsiveScale]}
    >
      <mesh
        geometry={geometry}
        material={[frontMaterial, sideMaterial]}
        frustumCulled
      />
    </group>
  );
}

function FloorBackdrop({ isMobile }: { isMobile: boolean }) {
  const floorAlphaMap = useMemo(() => createFloorAlphaMap(), []);
  const floorGeometry = useMemo(() => new THREE.PlaneGeometry(32, 32), []);

  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#05080B"),
        roughness: 0.82,
        metalness: 0.12,
        alphaMap: floorAlphaMap ?? undefined,
        transparent: true,
        depthWrite: false,
      }),
    [floorAlphaMap]
  );

  useEffect(() => {
    return () => {
      floorGeometry.dispose();
      floorMaterial.dispose();
      floorAlphaMap?.dispose();
    };
  }, [floorAlphaMap, floorGeometry, floorMaterial]);

  return (
    <>
      {!isMobile && (
        <ContactShadows
          position={[0, -1.25, 0]}
          opacity={0.7}
          scale={6.5}
          blur={2.8}
          far={3}
          resolution={384}
          color="#000000"
        />
      )}

      <mesh
        geometry={floorGeometry}
        material={floorMaterial}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.26, 0]}
      />
    </>
  );
}

interface Shared3DBackgroundProps {
  introCompleted: boolean;
}

export default function Shared3DBackground({
  introCompleted,
}: Shared3DBackgroundProps) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    const width = window.innerWidth;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    return width <= 768 || (coarsePointer && width <= 1024);
  });
  const [isTablet, setIsTablet] = useState(() => {
    if (typeof window === "undefined") return false;
    const width = window.innerWidth;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const mobileLike = width <= 768 || (coarsePointer && width <= 1024);
    return !mobileLike && width > 768 && width <= 1024;
  });
  const [documentHidden, setDocumentHidden] = useState(() =>
    typeof document !== "undefined" ? document.hidden : false
  );
  const [rangeVisible, setRangeVisible] = useState(true);
  const [canHover, setCanHover] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(hover: hover) and (pointer: fine)").matches
      : false
  );
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  const [isLowEndMobile, setIsLowEndMobile] = useState(false);
  const [canRenderCanvas, setCanRenderCanvas] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth > 768 : false
  );

  useEffect(() => {
    const width = window.innerWidth;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    const mobileLike = width <= 768 || (coarsePointer && width <= 1024);

    const navigatorWithMemory = navigator as Navigator & {
      deviceMemory?: number;
      connection?: { saveData?: boolean };
    };

    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigatorWithMemory.deviceMemory;
    const saveData = Boolean(navigatorWithMemory.connection?.saveData);

    const lowEnd =
      mobileLike &&
      (cores <= 4 || (typeof memory === "number" && memory <= 4) || saveData);

    setIsLowEndMobile(lowEnd);

    if (!mobileLike) {
      setCanRenderCanvas(true);
      return;
    }

    if (!introCompleted) {
      setCanRenderCanvas(false);
      return;
    }

    // Let the CSS-native hero entrance paint first. On lower-end phones,
    // keep WebGL off the main thread a little longer so logo/text animation
    // cannot lose frames during the intro -> hero handoff.
    const delay = lowEnd ? 950 : 220;
    const timer = window.setTimeout(() => {
      requestAnimationFrame(() => {
        setCanRenderCanvas(true);
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [introCompleted]);

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncViewport = () => {
      const width = window.innerWidth;
      const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
      const mobileLike = width <= 768 || (coarsePointer && width <= 1024);

      setIsMobile(mobileLike);
      setIsTablet(!mobileLike && width > 768 && width <= 1024);
    };

    const syncHover = () => setCanHover(hoverQuery.matches);
    const syncMotion = () => setReducedMotion(motionQuery.matches);
    const syncVisibility = () => setDocumentHidden(document.hidden);

    syncViewport();
    syncHover();
    syncMotion();
    syncVisibility();

    let resizeFrame = 0;
    let lastWidth = window.innerWidth;

    const handleResize = () => {
      const nextWidth = window.innerWidth;
      if (Math.abs(nextWidth - lastWidth) < 2) return;
      lastWidth = nextWidth;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(syncViewport);
    };

    const handleOrientation = () => {
      lastWidth = window.innerWidth;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(syncViewport);
    };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleOrientation);
    document.addEventListener("visibilitychange", syncVisibility);

    const sharedRange = document.querySelector(".shared-background-range");
    const rangeObserver =
      sharedRange && "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([entry]) => setRangeVisible(entry.isIntersecting),
            { rootMargin: "160px 0px", threshold: 0 }
          )
        : null;

    if (sharedRange && rangeObserver) {
      rangeObserver.observe(sharedRange);
    }

    if (typeof hoverQuery.addEventListener === "function") {
      hoverQuery.addEventListener("change", syncHover);
      motionQuery.addEventListener("change", syncMotion);
    } else {
      hoverQuery.addListener(syncHover);
      motionQuery.addListener(syncMotion);
    }

    return () => {
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientation);
      document.removeEventListener("visibilitychange", syncVisibility);
      rangeObserver?.disconnect();

      if (typeof hoverQuery.removeEventListener === "function") {
        hoverQuery.removeEventListener("change", syncHover);
        motionQuery.removeEventListener("change", syncMotion);
      } else {
        hoverQuery.removeListener(syncHover);
        motionQuery.removeListener(syncMotion);
      }
    };
  }, []);

  const isHidden = documentHidden || !rangeVisible;

  return (
    <div className="shared-3d-background hero-a-stage fixed inset-0 z-0 h-[100svh] w-full overflow-hidden bg-[#05080B] pointer-events-none">
      <div
        aria-hidden="true"
        className="hero-side-light left-light absolute -left-[20vw] top-[35%] h-[45vh] w-[35vw] rounded-full blur-[50px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(22,119,255,0.05), rgba(22,119,255,0.015) 35%, transparent 70%)",
        }}
      />

      <div
        aria-hidden="true"
        className="hero-side-light right-light absolute -right-[18vw] top-[32%] h-[50vh] w-[38vw] rounded-full blur-[55px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(22,119,255,0.07), rgba(22,119,255,0.02) 35%, transparent 72%)",
        }}
      />

      <div className="hero-a-float h-full w-full">
        <div className="hero-a-interaction h-full w-full">
          <div
            className="hero-a-object h-full w-full transition-opacity duration-700 ease-out"
            style={{ opacity: canRenderCanvas ? 1 : 0 }}
          >
            {canRenderCanvas && (
            <Canvas
              dpr={isMobile ? 1 : [1, 1.5]}
              frameloop={isHidden ? "never" : isMobile ? "demand" : "always"}
              gl={{
                antialias: !isMobile,
                alpha: true,
                powerPreference: "high-performance",
              }}
              camera={{
                position: [0, 0, 5],
                fov: isMobile ? 40 : isTablet ? 37 : 34,
                near: 0.1,
                far: 100,
              }}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = isMobile ? 1.05 : 1.1;
                gl.outputColorSpace = THREE.SRGBColorSpace;
              }}
              className="relative z-10 h-full w-full pointer-events-none"
            >
              <MobileFrameScheduler
                active={isMobile && !isHidden}
                targetFps={isLowEndMobile ? 20 : 30}
              />

              <fog attach="fog" args={["#05080B", 4.5, 14]} />

              <LivingStudioLighting
                isHidden={isHidden}
                isMobile={isMobile}
                canHover={canHover}
                reducedMotion={reducedMotion}
              />

              <FloorBackdrop isMobile={isMobile} />

              <AnimatedModel
                isMobile={isMobile}
                isTablet={isTablet}
                isHidden={isHidden}
                canHover={canHover}
                reducedMotion={reducedMotion}
              />
            </Canvas>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
