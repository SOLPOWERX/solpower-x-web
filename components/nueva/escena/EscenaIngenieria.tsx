"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, RoundedBox } from "@react-three/drei";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useLayoutEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { Inversor, Tablero, useLedsEquipos, useMaterialesEquipos } from "./equipos";
import { Arboles, Cables, Cielo, Terreno, c01, texturaCeldas, texturaMalla, texturaRejilla, texturaSenal, tramo, type Momento, type Zona } from "./comun";

/*
 * Página Ingeniería: todo empieza como un plano técnico (líneas azules) y se vuelve real.
 * Subestación de patio → línea de media tensión con energía → cuarto de celdas y analizador de redes
 * donde la onda distorsionada se limpia (calidad de energía).
 */

type Raton = MutableRefObject<{ x: number; y: number }>;
type Props = { progress: MotionValue<number>; raton: Raton; movil: boolean };

/** 0 = plano técnico, 1 = real. */
const real = (p: number) => tramo(p, 0.15, 0.36);

const zonas: Zona[] = [
  { x0: -10, x1: 26, z0: -9, z1: 9, color: "#9d9a90" }, // patio de la subestación
  { x0: -80, x1: -10, z0: -4, z1: 4, color: "#5d7f3c" }, // servidumbre de la línea
];

const dia: Momento[] = [
  { p: 0, arriba: "#03112c", horizonte: "#0a2a5c", sol: "#2a4a80", luz: 0.6 },
  { p: 0.17, arriba: "#03112c", horizonte: "#0a2a5c", sol: "#2a4a80", luz: 0.8 },
  { p: 0.36, arriba: "#2a5fae", horizonte: "#ffc996", sol: "#ffd9a0", luz: 2.5 },
  { p: 0.6, arriba: "#2f74d6", horizonte: "#d4e8ff", sol: "#fff4dc", luz: 3.0 },
  { p: 1, arriba: "#142a5c", horizonte: "#ff9e4a", sol: "#ffb347", luz: 2.0 },
];

/* ---------- Plano técnico: dibuja los bordes de todo y desvanece el color hasta que se vuelve real ---------- */

function Plano({ progress, lineas = true, children }: { progress: MotionValue<number>; lineas?: boolean; children: ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const datos = useRef<{ mats: THREE.Material[]; trans: boolean }>({ mats: [], trans: true });
  const lineaMat = useMemo(() => new THREE.LineBasicMaterial({ color: "#7fd8ff", transparent: true, opacity: 0.9, toneMapped: false }), []);

  useLayoutEffect(() => {
    const mats = new Set<THREE.Material>();
    const creadas: THREE.LineSegments[] = [];
    g.current!.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || o.userData.fijo) return;
      const arr = Array.isArray(m.material) ? m.material : [m.material];
      arr.forEach((x) => {
        if ((x as THREE.ShaderMaterial).isShaderMaterial) return;
        x.userData.op0 = x.userData.op0 ?? x.opacity;
        x.transparent = true;
        mats.add(x);
      });
      if (lineas && !(m as THREE.InstancedMesh).isInstancedMesh && !o.userData.sinLineas) {
        const l = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 28), lineaMat);
        l.userData.fijo = true;
        m.add(l);
        creadas.push(l);
      }
    });
    datos.current = { mats: [...mats], trans: true };
    return () =>
      creadas.forEach((l) => {
        l.parent?.remove(l);
        l.geometry.dispose();
      });
  }, [lineas, lineaMat]);

  useFrame(() => {
    const k = real(progress.get());
    const d = datos.current;
    const trans = k < 0.99;
    d.mats.forEach((m) => {
      m.opacity = (m.userData.op0 ?? 1) * k;
      m.visible = k > 0.01;
      if (trans !== d.trans) {
        m.transparent = trans || (m.userData.op0 ?? 1) < 1;
        m.needsUpdate = true;
      }
    });
    d.trans = trans;
    lineaMat.opacity = 0.9 * (1 - k);
    lineaMat.visible = k < 0.99;
  });

  return <group ref={g}>{children}</group>;
}

/** Etiqueta del plano técnico que señala un equipo. */
function Cota({ progress, pos, texto }: { progress: MotionValue<number>; pos: [number, number, number]; texto: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useFrame(() => {
    const p = progress.get();
    if (ref.current) ref.current.style.opacity = String(Math.min(tramo(p, 0.11, 0.15), 1 - real(p)));
  });
  return (
    <Html position={pos} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
      <div ref={ref} className="whitespace-nowrap rounded-md border border-[#7fd8ff]/60 bg-[#03112c]/70 px-2 py-1 font-mono text-[11px] text-[#bfeaff] opacity-0">
        {texto}
      </div>
    </Html>
  );
}

/* ---------- Transformador de potencia ---------- */

function Transformador() {
  const cuerpo = <meshStandardMaterial color="#8e9aa8" metalness={0.55} roughness={0.4} />;
  const porcelana = <meshStandardMaterial color="#7a4a2c" roughness={0.3} />;
  return (
    <group>
      <mesh position={[0, 0.2, 0]} receiveShadow>
        <boxGeometry args={[5, 0.4, 4]} />
        <meshStandardMaterial color="#b4b1a8" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 3, 2.2]} />
        {cuerpo}
      </mesh>
      {/* Radiadores a los dos lados */}
      {[-1, 1].map((s) =>
        [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75].map((x) => (
          <mesh key={`${s}${x}`} position={[x, 1.8, s * 1.35]} castShadow>
            <boxGeometry args={[0.08, 2.3, 0.5]} />
            {cuerpo}
          </mesh>
        )),
      )}
      {/* Tanque conservador */}
      <mesh position={[0.6, 3.95, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 2, 16]} />
        {cuerpo}
      </mesh>
      {/* Bujes de media tensión (altos) y de baja tensión */}
      {[-0.65, 0, 0.65].map((z) => (
        <group key={z}>
          <mesh position={[-0.9, 3.95, z]} castShadow>
            <cylinderGeometry args={[0.1, 0.14, 1.1, 10]} />
            {porcelana}
          </mesh>
          {[3.6, 3.85, 4.1, 4.35].map((y) => (
            <mesh key={y} position={[-0.9, y, z]}>
              <cylinderGeometry args={[0.19, 0.19, 0.04, 12]} />
              {porcelana}
            </mesh>
          ))}
          <mesh position={[0.9, 3.65, z]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 0.5, 8]} />
            {porcelana}
          </mesh>
        </group>
      ))}
      {/* Placa */}
      <mesh position={[0, 2.2, 1.11]}>
        <boxGeometry args={[0.7, 0.4, 0.02]} />
        <meshStandardMaterial color="#d8dde3" metalness={0.6} />
      </mesh>
    </group>
  );
}

/* ---------- Pórtico de llegada de la línea ---------- */

function Portico() {
  const acero = <meshStandardMaterial color="#9aa3ae" metalness={0.75} roughness={0.35} />;
  const porcelana = <meshStandardMaterial color="#7a4a2c" roughness={0.3} />;
  return (
    <group position={[-7, 0, 0]}>
      {[-2.6, 2.6].map((z) => (
        <group key={z}>
          <mesh position={[0, 4.5, z]} castShadow>
            <boxGeometry args={[0.4, 9, 0.4]} />
            {acero}
          </mesh>
          {/* Celosía */}
          {[1.5, 3.5, 5.5, 7.5].map((y) => (
            <mesh key={y} position={[0, y, z]} rotation={[0, 0, 0.6]}>
              <boxGeometry args={[0.06, 1.6, 0.06]} />
              {acero}
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 8.7, 0]} castShadow>
        <boxGeometry args={[0.35, 0.35, 5.8]} />
        {acero}
      </mesh>
      <mesh position={[0, 6, 0]} castShadow>
        <boxGeometry args={[0.25, 0.25, 5.8]} />
        {acero}
      </mesh>
      {[-1.2, 0, 1.2].map((z) => (
        <group key={z}>
          {/* Cadena de aisladores */}
          {[8.4, 8.2, 8.0, 7.8].map((y) => (
            <mesh key={y} position={[0, y, z]}>
              <cylinderGeometry args={[0.16, 0.16, 0.05, 12]} />
              {porcelana}
            </mesh>
          ))}
          {/* Seccionador */}
          <mesh position={[0.35, 6.45, z]} rotation={[0, 0, 0.25]} castShadow>
            <boxGeometry args={[0.06, 0.9, 0.06]} />
            {acero}
          </mesh>
          {/* Pararrayos */}
          <mesh position={[0.6, 5.5, z]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.9, 10]} />
            <meshStandardMaterial color="#6b6f75" roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------- Postes de la línea de media tensión ---------- */

const POSTES = [-13, -27, -41, -55, -69];

function Postes() {
  const concreto = <meshStandardMaterial color="#b9b5ab" roughness={0.9} />;
  return (
    <group>
      {POSTES.map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 6, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.26, 12, 10]} />
            {concreto}
          </mesh>
          <mesh position={[0, 11.2, 0]} castShadow>
            <boxGeometry args={[0.18, 0.18, 3.2]} />
            <meshStandardMaterial color="#8a8f96" metalness={0.6} />
          </mesh>
          {[-1.2, 0, 1.2].map((z) => (
            <mesh key={z} position={[0, 11.45, z]}>
              <cylinderGeometry args={[0.09, 0.12, 0.35, 10]} />
              <meshStandardMaterial color="#7a4a2c" roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ---------- Cuarto de celdas y analizador de redes ---------- */

function Analizador({ progress }: { progress: MotionValue<number> }) {
  const { lienzo, tex } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 160;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return { lienzo: c, tex: t };
  }, []);
  useFrame(({ clock }) => {
    const p = progress.get();
    const sucia = 1 - tramo(p, 0.84, 0.95);
    const g = lienzo.getContext("2d")!;
    g.fillStyle = "#06121f";
    g.fillRect(0, 0, 256, 160);
    g.strokeStyle = "rgba(127,216,255,.15)";
    g.lineWidth = 1;
    for (let x = 0; x < 256; x += 32) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, 160);
      g.stroke();
    }
    g.beginPath();
    g.moveTo(0, 80);
    g.lineTo(256, 80);
    g.stroke();
    // Onda: con armónicos al principio, limpia después de la corrección
    g.strokeStyle = sucia > 0.5 ? "#ff7a3a" : "#3dff8a";
    g.lineWidth = 3;
    g.beginPath();
    const t = clock.elapsedTime * 2;
    for (let x = 0; x <= 256; x += 2) {
      const a = (x / 256) * Math.PI * 4 + t;
      const y = Math.sin(a) + sucia * (0.32 * Math.sin(5 * a) + 0.2 * Math.sin(7 * a));
      if (x === 0) g.moveTo(x, 80 - y * 48);
      else g.lineTo(x, 80 - y * 48);
    }
    g.stroke();
    g.fillStyle = "#bfeaff";
    g.font = "bold 18px monospace";
    g.fillText(`THD ${Math.round(3 + sucia * 15)} %`, 10, 24);
    g.fillText(`FP ${(0.98 - sucia * 0.2).toFixed(2)}`, 150, 24);
    tex.needsUpdate = true;
  });
  return (
    <group position={[6.2, 0, 3.4]} rotation={[0, -0.5, 0]} scale={1.7}>
      {/* Trípode */}
      {[0, 2.1, 4.2].map((r) => (
        <mesh key={r} position={[Math.sin(r) * 0.25, 0.6, Math.cos(r) * 0.25]} rotation={[Math.cos(r) * 0.35, 0, -Math.sin(r) * 0.35]}>
          <cylinderGeometry args={[0.02, 0.02, 1.3, 6]} />
          <meshStandardMaterial color="#2b2f36" metalness={0.6} />
        </mesh>
      ))}
      <RoundedBox args={[0.7, 0.48, 0.14]} radius={0.04} smoothness={3} position={[0, 1.42, 0]} castShadow>
        <meshStandardMaterial color="#f2c230" roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 1.44, 0.075]} userData={{ fijo: true }}>
        <planeGeometry args={[0.56, 0.35]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

function CuartoCeldas() {
  const rejilla = useMemo(() => {
    const t = texturaRejilla();
    t.repeat.set(2, 1);
    return t;
  }, []);
  const senal = useMemo(() => texturaSenal(), []);
  return (
    <group position={[7, 0, -2]}>
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[6.6, 0.3, 4.6]} />
        <meshStandardMaterial color="#b4b1a8" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 3.4, 4]} />
        <meshStandardMaterial color="#e9e5dc" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.8, 0]} castShadow>
        <boxGeometry args={[6.4, 0.25, 4.4]} />
        <meshStandardMaterial color="#5f6873" roughness={0.6} />
      </mesh>
      <mesh position={[-1.2, 1.5, 2.02]}>
        <boxGeometry args={[1.6, 2.4, 0.06]} />
        <meshStandardMaterial color="#5b616b" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[1.4, 2.6, 2.02]}>
        <boxGeometry args={[1.6, 0.8, 0.04]} />
        <meshStandardMaterial map={rejilla} />
      </mesh>
      <mesh position={[0.2, 1.9, 2.04]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial map={senal} />
      </mesh>
    </group>
  );
}

/* ---------- Planta solar del proyecto: mesas con estructura, inversores, tablero AC y estación de monitoreo ---------- */

const MESAS_Z = [-5, -0.4, 4.2];
const PANEL_X0 = 12.9;
const N_COL = 11;
const PAN_A = 1.0; // ancho del panel
const PAN_L = 1.7; // largo del panel (en la pendiente)
const TILT = 0.21; // ~12°
const Y_FRENTE = 0.75;
/** Punto sobre la mesa: `u` a lo largo (x), `v` en la pendiente (0 = borde de abajo, 1 = arriba). */
const enMesa = (zc: number, x: number, v: number, sobre = 0): [number, number, number] => {
  const prof = 2 * PAN_L;
  const d = (v - 0.5) * prof; // positivo hacia el borde de arriba (atrás, −z)
  return [x, Y_FRENTE + (prof / 2) * Math.sin(TILT) + d * Math.sin(TILT) + sobre, zc - d * Math.cos(TILT)];
};

function PlantaSolar({ energia }: { energia: () => number }) {
  const panelesRef = useRef<THREE.InstancedMesh>(null);
  const m = useMaterialesEquipos();
  useLedsEquipos(m, energia);
  const cara = useMemo(() => new THREE.MeshStandardMaterial({ map: texturaCeldas(true), metalness: 0.45, roughness: 0.18 }), []);
  const prof = 2 * PAN_L;
  const xs = Array.from({ length: 6 }, (_, i) => PANEL_X0 - 0.3 + i * ((N_COL * PAN_A + 0.6) / 5));

  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    let n = 0;
    for (const zc of MESAS_Z)
      for (let f = 0; f < 2; f++)
        for (let i = 0; i < N_COL; i++) {
          const v = (f + 0.5) / 2;
          const [x, y, z] = enMesa(zc, PANEL_X0 + i * (PAN_A + 0.02), v, 0.08);
          o.position.set(x, y, z);
          o.rotation.set(TILT, 0, 0);
          o.updateMatrix();
          panelesRef.current!.setMatrixAt(n++, o.matrix);
        }
    panelesRef.current!.instanceMatrix.needsUpdate = true;
  }, []);

  const yBajo = Y_FRENTE;
  const yAlto = Y_FRENTE + prof * Math.sin(TILT);
  return (
    <group>
      <instancedMesh ref={panelesRef} args={[undefined, undefined, MESAS_Z.length * 2 * N_COL]} material={cara} castShadow receiveShadow>
        <boxGeometry args={[PAN_A, 0.04, PAN_L]} />
      </instancedMesh>
      {MESAS_Z.map((zc) => {
        const zF = zc + (prof / 2) * Math.cos(TILT);
        const zA = zc - (prof / 2) * Math.cos(TILT);
        return (
          <group key={zc}>
            {xs.map((x) => (
              <group key={x}>
                {/* Poste delantero (bajo) y trasero (alto) con su dado de concreto */}
                <mesh position={[x, (yBajo - 0.08) / 2, zF - 0.25]} material={m.galvanizado} castShadow>
                  <boxGeometry args={[0.07, yBajo - 0.08, 0.07]} />
                </mesh>
                <mesh position={[x, (yAlto - 0.08) / 2, zA + 0.25]} material={m.galvanizado} castShadow>
                  <boxGeometry args={[0.07, yAlto - 0.08, 0.07]} />
                </mesh>
                {[zF - 0.25, zA + 0.25].map((z) => (
                  <mesh key={z} position={[x, 0.08, z]} material={m.gris}>
                    <cylinderGeometry args={[0.13, 0.15, 0.16, 10]} />
                  </mesh>
                ))}
                {/* Viga inclinada y riostra diagonal */}
                <mesh position={[x, (yBajo + yAlto) / 2 - 0.05, zc]} rotation={[TILT, 0, 0]} material={m.galvanizado} castShadow>
                  <boxGeometry args={[0.06, 0.08, prof - 0.2]} />
                </mesh>
                <mesh position={[x, (yAlto * 0.55) / 1.1, zc]} rotation={[-0.62, 0, 0]} material={m.galvanizado}>
                  <boxGeometry args={[0.04, 0.04, prof * 0.55]} />
                </mesh>
              </group>
            ))}
            {/* Rieles (correas) a lo largo de la mesa */}
            {[0.12, 0.38, 0.62, 0.88].map((v) => {
              const [, y, z] = enMesa(zc, 0, v, 0.02);
              return (
                <mesh key={v} position={[PANEL_X0 + ((N_COL - 1) * (PAN_A + 0.02)) / 2, y, z]} material={m.plata} castShadow>
                  <boxGeometry args={[N_COL * (PAN_A + 0.02) + 0.5, 0.05, 0.05]} />
                </mesh>
              );
            })}
            {/* Inversor de la mesa, en su soporte al costado oeste */}
            <group position={[PANEL_X0 - 1.05, 0, zc + 0.9]}>
              {[-0.32, 0.32].map((dz) => (
                <mesh key={dz} position={[0, 0.85, dz]} material={m.galvanizado} castShadow>
                  <boxGeometry args={[0.06, 1.7, 0.06]} />
                </mesh>
              ))}
              {[0.6, 1.5].map((y) => (
                <mesh key={y} position={[0, y, 0]} material={m.galvanizado}>
                  <boxGeometry args={[0.05, 0.05, 0.74]} />
                </mesh>
              ))}
              <mesh position={[-0.05, 1.82, 0]} rotation={[0, 0, -0.25]} material={m.plata} castShadow>
                <boxGeometry args={[0.55, 0.025, 0.9]} />
              </mesh>
              <Inversor m={m} position={[-0.17, 1.1, 0]} rotation={[0, -Math.PI / 2, 0]} />
            </group>
          </group>
        );
      })}
      {/* Estación de monitoreo (piranómetro y sensor de temperatura) */}
      <group position={[24.6, 0, 7]}>
        <mesh position={[0, 1.4, 0]} material={m.galvanizado} castShadow>
          <cylinderGeometry args={[0.04, 0.05, 2.8, 8]} />
        </mesh>
        <mesh position={[0.3, 2.75, 0]} rotation={[0, 0, Math.PI / 2]} material={m.galvanizado}>
          <cylinderGeometry args={[0.025, 0.025, 0.6, 6]} />
        </mesh>
        <mesh position={[0.55, 2.82, 0]} material={m.blanco}>
          <cylinderGeometry args={[0.07, 0.07, 0.06, 14]} />
        </mesh>
        <mesh position={[0.55, 2.87, 0]}>
          <sphereGeometry args={[0.045, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#dff0ff" transparent opacity={0.7} roughness={0.05} />
        </mesh>
        <RoundedBox args={[0.3, 0.38, 0.14]} radius={0.03} smoothness={3} position={[0, 1.6, 0.1]} material={m.blanco} />
      </group>
    </group>
  );
}

/** Tablero de AC en la pared del cuarto de celdas: recibe los inversores. */
function TableroAC() {
  const m = useMaterialesEquipos();
  return (
    <group>
      <Tablero m={m} position={[10.14, 1.35, -1.6]} rotation={[0, Math.PI / 2, 0]} ancho={0.9} alto={1} />
      <mesh position={[10.14, 2.15, -1.6]} material={m.galvanizado}>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 10]} />
      </mesh>
    </group>
  );
}

/** Cerramiento del patio. */
function Cerca() {
  const malla = useMemo(() => texturaMalla(), []);
  const tramos: [number, number, number, number][] = [
    [-9.5, -8.5, 25.5, -8.5],
    [25.5, -8.5, 25.5, 8.5],
    [-9.5, 8.5, 25.5, 8.5],
    [-9.5, -8.5, -9.5, -3.5],
    [-9.5, 3.5, -9.5, 8.5],
  ];
  return (
    <group>
      {tramos.map(([a, b, c, d], i) => {
        const largo = Math.hypot(c - a, d - b);
        const t = malla.clone();
        t.needsUpdate = true;
        t.repeat.set(largo * 3, 2.2 * 3);
        return (
          <mesh key={i} position={[(a + c) / 2, 1.1, (b + d) / 2]} rotation={[0, -Math.atan2(d - b, c - a), 0]} userData={{ sinLineas: true }}>
            <planeGeometry args={[largo, 2.2]} />
            <meshStandardMaterial map={t} transparent alphaTest={0.3} side={THREE.DoubleSide} metalness={0.6} roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Malla de puesta a tierra: se ve en el plano y queda enterrada en lo real. */
function MallaTierra({ progress }: { progress: MotionValue<number> }) {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d9893b", emissive: "#d9893b", emissiveIntensity: 0.8, metalness: 0.8, transparent: true }), []);
  useFrame(() => {
    mat.opacity = 1 - real(progress.get());
    mat.visible = mat.opacity > 0.01;
  });
  const lineas: [number, number, number, number][] = [];
  for (let x = -8; x <= 24; x += 4) lineas.push([x, 0, 0.06, 16]);
  for (let z = -7; z <= 7; z += 3.5) lineas.push([8, z, 32, 0.06]);
  return (
    <group>
      {lineas.map(([x, z, w, d], i) => (
        <mesh key={i} position={[x, 0.08, z]} material={mat}>
          <boxGeometry args={[w, 0.04, d]} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- Mundo y cámara ---------- */

function Mundo({ progress, raton, movil }: Props) {
  const { camera } = useThree();
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), t: new THREE.Vector3(), mira: new THREE.Vector3(0, 2, 0) }), []);
  const hora = useMemo(() => () => progress.get(), [progress]);
  const lineaMT = useMemo(() => () => tramo(progress.get(), 0.38, 0.5) * (0.6 + 0.4 * tramo(progress.get(), 0.58, 0.66)), [progress]);
  const bt = useMemo(() => () => tramo(progress.get(), 0.45, 0.55), [progress]);

  // Conductores con catenaria entre apoyos
  const conductores = useMemo(() => {
    const out: THREE.Vector3[][] = [];
    for (const z of [-1.2, 0, 1.2]) {
      const apoyos: THREE.Vector3[] = [
        ...[...POSTES].reverse().map((x) => new THREE.Vector3(x, 11.62, z)),
        new THREE.Vector3(-7, 7.75, z),
      ];
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i < apoyos.length - 1; i++) {
        const a = apoyos[i];
        const b = apoyos[i + 1];
        for (let k = 0; k < 8; k++) {
          const t = k / 8;
          const pp = a.clone().lerp(b, t);
          pp.y -= 0.9 * 4 * t * (1 - t);
          pts.push(pp);
        }
      }
      pts.push(apoyos[apoyos.length - 1]);
      // Del pórtico al buje del transformador
      pts.push(new THREE.Vector3(-4, 5.8, z * 0.75), new THREE.Vector3(-0.9, 4.5, z * 0.54));
      out.push(pts);
    }
    return out;
  }, []);
  const rutasSolar = useMemo(() => {
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const dc = MESAS_Z.map((zc) => {
      const [, y, z] = enMesa(zc, 0, 0.12, -0.06);
      return [V(PANEL_X0 + (N_COL - 1) * (PAN_A + 0.02), y, z), V(PANEL_X0 - 0.2, y, z), V(PANEL_X0 - 0.75, 0.9, zc + 0.75), V(PANEL_X0 - 1.2, 0.6, zc + 0.78)];
    });
    const ac = MESAS_Z.map((zc, i) => [
      V(PANEL_X0 - 1.2, 0.6, zc + 1.17),
      V(PANEL_X0 - 1.25, 0.03, zc + 1.6),
      V(10.9, 0.03, -0.4 + i * 0.2),
      V(10.35, 0.4, -1.75 + i * 0.15),
      V(10.18, 0.86, -1.75 + i * 0.15),
    ]);
    return { dc, ac };
  }, []);
  const rutasBT = useMemo(() => {
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    return [[V(0.9, 3.9, 0), V(1.6, 2.4, 0.9), V(2.4, 0.03, 1.6), V(4.6, 0.03, 1.2), V(5.4, 0.4, 0.2), V(5.4, 0.8, 0)]];
  }, []);

  const tiempos = [0, 0.2, 0.42, 0.6, 0.76, 0.9, 1];
  const rutasCamara = useMemo(() => {
    const k = movil ? 1.3 : 1;
    const P = (x: number, y: number, z: number) => new THREE.Vector3(x * k, y, z * k);
    return {
      pos: new THREE.CatmullRomCurve3([P(-24, 18, 30), P(-12, 12, 22), P(-3, 6.5, 11), P(-24, 10, 12), P(21, 6.5, 15), P(8.4, 2.8, 6.9), P(-10, 26, 38)]),
      mira: new THREE.CatmullRomCurve3([
        new THREE.Vector3(2, 2, 0),
        new THREE.Vector3(0, 2.5, 0),
        new THREE.Vector3(-1, 3.4, 0),
        new THREE.Vector3(-34, 8, -2),
        new THREE.Vector3(13, 1.4, 0),
        new THREE.Vector3(6.2, 2.4, 3.4),
        new THREE.Vector3(4, 0, -2),
      ]),
    };
  }, [movil]);

  useFrame(({ clock }, dt) => {
    const p = c01(progress.get());
    let i = 0;
    while (i < tiempos.length - 2 && p > tiempos[i + 1]) i++;
    const u = (i + c01((p - tiempos[i]) / (tiempos[i + 1] - tiempos[i]))) / (tiempos.length - 1);
    rutasCamara.pos.getPoint(u, tmp.p);
    rutasCamara.mira.getPoint(u, tmp.t);
    const r = raton.current;
    const t = clock.elapsedTime;
    tmp.p.x += r.x * 1.1 + Math.sin(t * 0.25) * 0.35;
    tmp.p.y += -r.y * 0.5 + Math.sin(t * 0.33) * 0.15;
    const f = 1 - Math.pow(0.0015, dt);
    camera.position.lerp(tmp.p, f);
    tmp.mira.lerp(tmp.t, f);
    camera.lookAt(tmp.mira);
  });

  const centro = useMemo(() => new THREE.Vector3(4, 0, 0), []);
  return (
    <>
      <Cielo hora={hora} momentos={dia} centro={centro} sombra={45} calidad={movil ? 1024 : 2048} />
      {/* Cuadrícula del plano técnico */}
      <Cuadricula progress={progress} />
      <Plano progress={progress} lineas={false}>
        <Terreno zonas={zonas} seg={movil ? 140 : 200} />
        <Arboles zonas={zonas} n={movil ? 50 : 110} rmin={40} rmax={160} semilla={11} />
        <Cerca />
      </Plano>
      <Plano progress={progress}>
        <PlantaSolar energia={bt} />
        <Transformador />
        <Portico />
        <Postes />
        <CuartoCeldas />
        <Analizador progress={progress} />
      </Plano>
      <MallaTierra progress={progress} />
      {conductores.map((c, i) => (
        <Cables key={i} rutas={[c]} nivel={lineaMT} grosor={0.035} fases={1} />
      ))}
      <Cables rutas={rutasBT} nivel={bt} grosor={0.05} fases={3} enterrado />
      <Cables rutas={rutasSolar.dc} nivel={bt} grosor={0.022} fases={2} />
      <Cables rutas={rutasSolar.ac} nivel={bt} grosor={0.03} fases={3} enterrado />
      <TableroAC />
      <Cota progress={progress} pos={[0, 5.4, 0]} texto="Transformador 630 kVA · 13,2 kV / 440 V" />
      <Cota progress={progress} pos={[-7, 10, 0]} texto="Pórtico de llegada MT" />
      <Cota progress={progress} pos={[-27, 13, 0]} texto="Red de media tensión 13,2 kV" />
      <Cota progress={progress} pos={[7, 4.6, -2]} texto="Cuarto de celdas" />
      <Cota progress={progress} pos={[17, 2.8, -1]} texto="Generación solar 35 kWp" />
      <Cota progress={progress} pos={[16, 0.6, 7]} texto="Malla de puesta a tierra · IEEE 80" />
    </>
  );
}

function Cuadricula({ progress }: { progress: MotionValue<number> }) {
  const ref = useRef<THREE.GridHelper>(null);
  useFrame(() => {
    const m = ref.current!.material as THREE.LineBasicMaterial;
    m.transparent = true;
    m.opacity = 0.55 * (1 - real(progress.get()));
    m.visible = m.opacity > 0.01;
  });
  return <gridHelper ref={ref} args={[240, 120, "#2f8fd8", "#1a4f86"]} position={[0, 0.02, 0]} />;
}

export default function EscenaIngenieria(props: Props) {
  return (
    <Canvas
      shadows={props.movil ? true : "soft"}
      dpr={props.movil ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: props.movil ? 55 : 42, near: 0.1, far: 1500, position: [-24, 18, 30] }}
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
