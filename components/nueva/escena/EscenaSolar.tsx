"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { MotionValue } from "framer-motion";

/*
 * Una sola escena 3D que cambia con el scroll:
 * amanecer sobre una planta solar → los paneles siguen al sol → la cámara baja a un panel
 * → el panel se desarma en capas → vuelve a su lugar → vista aérea con la energía llegando a una empresa.
 */

type Raton = MutableRefObject<{ x: number; y: number }>;
type Props = { progress: MotionValue<number>; raton: Raton; listo: boolean; movil: boolean };

const c01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0 antes de a, 1 después de b, suave entre ambos. */
const tramo = (v: number, a: number, b: number) => {
  const t = c01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = THREE.MathUtils.lerp;

// Medidas del panel (portrait sobre seguidor de un eje: largo en X, ancho en Z)
const PL = 1.65;
const PA = 1;
const ALTO = 1.25; // altura del eje del seguidor

function texturaCeldas(marco: boolean) {
  const c = document.createElement("canvas");
  c.width = 420;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.fillStyle = "#081633";
  g.fillRect(0, 0, c.width, c.height);
  const cols = 10;
  const rows = 6;
  const pad = marco ? 12 : 6;
  const gap = 4;
  const cw = (c.width - pad * 2 - gap * (cols - 1)) / cols;
  const ch = (c.height - pad * 2 - gap * (rows - 1)) / rows;
  for (let r = 0; r < rows; r++)
    for (let k = 0; k < cols; k++) {
      const x = pad + k * (cw + gap);
      const y = pad + r * (ch + gap);
      const gr = g.createLinearGradient(x, y, x + cw, y + ch);
      gr.addColorStop(0, "#2f6ccc");
      gr.addColorStop(0.55, "#163f86");
      gr.addColorStop(1, "#0c2a5e");
      g.fillStyle = gr;
      g.fillRect(x, y, cw, ch);
      g.fillStyle = "rgba(255,255,255,.28)";
      g.fillRect(x, y + ch / 3, cw, 1.4);
      g.fillRect(x, y + (2 * ch) / 3, cw, 1.4);
    }
  if (marco) {
    g.strokeStyle = "#cfd8e5";
    g.lineWidth = 10;
    g.strokeRect(5, 5, c.width - 10, c.height - 10);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function texturaBrillo() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, "rgba(255,244,214,1)");
  gr.addColorStop(0.18, "rgba(255,206,92,.85)");
  gr.addColorStop(0.45, "rgba(240,165,0,.25)");
  gr.addColorStop(1, "rgba(240,165,0,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* Cielo: degradado que pasa del amanecer al día y a la tarde */
const cieloVert = /* glsl */ `
varying vec3 vPos;
void main() { vPos = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vPos, 1.0); }`;
const cieloFrag = /* glsl */ `
uniform vec3 arriba; uniform vec3 horizonte; uniform vec3 solDir; uniform vec3 solColor;
varying vec3 vPos;
void main() {
  vec3 d = normalize(vPos);
  float h = clamp(d.y * 1.6, 0.0, 1.0);
  vec3 col = mix(horizonte, arriba, pow(h, 0.7));
  float s = max(dot(d, normalize(solDir)), 0.0);
  col += solColor * (pow(s, 12.0) * 0.55 + pow(s, 3.0) * 0.18);
  gl_FragColor = vec4(col, 1.0);
}`;

const C = (h: string) => new THREE.Color(h);
// Amanecer → mañana dorada → día → atardecer
const paleta = [
  { p: 0, arriba: C("#0a1a3f"), horizonte: C("#ff8a3d"), sol: C("#ff9a3c"), suelo: C("#2c2a26"), luz: 1.3 },
  { p: 0.3, arriba: C("#2a5fae"), horizonte: C("#ffc58a"), sol: C("#ffd9a0"), suelo: C("#4a5a3a"), luz: 2.2 },
  { p: 0.65, arriba: C("#2f74d6"), horizonte: C("#cfe6ff"), sol: C("#fff4dc"), suelo: C("#55703f"), luz: 2.7 },
  { p: 1, arriba: C("#142a5c"), horizonte: C("#ff9e4a"), sol: C("#ffb347"), suelo: C("#3b3a2c"), luz: 1.8 },
];
function tramoPaleta(p: number) {
  let i = 0;
  while (i < paleta.length - 2 && p > paleta[i + 1].p) i++;
  return { a: paleta[i], b: paleta[i + 1], t: tramo(p, paleta[i].p, paleta[i + 1].p) };
}
function colorEn(p: number, k: "arriba" | "horizonte" | "sol" | "suelo", out: THREE.Color) {
  const { a, b, t } = tramoPaleta(p);
  return out.copy(a[k]).lerp(b[k], t);
}

/** Posición del sol: sale por el este (-X), sube y baja hacia la tarde. */
function solEn(p: number, out: THREE.Vector3) {
  const ang = lerp(0.04, 2.2, p);
  return out.set(-Math.cos(ang) * 70, Math.sin(ang) * 55 + 3, -90 + p * 40);
}

/* ---------- Planta solar con instancias ---------- */

function Planta({ progress, movil, heroIdx }: { progress: MotionValue<number>; movil: boolean; heroIdx: { fila: number; col: number } }) {
  const filas = movil ? 9 : 15;
  const cols = movil ? 16 : 26;
  const sepX = 3.7;
  const sepZ = PA + 0.06;
  const paneles = useRef<THREE.InstancedMesh>(null);
  const ejes = useRef<THREE.InstancedMesh>(null);
  const postes = useRef<THREE.InstancedMesh>(null);

  const mats = useMemo(() => {
    const lado = new THREE.MeshStandardMaterial({ color: "#c3ccd8", metalness: 0.8, roughness: 0.35 });
    const cara = new THREE.MeshStandardMaterial({ map: texturaCeldas(true), metalness: 0.35, roughness: 0.22 });
    const fondo = new THREE.MeshStandardMaterial({ color: "#d7dde6", roughness: 0.8 });
    return [lado, lado, cara, fondo, lado, lado];
  }, []);

  const pos = useMemo(() => {
    const out: { x: number; z: number }[] = [];
    for (let f = 0; f < filas; f++)
      for (let k = 0; k < cols; k++) {
        if (f === heroIdx.fila && k === heroIdx.col) continue;
        out.push({ x: (f - (filas - 1) / 2) * sepX, z: (k - (cols - 1) / 2) * sepZ - 4 });
      }
    return out;
  }, [filas, cols, heroIdx]);

  const m = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    // Ejes de los seguidores y postes (no se mueven)
    for (let f = 0; f < filas; f++) {
      m.position.set((f - (filas - 1) / 2) * sepX, ALTO - 0.06, -4);
      m.rotation.set(Math.PI / 2, 0, 0);
      m.scale.set(1, cols * sepZ, 1);
      m.updateMatrix();
      ejes.current!.setMatrixAt(f, m.matrix);
    }
    ejes.current!.instanceMatrix.needsUpdate = true;
    let n = 0;
    for (let f = 0; f < filas; f++)
      for (let k = 0; k < cols; k += 4) {
        m.position.set((f - (filas - 1) / 2) * sepX, ALTO / 2, (k - (cols - 1) / 2) * sepZ - 4);
        m.rotation.set(0, 0, 0);
        m.scale.set(1, ALTO, 1);
        m.updateMatrix();
        postes.current!.setMatrixAt(n++, m.matrix);
      }
    postes.current!.count = n;
    postes.current!.instanceMatrix.needsUpdate = true;
  }, [filas, cols, m]);

  const ultimo = useRef(-1);
  useFrame(() => {
    const p = progress.get();
    if (Math.abs(p - ultimo.current) < 0.0005) return;
    ultimo.current = p;
    // Los paneles siguen al sol: de cara al este al amanecer, casi planos al mediodía, al oeste en la tarde
    const giro = lerp(0.6, -0.45, tramo(p, 0, 1));
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
      <instancedMesh ref={paneles} args={[undefined, undefined, pos.length]} material={mats}>
        <boxGeometry args={[PL, 0.045, PA]} />
      </instancedMesh>
      <instancedMesh ref={ejes} args={[undefined, undefined, filas]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial color="#8a94a3" metalness={0.7} roughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={postes} args={[undefined, undefined, filas * Math.ceil(cols / 4)]}>
        <cylinderGeometry args={[0.045, 0.06, 1, 6]} />
        <meshStandardMaterial color="#6f7a8a" metalness={0.6} roughness={0.5} />
      </instancedMesh>
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
  const alto = useMemo(() => new THREE.Vector3(0, 3.3, 0), []);

  useFrame(() => {
    const p = progress.get();
    const giroPlanta = lerp(0.6, -0.45, tramo(p, 0, 1));
    const sube = tramo(p, 0.27, 0.42) * (1 - tramo(p, 0.68, 0.8));
    const abre = tramo(p, 0.4, 0.5) * (1 - tramo(p, 0.6, 0.7));
    const g = grupo.current!;
    g.position.copy(base).lerp(alto.set(base.x, 3.2, base.z + 1.6), sube);
    // Al subir se pone de frente a la cámara
    g.rotation.set(lerp(0, 1.05, sube), lerp(0, -0.35, sube), lerp(giroPlanta, 0, sube));
    capas.forEach((c, i) => {
      const l = capasRef.current[i];
      if (l) l.position.y = c.y + abre * (i - 2) * 0.5;
      const e = etiquetas.current[i];
      if (e) e.style.opacity = String(c01((abre - 0.6) / 0.4));
    });
  });

  const marco = new THREE.MeshStandardMaterial({ color: "#d3dbe6", metalness: 0.85, roughness: 0.3 });

  const Etiqueta = ({ i, text }: { i: number; text: string }) =>
    text ? (
      <Html position={[PL / 2 + 0.05, 0, 0]} center={false} zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          ref={(el) => {
            etiquetas.current[i] = el;
          }}
          className="hidden items-center gap-2 whitespace-nowrap text-[11px] font-medium text-white/90 opacity-0 md:flex"
          style={{ transform: "translateY(-50%)" }}
        >
          <span className="h-px w-10 bg-gradient-to-r from-sol-claro/0 to-sol-claro" />
          <span className="h-1.5 w-1.5 rounded-full bg-sol-claro shadow-[0_0_8px_2px_rgba(255,194,61,.7)]" />
          {text}
        </div>
      </Html>
    ) : null;

  return (
    <group ref={grupo}>
      {/* 0 Caja de conexiones */}
      <group ref={(el) => void (capasRef.current[0] = el)}>
        <mesh position={[0, 0, -0.2]}>
          <boxGeometry args={[0.32, 0.06, 0.2]} />
          <meshStandardMaterial color="#151a22" roughness={0.6} />
        </mesh>
        <Etiqueta i={0} text={capas[0].label} />
      </group>
      {/* 1 Marco */}
      <group ref={(el) => void (capasRef.current[1] = el)}>
        <mesh position={[0, 0, PA / 2 - 0.02]} material={marco}>
          <boxGeometry args={[PL, 0.05, 0.04]} />
        </mesh>
        <mesh position={[0, 0, -PA / 2 + 0.02]} material={marco}>
          <boxGeometry args={[PL, 0.05, 0.04]} />
        </mesh>
        <mesh position={[PL / 2 - 0.02, 0, 0]} material={marco}>
          <boxGeometry args={[0.04, 0.05, PA]} />
        </mesh>
        <mesh position={[-PL / 2 + 0.02, 0, 0]} material={marco}>
          <boxGeometry args={[0.04, 0.05, PA]} />
        </mesh>
        <Etiqueta i={1} text={capas[1].label} />
      </group>
      {/* 2 Lámina posterior */}
      <group ref={(el) => void (capasRef.current[2] = el)}>
        <mesh>
          <boxGeometry args={[PL - 0.06, 0.006, PA - 0.06]} />
          <meshStandardMaterial color="#eef2f7" roughness={0.7} />
        </mesh>
        <Etiqueta i={2} text={capas[2].label} />
      </group>
      {/* 3 y 5 EVA */}
      {[3, 5].map((i) => (
        <group key={i} ref={(el) => void (capasRef.current[i] = el)}>
          <mesh>
            <boxGeometry args={[PL - 0.06, 0.004, PA - 0.06]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.22} roughness={0.3} depthWrite={false} />
          </mesh>
          <Etiqueta i={i} text={capas[i].label} />
        </group>
      ))}
      {/* 4 Celdas */}
      <group ref={(el) => void (capasRef.current[4] = el)}>
        <mesh>
          <boxGeometry args={[PL - 0.06, 0.008, PA - 0.06]} />
          <meshStandardMaterial map={celdas} metalness={0.35} roughness={0.25} />
        </mesh>
        <Etiqueta i={4} text={capas[4].label} />
      </group>
      {/* 6 Vidrio */}
      <group ref={(el) => void (capasRef.current[6] = el)}>
        <mesh>
          <boxGeometry args={[PL - 0.04, 0.01, PA - 0.04]} />
          <meshStandardMaterial color="#dfefff" transparent opacity={0.18} metalness={0.1} roughness={0.02} depthWrite={false} />
        </mesh>
        <Etiqueta i={6} text={capas[6].label} />
      </group>
    </group>
  );
}

/* ---------- Empresa al fondo y energía que llega ---------- */

function Empresa({ progress }: { progress: MotionValue<number> }) {
  const puntos = useRef<THREE.InstancedMesh>(null);
  const linea = useRef<THREE.Mesh>(null);
  const N = 48;
  const curva = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(30, 1.4, -4),
        new THREE.Vector3(34, 5, -12),
        new THREE.Vector3(38, 6, -22),
        new THREE.Vector3(42, 4.6, -30),
      ]),
    [],
  );
  const tubo = useMemo(() => new THREE.TubeGeometry(curva, 80, 0.035, 6, false), [curva]);
  const m = useMemo(() => new THREE.Object3D(), []);
  const techo = useMemo(() => texturaCeldas(true), []);

  useFrame(({ clock }) => {
    const v = tramo(progress.get(), 0.8, 0.92);
    const t = clock.elapsedTime;
    for (let i = 0; i < N; i++) {
      const u = (i / N + t * 0.18) % 1;
      curva.getPointAt(u, m.position);
      const s = v * (0.6 + 0.4 * Math.sin(u * Math.PI));
      m.scale.setScalar(s);
      m.updateMatrix();
      puntos.current!.setMatrixAt(i, m.matrix);
    }
    puntos.current!.instanceMatrix.needsUpdate = true;
    (linea.current!.material as THREE.MeshBasicMaterial).opacity = v * 0.5;
  });

  return (
    <group>
      {/* Edificio industrial con paneles en el techo */}
      <group position={[46, 0, -36]}>
        <mesh position={[0, 2.4, 0]}>
          <boxGeometry args={[14, 4.8, 9]} />
          <meshStandardMaterial color="#e3e8ef" roughness={0.8} />
        </mesh>
        <mesh position={[0, 4.95, 0]}>
          <boxGeometry args={[14.4, 0.3, 9.4]} />
          <meshStandardMaterial color="#9aa6b6" roughness={0.6} />
        </mesh>
        {Array.from({ length: 4 }).map((_, i) => (
          <mesh key={i} position={[-4.5 + i * 3, 5.25, 0]} rotation={[0, 0, 0.15]}>
            <boxGeometry args={[2.6, 0.06, 7.6]} />
            <meshStandardMaterial map={techo} metalness={0.3} roughness={0.25} />
          </mesh>
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[-5.5 + i * 2.2, 1.6, 4.52]}>
            <boxGeometry args={[1.2, 1.2, 0.05]} />
            <meshStandardMaterial color="#ffd27a" emissive="#ffb347" emissiveIntensity={0.9} />
          </mesh>
        ))}
      </group>
      {/* Inversor / transformador junto a la planta */}
      <mesh position={[30, 0.9, -4]}>
        <boxGeometry args={[1.6, 1.8, 1.2]} />
        <meshStandardMaterial color="#cfd6df" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh ref={linea} geometry={tubo}>
        <meshBasicMaterial color="#ffc23d" transparent opacity={0} />
      </mesh>
      <instancedMesh ref={puntos} args={[undefined, undefined, N]}>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshBasicMaterial color="#ffd67a" toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* ---------- Cámara, cielo, sol y luces ---------- */

function Mundo({ progress, raton, listo, movil }: Props) {
  const { camera, scene } = useThree();
  const cielo = useRef<THREE.ShaderMaterial>(null);
  const sol = useRef<THREE.Sprite>(null);
  const luz = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const entrada = useRef(0);
  const tmp = useMemo(
    () => ({ c: new THREE.Color(), v: new THREE.Vector3(), p: new THREE.Vector3(), t: new THREE.Vector3(), mira: new THREE.Vector3() }),
    [],
  );
  const brillo = useMemo(() => texturaBrillo(), []);
  const suelo = useRef<THREE.Mesh>(null);
  const { gl } = useThree();

  const heroIdx = useMemo(() => ({ fila: movil ? 4 : 7, col: movil ? 13 : 21 }), [movil]);
  const base = useMemo(() => {
    const filas = movil ? 9 : 15;
    const cols = movil ? 16 : 26;
    return new THREE.Vector3((heroIdx.fila - (filas - 1) / 2) * 3.7, ALTO, (heroIdx.col - (cols - 1) / 2) * (PA + 0.06) - 4);
  }, [heroIdx, movil]);

  // Recorrido de la cámara (posición y punto al que mira), relativo al panel protagonista
  const rutas = useMemo(() => {
    const b = base;
    const P = (x: number, y: number, z: number) => new THREE.Vector3(b.x + x, y, b.z + z);
    const lejos = movil ? 1.35 : 1;
    return {
      pos: new THREE.CatmullRomCurve3([
        P(6 * lejos, 13, 27 * lejos),
        P(1, 5.5, 13),
        P(-3.6, 4.6, 8.6),
        P(-2.2, 4.4, 8.2),
        P(9, 8, 14),
        P(-4, 26, 34),
      ]),
      mira: new THREE.CatmullRomCurve3([
        P(-6, 1.5, -18),
        P(-2, 1.8, -6),
        P(0.4, 3.0, 1.6),
        P(0.5, 3.0, 1.6),
        P(4, 1.5, -6),
        P(26, 1, -30),
      ]),
    };
  }, [base, movil]);

  useLayoutEffect(() => {
    scene.fog = new THREE.Fog("#ff8a3d", 35, 170);
    // Reflejos suaves para que el vidrio y el aluminio brillen
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    return () => {
      env.dispose();
      pm.dispose();
    };
  }, [scene, gl]);

  useFrame(({ clock }, dt) => {
    const p = progress.get();
    if (listo) entrada.current = Math.min(1, entrada.current + dt / 2.6);
    const e = 1 - Math.pow(1 - entrada.current, 3);

    // Cámara: recorrido + entrada desde lo alto + leve movimiento con el mouse y respiración
    const u = c01(p);
    rutas.pos.getPoint(u, tmp.p);
    rutas.mira.getPoint(u, tmp.t);
    tmp.v.set(tmp.p.x - 18, tmp.p.y + 22, tmp.p.z + 26);
    tmp.p.lerpVectors(tmp.v, tmp.p, e);
    const r = raton.current;
    const t = clock.elapsedTime;
    tmp.p.x += r.x * 1.2 + Math.sin(t * 0.25) * 0.4;
    tmp.p.y += -r.y * 0.6 + Math.sin(t * 0.33) * 0.15;
    camera.position.lerp(tmp.p, 1 - Math.pow(0.0015, dt));
    tmp.mira.lerp(tmp.t, 1 - Math.pow(0.0015, dt));
    camera.lookAt(tmp.mira);

    // Cielo, sol, niebla y luces según la hora del día
    solEn(p, tmp.v);
    const m = cielo.current!;
    colorEn(p, "arriba", m.uniforms.arriba.value);
    colorEn(p, "horizonte", m.uniforms.horizonte.value);
    colorEn(p, "sol", m.uniforms.solColor.value);
    m.uniforms.solDir.value.copy(tmp.v).normalize();
    sol.current!.position.copy(tmp.v).normalize().multiplyScalar(140);
    sol.current!.material.color.copy(m.uniforms.solColor.value);
    luz.current!.position.copy(tmp.v);
    luz.current!.color.copy(m.uniforms.solColor.value);
    const { a, b, t: k } = tramoPaleta(p);
    const i = lerp(a.luz, b.luz, k);
    luz.current!.intensity = i;
    hemi.current!.intensity = 0.7 + i * 0.3;
    // La niebla toma el color del horizonte para que el suelo se funda con el cielo
    (scene.fog as THREE.Fog).color.copy(m.uniforms.horizonte.value);
    colorEn(p, "suelo", (suelo.current!.material as THREE.MeshStandardMaterial).color);
  });

  return (
    <>
      <mesh scale={400}>
        <sphereGeometry args={[1, 32, 16]} />
        <shaderMaterial
          ref={cielo}
          side={THREE.BackSide}
          depthWrite={false}
          fog={false}
          vertexShader={cieloVert}
          fragmentShader={cieloFrag}
          uniforms={{
            arriba: { value: new THREE.Color() },
            horizonte: { value: new THREE.Color() },
            solDir: { value: new THREE.Vector3(-1, 0.1, -0.5) },
            solColor: { value: new THREE.Color() },
          }}
        />
      </mesh>
      <sprite ref={sol} scale={[38, 38, 1]}>
        <spriteMaterial map={brillo} transparent depthWrite={false} fog={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <hemisphereLight ref={hemi} args={["#bcd6ff", "#2a2a22", 0.6]} />
      <directionalLight ref={luz} intensity={1.5} />

      {/* Suelo */}
      <mesh ref={suelo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#3d4a3a" roughness={1} envMapIntensity={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -4]}>
        <planeGeometry args={[(movil ? 9 : 15) * 3.7 + 4, (movil ? 16 : 26) * 1.06 + 4]} />
        <meshStandardMaterial color="#7a7564" roughness={1} transparent opacity={0.55} envMapIntensity={0} />
      </mesh>

      <Planta progress={progress} movil={movil} heroIdx={heroIdx} />
      <PanelHeroe progress={progress} base={base} />
      <Empresa progress={progress} />
    </>
  );
}

export default function EscenaSolar(props: Props) {
  return (
    <Canvas
      dpr={props.movil ? [1, 1.5] : [1, 1.75]}
      camera={{ fov: props.movil ? 55 : 42, near: 0.1, far: 900, position: [-40, 30, 40] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Mundo {...props} />
    </Canvas>
  );
}
