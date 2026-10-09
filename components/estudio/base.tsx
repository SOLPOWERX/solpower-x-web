"use client";

/* Piezas del estudio de imágenes: fondo de marca, luces, isla tipo maqueta, flujos de energía y objetos comunes. */

import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { rutaRecta, texturaCeldas } from "@/components/nueva/escena/comun";

type V3 = [number, number, number];
export const ORO = "#f0a500";
export const ORO_CLARO = "#ffc23d";

/** Lienzo → textura. */
export function lienzo(w: number, h: number, dibujar: (g: CanvasRenderingContext2D) => void, repetir = false) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  dibujar(c.getContext("2d")!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repetir) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/* ---------- Fondo azul de la marca con un halo y estrellas opcionales ---------- */

const fondoVert = /* glsl */ `
varying vec3 vDir;
void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const fondoFrag = /* glsl */ `
uniform vec3 arriba; uniform vec3 abajo; uniform vec3 halo; uniform float estrellas;
varying vec3 vDir;
float h(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
void main() {
  vec3 d = normalize(vDir);
  vec3 col = mix(abajo, arriba, smoothstep(-0.35, 0.75, d.y));
  float g = pow(max(dot(d, normalize(vec3(-0.2, 0.25, -1.0))), 0.0), 6.0);
  col += halo * g * 0.55;
  vec3 q = floor(d * 260.0);
  float s = step(0.9975, h(q)) * smoothstep(0.05, 0.5, d.y) * estrellas;
  col += vec3(s);
  gl_FragColor = vec4(col, 1.0);
}`;

export function Fondo({ arriba = "#0d2b5e", abajo = "#030b1d", halo = "#3b6fd1", estrellas = 0 }: { arriba?: string; abajo?: string; halo?: string; estrellas?: number }) {
  const u = useMemo(
    () => ({ arriba: { value: new THREE.Color(arriba) }, abajo: { value: new THREE.Color(abajo) }, halo: { value: new THREE.Color(halo) }, estrellas: { value: estrellas } }),
    [arriba, abajo, halo, estrellas],
  );
  return (
    <mesh scale={300} frustumCulled={false}>
      <sphereGeometry args={[1, 48, 24]} />
      <shaderMaterial side={THREE.BackSide} depthWrite={false} uniforms={u} vertexShader={fondoVert} fragmentShader={fondoFrag} />
    </mesh>
  );
}

/* ---------- Luces de estudio ---------- */

export function Luces({ sol = [8, 12, 6], color = "#fff1d6", fuerza = 2.6, relleno = 0.55, ambiente = 0.45, borde = "#6fa8ff", radio = 12 }: { sol?: V3; color?: string; fuerza?: number; relleno?: number; ambiente?: number; borde?: string; radio?: number }) {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = ambiente;
    return () => {
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene, ambiente]);
  return (
    <>
      <directionalLight
        position={sol}
        color={color}
        intensity={fuerza}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-radio}
        shadow-camera-right={radio}
        shadow-camera-top={radio}
        shadow-camera-bottom={-radio}
        shadow-camera-near={1}
        shadow-camera-far={60}
      />
      <hemisphereLight args={["#bcd6ff", "#2a2216", relleno]} />
      <directionalLight position={[-10, 6, -12]} color={borde} intensity={1.1} />
    </>
  );
}

/* ---------- Isla tipo maqueta: césped, capas de tierra y un filo dorado ---------- */

function texturaCapas(base: string) {
  return lienzo(
    512,
    128,
    (g) => {
      const tonos = [base, "#7a5a3c", "#5f4530", "#8a6a48", "#4d3826"];
      let y = 0;
      let i = 0;
      while (y < 128) {
        const alto = 10 + ((i * 37) % 22);
        g.fillStyle = tonos[i % tonos.length];
        g.fillRect(0, y, 512, alto);
        // Piedritas
        for (let k = 0; k < 18; k++) {
          g.fillStyle = "rgba(0,0,0,.18)";
          g.beginPath();
          g.arc(((k * 97 + i * 53) % 512) + 0.5, y + ((k * 13) % alto), 1.5 + (k % 3), 0, Math.PI * 2);
          g.fill();
        }
        y += alto;
        i++;
      }
    },
    true,
  );
}

export function Isla({ r = 7, h = 1.8, tope = "#6e9a45", tierra = "#6b4f36", lados = 64 }: { r?: number; h?: number; tope?: string; tierra?: string; lados?: number }) {
  const capas = useMemo(() => {
    const t = texturaCapas(tierra);
    t.repeat.set(5, 1);
    return t;
  }, [tierra]);
  return (
    <group>
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <cylinderGeometry args={[r, r, 0.24, lados]} />
        <meshStandardMaterial color={tope} roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.24 - h / 2, 0]} castShadow>
        <cylinderGeometry args={[r - 0.02, r * 0.9, h, lados, 1, true]} />
        <meshStandardMaterial map={capas} roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.24 - h, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[r * 0.9, lados]} />
        <meshStandardMaterial color="#2a1f15" />
      </mesh>
      {/* Filo dorado de la marca */}
      <mesh position={[0, -0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r + 0.005, 0.035, 8, lados * 2]} />
        <meshStandardMaterial color={ORO} emissive={ORO} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Mancha de suelo (grava, concreto, camino) sobre la isla. */
export function Parche({ position, size, color = "#a8a59b", rot = 0 }: { position: V3; size: [number, number]; color?: string; rot?: number }) {
  return (
    <mesh position={[position[0], 0.005 + position[1], position[2]]} rotation={[-Math.PI / 2, 0, rot]} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

/* ---------- Flujo de energía: puntos de luz que corren por una ruta ---------- */

export function Flujo({ puntos, color = ORO_CLARO, n = 14, vel = 0.18, tam = 0.075, recto = false, fase = 0 }: { puntos: V3[]; color?: string; n?: number; vel?: number; tam?: number; recto?: boolean; fase?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const curva = useMemo(() => {
    const v = puntos.map((p) => new THREE.Vector3(...p));
    return recto ? rutaRecta(v, 0.25) : new THREE.CatmullRomCurve3(v, false, "catmullrom", 0.3);
  }, [puntos, recto]);
  const o = useMemo(() => new THREE.Object3D(), []);
  const linea = useMemo(() => new THREE.TubeGeometry(curva, Math.max(40, Math.round(curva.getLength() * 12)), tam * 0.22, 6, false), [curva, tam]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * vel + fase;
    for (let i = 0; i < n; i++) {
      const u = (i / n + t) % 1;
      curva.getPointAt(u, o.position);
      const e = Math.sin(u * Math.PI);
      o.scale.setScalar(0.4 + e * 0.8);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <mesh geometry={linea}>
        <meshBasicMaterial color={color} transparent opacity={0.35} toneMapped={false} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, n]} frustumCulled={false}>
        <sphereGeometry args={[tam, 12, 10]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* ---------- Paneles solares ---------- */

export function usePanelMats(marcoOscuro = false) {
  return useMemo(() => {
    const lado = new THREE.MeshStandardMaterial({ color: marcoOscuro ? "#1d2533" : "#c3ccd8", metalness: 0.8, roughness: 0.3 });
    const cara = new THREE.MeshStandardMaterial({ map: texturaCeldas(true), metalness: 0.5, roughness: 0.16 });
    const fondo = new THREE.MeshStandardMaterial({ color: "#d7dde6", roughness: 0.8 });
    return [lado, lado, cara, fondo, lado, lado];
  }, [marcoOscuro]);
}

/** Paneles en cuadrícula sobre un plano local (x a lo largo, z hacia abajo de la pendiente). */
export function Paneles({ position = [0, 0, 0], rotation = [0, 0, 0], cols, filas, a = 1, l = 1.7, sep = 0.04, marcoOscuro = false }: { position?: V3; rotation?: V3; cols: number; filas: number; a?: number; l?: number; sep?: number; marcoOscuro?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mats = usePanelMats(marcoOscuro);
  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    let k = 0;
    for (let f = 0; f < filas; f++)
      for (let c = 0; c < cols; c++) {
        o.position.set((c - (cols - 1) / 2) * (a + sep), 0, (f - (filas - 1) / 2) * (l + sep));
        o.updateMatrix();
        ref.current!.setMatrixAt(k++, o.matrix);
      }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [cols, filas, a, l, sep]);
  return (
    <group position={position} rotation={rotation}>
      <instancedMesh ref={ref} args={[undefined, undefined, cols * filas]} material={mats} castShadow receiveShadow>
        <boxGeometry args={[a, 0.045, l]} />
      </instancedMesh>
    </group>
  );
}

/** Mesa solar en suelo: paneles inclinados sobre postes con su dado. */
export function MesaSolar({ position, rotY = 0, cols = 6, filas = 2, tilt = 0.32, altura = 0.55 }: { position: V3; rotY?: number; cols?: number; filas?: number; tilt?: number; altura?: number }) {
  const prof = filas * 1.74;
  const subida = Math.sin(tilt) * prof;
  const nx = Math.max(2, Math.ceil(cols / 2.5) + 1);
  const xs = Array.from({ length: nx }, (_, i) => (i / (nx - 1) - 0.5) * (cols * 1.04 - 0.6));
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <Paneles position={[0, altura + subida / 2 + 0.06, 0]} rotation={[tilt, 0, 0]} cols={cols} filas={filas} />
      {xs.map((x) => (
        <group key={x}>
          {([
            [prof * 0.38, altura],
            [-prof * 0.38, altura + subida * 0.88],
          ] as [number, number][]).map(([z, hh], i) => (
            <group key={i}>
              <mesh position={[x, hh / 2, z * Math.cos(tilt)]} castShadow>
                <boxGeometry args={[0.07, hh, 0.07]} />
                <meshStandardMaterial color="#a3acb7" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[x, 0.06, z * Math.cos(tilt)]}>
                <cylinderGeometry args={[0.12, 0.14, 0.12, 10]} />
                <meshStandardMaterial color="#b4b1a8" roughness={0.9} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ---------- Poste de red con crucetas y aisladores ---------- */

export function Poste({ position, altura = 6, transformador = false }: { position: V3; altura?: number; transformador?: boolean }) {
  return (
    <group position={position}>
      <mesh position={[0, altura / 2, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.14, altura, 12]} />
        <meshStandardMaterial color="#c9c4b8" roughness={0.85} />
      </mesh>
      <mesh position={[0, altura - 0.25, 0]} castShadow>
        <boxGeometry args={[0.12, 0.12, 1.9]} />
        <meshStandardMaterial color="#6f7a86" metalness={0.6} />
      </mesh>
      {[-0.8, 0, 0.8].map((z) => (
        <mesh key={z} position={[0, altura - 0.08, z]}>
          <cylinderGeometry args={[0.05, 0.08, 0.24, 10]} />
          <meshStandardMaterial color="#7a4a2c" roughness={0.3} />
        </mesh>
      ))}
      {transformador && (
        <group position={[0.38, altura - 1.6, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.3, 0.3, 0.9, 16]} />
            <meshStandardMaterial color="#9aa5b1" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.06, 16]} />
            <meshStandardMaterial color="#7d8894" metalness={0.5} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/** Conductores con catenaria entre puntos (pueden salir de la isla). */
export function Conductores({ tramos, color = "#2b2620", grosor = 0.025 }: { tramos: [V3, V3][]; color?: string; grosor?: number }) {
  const geos = useMemo(
    () =>
      tramos.map(([a, b]) => {
        const A = new THREE.Vector3(...a);
        const B = new THREE.Vector3(...b);
        const pts = Array.from({ length: 16 }, (_, i) => {
          const t = i / 15;
          const p = A.clone().lerp(B, t);
          p.y -= A.distanceTo(B) * 0.045 * 4 * t * (1 - t);
          return p;
        });
        return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, grosor, 6, false);
      }),
    [tramos, grosor],
  );
  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- Árbol low-poly ---------- */

export function Arbol({ position, s = 1, tono = 0 }: { position: V3; s?: number; tono?: number }) {
  const verdes = ["#4f8a34", "#3f7a2c", "#5f9a3a"];
  return (
    <group position={position} scale={s}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 1.2, 6]} />
        <meshStandardMaterial color="#5a4632" roughness={1} />
      </mesh>
      <mesh position={[0, 1.65, 0]} castShadow>
        <icosahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial color={verdes[tono % 3]} roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

/* ---------- Casco de ingeniero ---------- */

export function Casco({ position, rotation = [0, 0, 0], s = 1, color = "#e6e9ee" }: { position: V3; rotation?: V3; s?: number; color?: string }) {
  return (
    <group position={position} rotation={rotation} scale={s}>
      <mesh scale={[1, 1.05, 1.18]} castShadow>
        <sphereGeometry args={[0.5, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      {/* Ala con visera al frente */}
      <mesh position={[0, 0.02, 0.08]} scale={[1, 1, 1.22]} castShadow>
        <cylinderGeometry args={[0.55, 0.56, 0.035, 40]} />
        <meshPhysicalMaterial color={color} roughness={0.25} clearcoat={1} />
      </mesh>
      {/* Nervio central y franja dorada */}
      <mesh position={[0, 0.5, 0]} scale={[1, 1, 1.18]}>
        <torusGeometry args={[0.07, 0.035, 8, 24, Math.PI]} />
        <meshPhysicalMaterial color={color} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.14, 0]} scale={[1, 1, 1.18]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.49, 0.025, 8, 48]} />
        <meshStandardMaterial color={ORO} emissive={ORO} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

/* ---------- Ventanas iluminadas ---------- */

export function useVentanas(intensidad = 1.6) {
  return useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ffe6b0", emissive: "#ffc56a", emissiveIntensity: intensidad, toneMapped: false }),
    [intensidad],
  );
}

export { RoundedBox };
