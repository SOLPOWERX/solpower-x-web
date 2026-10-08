"use client";

/* Equipos eléctricos detallados que se repiten en las escenas: inversor, batería, tablero, bandejas y abrazaderas. */

import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { texturaSenal } from "./comun";

type V3 = [number, number, number];

/** Materiales compartidos (se crean una vez por escena). */
export function useMaterialesEquipos() {
  return useMemo(
    () => ({
      blanco: new THREE.MeshStandardMaterial({ color: "#f6f8fb", metalness: 0.15, roughness: 0.26 }),
      vidrio: new THREE.MeshStandardMaterial({ color: "#121a26", metalness: 0.5, roughness: 0.12 }),
      aletas: new THREE.MeshStandardMaterial({ color: "#c7ced8", metalness: 0.65, roughness: 0.3 }),
      oscuro: new THREE.MeshStandardMaterial({ color: "#23282f", metalness: 0.4, roughness: 0.5 }),
      negro: new THREE.MeshStandardMaterial({ color: "#121418", roughness: 0.55 }),
      rojo: new THREE.MeshStandardMaterial({ color: "#c62828", roughness: 0.45 }),
      amarillo: new THREE.MeshStandardMaterial({ color: "#f2c230", roughness: 0.45 }),
      gris: new THREE.MeshStandardMaterial({ color: "#aab2bd", metalness: 0.6, roughness: 0.35 }),
      galvanizado: new THREE.MeshStandardMaterial({ color: "#a3acb7", metalness: 0.8, roughness: 0.32 }),
      plata: new THREE.MeshStandardMaterial({ color: "#d9dee5", metalness: 0.7, roughness: 0.25 }),
      oro: new THREE.MeshStandardMaterial({ color: "#f0a500", emissive: "#f0a500", emissiveIntensity: 0.7, toneMapped: false }),
      led: new THREE.MeshStandardMaterial({ color: "#3dff8a", emissive: "#3dff8a", emissiveIntensity: 1.5, toneMapped: false }),
      gabinete: new THREE.MeshStandardMaterial({ color: "#c3cad3", metalness: 0.4, roughness: 0.35 }),
    }),
    [],
  );
}
export type MatsEquipos = ReturnType<typeof useMaterialesEquipos>;

/**
 * Inversor de pared. Mira hacia +z local; la pared queda detrás.
 * Medidas base 0,62 × 0,8 × 0,24 m (`escala` para equipos comerciales).
 * Entradas DC abajo a la izquierda (x ≈ −0,12) y salida AC abajo a la derecha (x ≈ +0,16).
 */
export function Inversor({ m, position, rotation = [0, 0, 0], escala = 1, simple = false }: { m: MatsEquipos; position: V3; rotation?: V3; escala?: number; simple?: boolean }) {
  return (
    <group position={position} rotation={rotation} scale={escala}>
      <mesh position={[0, 0, -0.145]} material={m.oscuro}>
        <boxGeometry args={[0.5, 0.86, 0.03]} />
      </mesh>
      <RoundedBox args={[0.62, 0.8, 0.24]} radius={0.045} smoothness={3} material={m.blanco} castShadow />
      {!simple && (
        <>
          {/* Aletas de disipación */}
          {[-1, 1].flatMap((s) =>
            [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <mesh key={`${s}${i}`} position={[s * 0.322, -0.32 + i * 0.09, -0.04]} material={m.aletas}>
                <boxGeometry args={[0.03, 0.045, 0.18]} />
              </mesh>
            )),
          )}
          {/* Panel frontal oscuro con franja dorada y tres luces de estado */}
          <mesh position={[0, 0.2, 0.121]} material={m.vidrio}>
            <boxGeometry args={[0.4, 0.2, 0.006]} />
          </mesh>
          <mesh position={[0, 0.25, 0.125]} material={m.oro}>
            <boxGeometry args={[0.24, 0.018, 0.003]} />
          </mesh>
          {[-0.07, 0, 0.07].map((x) => (
            <mesh key={x} position={[x, 0.16, 0.126]} material={m.led}>
              <sphereGeometry args={[0.012, 8, 8]} />
            </mesh>
          ))}
          {/* Placa de datos */}
          <mesh position={[0.2, -0.18, 0.121]} material={m.plata}>
            <boxGeometry args={[0.13, 0.09, 0.004]} />
          </mesh>
          {/* Regleta de conexiones abajo: dos pares DC (rojo/negro), prensaestopa AC y comunicaciones */}
          <mesh position={[0, -0.405, 0]} material={m.oscuro}>
            <boxGeometry args={[0.5, 0.03, 0.17]} />
          </mesh>
          {[
            [-0.21, m.rojo],
            [-0.165, m.negro],
            [-0.11, m.rojo],
            [-0.065, m.negro],
          ].map(([x, mat], i) => (
            <mesh key={i} position={[x as number, -0.45, 0.01]} material={mat as THREE.Material}>
              <cylinderGeometry args={[0.014, 0.014, 0.07, 8]} />
            </mesh>
          ))}
          <mesh position={[0.16, -0.445, 0.01]} material={m.gris}>
            <cylinderGeometry args={[0.03, 0.03, 0.06, 12]} />
          </mesh>
          <mesh position={[0.06, -0.44, 0.01]} material={m.negro}>
            <boxGeometry args={[0.04, 0.05, 0.03]} />
          </mesh>
          {/* Seccionador DC (perilla roja sobre placa amarilla) en el costado */}
          <mesh position={[0.322, -0.25, 0.04]} material={m.amarillo}>
            <boxGeometry args={[0.02, 0.1, 0.1]} />
          </mesh>
          <mesh position={[0.34, -0.25, 0.04]} rotation={[0, 0, Math.PI / 2]} material={m.rojo}>
            <boxGeometry args={[0.025, 0.09, 0.025]} />
          </mesh>
        </>
      )}
    </group>
  );
}

/** Pantalla con el porcentaje de carga (se dibuja solo cuando cambia). */
function PantallaCarga({ carga }: { carga: () => number }) {
  const { lienzo, tex } = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 48;
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return { lienzo: c, tex: t };
  }, []);
  const ultimo = useRef(-1);
  useFrame(() => {
    const v = Math.round(Math.min(1, Math.max(0, carga())) * 100);
    if (v === ultimo.current) return;
    ultimo.current = v;
    const g = lienzo.getContext("2d")!;
    g.fillStyle = "#06121f";
    g.fillRect(0, 0, 128, 48);
    g.fillStyle = "#3dff8a";
    g.font = "bold 22px monospace";
    g.fillText(`${v}%`, 8, 30);
    g.strokeStyle = "#3dff8a";
    g.lineWidth = 2;
    g.strokeRect(70, 14, 50, 20);
    g.fillRect(72, 16, (46 * v) / 100, 16);
    tex.needsUpdate = true;
  });
  return (
    <mesh position={[0, 0.02, 0.137]}>
      <planeGeometry args={[0.36, 0.135]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

/**
 * Batería de litio apilable: base, `modulos` módulos y unidad de control con pantalla de carga.
 * Mira hacia +z local. Bornes a la derecha, a la altura de la unidad de control.
 */
export function Bateria({ m, position, rotation = [0, 0, 0], carga, modulos = 3 }: { m: MatsEquipos; position: V3; rotation?: V3; carga: () => number; modulos?: number }) {
  const barras = useMemo(
    () => Array.from({ length: modulos }, () => new THREE.MeshStandardMaterial({ color: "#16301f", emissive: "#3dff8a", emissiveIntensity: 0, toneMapped: false })),
    [modulos],
  );
  useFrame(() => {
    const c = carga() * modulos;
    barras.forEach((b, i) => (b.emissiveIntensity = Math.min(1, Math.max(0, c - i)) * 1.8));
  });
  const H = 0.42;
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.04, 0]} material={m.oscuro} castShadow>
        <boxGeometry args={[0.82, 0.08, 0.3]} />
      </mesh>
      {barras.map((b, i) => {
        const y = 0.08 + H / 2 + i * (H + 0.012);
        return (
          <group key={i} position={[0, y, 0]}>
            <RoundedBox args={[0.76, H, 0.26]} radius={0.035} smoothness={3} material={m.blanco} castShadow />
            <mesh position={[0, -H / 2 + 0.004, 0.131]} material={m.gris}>
              <boxGeometry args={[0.72, 0.006, 0.003]} />
            </mesh>
            {/* Barra de carga del módulo */}
            <mesh position={[-0.22, 0.08, 0.132]} material={b}>
              <boxGeometry args={[0.16, 0.03, 0.004]} />
            </mesh>
            {/* Asas laterales */}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.39, 0, 0]} material={m.gris}>
                <boxGeometry args={[0.025, 0.18, 0.12]} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* Unidad de control con pantalla */}
      <group position={[0, 0.08 + modulos * (H + 0.012) + 0.17, 0]}>
        <RoundedBox args={[0.76, 0.32, 0.27]} radius={0.04} smoothness={3} material={m.blanco} castShadow />
        <mesh position={[0, 0.02, 0.135]} material={m.vidrio}>
          <boxGeometry args={[0.42, 0.17, 0.004]} />
        </mesh>
        <PantallaCarga carga={carga} />
        <mesh position={[0, -0.12, 0.137]} material={m.oro}>
          <boxGeometry args={[0.3, 0.014, 0.003]} />
        </mesh>
        {/* Bornes (+ rojo, − negro) */}
        {[
          [0.05, m.rojo],
          [-0.05, m.negro],
        ].map(([z, mat], i) => (
          <mesh key={i} position={[0.395, -0.05, z as number]} rotation={[0, 0, Math.PI / 2]} material={mat as THREE.Material}>
            <cylinderGeometry args={[0.018, 0.018, 0.04, 8]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** Ventana del tablero con hileras de interruptores. */
function texturaBreakers() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 160;
  const g = c.getContext("2d")!;
  g.fillStyle = "#cfd5dc";
  g.fillRect(0, 0, 128, 160);
  for (let r = 0; r < 4; r++) {
    g.fillStyle = "#2b3038";
    g.fillRect(8, 12 + r * 36, 112, 26);
    for (let k = 0; k < 8; k++) {
      g.fillStyle = "#1a1d22";
      g.fillRect(12 + k * 13.5, 15 + r * 36, 11, 20);
      g.fillStyle = k % 3 === 0 ? "#e53935" : "#f5f5f5";
      g.fillRect(15 + k * 13.5, 20 + r * 36, 5, 8);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Tablero eléctrico con ventana de interruptores, manija, señal y medidor opcional encima. Mira hacia +z local. */
export function Tablero({ m, position, rotation = [0, 0, 0], ancho = 0.9, alto = 1.2, medidor = false }: { m: MatsEquipos; position: V3; rotation?: V3; ancho?: number; alto?: number; medidor?: boolean }) {
  const breakers = useMemo(() => texturaBreakers(), []);
  const senal = useMemo(() => texturaSenal(), []);
  return (
    <group position={position} rotation={rotation}>
      <mesh material={m.gabinete} castShadow receiveShadow>
        <boxGeometry args={[ancho, alto, 0.26]} />
      </mesh>
      <mesh position={[0, 0, 0.131]} material={m.gris}>
        <boxGeometry args={[ancho - 0.06, alto - 0.06, 0.004]} />
      </mesh>
      <mesh position={[-ancho * 0.12, alto * 0.08, 0.135]}>
        <planeGeometry args={[ancho * 0.55, alto * 0.55]} />
        <meshStandardMaterial map={breakers} roughness={0.4} />
      </mesh>
      <mesh position={[ancho * 0.34, 0, 0.145]} material={m.oscuro}>
        <boxGeometry args={[0.04, 0.16, 0.03]} />
      </mesh>
      <mesh position={[-ancho * 0.12, -alto * 0.36, 0.135]}>
        <planeGeometry args={[0.16, 0.16]} />
        <meshStandardMaterial map={senal} />
      </mesh>
      <mesh position={[0, alto / 2 - 0.05, 0.136]} material={m.oro}>
        <boxGeometry args={[ancho * 0.5, 0.02, 0.003]} />
      </mesh>
      {medidor && (
        <group position={[0, alto / 2 + 0.3, 0]}>
          <mesh material={m.gabinete} castShadow>
            <boxGeometry args={[0.36, 0.44, 0.2]} />
          </mesh>
          <mesh position={[0, 0.03, 0.101]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.01, 24]} />
            <meshStandardMaterial color="#d6ecff" metalness={0.2} roughness={0.05} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0.03, 0.107]}>
            <planeGeometry args={[0.14, 0.05]} />
            <meshStandardMaterial color="#0b2a14" emissive="#3dff8a" emissiveIntensity={0.6} toneMapped={false} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/** Bandeja portacables abierta (en U) entre dos puntos. `normal` indica hacia dónde mira el fondo de la bandeja. */
export function Bandeja({ m, desde, hasta, ancho = 0.3, normal = [1, 0, 0] }: { m: MatsEquipos; desde: V3; hasta: V3; ancho?: number; normal?: V3 }) {
  const { pos, quat, largo } = useMemo(() => {
    const a = new THREE.Vector3(...desde);
    const b = new THREE.Vector3(...hasta);
    const dir = b.clone().sub(a);
    const largo = dir.length();
    dir.normalize();
    const n = new THREE.Vector3(...normal).normalize();
    const lado = new THREE.Vector3().crossVectors(n, dir).normalize();
    const mat = new THREE.Matrix4().makeBasis(lado, n, dir);
    return { pos: a.clone().add(b).multiplyScalar(0.5), quat: new THREE.Quaternion().setFromRotationMatrix(mat), largo };
  }, [desde, hasta, normal]);
  return (
    <group position={pos} quaternion={quat}>
      <mesh position={[0, -0.04, 0]} material={m.galvanizado} castShadow>
        <boxGeometry args={[ancho, 0.012, largo]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * ancho) / 2, 0, 0]} material={m.galvanizado} castShadow>
          <boxGeometry args={[0.012, 0.09, largo]} />
        </mesh>
      ))}
    </group>
  );
}

/** Abrazaderas cada cierto tramo sobre una ruta de cable pegada a la pared. */
export function Abrazaderas({ m, puntos, cada = 0.5, tam = 0.09 }: { m: MatsEquipos; puntos: THREE.Vector3[]; cada?: number; tam?: number }) {
  const lista = useMemo(() => {
    const c = new THREE.CatmullRomCurve3(puntos, false, "catmullrom", 0.05);
    const n = Math.max(2, Math.floor(c.getLength() / cada));
    return Array.from({ length: n }, (_, i) => c.getPointAt((i + 0.5) / n));
  }, [puntos, cada]);
  return (
    <group>
      {lista.map((p, i) => (
        <mesh key={i} position={p} material={m.gris}>
          <boxGeometry args={[tam, tam, tam]} />
        </mesh>
      ))}
    </group>
  );
}

/** Hace parpadear las luces de estado según la energía. */
export function useLedsEquipos(m: MatsEquipos, energia: () => number) {
  useFrame(({ clock }) => {
    m.led.emissiveIntensity = 0.8 + energia() * (1.8 + Math.sin(clock.elapsedTime * 3) * 0.9);
  });
}
