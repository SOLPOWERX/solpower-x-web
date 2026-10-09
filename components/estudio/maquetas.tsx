"use client";

/* Maquetas 3D hechas para explicar cada idea de la portada (no son capturas de las escenas). */

import { useFrame } from "@react-three/fiber";
import { useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { Bateria, Bandeja, Inversor, Tablero, useLedsEquipos, useMaterialesEquipos } from "@/components/nueva/escena/equipos";
import { Cables, Tuberia, texturaLamina, texturaMalla, texturaRejilla, texturaSenal } from "@/components/nueva/escena/comun";
import { Portico, Transformador } from "@/components/nueva/escena/EscenaIngenieria";
import { Arbol, Casco, Conductores, Flujo, Isla, MesaSolar, ORO, ORO_CLARO, Paneles, Parche, Poste, RoundedBox, lienzo, useVentanas } from "./base";

type V3 = [number, number, number];
const uno = () => 1;
const vs = (r: V3[][]) => r.map((p) => p.map((q) => new THREE.Vector3(...q)));

/* ---------- Texturas dibujadas ---------- */

function texturaMadera() {
  const t = lienzo(256, 256, (g) => {
    g.fillStyle = "#9a6a42";
    g.fillRect(0, 0, 256, 256);
    for (let x = 0; x < 256; x += 16) {
      g.fillStyle = x % 32 ? "#87593a" : "#a8774c";
      g.fillRect(x, 0, 12, 256);
    }
  }, true);
  return t;
}

function texturaTejas() {
  return lienzo(256, 256, (g) => {
    g.fillStyle = "#a4472b";
    g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 32) {
      g.fillStyle = "rgba(0,0,0,.22)";
      g.fillRect(0, y + 26, 256, 6);
      for (let x = (y / 32) % 2 ? 16 : 0; x < 256; x += 32) {
        g.fillStyle = "rgba(255,255,255,.08)";
        g.fillRect(x + 3, y + 2, 20, 22);
      }
    }
  }, true);
}

/** Plano técnico: cuadrícula azul con un dibujo de planta solar y cotas. */
function texturaPlano(fondo = "#0a2a5c") {
  return lienzo(1024, 720, (g) => {
    g.fillStyle = fondo;
    g.fillRect(0, 0, 1024, 720);
    g.strokeStyle = "rgba(127,216,255,.18)";
    g.lineWidth = 1;
    for (let x = 0; x < 1024; x += 32) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, 720);
      g.stroke();
    }
    for (let y = 0; y < 720; y += 32) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(1024, y);
      g.stroke();
    }
    g.strokeStyle = "#bfeaff";
    g.lineWidth = 3;
    // Mesas de paneles en planta
    for (let f = 0; f < 3; f++)
      for (let c = 0; c < 8; c++) g.strokeRect(120 + c * 82, 110 + f * 150, 74, 120);
    // Unifilar: inversor, tablero, medidor
    g.strokeRect(820, 140, 110, 80);
    g.strokeRect(820, 300, 110, 110);
    g.beginPath();
    g.arc(875, 500, 40, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(875, 220);
    g.lineTo(875, 300);
    g.moveTo(875, 410);
    g.lineTo(875, 460);
    g.moveTo(780, 180);
    g.lineTo(820, 180);
    g.stroke();
    // Cotas doradas
    g.strokeStyle = "#ffc23d";
    g.fillStyle = "#ffc23d";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(120, 600);
    g.lineTo(770, 600);
    g.moveTo(120, 588);
    g.lineTo(120, 612);
    g.moveTo(770, 588);
    g.lineTo(770, 612);
    g.stroke();
    g.font = "bold 26px monospace";
    g.fillText("16,40 m", 400, 590);
    g.fillStyle = "#bfeaff";
    g.font = "bold 22px monospace";
    g.fillText("INV", 852, 188);
    g.fillText("TGBT", 845, 360);
    g.fillText("kWh", 852, 508);
  });
}

/* ---------- Casa moderna (techo de una caída con paneles) ---------- */

function CasaModerna({ position = [0, 0, 0], rotY = 0, ventanas, medidor = true }: { position?: V3; rotY?: number; ventanas: THREE.Material; medidor?: boolean }) {
  const madera = useMemo(() => {
    const t = texturaMadera();
    t.repeat.set(2, 2);
    return t;
  }, []);
  const W = 4.6;
  const H = 2.9;
  const D = 3.6;
  const blanco = <meshStandardMaterial color="#f2efe9" roughness={0.7} />;
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        {blanco}
      </mesh>
      <mesh position={[-W / 2 + 0.75, H / 2 + 0.01, 0.02]} castShadow>
        <boxGeometry args={[1.5, H + 0.02, D + 0.06]} />
        <meshStandardMaterial map={madera} roughness={0.7} />
      </mesh>
      {/* Techo de una caída hacia el frente, con paneles */}
      <group position={[0.15, H + 0.32, 0]} rotation={[-0.24, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[W + 0.6, 0.16, D + 0.8]} />
          <meshStandardMaterial color="#3a3f48" roughness={0.6} metalness={0.2} />
        </mesh>
        <Paneles position={[0.25, 0.14, 0.05]} cols={4} filas={2} marcoOscuro />
      </group>
      {/* Ventanales y puerta */}
      <mesh position={[0.9, 1.45, D / 2 + 0.02]} material={ventanas}>
        <boxGeometry args={[2.3, 1.9, 0.04]} />
      </mesh>
      {[-0.25, 0.9, 2.05].map((x) => (
        <mesh key={x} position={[x, 1.45, D / 2 + 0.05]}>
          <boxGeometry args={[0.06, 1.95, 0.04]} />
          <meshStandardMaterial color="#2b2f36" />
        </mesh>
      ))}
      <mesh position={[-W / 2 + 0.75, 1.0, D / 2 + 0.06]}>
        <boxGeometry args={[0.8, 2, 0.05]} />
        <meshStandardMaterial color="#2d2a26" />
      </mesh>
      <mesh position={[W / 2 + 0.02, 1.9, -0.6]} material={ventanas}>
        <boxGeometry args={[0.04, 1, 1.4]} />
      </mesh>
      {medidor && (
        <group position={[W / 2 + 0.1, 1.35, 0.9]}>
          <mesh castShadow>
            <boxGeometry args={[0.18, 0.5, 0.36]} />
            <meshStandardMaterial color="#c3cad3" metalness={0.4} roughness={0.35} />
          </mesh>
          <mesh position={[0.095, 0.05, 0]}>
            <boxGeometry args={[0.01, 0.12, 0.2]} />
            <meshStandardMaterial color="#0b2a14" emissive="#3dff8a" emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/** Sol brillante al fondo. */
function Sol({ position, r = 1.6, color = "#ffd27a" }: { position: V3; r?: number; color?: string }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[r, 32, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[r * 1.9, 32, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ================= 1. Conectado a la red ================= */

export function OnGrid() {
  const v = useVentanas(0.35);
  return (
    <group>
      <Isla r={7} />
      <Parche position={[0, 0, 3.6]} size={[3.2, 4]} color="#c9c3b6" />
      <CasaModerna position={[-0.6, 0, -0.6]} ventanas={v} />
      <Poste position={[5.4, 0, 1.6]} altura={6.2} transformador />
      <Conductores
        tramos={[
          [[5.4, 6.12, 0.8], [5.2, 6.4, -18]],
          [[5.4, 6.12, 1.6], [5.2, 6.4, -17]],
          [[5.4, 6.12, 2.4], [5.2, 6.4, -16]],
          [[5.25, 4.4, 1.6], [1.8, 2.4, 0.3]],
        ]}
      />
      {/* Sol → paneles → casa → medidor → red (los excedentes salen a la red) */}
      <Flujo puntos={[[0.6, 3.4, 0.4], [1.75, 2.9, 0.9], [1.82, 1.6, 0.3]]} n={8} vel={0.3} />
      <Flujo puntos={[[1.85, 1.6, 0.3], [1.85, 2.4, 0.3], [5.25, 4.4, 1.6], [5.3, 6.1, 1.6], [5.4, 6.3, -16]]} n={22} vel={0.12} recto />
      <Sol position={[-14, 13, -24]} r={2} />
      <Arbol position={[-5.1, 0, -2.6]} s={1.2} />
      <Arbol position={[-4.6, 0, 2.6]} s={0.9} tono={1} />
      <Arbol position={[3.4, 0, -4.4]} s={1.1} tono={2} />
    </group>
  );
}

/* ================= 2. Autónomo (finca sin red) ================= */

function Finca({ ventanas }: { ventanas: THREE.Material }) {
  const tejas = useMemo(() => {
    const t = texturaTejas();
    t.repeat.set(3, 2);
    return t;
  }, []);
  const W = 4.6;
  const D = 3.2;
  const H = 2.3;
  const pend = 0.5;
  const sube = (D / 2) * Math.tan(pend);
  return (
    <group>
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#efe4cf" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[W + 0.1, 0.4, D + 0.1]} />
        <meshStandardMaterial color="#8d5b3a" roughness={0.9} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, H + sube / 2, (s * D) / 4]} rotation={[s * pend, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[W + 0.9, 0.12, D / 2 / Math.cos(pend) + 0.7]} />
          <meshStandardMaterial map={tejas} roughness={0.8} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * W) / 2, H, 0]} rotation={[0, (s * Math.PI) / 2, 0]}>
          <shapeGeometry args={[new THREE.Shape([new THREE.Vector2(-D / 2, 0), new THREE.Vector2(D / 2, 0), new THREE.Vector2(0, sube)])]} />
          <meshStandardMaterial color="#efe4cf" side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Corredor con columnas de madera */}
      {[-1.9, -0.6, 0.7, 1.95].map((x) => (
        <mesh key={x} position={[x, H / 2, D / 2 + 0.75]} castShadow>
          <boxGeometry args={[0.14, H, 0.14]} />
          <meshStandardMaterial color="#6e4a2e" />
        </mesh>
      ))}
      {[-1.3, 1.3].map((x) => (
        <group key={x}>
          <mesh position={[x, 1.25, D / 2 + 0.02]} material={ventanas}>
            <boxGeometry args={[0.9, 0.9, 0.04]} />
          </mesh>
          <mesh position={[x, 1.25, D / 2 + 0.04]}>
            <boxGeometry args={[1.02, 0.08, 0.04]} />
            <meshStandardMaterial color="#6e4a2e" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.0, D / 2 + 0.03]}>
        <boxGeometry args={[0.8, 1.8, 0.05]} />
        <meshStandardMaterial color="#5a3b24" />
      </mesh>
    </group>
  );
}

export function OffGrid() {
  const v = useVentanas(2.2);
  const m = useMaterialesEquipos();
  useLedsEquipos(m, uno);
  return (
    <group>
      <Isla r={7} tope="#5f8a3c" />
      <Parche position={[0.2, 0, 3.4]} size={[1.4, 3.8]} color="#b9a27e" />
      <group position={[-0.4, 0, -1.4]}>
        <Finca ventanas={v} />
      </group>
      <MesaSolar position={[2.6, 0, 2.6]} rotY={-0.15} cols={5} filas={2} />
      {/* Cuarto de baterías bajo cubierta */}
      <group position={[3.9, 0, -1.6]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, 2.25, 0]} rotation={[0, 0, 0.1]} castShadow>
          <boxGeometry args={[2.2, 0.08, 1.4]} />
          <meshStandardMaterial color="#8a919b" metalness={0.6} roughness={0.4} />
        </mesh>
        {[-0.95, 0.95].map((x) =>
          [-0.55, 0.55].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 1.1, z]}>
              <boxGeometry args={[0.07, 2.2, 0.07]} />
              <meshStandardMaterial color="#6e4a2e" />
            </mesh>
          )),
        )}
        <group scale={1.35}>
          <Bateria m={m} position={[-0.32, 0, 0]} carga={() => 0.8} />
          <Inversor m={m} position={[0.45, 1.05, -0.3]} />
        </group>
      </group>
      {/* Tanque de agua con bomba solar */}
      <group position={[-5, 0, 1.2]}>
        {[-0.45, 0.45].map((x) =>
          [-0.45, 0.45].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 1.1, z]}>
              <boxGeometry args={[0.08, 2.2, 0.08]} />
              <meshStandardMaterial color="#6e4a2e" />
            </mesh>
          )),
        )}
        <mesh position={[0, 2.75, 0]} castShadow>
          <cylinderGeometry args={[0.75, 0.75, 1.1, 24]} />
          <meshStandardMaterial color="#20262f" roughness={0.6} />
        </mesh>
      </group>
      <Flujo puntos={[[2.6, 1.2, 2.6], [3.6, 0.6, 0.6], [3.6, 1.1, -1.4]]} n={10} vel={0.25} />
      <Flujo puntos={[[3.4, 1.4, -1.8], [1.9, 2.6, -1.6], [0.6, 1.6, -0.4]]} n={10} vel={0.25} />
      <Arbol position={[-4.6, 0, -3.6]} s={1.3} />
      <Arbol position={[-2.6, 0, 4.6]} s={1} tono={2} />
      <Arbol position={[5.2, 0, -4.2]} s={1.1} tono={1} />
    </group>
  );
}

/* ================= 3. Híbrido: la casa sigue encendida cuando se va la luz ================= */

export function Hibrido() {
  const v = useVentanas(2.4);
  const m = useMaterialesEquipos();
  useLedsEquipos(m, uno);
  const apagadas = useMemo(() => new THREE.MeshStandardMaterial({ color: "#252a33", roughness: 0.3, metalness: 0.4 }), []);
  return (
    <group>
      <Isla r={7} />
      <Parche position={[0, 0, 3.6]} size={[3.2, 4]} color="#c9c3b6" />
      <CasaModerna position={[-1.4, 0, -0.6]} ventanas={v} />
      {/* Inversor y batería en la pared de la casa */}
      <group position={[0.92 + 0.05, 0, -0.1]} rotation={[0, Math.PI / 2, 0]} scale={1.35}>
        <Inversor m={m} position={[0.35, 1.5, 0.12]} />
        <Bateria m={m} position={[-0.6, 0, 0.18]} carga={() => 0.72} />
      </group>
      <Tuberia
        rutas={vs([
          [[1.15, 1.35, -0.55], [1.15, 0.6, -0.55], [1.15, 0.6, 0.55], [1.15, 1.6, 0.55]],
        ])}
        radio={0.04}
        nivel={uno}
      />
      {/* Red caída: poste y vecino sin luz */}
      <Poste position={[5.2, 0, 2]} altura={6} />
      <Conductores
        tramos={[
          [[5.2, 5.92, 1.2], [5.0, 6.2, -18]],
          [[5.2, 5.92, 2.0], [5.0, 6.2, -17]],
          [[5.2, 5.92, 2.8], [5.0, 6.2, -16]],
        ]}
      />
      <group position={[4.4, 0, -3.3]} scale={0.7}>
        <mesh position={[0, 1.4, 0]} castShadow>
          <boxGeometry args={[3, 2.8, 2.6]} />
          <meshStandardMaterial color="#8b8f98" roughness={0.9} />
        </mesh>
        <mesh position={[0, 1.6, 1.32]} material={apagadas}>
          <boxGeometry args={[1.4, 0.9, 0.04]} />
        </mesh>
      </group>
      <Flujo puntos={[[-1, 3.6, -0.3], [0.6, 2.8, 0.3], [1.15, 2.3, -0.1]]} n={8} vel={0.3} />
      <Flujo puntos={[[1.2, 1.0, 0.3], [1.6, 0.9, 1.4], [0.4, 1.4, 1.6]]} color="#3dff8a" n={8} vel={0.3} />
      <Arbol position={[-5.4, 0, -2.4]} s={1.2} />
      <Arbol position={[-4.8, 0, 2.8]} s={0.9} tono={1} />
    </group>
  );
}

/* ================= 4. BESS: almacenamiento con baterías ================= */

function Contenedor({ position, rotY = 0, abierto = false }: { position: V3; rotY?: number; abierto?: boolean }) {
  const rejilla = useMemo(() => {
    const t = texturaRejilla();
    t.repeat.set(4, 1);
    return t;
  }, []);
  const leds = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3dffd0", emissive: "#3dffd0", emissiveIntensity: 1.6, toneMapped: false }), []);
  useFrame(({ clock }) => {
    leds.emissiveIntensity = 1.6 + Math.sin(clock.elapsedTime * 2) * 0.4;
  });
  const L = 6;
  const A = 2.6;
  const P = 2.4;
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[L + 0.6, 0.24, P + 0.6]} />
        <meshStandardMaterial color="#b0ada4" roughness={0.9} />
      </mesh>
      <mesh position={[0, A / 2 + 0.24, abierto ? -0.15 : 0]} castShadow receiveShadow>
        <boxGeometry args={[L, A, abierto ? P - 0.3 : P]} />
        <meshStandardMaterial map={rejilla} metalness={0.3} roughness={0.35} />
      </mesh>
      {abierto && (
        <group position={[0, 0.24, P / 2 - 0.3]}>
          {/* Interior con racks de módulos */}
          <mesh position={[0, A / 2, -0.02]}>
            <boxGeometry args={[L - 0.1, A - 0.1, 0.04]} />
            <meshStandardMaterial color="#141a22" />
          </mesh>
          {[-2.2, -1.1, 0, 1.1, 2.2].map((x) =>
            [0.45, 0.85, 1.25, 1.65, 2.05].map((y) => (
              <group key={`${x}${y}`} position={[x, y, 0.08]}>
                <RoundedBox args={[0.95, 0.34, 0.2]} radius={0.03} smoothness={2}>
                  <meshStandardMaterial color="#e9edf2" metalness={0.2} roughness={0.4} />
                </RoundedBox>
                <mesh position={[-0.25, 0, 0.105]} material={leds}>
                  <boxGeometry args={[0.3, 0.05, 0.01]} />
                </mesh>
              </group>
            )),
          )}
          {/* Puertas abiertas */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * (L / 2 + 0.55), A / 2, 0.55]} rotation={[0, s * -1.35, 0]} castShadow>
              <boxGeometry args={[1.5, A - 0.1, 0.06]} />
              <meshStandardMaterial map={rejilla} metalness={0.3} roughness={0.35} />
            </mesh>
          ))}
        </group>
      )}
      <mesh position={[0, A + 0.24 + 0.05, 0]}>
        <boxGeometry args={[L - 0.4, 0.06, 0.08]} />
        <meshStandardMaterial color="#3dffd0" emissive="#3dffd0" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <mesh position={[L / 2 + 0.25, 1.4, 0]} castShadow>
        <boxGeometry args={[0.5, 1.4, 1.5]} />
        <meshStandardMaterial color="#dfe4ea" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

export function Bess() {
  const lamina = useMemo(() => {
    const t = texturaLamina();
    t.repeat.set(5, 1.5);
    return t;
  }, []);
  const rutas = useMemo(
    () => [
      [new THREE.Vector3(-1.6, 0.4, 1.4), new THREE.Vector3(-1.6, 0.03, 1.4), new THREE.Vector3(-1.6, 0.03, 4.2), new THREE.Vector3(-5.2, 0.03, 4.2), new THREE.Vector3(-5.2, 0.03, 2.6)],
      [new THREE.Vector3(1.6, 0.4, -2.6), new THREE.Vector3(1.6, 0.03, -2.6), new THREE.Vector3(5.6, 0.03, -2.6)],
    ],
    [],
  );
  return (
    <group>
      <Isla r={8} tope="#8f8e88" />
      <Contenedor position={[0.2, 0, 0.2]} abierto />
      <Contenedor position={[0.2, 0, -3.6]} />
      <group position={[-5.2, 0, 1.8]} scale={0.48}>
        <Transformador />
      </group>
      {/* Esquina de la fábrica que respaldan */}
      <mesh position={[6.2, 2.4, -1.8]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 4.8, 6]} />
        <meshStandardMaterial map={lamina} metalness={0.2} roughness={0.55} />
      </mesh>
      <mesh position={[4.88, 3.4, -1.8]}>
        <boxGeometry args={[0.04, 0.6, 4.6]} />
        <meshStandardMaterial color="#ffe2a0" emissive="#ffb347" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <Cables rutas={rutas} nivel={uno} grosor={0.04} fases={3} enterrado recto />
      <Flujo puntos={[[-1.6, 1.6, 1.4], [-3.4, 2.4, 3.2], [-5.2, 2.4, 2.2]]} color="#3dffd0" n={10} vel={0.25} />
      <Flujo puntos={[[2.6, 3.0, -3.6], [4.2, 3.6, -2.6], [4.9, 3.2, -1.8]]} color="#3dffd0" n={10} vel={0.25} />
    </group>
  );
}

/* ================= 5. Granjas y plantas solares ================= */

export function Granja() {
  const filas = [-6.6, -4.4, -2.2, 0, 2.2, 4.4, 6.6];
  const R = 10;
  return (
    <group>
      <Isla r={R} h={2.2} />
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[R - 0.8, 64]} />
        <meshStandardMaterial color="#a39d86" roughness={0.95} />
      </mesh>
      {filas.map((z) => {
        const largo = Math.floor(Math.sqrt(R * R - z * z) * 2 - 6);
        const n = Math.max(4, Math.floor(largo / 1.04));
        return (
          <group key={z}>
            <Paneles position={[-1, 1.15, z]} rotation={[0.38, 0, 0]} cols={n} filas={1} l={1.9} />
            <mesh position={[-1, 1.05, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.06, n * 1.04, 8]} />
              <meshStandardMaterial color="#a3acb7" metalness={0.8} roughness={0.3} />
            </mesh>
            {Array.from({ length: Math.ceil(n / 3) + 1 }, (_, i) => -1 - (n * 1.04) / 2 + (i * n * 1.04) / Math.ceil(n / 3)).map((x) => (
              <mesh key={x} position={[x, 0.52, z]} castShadow>
                <boxGeometry args={[0.08, 1.04, 0.08]} />
                <meshStandardMaterial color="#a3acb7" metalness={0.8} roughness={0.3} />
              </mesh>
            ))}
            <RoundedBox args={[0.5, 0.7, 0.3]} radius={0.04} smoothness={2} position={[-1 - (n * 1.04) / 2 - 0.6, 0.75, z]} castShadow>
              <meshStandardMaterial color="#f6f8fb" />
            </RoundedBox>
          </group>
        );
      })}
      <group position={[7.6, 0, -1.2]} scale={0.42} rotation={[0, Math.PI / 2, 0]}>
        <Transformador />
      </group>
      <Flujo puntos={[[-8.1, 0.7, -6.6], [-8.4, 0.2, -7.6], [6.4, 0.2, -7.6], [7.6, 1.4, -1.2]]} n={24} vel={0.1} recto />
      <Arbol position={[8.2, 0, 4.6]} s={1.2} />
      <Arbol position={[-8.6, 0, 4.8]} s={1} tono={1} />
    </group>
  );
}

/* ================= 6. Ingeniería solar: del plano a la obra ================= */

/** Mesa en alambre azul (el diseño). */
function MesaAlambre({ position }: { position: V3 }) {
  const geo = useMemo(() => {
    const g = new THREE.Group();
    const caja = (sx: number, sy: number, sz: number, x: number, y: number, z: number, rx = 0) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz));
      b.position.set(x, y, z);
      b.rotation.x = rx;
      g.add(b);
    };
    for (let c = 0; c < 4; c++) for (let f = 0; f < 2; f++) caja(1, 0.045, 1.7, (c - 1.5) * 1.04, 1.12 - (f - 0.5) * 0.55, (f - 0.5) * 1.65, 0.32);
    for (const x of [-1.9, 0, 1.9])
      for (const [z, h] of [
        [1.2, 0.6],
        [-1.2, 1.55],
      ])
        caja(0.07, h, 0.07, x, h / 2, z);
    g.updateMatrixWorld(true);
    const segs: number[] = [];
    g.children.forEach((o) => {
      const m = o as THREE.Mesh;
      const e = new THREE.EdgesGeometry(m.geometry);
      e.applyMatrix4(m.matrixWorld);
      segs.push(...(e.attributes.position.array as Float32Array));
    });
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
    return out;
  }, []);
  return (
    <lineSegments geometry={geo} position={position}>
      <lineBasicMaterial color="#7fd8ff" toneMapped={false} />
    </lineSegments>
  );
}

export function IngSolar() {
  const plano = useMemo(() => texturaPlano(), []);
  const suelo = useMemo(() => {
    const t = texturaPlano("#0b2f66");
    return t;
  }, []);
  return (
    <group>
      <Isla r={7} />
      {/* Mitad izquierda: el plano */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6.98, 64, Math.PI / 2, Math.PI]} />
        <meshStandardMaterial map={suelo} emissive="#1a4f86" emissiveIntensity={0.35} roughness={0.8} />
      </mesh>
      <MesaAlambre position={[-3.2, 0.02, 0.6]} />
      <mesh position={[-3.2, 0.03, 3.0]}>
        <boxGeometry args={[4.2, 0.01, 0.03]} />
        <meshBasicMaterial color={ORO_CLARO} toneMapped={false} />
      </mesh>
      {/* Mitad derecha: la obra */}
      <MesaSolar position={[3.1, 0, 0.6]} cols={4} filas={2} />
      {/* Plano flotando sobre la obra */}
      <mesh position={[-1.2, 4.1, -2.6]} rotation={[-0.2, 0.18, 0]}>
        <planeGeometry args={[5.2, 3.65]} />
        <meshStandardMaterial map={plano} emissive="#ffffff" emissiveMap={plano} emissiveIntensity={0.9} transparent opacity={0.92} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <Flujo puntos={[[0.6, 2.6, -2.2], [2.2, 2.9, -0.8], [3.1, 1.6, 0.4]]} n={12} vel={0.25} />
      <Casco position={[0.4, 0.02, 3.6]} rotation={[0, -0.6, 0]} s={1.1} />
      <mesh position={[1.9, 0.18, 4.4]} rotation={[0, 0.4, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 2.2, 20]} />
        <meshStandardMaterial color="#cfe6ff" roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ================= 7. Subestaciones ================= */

function Cerca({ r, hueco = 0.88, abre = 0.75 }: { r: number; hueco?: number; abre?: number }) {
  const malla = useMemo(() => texturaMalla(), []);
  const n = 18;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const a0 = (i / n) * Math.PI * 2;
        const a1 = ((i + 1) / n) * Math.PI * 2;
        const medio = (a0 + a1) / 2;
        if (Math.abs(Math.atan2(Math.sin(medio - hueco), Math.cos(medio - hueco))) < abre) return null;
        const x0 = Math.cos(a0) * r;
        const z0 = Math.sin(a0) * r;
        const x1 = Math.cos(a1) * r;
        const z1 = Math.sin(a1) * r;
        const largo = Math.hypot(x1 - x0, z1 - z0);
        const t = malla.clone();
        t.needsUpdate = true;
        t.repeat.set(largo * 3, 6.6);
        return (
          <group key={i}>
            <mesh position={[(x0 + x1) / 2, 1.1, (z0 + z1) / 2]} rotation={[0, -Math.atan2(z1 - z0, x1 - x0), 0]}>
              <planeGeometry args={[largo, 2.2]} />
              <meshStandardMaterial map={t} transparent alphaTest={0.3} side={THREE.DoubleSide} metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[x0, 1.15, z0]}>
              <cylinderGeometry args={[0.04, 0.05, 2.3, 6]} />
              <meshStandardMaterial color="#9aa3ae" metalness={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function Subestacion() {
  const senal = useMemo(() => texturaSenal(), []);
  return (
    <group>
      <Isla r={8} tope="#9d9a90" />
      <group position={[1, 0, 0.4]} scale={0.8}>
        <Transformador />
      </group>
      <group position={[0.8, 0, 0.4]} scale={0.7}>
        <Portico />
      </group>
      <Conductores
        tramos={[-0.84, 0, 0.84].map((z) => [[-4.1, 5.95, 0.4 + z], [-22, 7, 0.4 + z * 1.4]] as [V3, V3])}
        color="#3a3228"
      />
      {[-0.84, 0, 0.84].map((z, i) => (
        <Flujo key={z} puntos={[[-16, 6.8, 0.4 + z * 1.3], [-4.1, 5.95, 0.4 + z], [-1.2, 4.6, 0.4 + z * 0.6], [0.3, 3.6, 0.4 + z * 0.5]]} n={14} vel={0.14} fase={i * 0.2} />
      ))}
      {/* Cuarto de celdas */}
      <group position={[5, 0, -2.6]}>
        <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.8, 2.6, 2.4]} />
          <meshStandardMaterial color="#e9e5dc" roughness={0.8} />
        </mesh>
        <mesh position={[0, 2.7, 0]} castShadow>
          <boxGeometry args={[3.1, 0.2, 2.7]} />
          <meshStandardMaterial color="#5f6873" />
        </mesh>
        <mesh position={[-0.5, 1.05, 1.22]}>
          <boxGeometry args={[0.9, 1.9, 0.04]} />
          <meshStandardMaterial color="#5b616b" metalness={0.4} />
        </mesh>
        <mesh position={[0.6, 1.5, 1.23]}>
          <planeGeometry args={[0.45, 0.45]} />
          <meshStandardMaterial map={senal} />
        </mesh>
      </group>
      <Cerca r={7.3} />
    </group>
  );
}

/* ================= 8. Redes de media y baja tensión ================= */

export function Redes() {
  const v = useVentanas(0.5);
  const xs = [-4.6, 0, 4.6];
  const z = -0.6;
  const fases = [-0.8, 0, 0.8];
  return (
    <group>
      <Isla r={7} />
      <Parche position={[0, 0, 2.6]} size={[14, 1.6]} color="#4a4c50" />
      {xs.map((x, i) => (
        <Poste key={x} position={[x, 0, z]} altura={6.4} transformador={i === 1} />
      ))}
      <Conductores
        tramos={fases.flatMap((dz) => [
          [[-22, 6.6, z + dz], [xs[0], 6.32, z + dz]],
          [[xs[0], 6.32, z + dz], [xs[1], 6.32, z + dz]],
          [[xs[1], 6.32, z + dz], [xs[2], 6.32, z + dz]],
          [[xs[2], 6.32, z + dz], [22, 6.6, z + dz]],
        ] as [V3, V3][])}
        color="#3a3228"
      />
      {fases.map((dz, i) => (
        <Flujo key={dz} puntos={[[-16, 6.5, z + dz], [-4.6, 6.32, z + dz], [0, 6.18, z + dz], [4.6, 6.32, z + dz], [16, 6.5, z + dz]]} n={26} vel={0.08} fase={i * 0.13} />
      ))}
      {/* Acometidas en baja tensión a dos casas */}
      {[-2.6, 2.8].map((x, i) => (
        <group key={x}>
          <group position={[x, 0, 4.4]} rotation={[0, Math.PI, 0]} scale={0.55}>
            <mesh position={[0, 1.6, 0]} castShadow>
              <boxGeometry args={[3.6, 3.2, 3]} />
              <meshStandardMaterial color={i ? "#efe4d2" : "#dfe7ee"} roughness={0.85} />
            </mesh>
            <mesh position={[0, 3.9, 0]} rotation={[0, Math.PI / 4, 0]} scale={[2.7, 1.4, 2.3]} castShadow>
              <coneGeometry args={[1, 1, 4]} />
              <meshStandardMaterial color={i ? "#9a4a32" : "#4a4f58"} roughness={0.7} />
            </mesh>
            <mesh position={[0, 1.6, -1.52]} material={v}>
              <boxGeometry args={[1.2, 0.9, 0.04]} />
            </mesh>
          </group>
          <Conductores tramos={[[[0.38, 4.5, z], [x, 1.9, 3.6]]]} grosor={0.02} />
          <Flujo puntos={[[0.38, 4.5, z], [x * 0.55, 3.4, 1.6], [x, 1.9, 3.6]]} n={8} vel={0.3} tam={0.06} />
        </group>
      ))}
      <Arbol position={[-5.6, 0, -3.6]} s={1.1} />
      <Arbol position={[5.4, 0, -3.8]} s={1.2} tono={1} />
    </group>
  );
}

/* ================= 9. Instalaciones eléctricas ================= */

export function Instalaciones() {
  const m = useMaterialesEquipos();
  useLedsEquipos(m, uno);
  const zp = -1.6;
  return (
    <group>
      <Isla r={6} tope="#8d8b84" />
      <mesh position={[0, 2.2, zp - 0.15]} castShadow receiveShadow>
        <boxGeometry args={[8.6, 4.4, 0.3]} />
        <meshStandardMaterial color="#e9e7e2" roughness={0.85} />
      </mesh>
      <Bandeja m={m} desde={[-3.6, 3.75, zp + 0.3]} hasta={[3.6, 3.75, zp + 0.3]} ancho={0.5} normal={[0, 1, 0]} />
      <Inversor m={m} position={[-2.7, 2.35, zp + 0.12 * 1.3]} escala={1.3} />
      <Inversor m={m} position={[-0.95, 2.35, zp + 0.12 * 1.3]} escala={1.3} />
      <Tablero m={m} position={[1.9, 1.75, zp + 0.13]} ancho={1.4} alto={1.9} medidor />
      <Tuberia
        rutas={vs([
          [[-2.7, 3.66, zp + 0.3], [-2.7, 3.2, zp + 0.3], [-2.95, 3.2, zp + 0.3], [-2.95, 2.86, zp + 0.2]],
          [[-0.95, 3.66, zp + 0.3], [-0.95, 3.2, zp + 0.3], [-1.2, 3.2, zp + 0.3], [-1.2, 2.86, zp + 0.2]],
          [[-2.5, 1.75, zp + 0.2], [-2.5, 1.2, zp + 0.2], [1.5, 1.2, zp + 0.2], [1.5, 0.8, zp + 0.2]],
          [[-0.75, 1.75, zp + 0.2], [-0.75, 1.35, zp + 0.2], [1.8, 1.35, zp + 0.2], [1.8, 0.8, zp + 0.2]],
          [[1.9, 2.7, zp + 0.2], [1.9, 3.66, zp + 0.2]],
        ])}
        radio={0.045}
        nivel={uno}
      />
      <Flujo puntos={[[-3.6, 3.82, zp + 0.3], [3.6, 3.82, zp + 0.3]]} n={18} vel={0.12} tam={0.05} />
      <Casco position={[3.6, 0.02, 1.4]} rotation={[0, -0.5, 0]} s={1} />
      {/* Carrete de cable */}
      <group position={[-3.2, 0.55, 1.6]} rotation={[0, 0.5, Math.PI / 2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.08, 24]} />
          <meshStandardMaterial color="#7a5a3c" />
        </mesh>
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.08, 24]} />
          <meshStandardMaterial color="#7a5a3c" />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.38, 0.38, 0.46, 24]} />
          <meshStandardMaterial color="#c62828" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/* ================= 10. Certificación RETIE ================= */

function texturaCertificado() {
  return lienzo(768, 1000, (g) => {
    g.fillStyle = "#fbfaf6";
    g.fillRect(0, 0, 768, 1000);
    g.strokeStyle = "#0d2b5e";
    g.lineWidth = 10;
    g.strokeRect(24, 24, 720, 952);
    g.strokeStyle = "#f0a500";
    g.lineWidth = 3;
    g.strokeRect(44, 44, 680, 912);
    g.fillStyle = "#0d2b5e";
    g.font = "bold 46px sans-serif";
    g.textAlign = "center";
    g.fillText("CERTIFICADO", 384, 150);
    g.font = "bold 30px sans-serif";
    g.fillText("DE CONFORMIDAD", 384, 196);
    g.fillStyle = "#f0a500";
    g.font = "bold 64px sans-serif";
    g.fillText("RETIE", 384, 290);
    g.textAlign = "left";
    g.fillStyle = "#5b6475";
    for (let i = 0; i < 7; i++) {
      g.fillRect(110, 360 + i * 54, i % 3 === 2 ? 380 : 520, 12);
      g.fillStyle = "#2e9e5b";
      g.font = "bold 34px sans-serif";
      g.fillText("✓", 66, 375 + i * 54);
      g.fillStyle = "#5b6475";
    }
    g.strokeStyle = "#0d2b5e";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(110, 860);
    g.lineTo(360, 860);
    g.stroke();
    g.font = "22px sans-serif";
    g.fillText("Ingeniero responsable", 120, 895);
  });
}

export function Retie() {
  const m = useMaterialesEquipos();
  const cert = useMemo(() => texturaCertificado(), []);
  return (
    <group>
      <Isla r={6} />
      {/* Certificado en su atril */}
      <group position={[-1.2, 0, -0.8]} rotation={[0, 0.25, 0]}>
        <group position={[0, 2.3, 0]} rotation={[-0.14, 0, 0]}>
          <RoundedBox args={[3.2, 4.2, 0.08]} radius={0.04} smoothness={2} castShadow>
            <meshStandardMaterial color="#fbfaf6" roughness={0.8} />
          </RoundedBox>
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[3.08, 4.0]} />
            <meshStandardMaterial map={cert} color="#dad8d1" roughness={0.85} />
          </mesh>
          {/* Sello dorado con cintas */}
          <group position={[1.0, -1.45, 0.08]}>
            {[-0.35, 0.35].map((r) => (
              <mesh key={r} position={[r * 0.4, -0.38, -0.01]} rotation={[0, 0, r]}>
                <boxGeometry args={[0.18, 0.62, 0.01]} />
                <meshStandardMaterial color="#c62828" />
              </mesh>
            ))}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.38, 0.38, 0.06, 32]} />
              <meshStandardMaterial color={ORO} metalness={0.9} roughness={0.25} emissive={ORO} emissiveIntensity={0.25} />
            </mesh>
            <mesh position={[0, 0, 0.035]}>
              <torusGeometry args={[0.28, 0.02, 8, 40]} />
              <meshStandardMaterial color="#ffd27a" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        </group>
        <mesh position={[0, 1.1, -0.7]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[0.08, 2.4, 0.08]} />
          <meshStandardMaterial color="#6e4a2e" />
        </mesh>
      </group>
      {/* Tablero revisado con su visto bueno */}
      <mesh position={[2.9, 0.6, 0.2]} castShadow>
        <boxGeometry args={[0.15, 1.2, 0.15]} />
        <meshStandardMaterial color="#a3acb7" metalness={0.8} />
      </mesh>
      <Tablero m={m} position={[2.9, 1.95, 0.32]} rotation={[0, -0.35, 0]} ancho={1.1} alto={1.4} />
      <group position={[3.0, 3.6, 0.5]} rotation={[0, -0.35, 0]}>
        <mesh position={[-0.22, -0.05, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.16, 0.5, 0.16]} />
          <meshStandardMaterial color="#3dff8a" emissive="#3dff8a" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
        <mesh position={[0.17, 0.18, 0]} rotation={[0, 0, -Math.PI / 5]}>
          <boxGeometry args={[0.16, 0.95, 0.16]} />
          <meshStandardMaterial color="#3dff8a" emissive="#3dff8a" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      </group>
      <Casco position={[1.6, 0.02, 3.0]} rotation={[0, -0.9, 0]} s={1.05} />
      <Arbol position={[-4.6, 0, 2.2]} s={0.9} tono={2} />
    </group>
  );
}

/* ================= 11. Calidad de energía: la onda entra sucia y sale limpia ================= */

function texturaPantalla() {
  return lienzo(512, 320, (g) => {
    g.fillStyle = "#06121f";
    g.fillRect(0, 0, 512, 320);
    g.strokeStyle = "rgba(127,216,255,.15)";
    for (let x = 0; x < 512; x += 64) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, 320);
      g.stroke();
    }
    g.beginPath();
    g.moveTo(0, 170);
    g.lineTo(512, 170);
    g.stroke();
    g.strokeStyle = "#3dff8a";
    g.lineWidth = 5;
    g.beginPath();
    for (let x = 0; x <= 512; x += 2) {
      const y = 170 - Math.sin((x / 512) * Math.PI * 4) * 95;
      if (x === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.stroke();
    g.fillStyle = "#bfeaff";
    g.font = "bold 34px monospace";
    g.fillText("THD 3 %", 18, 46);
    g.fillText("FP 0,98", 320, 46);
  });
}

export function Calidad() {
  const pantalla = useMemo(() => texturaPantalla(), []);
  const { sucia, limpia } = useMemo(() => {
    const onda = (x0: number, x1: number, d: (x: number) => number) =>
      new THREE.CatmullRomCurve3(
        Array.from({ length: 160 }, (_, i) => {
          const x = x0 + ((x1 - x0) * i) / 159;
          const a = x * 1.6;
          return new THREE.Vector3(x, 3.9 + Math.sin(a) * 0.9 + d(x) * (0.32 * Math.sin(5 * a) + 0.22 * Math.sin(7 * a)), -1.8);
        }),
      );
    const mezcla = (x: number) => Math.min(1, Math.max(0, (0.2 - x) / 2.4));
    return {
      sucia: new THREE.TubeGeometry(onda(-7, 0.4, mezcla), 400, 0.06, 8, false),
      limpia: new THREE.TubeGeometry(onda(0.4, 7, () => 0), 300, 0.06, 8, false),
    };
  }, []);
  return (
    <group>
      <Isla r={6.5} tope="#86847c" />
      <mesh geometry={sucia}>
        <meshBasicMaterial color="#ff6a2a" toneMapped={false} />
      </mesh>
      <mesh geometry={limpia}>
        <meshBasicMaterial color={ORO_CLARO} toneMapped={false} />
      </mesh>
      {/* Analizador de redes en su trípode */}
      <group position={[-1.2, 0, 0.8]} rotation={[0, 0.25, 0]} scale={2}>
        {[0, 2.1, 4.2].map((r) => (
          <mesh key={r} position={[Math.sin(r) * 0.25, 0.6, Math.cos(r) * 0.25]} rotation={[Math.cos(r) * 0.35, 0, -Math.sin(r) * 0.35]}>
            <cylinderGeometry args={[0.02, 0.02, 1.3, 6]} />
            <meshStandardMaterial color="#2b2f36" metalness={0.6} />
          </mesh>
        ))}
        <RoundedBox args={[0.9, 0.6, 0.16]} radius={0.05} smoothness={3} position={[0, 1.5, 0]} castShadow>
          <meshStandardMaterial color="#f2c230" roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 1.52, 0.085]}>
          <planeGeometry args={[0.74, 0.46]} />
          <meshBasicMaterial map={pantalla} toneMapped={false} />
        </mesh>
      </group>
      {/* Banco de condensadores con la puerta abierta */}
      <group position={[3.2, 0, -0.6]} rotation={[0, 0.4, 0]}>
        <mesh position={[0, 1.2, -0.1]} castShadow>
          <boxGeometry args={[1.6, 2.4, 0.8]} />
          <meshStandardMaterial color="#c3cad3" metalness={0.4} roughness={0.35} />
        </mesh>
        <mesh position={[0, 1.2, 0.31]}>
          <boxGeometry args={[1.45, 2.25, 0.02]} />
          <meshStandardMaterial color="#20262f" />
        </mesh>
        {[-0.45, 0, 0.45].map((x) =>
          [0.6, 1.3].map((y) => (
            <group key={`${x}${y}`} position={[x, y, 0.42]}>
              <mesh>
                <cylinderGeometry args={[0.16, 0.16, 0.5, 18]} />
                <meshStandardMaterial color="#d9dee5" metalness={0.7} roughness={0.25} />
              </mesh>
              <mesh position={[0, 0.3, 0]}>
                <cylinderGeometry args={[0.05, 0.05, 0.1, 10]} />
                <meshStandardMaterial color="#c62828" />
              </mesh>
            </group>
          )),
        )}
        <mesh position={[0.95, 1.2, 0.75]} rotation={[0, -1.1, 0]}>
          <boxGeometry args={[1.5, 2.3, 0.05]} />
          <meshStandardMaterial color="#c3cad3" metalness={0.4} roughness={0.35} />
        </mesh>
      </group>
      <Casco position={[1.4, 0.02, 3.2]} rotation={[0, -0.4, 0]} />
    </group>
  );
}

/* ================= 12. Nosotros: la mesa del ingeniero ================= */

function texturaPortatil() {
  return lienzo(512, 320, (g) => {
    g.fillStyle = "#0a1a33";
    g.fillRect(0, 0, 512, 320);
    g.fillStyle = "#13305e";
    g.fillRect(0, 0, 512, 40);
    g.fillStyle = "#bfeaff";
    g.font = "bold 20px sans-serif";
    g.fillText("Producción simulada · kWh/mes", 16, 27);
    const vals = [0.55, 0.62, 0.7, 0.78, 0.85, 0.82, 0.88, 0.9, 0.8, 0.72, 0.64, 0.58];
    vals.forEach((v, i) => {
      g.fillStyle = i % 2 ? "#ffc23d" : "#f0a500";
      g.fillRect(30 + i * 39, 290 - v * 220, 26, v * 220);
    });
  });
}

export function Nosotros() {
  const madera = useMemo(() => {
    const t = texturaMadera();
    t.repeat.set(3, 2);
    return t;
  }, []);
  const plano = useMemo(() => texturaPlano(), []);
  const portatil = useMemo(() => texturaPortatil(), []);
  return (
    <group>
      <RoundedBox args={[11, 0.4, 6.6]} radius={0.12} smoothness={3} position={[0, -0.2, 0]} receiveShadow>
        <meshStandardMaterial map={madera} roughness={0.6} />
      </RoundedBox>
      {/* Plano extendido */}
      <mesh position={[-1.2, 0.012, 0.6]} rotation={[-Math.PI / 2, 0, 0.1]} receiveShadow>
        <planeGeometry args={[4.6, 3.25]} />
        <meshStandardMaterial map={plano} roughness={0.85} />
      </mesh>
      <mesh position={[-4.1, 0.2, -1.6]} rotation={[0, 0.5, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 2.6, 24]} />
        <meshStandardMaterial color="#cfe6ff" roughness={0.75} />
      </mesh>
      {/* Portátil con la simulación */}
      <group position={[2.6, 0, -1.4]} rotation={[0, -0.35, 0]}>
        <RoundedBox args={[2.6, 0.08, 1.75]} radius={0.03} smoothness={2} position={[0, 0.04, 0]} castShadow>
          <meshStandardMaterial color="#c7ced8" metalness={0.7} roughness={0.3} />
        </RoundedBox>
        <group position={[0, 0.08, -0.86]} rotation={[-0.32, 0, 0]}>
          <RoundedBox args={[2.6, 1.7, 0.06]} radius={0.03} smoothness={2} position={[0, 0.85, 0]} castShadow>
            <meshStandardMaterial color="#c7ced8" metalness={0.7} roughness={0.3} />
          </RoundedBox>
          <mesh position={[0, 0.87, 0.035]}>
            <planeGeometry args={[2.42, 1.5]} />
            <meshBasicMaterial map={portatil} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <Casco position={[3.2, 0.02, 1.5]} rotation={[0, -0.8, 0]} s={1.2} />
      {/* Pinza voltiamperimétrica */}
      <group position={[0.9, 0.11, 2.3]} rotation={[-Math.PI / 2, 0, 0.6]}>
        <RoundedBox args={[0.5, 1.15, 0.2]} radius={0.06} smoothness={3} castShadow>
          <meshStandardMaterial color="#f2c230" roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0.15, 0.105]}>
          <planeGeometry args={[0.36, 0.3]} />
          <meshStandardMaterial color="#0b2a14" emissive="#3dff8a" emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.82, 0]}>
          <torusGeometry args={[0.24, 0.07, 10, 30, Math.PI * 1.6]} />
          <meshStandardMaterial color="#2b2f36" />
        </mesh>
      </group>
      {/* Maqueta de un panel en su soporte */}
      <group position={[-4.3, 0, 1.6]} rotation={[0, 0.5, 0]}>
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.06, 0.7, 0.06]} />
          <meshStandardMaterial color="#a3acb7" metalness={0.8} />
        </mesh>
        <Paneles position={[0, 0.78, 0]} rotation={[-0.6, 0, 0]} cols={2} filas={1} a={0.7} l={1.15} />
      </group>
      {/* Lápiz */}
      <mesh position={[0.5, 0.05, -0.4]} rotation={[0, 0.9, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 1.3, 6]} />
        <meshStandardMaterial color={ORO} />
      </mesh>
    </group>
  );
}

/* ================= 13. Cierre: su factura baja ================= */

function texturaFactura() {
  return lienzo(720, 1000, (g) => {
    g.fillStyle = "#fbfaf6";
    g.fillRect(0, 0, 720, 1000);
    g.fillStyle = "#0d2b5e";
    g.fillRect(0, 0, 720, 120);
    g.fillStyle = "#fff";
    g.font = "bold 40px sans-serif";
    g.fillText("FACTURA DE ENERGÍA", 40, 76);
    g.fillStyle = "#8a93a3";
    for (let i = 0; i < 4; i++) g.fillRect(40, 170 + i * 40, i % 2 ? 300 : 420, 14);
    g.fillStyle = "#0d2b5e";
    g.font = "bold 28px sans-serif";
    g.fillText("Consumo de la red · kWh", 40, 380);
    const vals = [0.95, 0.92, 0.9, 0.42, 0.24, 0.16, 0.12, 0.1];
    vals.forEach((v, i) => {
      g.fillStyle = i < 3 ? "#c6cbd4" : "#f0a500";
      g.fillRect(50 + i * 80, 820 - v * 380, 54, v * 380);
    });
    g.strokeStyle = "#2e9e5b";
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(90, 430);
    g.lineTo(300, 470);
    g.lineTo(640, 760);
    g.stroke();
    g.fillStyle = "#2e9e5b";
    g.beginPath();
    g.moveTo(660, 780);
    g.lineTo(610, 770);
    g.lineTo(650, 730);
    g.fill();
    g.fillStyle = "#0d2b5e";
    g.font = "bold 34px sans-serif";
    g.fillText("Total a pagar", 40, 920);
    g.fillStyle = "#2e9e5b";
    g.fillText("↓ mucho menos", 400, 920);
  });
}

export function Cierre() {
  const factura = useMemo(() => texturaFactura(), []);
  return (
    <group>
      <Isla r={5} />
      <group position={[-0.8, 2.6, 0]} rotation={[-0.12, 0.3, 0.04]}>
        <RoundedBox args={[3.3, 4.6, 0.05]} radius={0.03} smoothness={2} castShadow>
          <meshStandardMaterial color="#fbfaf6" />
        </RoundedBox>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[3.24, 4.5]} />
          <meshStandardMaterial map={factura} color="#dad8d1" roughness={0.85} />
        </mesh>
      </group>
      <MesaSolar position={[2.4, 0, 1.6]} rotY={-0.4} cols={3} filas={1} />
      <Sol position={[-4.5, 6.4, -4]} r={1.1} />
      <Flujo puntos={[[-3.6, 5.8, -3.6], [0.6, 4.4, -1.2], [2.4, 1.3, 1.6]]} n={12} vel={0.25} />
      <Arbol position={[3.4, 0, -2.4]} s={1} />
    </group>
  );
}

/* ================= 14. Contacto: hablemos por el celular ================= */

function texturaChat() {
  return lienzo(560, 1160, (g) => {
    g.fillStyle = "#0b1730";
    g.fillRect(0, 0, 560, 1160);
    g.fillStyle = "#13305e";
    g.fillRect(0, 0, 560, 130);
    g.fillStyle = "#f0a500";
    g.beginPath();
    g.arc(70, 70, 34, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#fff";
    g.font = "bold 30px sans-serif";
    g.fillText("Ingeniero", 120, 64);
    g.fillStyle = "#9fb4d6";
    g.font = "22px sans-serif";
    g.fillText("en línea", 120, 96);
    const burbuja = (x: number, y: number, w: number, h: number, c: string, txt: string[], oscuro: boolean) => {
      g.fillStyle = c;
      g.beginPath();
      g.roundRect(x, y, w, h, 26);
      g.fill();
      g.fillStyle = oscuro ? "#0b1730" : "#fff";
      g.font = "26px sans-serif";
      txt.forEach((t, i) => g.fillText(t, x + 24, y + 46 + i * 36));
    };
    burbuja(170, 190, 360, 120, "#ffffff", ["Hola, quiero pagar", "menos de energía"], true);
    burbuja(30, 340, 400, 160, "#f0a500", ["¡Con gusto!", "Envíenos una foto", "de su factura"], true);
    g.fillStyle = "#fbfaf6";
    g.beginPath();
    g.roundRect(250, 540, 280, 300, 22);
    g.fill();
    g.fillStyle = "#0d2b5e";
    g.fillRect(270, 560, 240, 40);
    g.fillStyle = "#c6cbd4";
    for (let i = 0; i < 6; i++) g.fillRect(275, 625 + i * 32, 200 - (i % 3) * 40, 12);
    burbuja(30, 880, 440, 120, "#f0a500", ["Su ahorro estimado:", "hasta 90 % menos"], true);
  });
}

export function Contacto() {
  const chat = useMemo(() => texturaChat(), []);
  const v = useVentanas(0.4);
  return (
    <group>
      <Isla r={5} />
      <group position={[0.6, 2.35, 0.4]} rotation={[-0.08, -0.32, 0]}>
        <RoundedBox args={[2.1, 4.3, 0.2]} radius={0.22} smoothness={4} castShadow>
          <meshPhysicalMaterial color="#14181f" metalness={0.6} roughness={0.25} clearcoat={1} />
        </RoundedBox>
        <mesh position={[0, 0, 0.105]}>
          <planeGeometry args={[1.9, 3.95]} />
          <meshBasicMaterial map={chat} toneMapped={false} />
        </mesh>
      </group>
      {/* Burbujas que salen del celular */}
      {[
        [-1.6, 3.9, 0.6, ORO, 1.1],
        [2.6, 4.6, -0.2, "#ffffff", 0.8],
        [-2.0, 2.4, 1.2, "#ffffff", 0.7],
      ].map(([x, y, z, c, s], i) => (
        <group key={i} position={[x as number, y as number, z as number]} scale={s as number} rotation={[0, 0.3, 0]}>
          <RoundedBox args={[1.2, 0.75, 0.22]} radius={0.2} smoothness={4} castShadow>
            <meshStandardMaterial color={c as string} emissive={c as string} emissiveIntensity={0.25} roughness={0.35} />
          </RoundedBox>
          <mesh position={[-0.35, -0.42, 0]} rotation={[0, 0, 0.6]}>
            <coneGeometry args={[0.14, 0.3, 4]} />
            <meshStandardMaterial color={c as string} emissive={c as string} emissiveIntensity={0.25} />
          </mesh>
          {[-0.28, 0, 0.28].map((dx) => (
            <mesh key={dx} position={[dx, 0, 0.12]}>
              <sphereGeometry args={[0.07, 12, 8]} />
              <meshStandardMaterial color={c === "#ffffff" ? "#0d2b5e" : "#ffffff"} />
            </mesh>
          ))}
        </group>
      ))}
      <group position={[-2.4, 0, -1.8]} scale={0.5}>
        <CasaModerna ventanas={v} medidor={false} />
      </group>
      <Arbol position={[3.2, 0, -2.2]} s={0.9} tono={1} />
    </group>
  );
}

export type Maqueta = {
  Escena: () => ReactNode;
  cam: V3;
  mira: V3;
  fov?: number;
  /** Corre el encuadre (fracción del ancho/alto) para dejar sitio al texto de la tarjeta. */
  corrimiento?: [number, number];
  /** Qué tanto se aleja la cámara (1 = sin cambio). */
  lejos?: number;
  fondo?: { arriba?: string; abajo?: string; halo?: string; estrellas?: number };
  luz?: { sol?: V3; color?: string; fuerza?: number; relleno?: number; ambiente?: number };
};

export const maquetas: Record<string, Maqueta> = {
  ongrid: { Escena: OnGrid, cam: [15, 11, 17], mira: [0.5, 1.6, 0], corrimiento: [-0.12, 0.08], fondo: { halo: "#ffb347" } },
  offgrid: { Escena: OffGrid, cam: [15, 10, 17], mira: [0, 1.4, 0], corrimiento: [-0.12, 0.08], fondo: { arriba: "#1b2a63", abajo: "#120b24", halo: "#ff8a3d", estrellas: 0.8 }, luz: { sol: [-12, 5, 6], color: "#ffb070", fuerza: 2.4, relleno: 0.35, ambiente: 0.3 } },
  hibrido: { Escena: Hibrido, cam: [15, 9.5, 16], mira: [0.5, 1.6, 0], corrimiento: [-0.12, 0.08], fondo: { arriba: "#0b1d45", abajo: "#040814", halo: "#3b6fd1", estrellas: 1 }, luz: { sol: [10, 9, 4], color: "#b8c8ff", fuerza: 1.2, relleno: 0.3, ambiente: 0.3 } },
  bess: { Escena: Bess, cam: [14, 9, 17], mira: [0, 1.4, -0.6], corrimiento: [-0.12, 0.08], fondo: { arriba: "#0b1d45", abajo: "#030812", halo: "#2fd6b0", estrellas: 0.6 }, luz: { sol: [8, 10, 8], color: "#cfe0ff", fuerza: 1.6, relleno: 0.35, ambiente: 0.35 } },
  granja: { Escena: Granja, cam: [17, 15, 20], mira: [0, 0, 0], corrimiento: [-0.12, 0.06], fondo: { halo: "#ffb347" }, luz: { sol: [-12, 7, 4], color: "#ffd9a0", fuerza: 2.8 } },
  "ing-solar": { Escena: IngSolar, cam: [10, 9, 16], mira: [0, 1.8, 0], corrimiento: [-0.1, 0.08] },
  subestaciones: { Escena: Subestacion, cam: [14, 10, 17], mira: [0, 2, 0], corrimiento: [-0.12, 0.08] },
  redes: { Escena: Redes, cam: [13, 10, 18], mira: [0, 2.6, 0], corrimiento: [-0.1, 0.05], lejos: 1.2 },
  instalaciones: { Escena: Instalaciones, cam: [8, 6.5, 13], mira: [0, 1.9, -1], corrimiento: [-0.1, 0.06], lejos: 1.35 },
  retie: { Escena: Retie, cam: [10, 7, 14], mira: [0, 2.2, 0], corrimiento: [-0.1, 0.06] },
  calidad: { Escena: Calidad, cam: [10, 7, 15], mira: [0, 2.4, 0], corrimiento: [-0.1, 0.06] },
  nosotros: { Escena: Nosotros, cam: [6, 9, 10], mira: [0, 0, 0.2], fov: 32, luz: { sol: [-6, 12, 5], color: "#ffe2b8", fuerza: 2.6 } },
  cierre: { Escena: Cierre, cam: [9, 6.5, 13], mira: [0, 2.4, 0], fondo: { halo: "#ffb347" } },
  contacto: { Escena: Contacto, cam: [8, 6, 13], mira: [0, 2.4, 0], fov: 36 },
};

export { ORO };
