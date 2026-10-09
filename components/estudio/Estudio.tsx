"use client";

/* Estudio de imágenes: muestra una maqueta a pantalla completa para guardarla como imagen de la web. */

import { Canvas, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useLayoutEffect } from "react";
import * as THREE from "three";
import { Fondo, Luces } from "./base";
import { maquetas, type Maqueta } from "./maquetas";

function Camara({ m }: { m: Maqueta }) {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const c = camera as THREE.PerspectiveCamera;
    c.fov = m.fov ?? 30;
    const mira = new THREE.Vector3(...m.mira);
    c.position.copy(new THREE.Vector3(...m.cam).sub(mira).multiplyScalar(m.lejos ?? 1.15).add(mira));
    c.lookAt(...m.mira);
    const [dx, dy] = m.corrimiento ?? [0, 0];
    c.setViewOffset(size.width, size.height, dx * size.width, dy * size.height, size.width, size.height);
    c.updateProjectionMatrix();
  }, [camera, size, m]);
  return null;
}

export default function Estudio({ d }: { d: string }) {
  const m = maquetas[d];
  if (!m) return <p style={{ padding: 40 }}>Maquetas: {Object.keys(maquetas).join(", ")}</p>;
  const { Escena } = m;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#030b1d" }}>
      <Canvas
        shadows="soft"
        dpr={1}
        camera={{ fov: 30, near: 0.1, far: 1000 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        <Camara m={m} />
        <Fondo {...m.fondo} />
        <Luces {...m.luz} />
        <Escena />
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur intensity={0.8} luminanceThreshold={0.9} luminanceSmoothing={0.25} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
