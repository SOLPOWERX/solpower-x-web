"use client";

import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

/**
 * Lienzo 3D común a todas las escenas.
 * Solo dibuja mientras se ve en pantalla (al bajar a las demás secciones se detiene del todo)
 * y baja la resolución sola si el equipo no alcanza a mover la escena con fluidez.
 */
export default function Lienzo({
  movil,
  posicion,
  children,
}: {
  movil: boolean;
  posicion: [number, number, number];
  children: ReactNode;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const tope = movil ? 1.25 : 1.5;
  const [dpr, setDpr] = useState(tope);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={caja} className="h-full w-full">
      <Canvas
        frameloop={visible ? "always" : "never"}
        shadows={movil ? true : "soft"}
        dpr={dpr}
        camera={{ fov: movil ? 55 : 42, near: 0.1, far: 1500, position: posicion }}
        // Con efectos (computador) el suavizado lo hace el compositor; en celular lo hace el navegador
        gl={{ antialias: movil, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(tope)} />
        {children}
        {!movil && (
          <EffectComposer multisampling={2}>
            <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.9} luminanceSmoothing={0.25} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
