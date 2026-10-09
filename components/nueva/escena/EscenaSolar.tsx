"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import Lienzo from "./Lienzo";
import type { MotionValue } from "framer-motion";
import { Arboles, Cables, Cielo, Terreno, c01, lerp, texturaCeldas, texturaLamina, texturaMalla, texturaRejilla, texturaSenal, tramo, type Camino, type Zona } from "./comun";

/*
 * Portada: una sola escena 3D que cambia con el scroll.
 * Amanecer sobre la planta → los paneles siguen al sol → un panel sube y se desarma
 * → vuelve a su lugar → vista aérea con la energía corriendo por los cables hasta la fábrica.
 */

type Raton = MutableRefObject<{ x: number; y: number }>;
type Props = { progress: MotionValue<number>; raton: Raton; listo: boolean; movil: boolean };

// Panel en seguidor de un eje: largo en X, ancho en Z
const PL = 1.65;
const PA = 1;
const ALTO = 1.25;
const SEP_X = 3.7;
const SEP_Z = PA + 0.06;
const FILAS = 15;
const COLS = 26;
const filaX = (f: number) => (f - (FILAS - 1) / 2) * SEP_X;
const colZ = (k: number) => (k - (COLS - 1) / 2) * SEP_Z - 4;
const HEROE = { fila: 7, col: 21 };
// Inversores de string al final de cada fila
const INV_DX = 0.9;
const INV_Z = colZ(COLS - 1) + 1.1;
const giroSol = (p: number) => lerp(0.6, -0.45, tramo(p, 0, 1));

const zonas: Zona[] = [
  { x0: -29, x1: 29, z0: -20, z1: 13, color: "#8f8b7b" }, // planta (grava)
  { x0: 29.5, x1: 40.5, z0: -6.6, z1: 4.8, color: "#a7a69d" }, // subestación
  { x0: 36, x1: 74, z0: -28, z1: 1, color: "#a3a29a" }, // patio de la fábrica
];
const caminos: Camino[] = [
  [
    [-140, 17],
    [34, 17],
    [40, 9],
    [40, 1],
  ],
  [
    [74, -12],
    [170, -40],
  ],
];

/* ---------- Planta solar ---------- */

function Planta({ progress }: { progress: MotionValue<number> }) {
  const paneles = useRef<THREE.InstancedMesh>(null);
  const ejes = useRef<THREE.InstancedMesh>(null);
  const postes = useRef<THREE.InstancedMesh>(null);

  const mats = useMemo(() => {
    const lado = new THREE.MeshStandardMaterial({ color: "#c3ccd8", metalness: 0.8, roughness: 0.35 });
    const cara = new THREE.MeshStandardMaterial({ map: texturaCeldas(true), metalness: 0.45, roughness: 0.18 });
    const fondo = new THREE.MeshStandardMaterial({ color: "#d7dde6", roughness: 0.8 });
    return [lado, lado, cara, fondo, lado, lado];
  }, []);

  const pos = useMemo(() => {
    const out: { x: number; z: number }[] = [];
    for (let f = 0; f < FILAS; f++)
      for (let k = 0; k < COLS; k++) if (!(f === HEROE.fila && k === HEROE.col)) out.push({ x: filaX(f), z: colZ(k) });
    return out;
  }, []);
  const m = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    for (let f = 0; f < FILAS; f++) {
      m.position.set(filaX(f), ALTO - 0.06, -4);
      m.rotation.set(Math.PI / 2, 0, 0);
      m.scale.set(1, COLS * SEP_Z, 1);
      m.updateMatrix();
      ejes.current!.setMatrixAt(f, m.matrix);
    }
    ejes.current!.instanceMatrix.needsUpdate = true;
    let n = 0;
    for (let f = 0; f < FILAS; f++)
      for (let k = 0; k < COLS; k += 4) {
        m.position.set(filaX(f), ALTO / 2, colZ(k));
        m.rotation.set(0, 0, 0);
        m.scale.set(1, ALTO, 1);
        m.updateMatrix();
        postes.current!.setMatrixAt(n++, m.matrix);
      }
    postes.current!.count = n;
    postes.current!.instanceMatrix.needsUpdate = true;
  }, [m]);

  const ultimo = useRef(-1);
  useFrame(() => {
    const p = progress.get();
    if (Math.abs(p - ultimo.current) < 0.0005) return;
    ultimo.current = p;
    const giro = giroSol(p);
    pos.forEach((q, i) => {
      m.position.set(q.x, ALTO, q.z);
      m.rotation.set(0, 0, giro);
      m.scale.set(1, 1, 1);
      m.updateMatrix();
      paneles.current!.setMatrixAt(i, m.matrix);
    });
    paneles.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={paneles} args={[undefined, undefined, pos.length]} material={mats} castShadow receiveShadow>
        <boxGeometry args={[PL, 0.045, PA]} />
      </instancedMesh>
      <instancedMesh ref={ejes} args={[undefined, undefined, FILAS]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial color="#8a94a3" metalness={0.7} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={postes} args={[undefined, undefined, FILAS * Math.ceil(COLS / 4)]} castShadow>
        <cylinderGeometry args={[0.045, 0.06, 1, 6]} />
        <meshStandardMaterial color="#6f7a8a" metalness={0.6} roughness={0.5} />
      </instancedMesh>
    </group>
  );
}

/* ---------- Inversores de string (estilo equipo blanco, con aletas, luces y conectores) ---------- */

type MatsInv = Record<"cuerpo" | "frente" | "aletas" | "acero" | "conector" | "oro" | "led" | "techo" | "concreto", THREE.MeshStandardMaterial>;

function Inversor({ x, m, simple }: { x: number; m: MatsInv; simple: boolean }) {
  return (
    <group position={[x, 0, INV_Z]}>
      {/* Base de concreto, postes y travesaños galvanizados */}
      <mesh position={[0, 0.04, -0.2]} material={m.concreto} receiveShadow>
        <boxGeometry args={[0.9, 0.08, 0.36]} />
      </mesh>
      {[-0.32, 0.32].map((dx) => (
        <mesh key={dx} position={[dx, 0.82, -0.2]} material={m.acero} castShadow>
          <boxGeometry args={[0.06, 1.62, 0.06]} />
        </mesh>
      ))}
      {[0.72, 1.45].map((y) => (
        <mesh key={y} position={[0, y, -0.2]} material={m.acero}>
          <boxGeometry args={[0.74, 0.05, 0.04]} />
        </mesh>
      ))}
      {/* Techito que le da sombra */}
      <mesh position={[0, 1.7, -0.06]} rotation={[0.28, 0, 0]} material={m.techo} castShadow>
        <boxGeometry args={[0.88, 0.025, 0.52]} />
      </mesh>
      {/* Cuerpo del inversor */}
      <RoundedBox args={[0.62, 0.8, 0.24]} radius={0.045} smoothness={3} position={[0, 1.1, -0.04]} material={m.cuerpo} castShadow />
      {!simple && (
        <>
          {/* Aletas de disipación a los lados */}
          {[-1, 1].flatMap((s) =>
            [0, 1, 2, 3, 4, 5, 6].map((i) => (
              <mesh key={`${s}${i}`} position={[s * 0.322, 0.8 + i * 0.1, -0.06]} material={m.aletas}>
                <boxGeometry args={[0.035, 0.05, 0.2]} />
              </mesh>
            )),
          )}
          {/* Panel frontal con franja dorada y luces de estado */}
          <mesh position={[0, 1.3, 0.083]} material={m.frente}>
            <boxGeometry args={[0.38, 0.15, 0.01]} />
          </mesh>
          <mesh position={[0, 1.32, 0.09]} material={m.oro}>
            <boxGeometry args={[0.22, 0.022, 0.004]} />
          </mesh>
          {[-0.06, 0, 0.06].map((dx) => (
            <mesh key={dx} position={[dx, 1.255, 0.09]} material={m.led}>
              <sphereGeometry args={[0.013, 8, 8]} />
            </mesh>
          ))}
          {/* Placa de datos */}
          <mesh position={[0.19, 0.95, 0.083]} material={m.aletas}>
            <boxGeometry args={[0.12, 0.08, 0.005]} />
          </mesh>
          {/* Conectores abajo */}
          <mesh position={[0, 0.685, -0.03]} material={m.conector}>
            <boxGeometry args={[0.5, 0.05, 0.18]} />
          </mesh>
          {[-0.18, -0.1, -0.02, 0.06, 0.14].map((dx) => (
            <mesh key={dx} position={[dx, 0.64, 0]} material={m.conector}>
              <cylinderGeometry args={[0.018, 0.018, 0.07, 8]} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

function Inversores({ movil, energia }: { movil: boolean; energia: () => number }) {
  const m = useMemo<MatsInv>(
    () => ({
      cuerpo: new THREE.MeshStandardMaterial({ color: "#f6f8fb", metalness: 0.15, roughness: 0.26 }),
      frente: new THREE.MeshStandardMaterial({ color: "#1b2230", metalness: 0.4, roughness: 0.25 }),
      aletas: new THREE.MeshStandardMaterial({ color: "#c7ced8", metalness: 0.6, roughness: 0.35 }),
      acero: new THREE.MeshStandardMaterial({ color: "#8f99a6", metalness: 0.75, roughness: 0.35 }),
      conector: new THREE.MeshStandardMaterial({ color: "#14171c", roughness: 0.5 }),
      oro: new THREE.MeshStandardMaterial({ color: "#f0a500", emissive: "#f0a500", emissiveIntensity: 0.6 }),
      led: new THREE.MeshStandardMaterial({ color: "#3dff8a", emissive: "#3dff8a", emissiveIntensity: 2, toneMapped: false }),
      techo: new THREE.MeshStandardMaterial({ color: "#e1e6ec", metalness: 0.5, roughness: 0.3 }),
      concreto: new THREE.MeshStandardMaterial({ color: "#b0ada4", roughness: 0.9 }),
    }),
    [],
  );
  useFrame(({ clock }) => {
    m.led.emissiveIntensity = 1.2 + energia() * (1.6 + Math.sin(clock.elapsedTime * 3) * 0.9);
  });
  return (
    <group>
      {Array.from({ length: FILAS }).map((_, f) => (
        <Inversor key={f} x={filaX(f) + INV_DX} m={m} simple={movil} />
      ))}
    </group>
  );
}

/* ---------- El panel protagonista que se desarma ---------- */

const capas = [
  { label: "Caja de conexiones IP68", y: -0.06 },
  { label: "Marco de aluminio", y: -0.02 },
  { label: "Lámina posterior", y: 0 },
  { label: "Encapsulante EVA", y: 0.012 },
  { label: "Celdas monocristalinas", y: 0.024 },
  { label: "", y: 0.036 },
  { label: "Vidrio templado 3,2 mm", y: 0.048 },
];

function PanelHeroe({ progress, base }: { progress: MotionValue<number>; base: THREE.Vector3 }) {
  const grupo = useRef<THREE.Group>(null);
  const capasRef = useRef<(THREE.Group | null)[]>([]);
  const etiquetas = useRef<(HTMLDivElement | null)[]>([]);
  const celdas = useMemo(() => texturaCeldas(false), []);
  const arriba = useMemo(() => new THREE.Vector3(), []);
  const marco = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d3dbe6", metalness: 0.85, roughness: 0.3 }), []);

  useFrame(() => {
    const p = progress.get();
    const sube = tramo(p, 0.27, 0.42) * (1 - tramo(p, 0.68, 0.8));
    const abre = tramo(p, 0.4, 0.5) * (1 - tramo(p, 0.6, 0.7));
    const g = grupo.current!;
    g.position.copy(base).lerp(arriba.set(base.x, 3.2, base.z + 1.6), sube);
    g.rotation.set(lerp(0, 1.05, sube), lerp(0, -0.35, sube), lerp(giroSol(p), 0, sube));
    capas.forEach((c, i) => {
      const l = capasRef.current[i];
      if (l) l.position.y = c.y + abre * (i - 2) * 0.5;
      const e = etiquetas.current[i];
      if (e) e.style.opacity = String(c01((abre - 0.6) / 0.4));
    });
  });

  const Etiqueta = ({ i, text }: { i: number; text: string }) =>
    text ? (
      <Html position={[PL / 2 + 0.05, 0, 0]} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          ref={(el) => {
            etiquetas.current[i] = el;
          }}
          className="hidden items-center gap-2 whitespace-nowrap text-[11px] font-medium text-white/90 opacity-0 md:flex"
          style={{ transform: "translateY(-50%)", textShadow: "0 1px 6px rgba(4,15,38,.8)" }}
        >
          <span className="h-px w-10 bg-gradient-to-r from-sol-claro/0 to-sol-claro" />
          <span className="h-1.5 w-1.5 rounded-full bg-sol-claro shadow-[0_0_8px_2px_rgba(255,194,61,.7)]" />
          {text}
        </div>
      </Html>
    ) : null;

  const capa = (i: number) => (el: THREE.Group | null) => void (capasRef.current[i] = el);

  return (
    <group ref={grupo}>
      <group ref={capa(0)}>
        <mesh position={[0, 0, -0.2]} castShadow>
          <boxGeometry args={[0.32, 0.06, 0.2]} />
          <meshStandardMaterial color="#151a22" roughness={0.6} />
        </mesh>
        <Etiqueta i={0} text={capas[0].label} />
      </group>
      <group ref={capa(1)}>
        {[
          [0, PA / 2 - 0.02, PL, 0.04],
          [0, -PA / 2 + 0.02, PL, 0.04],
          [PL / 2 - 0.02, 0, 0.04, PA],
          [-PL / 2 + 0.02, 0, 0.04, PA],
        ].map(([x, z, w, d], k) => (
          <mesh key={k} position={[x, 0, z]} material={marco} castShadow>
            <boxGeometry args={[w, 0.05, d]} />
          </mesh>
        ))}
        <Etiqueta i={1} text={capas[1].label} />
      </group>
      <group ref={capa(2)}>
        <mesh castShadow>
          <boxGeometry args={[PL - 0.06, 0.006, PA - 0.06]} />
          <meshStandardMaterial color="#eef2f7" roughness={0.7} />
        </mesh>
        <Etiqueta i={2} text={capas[2].label} />
      </group>
      {[3, 5].map((i) => (
        <group key={i} ref={capa(i)}>
          <mesh>
            <boxGeometry args={[PL - 0.06, 0.004, PA - 0.06]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.22} roughness={0.3} depthWrite={false} />
          </mesh>
          <Etiqueta i={i} text={capas[i].label} />
        </group>
      ))}
      <group ref={capa(4)}>
        <mesh castShadow>
          <boxGeometry args={[PL - 0.06, 0.008, PA - 0.06]} />
          <meshStandardMaterial map={celdas} metalness={0.45} roughness={0.2} />
        </mesh>
        <Etiqueta i={4} text={capas[4].label} />
      </group>
      <group ref={capa(6)}>
        <mesh>
          <boxGeometry args={[PL - 0.04, 0.01, PA - 0.04]} />
          <meshStandardMaterial color="#dfefff" transparent opacity={0.18} metalness={0.1} roughness={0.02} depthWrite={false} />
        </mesh>
        <Etiqueta i={6} text={capas[6].label} />
      </group>
    </group>
  );
}

/* ---------- Estación inversora tipo "skid" (equipos blancos) ---------- */

function Skid({ energia }: { energia: () => number }) {
  const rejilla = useMemo(() => {
    const t = texturaRejilla();
    t.repeat.set(2, 1);
    return t;
  }, []);
  const led = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    led.current!.emissiveIntensity = 1.5 + energia() * (2 + Math.sin(clock.elapsedTime * 4) * 1.5);
  });
  return (
    <group position={[34.5, 0, -1]}>
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.4, 0.36, 3.2]} />
        <meshStandardMaterial color="#5f6873" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* Gabinete del inversor */}
      <mesh position={[-1.7, 1.66, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 2.6, 2.7]} />
        <meshStandardMaterial map={rejilla} metalness={0.25} roughness={0.35} />
      </mesh>
      <mesh position={[-1.7, 2.6, 1.36]}>
        <boxGeometry args={[2.6, 0.12, 0.02]} />
        <meshStandardMaterial color="#f0a500" emissive="#f0a500" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-0.2, 2.3, 1.37]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial ref={led} color="#3dff8a" emissive="#3dff8a" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* Transformador con aletas y aisladores */}
      <mesh position={[1.9, 1.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 2.2, 2.2]} />
        <meshStandardMaterial color="#e8ecf1" metalness={0.35} roughness={0.4} />
      </mesh>
      {[-0.8, -0.4, 0, 0.4, 0.8].map((z) => (
        <mesh key={z} position={[3.12, 1.4, z]} castShadow>
          <boxGeometry args={[0.16, 1.7, 0.05]} />
          <meshStandardMaterial color="#d4dae2" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
      {[-0.6, 0, 0.6].map((z) => (
        <group key={z}>
          <mesh position={[1.9, 2.85, z]} castShadow>
            <cylinderGeometry args={[0.09, 0.12, 0.6, 10]} />
            <meshStandardMaterial color="#7a4a2c" roughness={0.3} />
          </mesh>
          {/* Faldones del aislador */}
          {[2.72, 2.86, 3.0].map((y) => (
            <mesh key={y} position={[1.9, y, z]}>
              <cylinderGeometry args={[0.15, 0.15, 0.03, 12]} />
              <meshStandardMaterial color="#8a5534" roughness={0.3} />
            </mesh>
          ))}
          {/* Cable del aislador al gabinete */}
          <mesh position={[0.95, 3.1, z]} rotation={[0, 0, Math.PI / 2.4]}>
            <cylinderGeometry args={[0.035, 0.035, 2, 8]} />
            <meshStandardMaterial color="#1b1f26" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Tanque conservador sobre el transformador */}
      <mesh position={[1.9, 3.35, -0.95]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 2, 16]} />
        <meshStandardMaterial color="#dfe4ea" metalness={0.4} roughness={0.35} />
      </mesh>
      {[1.2, 2.6].map((x) => (
        <mesh key={x} position={[x, 2.85, -0.95]}>
          <boxGeometry args={[0.08, 0.7, 0.08]} />
          <meshStandardMaterial color="#9aa3ae" metalness={0.6} />
        </mesh>
      ))}
      {/* Radiadores del otro lado */}
      {[0.9, 1.3, 1.7, 2.1, 2.5, 2.9].map((x) => (
        <mesh key={x} position={[x, 1.4, -1.22]} castShadow>
          <boxGeometry args={[0.05, 1.7, 0.16]} />
          <meshStandardMaterial color="#d4dae2" metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
      {/* Puertas, manijas y placa del gabinete */}
      {[-2.6, -0.8].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.66, 1.36]}>
            <boxGeometry args={[0.02, 2.3, 0.01]} />
            <meshStandardMaterial color="#9ea7b3" />
          </mesh>
          <mesh position={[x + 0.25, 1.6, 1.38]}>
            <boxGeometry args={[0.06, 0.32, 0.05]} />
            <meshStandardMaterial color="#3b424c" metalness={0.7} />
          </mesh>
        </group>
      ))}
      {/* Bandeja portacables entre gabinete y transformador */}
      <mesh position={[0.1, 3.05, 0.9]} castShadow>
        <boxGeometry args={[1.5, 0.08, 0.4]} />
        <meshStandardMaterial color="#aab3be" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Celda de media tensión (RMU) */}
      <group position={[0.4, 0, -2.9]}>
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <boxGeometry args={[2.2, 0.16, 1.5]} />
          <meshStandardMaterial color="#b9b8b0" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.16, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.9, 2, 1.1]} />
          <meshStandardMaterial color="#b7c0cb" metalness={0.35} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.55, 0.56]}>
          <boxGeometry args={[1.3, 0.35, 0.02]} />
          <meshStandardMaterial color="#1c2b40" metalness={0.5} roughness={0.2} />
        </mesh>
        {[-0.45, 0, 0.45].map((x, i) => (
          <mesh key={x} position={[x, 1.1, 0.57]}>
            <circleGeometry args={[0.07, 16]} />
            <meshStandardMaterial color={i === 1 ? "#e53935" : "#43a047"} emissive={i === 1 ? "#e53935" : "#43a047"} emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
        ))}
      </group>
      {/* Cajas por donde entran y salen los cables */}
      <mesh position={[-1.5, 0.55, 1.37]}>
        <boxGeometry args={[0.75, 0.32, 0.08]} />
        <meshStandardMaterial color="#2a3039" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[2.4, 0.6, 1.13]}>
        <boxGeometry args={[0.75, 0.32, 0.08]} />
        <meshStandardMaterial color="#2a3039" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Extintor */}
      <mesh position={[-3.7, 0.45, 1.75]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.7, 12]} />
        <meshStandardMaterial color="#d32f2f" metalness={0.3} roughness={0.35} />
      </mesh>
      <Cerramiento energia={energia} />
    </group>
  );
}

/** Cerramiento de la subestación: malla, postes, puerta, señal de peligro y luminaria. */
function Cerramiento({ energia }: { energia: () => number }) {
  const malla = useMemo(() => texturaMalla(), []);
  const senal = useMemo(() => texturaSenal(), []);
  const mallaPuerta = useMemo(() => {
    const t = texturaMalla();
    t.repeat.set(1.36 * 3, 2.1 * 3);
    return t;
  }, []);
  const lampara = useRef<THREE.MeshStandardMaterial>(null);
  const X0 = -4.6;
  const X1 = 5.6;
  const Z0 = -5.2;
  const Z1 = 5.4;
  const H = 2.2;
  // Tramos de cerca [x0, z0, x1, z1]; el frente se parte para dejar la puerta
  const tramos: [number, number, number, number][] = [
    [X0, Z0, X1, Z0],
    [X1, Z0, X1, Z1],
    [X0, Z0, X0, Z1],
    [X0, Z1, -1.4, Z1],
    [1.4, Z1, X1, Z1],
  ];
  const postes = useMemo(() => {
    const out: [number, number][] = [];
    for (const [a, b, c, d] of tramos) {
      const n = Math.max(1, Math.round(Math.hypot(c - a, d - b) / 2.2));
      for (let i = 0; i <= n; i++) out.push([a + ((c - a) * i) / n, b + ((d - b) * i) / n]);
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useFrame(() => {
    lampara.current!.emissiveIntensity = 0.6 + energia() * 3;
  });

  return (
    <group>
      {tramos.map(([a, b, c, d], i) => {
        const largo = Math.hypot(c - a, d - b);
        const t = malla.clone();
        t.needsUpdate = true;
        t.repeat.set(largo * 3, H * 3);
        return (
          <group key={i} position={[(a + c) / 2, 0, (b + d) / 2]} rotation={[0, -Math.atan2(d - b, c - a), 0]}>
            <mesh position={[0, H / 2, 0]}>
              <planeGeometry args={[largo, H]} />
              <meshStandardMaterial map={t} transparent alphaTest={0.3} side={THREE.DoubleSide} metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0, H, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03, 0.03, largo, 6]} />
              <meshStandardMaterial color="#aeb6c1" metalness={0.7} />
            </mesh>
          </group>
        );
      })}
      {postes.map(([x, z], i) => (
        <mesh key={i} position={[x, H / 2 + 0.1, z]} castShadow>
          <cylinderGeometry args={[0.045, 0.05, H + 0.2, 6]} />
          <meshStandardMaterial color="#9aa3ae" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      {/* Puerta de dos hojas */}
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, H / 2, Z1]}>
          <boxGeometry args={[1.36, H - 0.1, 0.04]} />
          <meshStandardMaterial map={mallaPuerta} transparent alphaTest={0.3} color="#dfe5ec" metalness={0.6} />
        </mesh>
      ))}
      {/* Señal de peligro */}
      <mesh position={[2.6, 1.35, Z1 + 0.03]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshStandardMaterial map={senal} roughness={0.6} />
      </mesh>
      {/* Poste de iluminación */}
      <group position={[X1 - 0.4, 0, Z1 - 0.4]}>
        <mesh position={[0, 2.6, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.09, 5.2, 8]} />
          <meshStandardMaterial color="#8d96a3" metalness={0.7} />
        </mesh>
        <mesh position={[-0.45, 5.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.9, 6]} />
          <meshStandardMaterial color="#8d96a3" metalness={0.7} />
        </mesh>
        <mesh position={[-0.85, 5.08, 0]}>
          <boxGeometry args={[0.45, 0.1, 0.22]} />
          <meshStandardMaterial ref={lampara} color="#fff3d6" emissive="#ffd88a" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** Tablero general en la fachada de la fábrica: ahí llega la energía de la planta. */
function TableroFabrica({ energia }: { energia: () => number }) {
  const led = useRef<THREE.MeshStandardMaterial>(null);
  const senal = useMemo(() => texturaSenal(), []);
  useFrame(({ clock }) => {
    led.current!.emissiveIntensity = 1 + energia() * (2 + Math.sin(clock.elapsedTime * 4) * 1.2);
  });
  return (
    <group position={[47.5, 0, -8.5]}>
      <mesh position={[0, 0.06, 0.05]} receiveShadow>
        <boxGeometry args={[1.6, 0.12, 0.9]} />
        <meshStandardMaterial color="#b0ada4" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.8, 0.45]} />
        <meshStandardMaterial color="#c3cad3" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, 1.02, 0.228]}>
        <boxGeometry args={[0.02, 1.6, 0.005]} />
        <meshStandardMaterial color="#8f98a4" />
      </mesh>
      <mesh position={[0.3, 1.45, 0.229]}>
        <boxGeometry args={[0.36, 0.22, 0.005]} />
        <meshStandardMaterial color="#1b2230" metalness={0.4} roughness={0.2} />
      </mesh>
      <mesh position={[-0.3, 1.62, 0.229]}>
        <boxGeometry args={[0.4, 0.05, 0.005]} />
        <meshStandardMaterial color="#f0a500" emissive="#f0a500" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.3, 1.25, 0.232]}>
        <sphereGeometry args={[0.025, 10, 10]} />
        <meshStandardMaterial ref={led} color="#3dff8a" emissive="#3dff8a" emissiveIntensity={1.5} toneMapped={false} />
      </mesh>
      <mesh position={[-0.2, 1.02, 0.232]}>
        <planeGeometry args={[0.18, 0.18]} />
        <meshStandardMaterial map={senal} />
      </mesh>
      {/* Tubo que sube del tablero a la nave */}
      <mesh position={[0, 2.5, -0.1]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 1.4, 10]} />
        <meshStandardMaterial color="#9aa3ae" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.3, 0.24]}>
        <boxGeometry args={[0.6, 0.25, 0.05]} />
        <meshStandardMaterial color="#2a3039" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ---------- Fábrica con techo solar ---------- */

function Fabrica({ energia }: { energia: () => number }) {
  const lamina = useMemo(() => {
    const t = texturaLamina();
    t.repeat.set(10, 1.6);
    return t;
  }, []);
  const lado = useMemo(() => {
    const t = texturaLamina();
    t.repeat.set(6, 1.6);
    return t;
  }, []);
  const puerta = useMemo(() => {
    const t = texturaLamina("#6c7581", "#525b66");
    t.rotation = Math.PI / 2;
    t.repeat.set(1, 6);
    return t;
  }, []);
  const celdas = useMemo(() => texturaCeldas(true), []);
  const ventanas = useRef<THREE.MeshStandardMaterial>(null);
  const techoSolar = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const m = new THREE.Object3D();
    let n = 0;
    for (const lado of [-1, 1])
      for (let i = 0; i < 12; i++)
        for (let j = 0; j < 3; j++) {
          // Sobre cada agua del techo (pendiente 0,12 rad desde la cumbrera)
          const z = 1.4 + j * 1.9;
          m.position.set(-10.2 + i * 1.86, 9.48 - z * 0.12, lado * z);
          m.rotation.set(lado * 0.12, 0, 0);
          m.updateMatrix();
          techoSolar.current!.setMatrixAt(n++, m.matrix);
        }
    techoSolar.current!.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame(() => {
    ventanas.current!.emissiveIntensity = 0.3 + energia() * 2.4;
  });

  const blanco = <meshStandardMaterial color="#eef1f5" metalness={0.2} roughness={0.5} />;

  return (
    <group>
      {/* Nave principal */}
      <group position={[56, 0, -16]}>
        <mesh position={[0, 0.5, 0]} receiveShadow>
          <boxGeometry args={[24.4, 1, 14.4]} />
          <meshStandardMaterial color="#9aa3ae" roughness={0.8} />
        </mesh>
        <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[24, 8, 14]} />
          <meshStandardMaterial attach="material-0" map={lado} roughness={0.55} metalness={0.2} />
          <meshStandardMaterial attach="material-1" map={lado} roughness={0.55} metalness={0.2} />
          <meshStandardMaterial attach="material-2" color="#8c97a6" />
          <meshStandardMaterial attach="material-3" color="#8c97a6" />
          <meshStandardMaterial attach="material-4" map={lamina} roughness={0.55} metalness={0.2} />
          <meshStandardMaterial attach="material-5" map={lamina} roughness={0.55} metalness={0.2} />
        </mesh>
        {/* Techo a dos aguas */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, 8.9, s * 3.55]} rotation={[s * 0.12, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[24.8, 0.25, 7.6]} />
            <meshStandardMaterial color="#8792a1" metalness={0.55} roughness={0.45} />
          </mesh>
        ))}
        <instancedMesh ref={techoSolar} args={[undefined, undefined, 72]} castShadow>
          <boxGeometry args={[1.75, 0.05, 1.8]} />
          <meshStandardMaterial map={celdas} metalness={0.45} roughness={0.2} />
        </instancedMesh>
        {/* Fachada: puertas de cargue, marquesina y franja de ventanas */}
        {[-8, -3.5, 1, 5.5].map((x) => (
          <mesh key={x} position={[x, 2.6, 7.06]}>
            <boxGeometry args={[3.2, 4, 0.12]} />
            <meshStandardMaterial map={puerta} roughness={0.6} metalness={0.3} />
          </mesh>
        ))}
        <mesh position={[-1.25, 5.1, 8.3]} castShadow>
          <boxGeometry args={[17, 0.22, 2.6]} />
          <meshStandardMaterial color="#cdd4de" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 6.9, 7.06]}>
          <boxGeometry args={[22, 0.9, 0.08]} />
          <meshStandardMaterial ref={ventanas} color="#ffe2a0" emissive="#ffb347" emissiveIntensity={0.4} toneMapped={false} />
        </mesh>
        <mesh position={[9.5, 3.4, 7.08]}>
          <boxGeometry args={[3.2, 1.1, 0.06]} />
          <meshStandardMaterial color="#0d2b5e" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[9.5, 3.4, 7.12]}>
          <boxGeometry args={[2.6, 0.18, 0.02]} />
          <meshStandardMaterial color="#f0a500" emissive="#f0a500" emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
        {/* Equipos de aire en el techo */}
        {[-6, 0, 6].map((x) => (
          <mesh key={x} position={[x, 9.6, 0]} castShadow>
            <boxGeometry args={[1.6, 0.9, 1.4]} />
            {blanco}
          </mesh>
        ))}
      </group>

      {/* Oficinas de vidrio */}
      <group position={[40.5, 0, -12]}>
        <mesh position={[0, 3.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[6, 7.2, 6]} />
          <meshStandardMaterial color="#25476e" metalness={0.9} roughness={0.08} />
        </mesh>
        {[1.8, 3.6, 5.4, 7.2].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <boxGeometry args={[6.12, 0.2, 6.12]} />
            {blanco}
          </mesh>
        ))}
      </group>

      {/* Silos */}
      {[0, 4.4].map((dx) => (
        <group key={dx} position={[71 + dx * 0.2, 0, -22 + dx]}>
          <mesh position={[0, 5, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.9, 1.9, 10, 24]} />
            <meshStandardMaterial color="#e3e7ec" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, 10.8, 0]} castShadow>
            <coneGeometry args={[1.95, 1.6, 24]} />
            <meshStandardMaterial color="#cfd5dd" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Camiones en los muelles */}
      {[-8, 1].map((x) => (
        <group key={x} position={[56 + x, 0, -1.2]}>
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

      {/* Parqueadero con techo solar */}
      <group position={[64, 0, -2.5]}>
        {[
          [-4.5, -2],
          [4.5, -2],
          [-4.5, 2],
          [4.5, 2],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 1.5, z]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
            <meshStandardMaterial color="#9aa3ae" metalness={0.6} />
          </mesh>
        ))}
        <mesh position={[0, 3.1, 0]} rotation={[0.08, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[10.5, 0.12, 5.4]} />
          <meshStandardMaterial map={celdas} metalness={0.45} roughness={0.2} />
        </mesh>
        {[
          [-3, "#c62828"],
          [0, "#eceff1"],
          [3, "#37474f"],
        ].map(([x, c]) => (
          <mesh key={x as number} position={[x as number, 0.65, 0]} castShadow>
            <boxGeometry args={[1.8, 1.1, 4]} />
            <meshStandardMaterial color={c as string} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ---------- Cámara y mundo ---------- */

function Mundo({ progress, raton, listo, movil }: Props) {
  const { camera } = useThree();
  const entrada = useRef(0);
  const tmp = useMemo(() => ({ v: new THREE.Vector3(), p: new THREE.Vector3(), t: new THREE.Vector3(), mira: new THREE.Vector3() }), []);
  const base = useMemo(() => new THREE.Vector3(filaX(HEROE.fila), ALTO, colZ(HEROE.col)), []);
  const centro = useMemo(() => new THREE.Vector3(14, 0, -6), []);
  const energia = useMemo(() => () => 0.45 + 0.55 * tramo(progress.get(), 0.76, 0.88), [progress]);
  const hora = useMemo(() => () => progress.get(), [progress]);

  // Cables: de cada inversor a la troncal, la troncal hasta la estación y de ahí a la fábrica
  // Cables: ramal de cada inversor a la zanja, troncal hasta la subestación y de ahí a la fábrica
  const { ramales, troncales } = useMemo(() => {
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const S = 0.03; // a ras de suelo: el cable queda medio enterrado
    const ramales: THREE.Vector3[][] = [];
    for (let f = 0; f < FILAS; f++) {
      const x = filaX(f) + INV_DX;
      ramales.push([V(x, 0.62, INV_Z - 0.02), V(x, S, INV_Z - 0.02), V(x, S, 11.8)]);
    }
    // Todo en ángulo recto, como va la canalización en obra
    const troncales = [
      // Planta → entra por la puerta de la subestación y sube al gabinete del inversor
      [V(filaX(0) + INV_DX, S, 11.8), V(34.2, S, 11.8), V(34.2, S, 1.6), V(33, S, 1.6), V(33, S, 0.8), V(33, 0.55, 0.8), V(33, 0.55, 0.42)],
      // Transformador → sale por el costado, va enterrado y sube al tablero de la fábrica
      [V(36.9, 0.6, 0.17), V(36.9, 0.6, 0.6), V(36.9, S, 0.6), V(43.5, S, 0.6), V(43.5, S, -7.6), V(47.5, S, -7.6), V(47.5, 0.3, -7.6), V(47.5, 0.3, -8.24)],
    ];
    return { ramales, troncales };
  }, []);

  const rutasCamara = useMemo(() => {
    const b = base;
    const P = (x: number, y: number, z: number) => new THREE.Vector3(b.x + x, y, b.z + z);
    const k = movil ? 1.35 : 1;
    return {
      pos: new THREE.CatmullRomCurve3([P(6 * k, 13, 27 * k), P(1, 5.5, 13), P(-3.6, 4.6, 8.6), P(-2.2, 4.4, 8.2), P(9, 8, 15), P(24, 6.5, 6.5), P(18 * k, 34, 52 * k)]),
      mira: new THREE.CatmullRomCurve3([P(-6, 1.5, -18), P(-2, 1.8, -6), P(0.4, 3.0, 1.6), P(0.5, 3.0, 1.6), P(6, 1.5, -6), P(35, 1.6, -6), P(36, 0, -16)]),
    };
  }, [base, movil]);

  useFrame(({ clock }, dt) => {
    const p = progress.get();
    if (listo) entrada.current = Math.min(1, entrada.current + dt / 2.6);
    const e = 1 - Math.pow(1 - entrada.current, 3);
    // Momento del scroll en que la cámara llega a cada punto (el penúltimo pasa junto a la subestación)
    const tiempos = [0, 0.2, 0.4, 0.6, 0.78, 0.9, 1];
    let i = 0;
    while (i < tiempos.length - 2 && p > tiempos[i + 1]) i++;
    const u = (i + c01((p - tiempos[i]) / (tiempos[i + 1] - tiempos[i]))) / (tiempos.length - 1);
    rutasCamara.pos.getPoint(u, tmp.p);
    rutasCamara.mira.getPoint(u, tmp.t);
    tmp.v.set(tmp.p.x - 18, tmp.p.y + 22, tmp.p.z + 26);
    tmp.p.lerpVectors(tmp.v, tmp.p, e);
    const r = raton.current;
    const t = clock.elapsedTime;
    tmp.p.x += r.x * 1.2 + Math.sin(t * 0.25) * 0.4;
    tmp.p.y += -r.y * 0.6 + Math.sin(t * 0.33) * 0.15;
    const f = 1 - Math.pow(0.0015, dt);
    camera.position.lerp(tmp.p, f);
    tmp.mira.lerp(tmp.t, f);
    camera.lookAt(tmp.mira);
  });

  return (
    <>
      <Cielo hora={hora} centro={centro} sombra={60} calidad={movil ? 1024 : 2048} />
      <Terreno zonas={zonas} caminos={caminos} seg={movil ? 140 : 220} />
      <Arboles zonas={zonas} n={movil ? 60 : 120} rmin={55} rmax={170} />
      <Planta progress={progress} />
      <PanelHeroe progress={progress} base={base} />
      <Cables rutas={ramales} nivel={energia} grosor={0.03} fases={3} enterrado recto />
      <Cables rutas={troncales} nivel={energia} grosor={0.07} fases={3} enterrado mojones recto />
      <TableroFabrica energia={energia} />
      <Inversores movil={movil} energia={energia} />
      <Skid energia={energia} />
      <Fabrica energia={energia} />
    </>
  );
}

export default function EscenaSolar(props: Props) {
  return (
    <Lienzo movil={props.movil} posicion={[-40, 30, 40]}>
      <Mundo {...props} />
    </Lienzo>
  );
}
