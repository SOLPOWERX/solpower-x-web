"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { Bandeja, Inversor, Tablero, useLedsEquipos, useMaterialesEquipos } from "./equipos";
import { Arboles, Cables, Cielo, Terreno, c01, type Momento, lerp, texturaCeldas, texturaLamina, texturaRejilla, tramo, type Zona } from "./comun";

/*
 * Página Empresas: una bodega con el techo vacío.
 * Al bajar: los paneles se instalan → la energía baja a los inversores y al tablero → la cámara rodea la bodega
 * → al atardecer se va la luz del barrio, pero la bodega sigue encendida con sus baterías.
 */

type Raton = MutableRefObject<{ x: number; y: number }>;
type Props = { progress: MotionValue<number>; raton: Raton; movil: boolean };

// Bodega
const W = 32;
const D = 20;
const H = 9;
const PEND = 0.1; // pendiente del techo (rad)
const techoY = (z: number) => H + 0.62 - (Math.abs(z) - D / 4) * Math.tan(PEND);

const zonas: Zona[] = [
  { x0: -30, x1: 32, z0: -17, z1: 18, color: "#a6a59d" }, // patio de concreto
  { x0: -220, x1: 220, z0: 19, z1: 27, color: "#3b3d41" }, // vía asfaltada
  { x0: -70, x1: 70, z0: 29, z1: 48, color: "#5c7a3e" }, // barrio
];

// Del amanecer a la noche: al final oscurece para que se note el apagón del barrio
const dia: Momento[] = [
  { p: 0, arriba: "#0b1d45", horizonte: "#ff8a3d", sol: "#ff9a3c", luz: 1.6 },
  { p: 0.3, arriba: "#2a5fae", horizonte: "#ffc996", sol: "#ffd9a0", luz: 2.6 },
  { p: 0.62, arriba: "#2f74d6", horizonte: "#d4e8ff", sol: "#fff4dc", luz: 3.0 },
  { p: 0.82, arriba: "#18306a", horizonte: "#ff9e4a", sol: "#ffb347", luz: 1.8 },
  { p: 1, arriba: "#040a1c", horizonte: "#2c1e3a", sol: "#ff6a2a", luz: 0.35 },
];

// Momentos del día de esta página
const instala = (p: number, d: number) => tramo(p, 0.16 + d * 0.22, 0.2 + d * 0.22);
/** La red del barrio: normal, titila y se cae al final. */
function red(p: number, t: number) {
  if (p < 0.86) return 1;
  if (p < 0.91) return Math.sin(t * 40) > 0.2 ? 1 : 0.1;
  return 0;
}

/* ---------- Paneles que caen y se instalan en el techo ---------- */

function TechoSolar({ progress }: { progress: MotionValue<number> }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mats = useMemo(() => {
    const lado = new THREE.MeshStandardMaterial({ color: "#c3ccd8", metalness: 0.8, roughness: 0.35 });
    const cara = new THREE.MeshStandardMaterial({ map: texturaCeldas(true), metalness: 0.45, roughness: 0.18 });
    const fondo = new THREE.MeshStandardMaterial({ color: "#d7dde6", roughness: 0.8 });
    return [lado, lado, cara, fondo, lado, lado];
  }, []);
  const paneles = useMemo(() => {
    const out: { x: number; z: number; s: number; d: number }[] = [];
    const filas = [1.3, 3.3, 5.3, 7.3];
    for (const s of [-1, 1])
      filas.forEach((fz, fi) => {
        for (let i = 0; i < 16; i++) {
          // Orden de instalación: fila por fila, de izquierda a derecha, con un poco de azar
          const d = (fi * 2 + (s > 0 ? 1 : 0)) / 8 + (i / 16) * 0.11 + Math.random() * 0.015;
          out.push({ x: -14.25 + i * 1.9, z: s * fz, s, d: Math.min(d, 1) });
        }
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
      const a = instala(p, q.d * 0.9);
      m.position.set(q.x, techoY(q.z) + 0.32 + (1 - a) * 11, q.z);
      m.rotation.set(q.s * PEND + (1 - a) * 0.6, (1 - a) * 1.4, 0);
      const e = a < 0.01 ? 0.0001 : lerp(0.5, 1, a);
      m.scale.set(e, e, e);
      m.updateMatrix();
      ref.current!.setMatrixAt(i, m.matrix);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, paneles.length]} material={mats} castShadow receiveShadow frustumCulled={false}>
      <boxGeometry args={[1.8, 0.05, 1.85]} />
    </instancedMesh>
  );
}

/* ---------- La bodega ---------- */

function Bodega({ energia }: { energia: () => number }) {
  const frente = useMemo(() => {
    const t = texturaLamina();
    t.repeat.set(13, 1.8);
    return t;
  }, []);
  const lado = useMemo(() => {
    const t = texturaLamina();
    t.repeat.set(8, 1.8);
    return t;
  }, []);
  const puerta = useMemo(() => {
    const t = texturaLamina("#6c7581", "#525b66");
    t.rotation = Math.PI / 2;
    t.repeat.set(1, 7);
    return t;
  }, []);
  const ventanas = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    ventanas.current!.emissiveIntensity = 0.25 + energia() * 2.6;
  });
  const blanco = <meshStandardMaterial color="#eef1f5" metalness={0.2} roughness={0.5} />;

  return (
    <group>
      <mesh position={[0, 0.5, 0]} receiveShadow>
        <boxGeometry args={[W + 0.4, 1, D + 0.4]} />
        <meshStandardMaterial color="#9aa3ae" roughness={0.8} />
      </mesh>
      <mesh position={[0, H / 2 + 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial attach="material-0" map={lado} roughness={0.55} metalness={0.2} />
        <meshStandardMaterial attach="material-1" map={lado} roughness={0.55} metalness={0.2} />
        <meshStandardMaterial attach="material-2" color="#8c97a6" />
        <meshStandardMaterial attach="material-3" color="#8c97a6" />
        <meshStandardMaterial attach="material-4" map={frente} roughness={0.55} metalness={0.2} />
        <meshStandardMaterial attach="material-5" map={frente} roughness={0.55} metalness={0.2} />
      </mesh>
      {/* Techo a dos aguas */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, H + 0.62, (s * D) / 4]} rotation={[s * PEND, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[W + 0.8, 0.3, D / 2 + 0.5]} />
          <meshStandardMaterial color="#8792a1" metalness={0.55} roughness={0.45} />
        </mesh>
      ))}
      {/* Puertas de cargue, marquesina y ventanas */}
      {[-10, -5, 0, 5].map((x) => (
        <mesh key={x} position={[x, 2.9, D / 2 + 0.06]}>
          <boxGeometry args={[3.4, 4.4, 0.12]} />
          <meshStandardMaterial map={puerta} roughness={0.6} metalness={0.3} />
        </mesh>
      ))}
      <mesh position={[-2.5, 5.6, D / 2 + 1.4]} castShadow>
        <boxGeometry args={[19, 0.22, 2.8]} />
        <meshStandardMaterial color="#cdd4de" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 7.7, D / 2 + 0.06]}>
        <boxGeometry args={[W - 3, 1, 0.08]} />
        <meshStandardMaterial ref={ventanas} color="#ffe2a0" emissive="#ffb347" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>
      <mesh position={[11.5, 3.6, D / 2 + 0.08]}>
        <boxGeometry args={[5, 1.4, 0.06]} />
        <meshStandardMaterial color="#0d2b5e" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[11.5, 3.6, D / 2 + 0.12]}>
        <boxGeometry args={[4.2, 0.22, 0.02]} />
        <meshStandardMaterial color="#f0a500" emissive="#f0a500" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      {/* Oficinas de vidrio */}
      <group position={[-W / 2 - 3.2, 0, 4]}>
        <mesh position={[0, 3.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[6.4, 7.6, 9]} />
          <meshStandardMaterial color="#25476e" metalness={0.9} roughness={0.08} />
        </mesh>
        {[1.9, 3.8, 5.7, 7.6].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <boxGeometry args={[6.52, 0.2, 9.12]} />
            {blanco}
          </mesh>
        ))}
      </group>
      {/* Equipos de aire en la cumbrera */}
      {[-12, 12].map((x) => (
        <mesh key={x} position={[x, H + 1.5, 0]} castShadow>
          <boxGeometry args={[1.8, 0.9, 1.4]} />
          {blanco}
        </mesh>
      ))}
      {/* Camiones */}
      {[-10, 0].map((x) => (
        <group key={x} position={[x, 0, D / 2 + 5.5]}>
          <mesh position={[0, 2.1, 0]} castShadow>
            <boxGeometry args={[2.5, 3, 8]} />
            <meshStandardMaterial color="#f4f6f9" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.6, 5.1]} castShadow>
            <boxGeometry args={[2.4, 2.4, 2.1]} />
            <meshStandardMaterial color="#0d2b5e" metalness={0.4} roughness={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------- Pared lateral: bandejas, cuatro inversores y tablero general ---------- */

// Inversores en la pared x = W/2, mirando hacia +x
const ZINV = [-6.5, -4.3, -2.1, 0.1];
const YINV = 2.6;
const ESC_INV = 1.7;
const XP = W / 2; // cara de la pared
const Y_DC = 4.45; // bandeja de llegada DC (arriba de los inversores)
const Y_AC = 1.25; // bandeja de salida AC (abajo)
const Z_BAJANTE = -8; // bajante vertical desde el techo
const Z_TAB = 3.3; // tablero general

function CuartoElectrico({ energia }: { energia: () => number }) {
  const m = useMaterialesEquipos();
  useLedsEquipos(m, energia);
  return (
    <group>
      {/* Bandejas portacables */}
      <Bandeja m={m} desde={[XP + 0.33, Y_DC - 0.05, Z_BAJANTE - 0.3]} hasta={[XP + 0.33, Y_DC - 0.05, 0.9]} ancho={0.6} normal={[0, 1, 0]} />
      <Bandeja m={m} desde={[XP + 0.05, Y_DC - 0.3, Z_BAJANTE]} hasta={[XP + 0.05, H + 0.4, Z_BAJANTE]} ancho={0.6} normal={[1, 0, 0]} />
      <Bandeja m={m} desde={[XP + 0.33, Y_AC - 0.05, ZINV[0] - 0.6]} hasta={[XP + 0.33, Y_AC - 0.05, Z_TAB - 0.62]} ancho={0.6} normal={[0, 1, 0]} />
      {/* Soportes de las bandejas */}
      {[-7.5, -5.4, -3.2, -1, 0.8].map((z) => (
        <mesh key={z} position={[XP + 0.33, Y_DC - 0.11, z]} material={m.galvanizado}>
          <boxGeometry args={[0.66, 0.04, 0.04]} />
        </mesh>
      ))}
      {[-6.6, -4.4, -2.2, 0, 1.8].map((z) => (
        <mesh key={z} position={[XP + 0.33, Y_AC - 0.11, z]} material={m.galvanizado}>
          <boxGeometry args={[0.66, 0.04, 0.04]} />
        </mesh>
      ))}
      {ZINV.map((z) => (
        <Inversor key={z} m={m} position={[XP + 0.06 + 0.145 * ESC_INV, YINV, z]} rotation={[0, Math.PI / 2, 0]} escala={ESC_INV} />
      ))}
      {/* Tablero general con medidor */}
      <Tablero m={m} position={[XP + 0.14, 1.55, Z_TAB]} rotation={[0, Math.PI / 2, 0]} ancho={1.25} alto={1.7} medidor />
      {/* Tubo que entra a la bodega desde el tablero */}
      <mesh position={[XP + 0.14, 2.75, Z_TAB]} material={m.galvanizado}>
        <cylinderGeometry args={[0.08, 0.08, 0.7, 10]} />
      </mesh>
      {/* Placa de identificación de la cara de la pared */}
      <mesh position={[XP + 0.02, 5.2, -3.2]} rotation={[0, Math.PI / 2, 0]} material={m.oro}>
        <boxGeometry args={[3.2, 0.06, 0.01]} />
      </mesh>
    </group>
  );
}

/* ---------- Baterías (BESS) ---------- */

function Baterias({ respaldo }: { respaldo: () => number }) {
  const rejilla = useMemo(() => {
    const t = texturaRejilla();
    t.repeat.set(3, 1);
    return t;
  }, []);
  const franja = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    franja.current!.emissiveIntensity = 0.6 + respaldo() * (2.5 + Math.sin(clock.elapsedTime * 2.5) * 1.2);
  });
  return (
    <group position={[25, 0, 7]}>
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[7.6, 0.3, 3.4]} />
        <meshStandardMaterial color="#b0ada4" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.6, 2.6, 2.5]} />
        <meshStandardMaterial map={rejilla} metalness={0.25} roughness={0.35} />
      </mesh>
      {[-2.2, -0.75, 0.75, 2.2].map((x) => (
        <mesh key={x} position={[x, 1.6, 1.26]}>
          <boxGeometry args={[0.02, 2.3, 0.01]} />
          <meshStandardMaterial color="#aab2bd" />
        </mesh>
      ))}
      <mesh position={[0, 2.75, 1.26]}>
        <boxGeometry args={[6.2, 0.1, 0.02]} />
        <meshStandardMaterial ref={franja} color="#3dff8a" emissive="#3dff8a" emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      <mesh position={[3.55, 1.7, 0]} castShadow>
        <boxGeometry args={[0.5, 1.4, 1.6]} />
        <meshStandardMaterial color="#dfe4ea" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ---------- Vía, postes de luz y barrio (se apagan cuando cae la red) ---------- */

function Barrio({ progress }: { progress: MotionValue<number> }) {
  const lamparas = useMemo(() => new THREE.MeshStandardMaterial({ color: "#fff3d6", emissive: "#ffd88a", emissiveIntensity: 1, toneMapped: false }), []);
  const ventanas = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffe6b0", emissive: "#ffc56a", emissiveIntensity: 0.8, toneMapped: false }), []);
  const rayas = useRef<THREE.InstancedMesh>(null);
  const casas = useMemo(
    () =>
      [-48, -34, -20, -6, 8, 22, 36, 50].map((x, i) => ({
        x,
        z: 35 + (i % 2) * 5,
        w: 7 + (i % 3),
        h: 4 + (i % 2) * 2.5,
        c: ["#e9e2d4", "#d9c7a8", "#c9d6e3", "#ede8df"][i % 4],
      })),
    [],
  );
  useLayoutEffect(() => {
    const m = new THREE.Object3D();
    for (let i = 0; i < 50; i++) {
      m.position.set(-196 + i * 8, 0.06, 23);
      m.updateMatrix();
      rayas.current!.setMatrixAt(i, m.matrix);
    }
    rayas.current!.instanceMatrix.needsUpdate = true;
  }, []);
  useFrame(({ clock }) => {
    const p = progress.get();
    // De noche las luces se ven más; cuando cae la red se apagan
    const noche = tramo(p, 0.72, 0.9);
    const r = red(p, clock.elapsedTime);
    lamparas.emissiveIntensity = (0.4 + noche * 3) * r;
    ventanas.emissiveIntensity = (0.2 + noche * 1.6) * r;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 23]} receiveShadow>
        <planeGeometry args={[440, 7]} />
        <meshStandardMaterial color="#34363a" roughness={0.95} />
      </mesh>
      <instancedMesh ref={rayas} args={[undefined, undefined, 50]}>
        <boxGeometry args={[3, 0.02, 0.18]} />
        <meshStandardMaterial color="#e8e2c8" roughness={0.8} />
      </instancedMesh>
      {/* Postes de alumbrado */}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = -66 + i * 12;
        return (
          <group key={i} position={[x, 0, 19.6]}>
            <mesh position={[0, 3.5, 0]} castShadow>
              <cylinderGeometry args={[0.09, 0.13, 7, 8]} />
              <meshStandardMaterial color="#8d96a3" metalness={0.7} />
            </mesh>
            <mesh position={[0, 6.95, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 1.8, 6]} />
              <meshStandardMaterial color="#8d96a3" metalness={0.7} />
            </mesh>
            <mesh position={[0, 6.85, 1.75]} material={lamparas}>
              <boxGeometry args={[0.35, 0.12, 0.7]} />
            </mesh>
          </group>
        );
      })}
      {/* Casas y locales del barrio */}
      {casas.map((c) => (
        <group key={c.x} position={[c.x, 0, c.z]}>
          <mesh position={[0, c.h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[c.w, c.h, 6]} />
            <meshStandardMaterial color={c.c} roughness={0.8} />
          </mesh>
          <mesh position={[0, c.h + 0.9, 0]} rotation={[0, Math.PI / 4, 0]} scale={[c.w * 0.75, 1.8, 4.4]} castShadow>
            <coneGeometry args={[1, 1, 4]} />
            <meshStandardMaterial color="#9a4a32" roughness={0.7} />
          </mesh>
          {[-c.w / 4, c.w / 4].map((x) => (
            <mesh key={x} position={[x, c.h * 0.55, -3.02]} material={ventanas}>
              <boxGeometry args={[1.1, 1, 0.04]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ---------- Mundo y cámara ---------- */

function Mundo({ progress, raton, movil }: Props) {
  const { camera } = useThree();
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), t: new THREE.Vector3(), mira: new THREE.Vector3(0, 4, 0) }), []);
  const energia = useMemo(() => () => tramo(progress.get(), 0.38, 0.5), [progress]);
  const respaldo = useMemo(() => () => tramo(progress.get(), 0.9, 0.95), [progress]);
  const reloj = useRef(0);
  const deRed = useMemo(() => () => 0.35 + 0.4 * red(progress.get(), reloj.current), [progress]);
  const hora = useMemo(() => () => progress.get(), [progress]);

  const yr = techoY(4) + 0.42;
  const rutas = useMemo(() => {
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const xs = [-12, -4, 4, 12]; // cada inversor recibe un grupo de paneles del techo
    // DC: del techo → bajante vertical → bandeja de arriba → baja al lado del inversor → entra por abajo
    const dc = ZINV.map((zi, i) => {
      const zr = -4 - i * 0.22;
      const xb = XP + 0.12 + i * 0.13;
      const zb = Z_BAJANTE + (i - 1.5) * 0.13;
      const zLado = zi + 0.62 * ESC_INV * 0.5 + 0.28;
      return [
        V(xs[i], yr, zr),
        V(13.5, yr, zr),
        V(15.2, techoY(7.4) + 0.42, -7.4),
        V(XP + 0.12, H + 0.55, zb),
        V(XP + 0.12, Y_DC + 0.4, zb),
        V(xb, Y_DC, Z_BAJANTE + 0.5),
        V(xb, Y_DC, zLado - 0.3),
        V(XP + 0.42, Y_DC - 0.3, zLado),
        V(XP + 0.42, YINV - 0.95, zLado),
        V(XP + 0.32, YINV - 0.95, zi + 0.24),
        V(XP + 0.3, YINV - 0.8, zi + 0.24),
      ];
    });
    // AC: de cada inversor baja a la bandeja de abajo y va al tablero
    const ac = ZINV.map((zi, i) => {
      const xb = XP + 0.12 + i * 0.14;
      return [
        V(XP + 0.3, YINV - 0.8, zi - 0.27),
        V(XP + 0.3, YINV - 1.0, zi - 0.27),
        V(xb, Y_AC, zi - 0.1),
        V(xb, Y_AC, Z_TAB - 0.9),
        V(XP + 0.25, Y_AC + 0.05, Z_TAB - 0.64),
      ];
    });
    return {
      dc,
      ac,
      // Baterías → tablero (enterrado, sube por debajo del tablero)
      bateria: [[V(21.5, 0.6, 7.2), V(20.5, 0.03, 6.6), V(18.4, 0.03, 4.8), V(XP + 0.5, 0.03, 3.6), V(XP + 0.16, 0.4, 3.1), V(XP + 0.14, 0.7, 3.1)]],
      // Red del operador: transformador de poste en la vía → medidor y tablero
      red: [[V(26, 0.03, 19.2), V(24, 0.03, 12), V(19, 0.03, 5.2), V(XP + 0.5, 0.03, 4), V(XP + 0.16, 0.4, 3.6), V(XP + 0.14, 0.7, 3.6)]],
    };
  }, [yr]);

  const tiempos = [0, 0.2, 0.4, 0.58, 0.76, 0.9, 1];
  const rutasCamara = useMemo(() => {
    const k = movil ? 1.3 : 1;
    const P = (x: number, y: number, z: number) => new THREE.Vector3(x * k, y, z * k);
    return {
      pos: new THREE.CatmullRomCurve3([P(-34, 12, 28), P(-16, 26, 32), P(8, 32, 24), P(26, 6, 5), P(28, 20, -32), P(42, 9, 34), P(50, 13, 6)]),
      mira: new THREE.CatmullRomCurve3([
        new THREE.Vector3(2, 4, 0),
        new THREE.Vector3(0, 9, 0),
        new THREE.Vector3(2, 9, -1),
        new THREE.Vector3(16, 3, -2.6),
        new THREE.Vector3(0, 6, 0),
        new THREE.Vector3(19, 3, 9),
        new THREE.Vector3(2, 4, 18),
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
    tmp.p.x += r.x * 1.4 + Math.sin(t * 0.25) * 0.5;
    tmp.p.y += -r.y * 0.7 + Math.sin(t * 0.33) * 0.2;
    const f = 1 - Math.pow(0.0015, dt);
    camera.position.lerp(tmp.p, f);
    tmp.mira.lerp(tmp.t, f);
    camera.lookAt(tmp.mira);
  });

  const centro = useMemo(() => new THREE.Vector3(4, 0, 6), []);
  return (
    <>
      <Cielo hora={hora} momentos={dia} arco={[0.05, 3.2]} centro={centro} sombra={55} calidad={movil ? 1024 : 2048} />
      <Terreno zonas={zonas} seg={movil ? 140 : 220} />
      <Arboles zonas={zonas} n={movil ? 60 : 130} rmin={50} rmax={170} semilla={3} />
      <Bodega energia={energia} />
      <TechoSolar progress={progress} />
      <CuartoElectrico energia={energia} />
      <Baterias respaldo={respaldo} />
      <Barrio progress={progress} />
      <Cables rutas={rutas.dc} nivel={energia} grosor={0.028} fases={2} />
      <Cables rutas={rutas.ac} nivel={energia} grosor={0.028} fases={3} />
      <Cables rutas={rutas.bateria} nivel={respaldo} grosor={0.06} fases={3} enterrado />
      <Cables rutas={rutas.red} nivel={deRed} grosor={0.06} fases={3} enterrado mojones />
      {/* Transformador de poste del operador de red */}
      <group position={[26, 0, 19.4]}>
        <mesh position={[0, 4.5, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.22, 9, 8]} />
          <meshStandardMaterial color="#a8a39a" roughness={0.9} />
        </mesh>
        <mesh position={[0.45, 6.2, 0]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 1.1, 14]} />
          <meshStandardMaterial color="#9aa5b1" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 8.6, 0]}>
          <boxGeometry args={[2.4, 0.12, 0.12]} />
          <meshStandardMaterial color="#6f7a86" metalness={0.6} />
        </mesh>
      </group>
    </>
  );
}

export default function EscenaEmpresa(props: Props) {
  return (
    <Canvas
      shadows={props.movil ? true : "soft"}
      dpr={props.movil ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: props.movil ? 55 : 42, near: 0.1, far: 1500, position: [-34, 12, 28] }}
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
