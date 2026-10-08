"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { Arboles, Cables, Cielo, Terreno, c01, lerp, texturaCeldas, tramo, type Momento, type Zona } from "./comun";

/*
 * Página Hogares: una casa moderna con el techo vacío.
 * Al bajar: los paneles se instalan → la energía baja al inversor y la batería se llena → se carga el carro
 * → de noche se va la luz en el barrio, pero la casa sigue encendida.
 */

type Raton = MutableRefObject<{ x: number; y: number }>;
type Props = { progress: MotionValue<number>; raton: Raton; movil: boolean };

// Casa principal (dos pisos), techo a dos aguas con la cara solar mirando a la calle (+z)
const W = 12;
const D = 9;
const H = 6.4;
const PEND = 0.45;
const SUBE = (D / 2) * Math.tan(PEND);
const techoY = (z: number) => H + SUBE - Math.abs(z) * Math.tan(PEND);

const zonas: Zona[] = [
  { x0: -70, x1: 70, z0: -45, z1: 15, color: "#5d7f3c" }, // barrio
  { x0: -220, x1: 220, z0: 16, z1: 23, color: "#3b3d41" }, // calle
  { x0: -70, x1: 70, z0: 24, z1: 48, color: "#5d7f3c" }, // barrio del frente
];

const dia: Momento[] = [
  { p: 0, arriba: "#0b1d45", horizonte: "#ff8a3d", sol: "#ff9a3c", luz: 1.6 },
  { p: 0.3, arriba: "#2a5fae", horizonte: "#ffc996", sol: "#ffd9a0", luz: 2.6 },
  { p: 0.6, arriba: "#2f74d6", horizonte: "#d4e8ff", sol: "#fff4dc", luz: 3.0 },
  { p: 0.8, arriba: "#18306a", horizonte: "#ff9e4a", sol: "#ffb347", luz: 1.8 },
  { p: 1, arriba: "#040a1c", horizonte: "#2c1e3a", sol: "#ff6a2a", luz: 0.35 },
];

const instala = (p: number, d: number) => tramo(p, 0.16 + d * 0.2, 0.2 + d * 0.2);
const noche = (p: number) => tramo(p, 0.74, 0.92);
/** Red del barrio: normal, titila y se cae al final. */
function red(p: number, t: number) {
  if (p < 0.86) return 1;
  if (p < 0.91) return Math.sin(t * 40) > 0.2 ? 1 : 0.1;
  return 0;
}

/* ---------- Paneles del techo ---------- */

function TechoSolar({ progress }: { progress: MotionValue<number> }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mats = useMemo(() => {
    const lado = new THREE.MeshStandardMaterial({ color: "#1d2533", metalness: 0.7, roughness: 0.35 });
    const cara = new THREE.MeshStandardMaterial({ map: texturaCeldas(true), metalness: 0.45, roughness: 0.18 });
    const fondo = new THREE.MeshStandardMaterial({ color: "#d7dde6", roughness: 0.8 });
    return [lado, lado, cara, fondo, lado, lado];
  }, []);
  const paneles = useMemo(() => {
    const out: { x: number; z: number; d: number }[] = [];
    [1.15, 2.85].forEach((z, f) => {
      for (let i = 0; i < 8; i++) out.push({ x: -3.7 + i * 1.06, z, d: (f * 8 + i) / 16 });
    });
    return out;
  }, []);
  const m = useMemo(() => new THREE.Object3D(), []);
  const ultimo = useRef(-1);
  useFrame(() => {
    const p = progress.get();
    if (Math.abs(p - ultimo.current) < 0.0004) return;
    ultimo.current = p;
    paneles.forEach((q, i) => {
      const a = instala(p, q.d);
      m.position.set(q.x, techoY(q.z) + 0.22 + (1 - a) * 7, q.z);
      m.rotation.set(PEND + (1 - a) * 0.7, (1 - a) * 1.2, 0);
      const e = a < 0.01 ? 0.0001 : lerp(0.5, 1, a);
      m.scale.set(e, e, e);
      m.updateMatrix();
      ref.current!.setMatrixAt(i, m.matrix);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, paneles.length]} material={mats} castShadow receiveShadow frustumCulled={false}>
      <boxGeometry args={[1.0, 0.04, 1.68]} />
    </instancedMesh>
  );
}

/* ---------- La casa ---------- */

function Casa({ progress }: { progress: MotionValue<number> }) {
  const ventanas = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#9fc3e6", emissive: "#ffcf7a", emissiveIntensity: 0, metalness: 0.6, roughness: 0.08, toneMapped: false }),
    [],
  );
  const madera = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "#9a6a42";
    g.fillRect(0, 0, 128, 128);
    for (let x = 0; x < 128; x += 8) {
      g.fillStyle = x % 16 ? "#87593a" : "#a8774c";
      g.fillRect(x, 0, 6, 128);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 2);
    return t;
  }, []);
  useFrame(() => {
    // La casa siempre tiene luz (sol y batería); de noche se nota
    ventanas.emissiveIntensity = 0.05 + noche(progress.get()) * 1.8;
  });
  const blanco = <meshStandardMaterial color="#f2efe9" roughness={0.75} />;
  const techo = <meshStandardMaterial color="#3a3f48" roughness={0.6} metalness={0.2} />;

  return (
    <group>
      {/* Volumen principal */}
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        {blanco}
      </mesh>
      {/* Remate de madera en la fachada */}
      <mesh position={[-3.6, H / 2, D / 2 + 0.06]} castShadow>
        <boxGeometry args={[4.4, H, 0.12]} />
        <meshStandardMaterial map={madera} roughness={0.7} />
      </mesh>
      {/* Ventanales */}
      <mesh position={[2.4, 1.6, D / 2 + 0.05]} material={ventanas}>
        <boxGeometry args={[6, 2.4, 0.06]} />
      </mesh>
      <mesh position={[2.4, 4.7, D / 2 + 0.05]} material={ventanas}>
        <boxGeometry args={[6, 1.7, 0.06]} />
      </mesh>
      <mesh position={[-3.6, 4.7, D / 2 + 0.13]} material={ventanas}>
        <boxGeometry args={[2.6, 1.5, 0.06]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2 + 0.05), 4.6, 0]} material={ventanas}>
          <boxGeometry args={[0.06, 1.5, 3]} />
        </mesh>
      ))}
      {/* Puerta y balcón */}
      <mesh position={[-1, 1.15, D / 2 + 0.07]}>
        <boxGeometry args={[1.2, 2.3, 0.08]} />
        <meshStandardMaterial color="#2d2a26" roughness={0.5} />
      </mesh>
      <mesh position={[2.4, 3.25, D / 2 + 0.8]} castShadow>
        <boxGeometry args={[6.4, 0.18, 1.6]} />
        {blanco}
      </mesh>
      <mesh position={[2.4, 3.8, D / 2 + 1.55]}>
        <boxGeometry args={[6.4, 0.9, 0.04]} />
        <meshStandardMaterial color="#cfe3f5" transparent opacity={0.35} roughness={0.05} />
      </mesh>
      {/* Techo a dos aguas */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, H + SUBE / 2, (s * D) / 4]} rotation={[s * PEND, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[W + 0.8, 0.22, D / 2 / Math.cos(PEND) + 0.5]} />
          {techo}
        </mesh>
      ))}
      {/* Hastiales (triángulos del techo) */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2 - 0.01), H, 0]} rotation={[0, s * Math.PI / 2, 0]}>
          <shapeGeometry
            args={[
              new THREE.Shape([new THREE.Vector2(-D / 2, 0), new THREE.Vector2(D / 2, 0), new THREE.Vector2(0, SUBE)]),
            ]}
          />
          <meshStandardMaterial color="#f2efe9" roughness={0.75} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Chimenea */}
      <mesh position={[-4, H + SUBE, -1.6]} castShadow>
        <boxGeometry args={[0.8, 1.6, 0.8]} />
        <meshStandardMaterial color="#b9b2a6" roughness={0.9} />
      </mesh>

      {/* Garaje con techo plano */}
      <group position={[W / 2 + 3.2, 0, 1]}>
        <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.4, 3.4, 7]} />
          {blanco}
        </mesh>
        <mesh position={[0, 3.5, 0]} castShadow>
          <boxGeometry args={[6.8, 0.2, 7.4]} />
          {techo}
        </mesh>
        <mesh position={[0, 1.4, 3.52]}>
          <boxGeometry args={[4.6, 2.6, 0.06]} />
          <meshStandardMaterial color="#5b616b" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>

      {/* Andén, entrada de carro, cerca viva y jardín */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2 + 3.2, 0.03, 9.5]} receiveShadow>
        <planeGeometry args={[5.6, 12]} />
        <meshStandardMaterial color="#b8b4aa" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1, 0.03, 9.5]} receiveShadow>
        <planeGeometry args={[1.6, 12]} />
        <meshStandardMaterial color="#c9c3b6" roughness={0.9} />
      </mesh>
      {[
        [-9.5, 14.2, 15, 0.9],
        [-15.4, 3, 0.9, 23],
        [17.4, 3, 0.9, 23],
      ].map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.55, z]} castShadow>
          <boxGeometry args={[w, 1.1, d]} />
          <meshStandardMaterial color="#3f6a2c" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- Inversor, batería con nivel de carga y cargador del carro ---------- */

function Equipos({ progress }: { progress: MotionValue<number> }) {
  const segs = useMemo(
    () => Array.from({ length: 5 }, () => new THREE.MeshStandardMaterial({ color: "#1a2a1e", emissive: "#3dff8a", emissiveIntensity: 0, toneMapped: false })),
    [],
  );
  const cuerpo = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f6f8fb", metalness: 0.15, roughness: 0.26 }), []);
  const frente = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1b2230", metalness: 0.4, roughness: 0.25 }), []);
  const cargador = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3dd2ff", emissive: "#3dd2ff", emissiveIntensity: 0.3, toneMapped: false }), []);
  useFrame(({ clock }) => {
    const p = progress.get();
    // Se carga de día y baja un poco cuando respalda la casa de noche
    const carga = tramo(p, 0.42, 0.72) - tramo(p, 0.9, 1) * 0.35;
    segs.forEach((s, i) => {
      const lleno = c01(carga * 5 - i);
      s.emissiveIntensity = lleno * (1.6 + (lleno < 1 ? Math.sin(clock.elapsedTime * 5) * 0.8 : 0));
    });
    cargador.emissiveIntensity = 0.3 + tramo(p, 0.6, 0.66) * (1 - tramo(p, 0.84, 0.9)) * (2 + Math.sin(clock.elapsedTime * 3));
  });
  const x = W / 2 + 6.45; // pared exterior del garaje
  return (
    <group>
      {/* Inversor */}
      <group position={[x, 2.4, -0.6]} rotation={[0, Math.PI / 2, 0]}>
        <RoundedBox args={[0.7, 0.85, 0.22]} radius={0.05} smoothness={3} material={cuerpo} castShadow />
        <mesh position={[0, 0.22, 0.115]} material={frente}>
          <boxGeometry args={[0.38, 0.14, 0.01]} />
        </mesh>
      </group>
      {/* Batería con cinco barras de carga */}
      <group position={[x, 1.05, 1.1]} rotation={[0, Math.PI / 2, 0]}>
        <RoundedBox args={[0.85, 1.9, 0.26]} radius={0.06} smoothness={3} material={cuerpo} castShadow />
        {segs.map((m, i) => (
          <mesh key={i} position={[0, -0.5 + i * 0.22, 0.135]} material={m}>
            <boxGeometry args={[0.36, 0.1, 0.01]} />
          </mesh>
        ))}
      </group>
      {/* Cargador del carro eléctrico en el frente del garaje */}
      <group position={[W / 2 + 0.9, 1.3, 4.6]}>
        <RoundedBox args={[0.45, 0.6, 0.16]} radius={0.04} smoothness={3} material={cuerpo} castShadow />
        <mesh position={[0, 0.08, 0.085]} material={cargador}>
          <boxGeometry args={[0.22, 0.04, 0.01]} />
        </mesh>
      </group>
      {/* Carro eléctrico */}
      <group position={[W / 2 + 3.2, 0, 8]}>
        <RoundedBox args={[2, 0.9, 4.3]} radius={0.3} smoothness={4} position={[0, 0.75, 0]} castShadow>
          <meshStandardMaterial color="#e7ecf2" metalness={0.7} roughness={0.25} />
        </RoundedBox>
        <RoundedBox args={[1.7, 0.65, 2.3]} radius={0.28} smoothness={4} position={[0, 1.45, -0.2]} castShadow>
          <meshStandardMaterial color="#1c2633" metalness={0.8} roughness={0.1} />
        </RoundedBox>
        {[
          [-0.95, -1.35],
          [0.95, -1.35],
          [-0.95, 1.35],
          [0.95, 1.35],
        ].map(([wx, wz], i) => (
          <mesh key={i} position={[wx, 0.36, wz]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.36, 0.36, 0.26, 18]} />
            <meshStandardMaterial color="#15181d" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ---------- Barrio: calle, postes y casas vecinas que se apagan ---------- */

function Barrio({ progress }: { progress: MotionValue<number> }) {
  const lamparas = useMemo(() => new THREE.MeshStandardMaterial({ color: "#fff3d6", emissive: "#ffd88a", emissiveIntensity: 1, toneMapped: false }), []);
  const ventanas = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffe6b0", emissive: "#ffc56a", emissiveIntensity: 0.8, toneMapped: false }), []);
  const rayas = useRef<THREE.InstancedMesh>(null);
  const vecinos = useMemo(
    () => [
      { x: -24, z: 0, r: 0.1, c: "#ece6da" },
      { x: -22, z: -22, r: 0.3, c: "#dfe7ee" },
      { x: 2, z: -26, r: 0, c: "#efe4d2" },
      { x: 28, z: -20, r: -0.2, c: "#e6e9ec" },
      { x: 32, z: 2, r: -0.1, c: "#f0e7d8" },
      { x: -18, z: 34, r: Math.PI, c: "#e7e0d3" },
      { x: 4, z: 33, r: Math.PI, c: "#dde5ec" },
      { x: 26, z: 35, r: Math.PI, c: "#efe6d6" },
    ],
    [],
  );
  useLayoutEffect(() => {
    const m = new THREE.Object3D();
    for (let i = 0; i < 50; i++) {
      m.position.set(-196 + i * 8, 0.06, 19.5);
      m.updateMatrix();
      rayas.current!.setMatrixAt(i, m.matrix);
    }
    rayas.current!.instanceMatrix.needsUpdate = true;
  }, []);
  useFrame(({ clock }) => {
    const p = progress.get();
    const r = red(p, clock.elapsedTime);
    lamparas.emissiveIntensity = (0.3 + noche(p) * 3) * r;
    ventanas.emissiveIntensity = (0.15 + noche(p) * 1.6) * r;
  });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 19.5]} receiveShadow>
        <planeGeometry args={[440, 6.5]} />
        <meshStandardMaterial color="#34363a" roughness={0.95} />
      </mesh>
      <instancedMesh ref={rayas} args={[undefined, undefined, 50]}>
        <boxGeometry args={[3, 0.02, 0.16]} />
        <meshStandardMaterial color="#e8e2c8" roughness={0.8} />
      </instancedMesh>
      {Array.from({ length: 9 }).map((_, i) => (
        <group key={i} position={[-48 + i * 12, 0, 16.4]}>
          <mesh position={[0, 3, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 6, 8]} />
            <meshStandardMaterial color="#8d96a3" metalness={0.7} />
          </mesh>
          <mesh position={[0, 5.95, 0.8]} material={lamparas}>
            <boxGeometry args={[0.32, 0.1, 0.6]} />
          </mesh>
          <mesh position={[0, 6.0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.9, 6]} />
            <meshStandardMaterial color="#8d96a3" metalness={0.7} />
          </mesh>
        </group>
      ))}
      {vecinos.map((v, i) => (
        <group key={i} position={[v.x, 0, v.z]} rotation={[0, v.r, 0]}>
          <mesh position={[0, 2.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[9, 5.2, 7]} />
            <meshStandardMaterial color={v.c} roughness={0.8} />
          </mesh>
          <mesh position={[0, 6.1, 0]} rotation={[0, Math.PI / 4, 0]} scale={[6.6, 1.9, 5.2]} castShadow>
            <coneGeometry args={[1, 1, 4]} />
            <meshStandardMaterial color={i % 2 ? "#8f4430" : "#4a4f58"} roughness={0.7} />
          </mesh>
          {[-2.2, 2.2].map((x) =>
            [1.6, 4].map((y) => (
              <mesh key={`${x}${y}`} position={[x, y, 3.52]} material={ventanas}>
                <boxGeometry args={[1.4, 1.1, 0.04]} />
              </mesh>
            )),
          )}
        </group>
      ))}
    </group>
  );
}

/* ---------- Mundo y cámara ---------- */

function Mundo({ progress, raton, movil }: Props) {
  const { camera } = useThree();
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), t: new THREE.Vector3(), mira: new THREE.Vector3(0, 3, 0) }), []);
  const energia = useMemo(() => () => tramo(progress.get(), 0.36, 0.46), [progress]);
  const reloj = useRef(0);
  const carro = useMemo(() => () => tramo(progress.get(), 0.6, 0.66) * (1 - tramo(progress.get(), 0.84, 0.9)), [progress]);
  const deRed = useMemo(() => () => 0.3 + 0.4 * red(progress.get(), reloj.current), [progress]);
  const hora = useMemo(() => () => progress.get(), [progress]);

  const rutas = useMemo(() => {
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const xg = W / 2 + 6.5;
    return {
      // Del techo por el alero, al garaje, al inversor y a la batería
      solar: [
        [V(4.6, techoY(2) + 0.42, 2), V(W / 2 + 0.3, H + 0.3, 2.6), V(W / 2 + 0.4, 3.8, 2.6), V(xg - 3, 3.75, -0.6), V(xg + 0.05, 3.7, -0.6), V(xg + 0.05, 2.9, -0.6)],
        [V(xg + 0.05, 1.95, -0.6), V(xg + 0.08, 1.9, 0.3), V(xg + 0.08, 2.05, 1.1)],
      ],
      // Cargador → carro
      carro: [[V(W / 2 + 0.9, 1.0, 4.7), V(W / 2 + 1.4, 0.15, 5.4), V(W / 2 + 2.2, 0.15, 6.4), V(W / 2 + 2.2, 0.9, 6.7)]],
      // Acometida de la red desde el poste de la calle
      red: [[V(W / 2 + 6, 0.03, 16), V(W / 2 + 6.6, 0.03, 8), V(xg + 0.3, 0.03, 3), V(xg + 0.08, 0.6, 0.2)]],
    };
  }, []);

  const tiempos = [0, 0.2, 0.4, 0.58, 0.76, 0.9, 1];
  const rutasCamara = useMemo(() => {
    const k = movil ? 1.3 : 1;
    const P = (x: number, y: number, z: number) => new THREE.Vector3(x * k, y, z * k);
    return {
      pos: new THREE.CatmullRomCurve3([P(-22, 7, 25), P(-8, 17, 19), P(3, 14, 12), P(23, 4.2, 6), P(17, 8, 23), P(-16, 11, 29), P(-26, 20, 40)]),
      mira: new THREE.CatmullRomCurve3([
        new THREE.Vector3(3, 3.5, 0),
        new THREE.Vector3(0, 6, 0),
        new THREE.Vector3(0, 7, 1.5),
        new THREE.Vector3(12.4, 1.8, 0.4),
        new THREE.Vector3(6, 2.5, 4),
        new THREE.Vector3(3, 3, 3),
        new THREE.Vector3(2, 3, 2),
      ]),
    };
  }, [movil]);

  useFrame(({ clock }, dt) => {
    reloj.current = clock.elapsedTime;
    const p = c01(progress.get());
    let i = 0;
    while (i < tiempos.length - 2 && p > tiempos[i + 1]) i++;
    const u = (i + c01((p - tiempos[i]) / (tiempos[i + 1] - tiempos[i]))) / (tiempos.length - 1);
    rutasCamara.pos.getPoint(u, tmp.p);
    rutasCamara.mira.getPoint(u, tmp.t);
    const r = raton.current;
    const t = clock.elapsedTime;
    tmp.p.x += r.x * 1 + Math.sin(t * 0.25) * 0.35;
    tmp.p.y += -r.y * 0.5 + Math.sin(t * 0.33) * 0.15;
    const f = 1 - Math.pow(0.0015, dt);
    camera.position.lerp(tmp.p, f);
    tmp.mira.lerp(tmp.t, f);
    camera.lookAt(tmp.mira);
  });

  const centro = useMemo(() => new THREE.Vector3(3, 0, 4), []);
  return (
    <>
      <Cielo hora={hora} momentos={dia} arco={[0.05, 3.2]} centro={centro} sombra={36} calidad={movil ? 1024 : 2048} />
      <Terreno zonas={zonas} seg={movil ? 140 : 220} />
      <Arboles zonas={[{ x0: -40, x1: 45, z0: -35, z1: 45 }]} n={movil ? 50 : 110} rmin={55} rmax={170} semilla={7} />
      {/* Árboles del jardín */}
      {[
        [-11, -6],
        [-12, 8],
        [13, -7],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.22, 2.4, 6]} />
            <meshStandardMaterial color="#5a4632" roughness={1} />
          </mesh>
          <mesh position={[0, 3.4, 0]} castShadow>
            <icosahedronGeometry args={[1.8, 1]} />
            <meshStandardMaterial color={i % 2 ? "#4c7a33" : "#3f6b2c"} roughness={0.9} flatShading />
          </mesh>
        </group>
      ))}
      <Casa progress={progress} />
      <TechoSolar progress={progress} />
      <Equipos progress={progress} />
      <Barrio progress={progress} />
      <Cables rutas={rutas.solar} nivel={energia} grosor={0.035} fases={3} />
      <Cables rutas={rutas.carro} nivel={carro} grosor={0.05} fases={1} />
      <Cables rutas={rutas.red} nivel={deRed} grosor={0.045} fases={3} enterrado />
    </>
  );
}

export default function EscenaHogar(props: Props) {
  return (
    <Canvas
      shadows={props.movil ? true : "soft"}
      dpr={props.movil ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: props.movil ? 55 : 42, near: 0.1, far: 1500, position: [-22, 7, 25] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Mundo {...props} />
      {!props.movil && (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.9} luminanceSmoothing={0.25} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
