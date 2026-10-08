"use client";

/* Piezas 3D compartidas por todas las escenas: texturas, cielo, terreno, árboles y cables con energía. */

import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export const c01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0 antes de a, 1 después de b, suave entre ambos. */
export const tramo = (v: number, a: number, b: number) => {
  const t = c01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const lerp = THREE.MathUtils.lerp;

/* ---------- Texturas dibujadas en canvas (nada de fotos) ---------- */

function lienzo(w: number, h: number, dibujar: (g: CanvasRenderingContext2D) => void, repetir = false) {
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

/** Celdas de un panel solar (10 × 6). */
export function texturaCeldas(marco: boolean) {
  return lienzo(420, 256, (g) => {
    g.fillStyle = "#081633";
    g.fillRect(0, 0, 420, 256);
    const cols = 10;
    const rows = 6;
    const pad = marco ? 12 : 6;
    const gap = 4;
    const cw = (420 - pad * 2 - gap * (cols - 1)) / cols;
    const ch = (256 - pad * 2 - gap * (rows - 1)) / rows;
    for (let r = 0; r < rows; r++)
      for (let k = 0; k < cols; k++) {
        const x = pad + k * (cw + gap);
        const y = pad + r * (ch + gap);
        const gr = g.createLinearGradient(x, y, x + cw, y + ch);
        gr.addColorStop(0, "#3474d6");
        gr.addColorStop(0.55, "#17438c");
        gr.addColorStop(1, "#0c2a5e");
        g.fillStyle = gr;
        g.fillRect(x, y, cw, ch);
        g.fillStyle = "rgba(255,255,255,.3)";
        g.fillRect(x, y + ch / 3, cw, 1.4);
        g.fillRect(x, y + (2 * ch) / 3, cw, 1.4);
      }
    if (marco) {
      g.strokeStyle = "#d5dde8";
      g.lineWidth = 10;
      g.strokeRect(5, 5, 410, 246);
    }
  });
}

/** Resplandor redondo para el sol. */
export function texturaBrillo() {
  return lienzo(256, 256, (g) => {
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, "rgba(255,248,226,1)");
    gr.addColorStop(0.16, "rgba(255,214,110,.9)");
    gr.addColorStop(0.45, "rgba(240,165,0,.22)");
    gr.addColorStop(1, "rgba(240,165,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
  });
}

/** Lámina metálica ondulada (paredes de bodegas). */
export function texturaLamina(base = "#e6ebf1", raya = "#c9d1dc") {
  return lienzo(
    256,
    256,
    (g) => {
      g.fillStyle = base;
      g.fillRect(0, 0, 256, 256);
      for (let x = 0; x < 256; x += 16) {
        const gr = g.createLinearGradient(x, 0, x + 16, 0);
        gr.addColorStop(0, base);
        gr.addColorStop(0.5, raya);
        gr.addColorStop(1, base);
        g.fillStyle = gr;
        g.fillRect(x, 0, 16, 256);
      }
    },
    true,
  );
}

/** Rejillas de ventilación (equipos tipo skid / inversores). */
export function texturaRejilla() {
  return lienzo(
    256,
    256,
    (g) => {
      g.fillStyle = "#f4f6f9";
      g.fillRect(0, 0, 256, 256);
      g.fillStyle = "#c7ced8";
      for (let y = 20; y < 236; y += 12) g.fillRect(24, y, 208, 5);
      g.strokeStyle = "#b5bdc9";
      g.lineWidth = 4;
      g.strokeRect(8, 8, 240, 240);
    },
    true,
  );
}

/** Malla eslabonada para cerramientos (con transparencia). */
export function texturaMalla() {
  return lienzo(
    64,
    64,
    (g) => {
      g.clearRect(0, 0, 64, 64);
      g.strokeStyle = "rgba(200,208,218,.95)";
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(0, 32);
      g.lineTo(32, 0);
      g.lineTo(64, 32);
      g.lineTo(32, 64);
      g.closePath();
      g.stroke();
    },
    true,
  );
}

/** Señal amarilla de "peligro, riesgo eléctrico". */
export function texturaSenal() {
  return lienzo(128, 128, (g) => {
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = "#ffc400";
    g.strokeStyle = "#111";
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(64, 10);
    g.lineTo(120, 112);
    g.lineTo(8, 112);
    g.closePath();
    g.fill();
    g.stroke();
    g.fillStyle = "#111";
    g.beginPath();
    g.moveTo(70, 38);
    g.lineTo(50, 74);
    g.lineTo(64, 74);
    g.lineTo(56, 100);
    g.lineTo(80, 62);
    g.lineTo(66, 62);
    g.closePath();
    g.fill();
  });
}

/** Ruido fino para dar textura al pasto y la tierra. */
export function texturaRuido() {
  return lienzo(
    256,
    256,
    (g) => {
      const d = g.createImageData(256, 256);
      for (let i = 0; i < d.data.length; i += 4) {
        const v = 200 + Math.random() * 55;
        d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
        d.data[i + 3] = 255;
      }
      g.putImageData(d, 0, 0);
    },
    true,
  );
}

/* ---------- Ruido para el relieve ---------- */

function hash(x: number, z: number) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function ruido(x: number, z: number) {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi);
  const b = hash(xi + 1, zi);
  const c = hash(xi, zi + 1);
  const d = hash(xi + 1, zi + 1);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
export function fbm(x: number, z: number) {
  let s = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < 4; i++) {
    s += a * ruido(x * f, z * f);
    f *= 2;
    a *= 0.5;
  }
  return s;
}

/** Zona plana del terreno (donde va la planta, la fábrica o la casa) y su color. */
export type Zona = { x0: number; x1: number; z0: number; z1: number; color?: string };
/** Camino de tierra: lista de puntos [x, z]. */
export type Camino = [number, number][];

function distSegmento(px: number, pz: number, a: [number, number], b: [number, number]) {
  const vx = b[0] - a[0];
  const vz = b[1] - a[1];
  const t = c01(((px - a[0]) * vx + (pz - a[1]) * vz) / (vx * vx + vz * vz));
  const dx = px - (a[0] + vx * t);
  const dz = pz - (a[1] + vz * t);
  return Math.sqrt(dx * dx + dz * dz);
}

/** Altura del terreno: plano cerca de las zonas, lomas que crecen con la distancia. */
export function alturaTerreno(x: number, z: number, zonas: Zona[]) {
  let dentro = 99;
  for (const s of zonas) {
    const dx = Math.max(s.x0 - x, 0, x - s.x1);
    const dz = Math.max(s.z0 - z, 0, z - s.z1);
    dentro = Math.min(dentro, Math.sqrt(dx * dx + dz * dz));
  }
  const borde = tramo(dentro, 4, 30);
  const lejos = tramo(Math.sqrt(x * x + z * z), 70, 220);
  const lomas = (fbm(x * 0.018, z * 0.018) - 0.35) * (4 + lejos * 34);
  const grumos = (fbm(x * 0.25, z * 0.25) - 0.5) * 0.35;
  return borde * Math.max(lomas, -1) + grumos * (0.3 + borde);
}

/** Terreno con relieve, pasto con manchas, caminos de tierra y zonas de grava. */
export function Terreno({ zonas, caminos = [], tam = 640, seg = 220 }: { zonas: Zona[]; caminos?: Camino[]; tam?: number; seg?: number }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(tam, tam, seg, seg);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(p.count * 3);
    const c = new THREE.Color();
    const pasto1 = new THREE.Color("#4f6d34");
    const pasto2 = new THREE.Color("#7b8a45");
    const pasto3 = new THREE.Color("#3a5a2c");
    const tierra = new THREE.Color("#8a7350");
    const zonaCol = zonas.map((z) => new THREE.Color(z.color ?? "#8d8a7c"));
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      p.setY(i, alturaTerreno(x, z, zonas));
      const n = fbm(x * 0.06, z * 0.06);
      c.copy(pasto1).lerp(pasto2, tramo(n, 0.45, 0.7)).lerp(pasto3, tramo(n, 0.35, 0.15));
      zonas.forEach((s, k) => {
        const dx = Math.max(s.x0 - x, 0, x - s.x1);
        const dz = Math.max(s.z0 - z, 0, z - s.z1);
        const d = Math.sqrt(dx * dx + dz * dz);
        c.lerp(zonaCol[k], 1 - tramo(d, 0, 2.5));
      });
      for (const cam of caminos)
        for (let s = 0; s < cam.length - 1; s++) {
          const d = distSegmento(x, z, cam[s], cam[s + 1]);
          if (d < 4) c.lerp(tierra, 1 - tramo(d, 1.2, 3.2));
        }
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, [zonas, caminos, tam, seg]);
  const grano = useMemo(() => {
    const t = texturaRuido();
    t.repeat.set(tam / 3, tam / 3);
    return t;
  }, [tam]);

  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors map={grano} roughness={1} envMapIntensity={0.15} />
    </mesh>
  );
}

/** Árboles bajos repartidos alrededor, sin pisar las zonas ni los caminos. */
export function Arboles({ zonas, n = 160, rmin = 40, rmax = 150, semilla = 1 }: { zonas: Zona[]; n?: number; rmin?: number; rmax?: number; semilla?: number }) {
  const tronco = useRef<THREE.InstancedMesh>(null);
  const copa = useRef<THREE.InstancedMesh>(null);
  const datos = useMemo(() => {
    const out: { x: number; z: number; s: number; y: number; tono: number }[] = [];
    let i = 0;
    while (out.length < n && i < n * 20) {
      i++;
      const a = hash(i * 1.7, semilla) * Math.PI * 2;
      const r = rmin + hash(i * 3.1, semilla + 2) * (rmax - rmin);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const libre = zonas.every((s) => x < s.x0 - 8 || x > s.x1 + 8 || z < s.z0 - 8 || z > s.z1 + 8);
      if (!libre) continue;
      out.push({ x, z, s: 0.55 + hash(i, 9) * 0.75, y: alturaTerreno(x, z, zonas), tono: hash(i, 4) });
    }
    return out;
  }, [zonas, n, rmin, rmax, semilla]);

  useLayoutEffect(() => {
    const m = new THREE.Object3D();
    const c = new THREE.Color();
    datos.forEach((d, i) => {
      m.position.set(d.x, d.y + 1.1 * d.s, d.z);
      m.scale.set(d.s, d.s, d.s);
      m.rotation.set(0, d.tono * 6, 0);
      m.updateMatrix();
      tronco.current!.setMatrixAt(i, m.matrix);
      m.position.y = d.y + 3 * d.s;
      m.scale.set(d.s * (1 + d.tono * 0.4), d.s * (1.1 + d.tono * 0.5), d.s * (1 + d.tono * 0.4));
      m.updateMatrix();
      copa.current!.setMatrixAt(i, m.matrix);
      copa.current!.setColorAt(i, c.set("#3f6b2c").lerp(new THREE.Color("#6f8a3a"), d.tono));
    });
    tronco.current!.instanceMatrix.needsUpdate = true;
    copa.current!.instanceMatrix.needsUpdate = true;
    if (copa.current!.instanceColor) copa.current!.instanceColor.needsUpdate = true;
  }, [datos]);

  return (
    <group>
      <instancedMesh ref={tronco} args={[undefined, undefined, datos.length]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 2.2, 6]} />
        <meshStandardMaterial color="#5a4632" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={copa} args={[undefined, undefined, datos.length]} castShadow>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshStandardMaterial roughness={0.9} flatShading />
      </instancedMesh>
    </group>
  );
}

/* ---------- Cables en el suelo con olas de luz ---------- */

const cableVert = /* glsl */ `
varying vec2 vUv;
varying vec3 vN;
varying vec3 vVista;
void main() {
  vUv = uv;
  vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vVista = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;
const cableFrag = /* glsl */ `
uniform float t; uniform float k; uniform float largo; uniform float fase;
varying vec2 vUv;
varying vec3 vN;
varying vec3 vVista;
void main() {
  // Cable de caucho con luz, brillo y borde: se ve redondo, no plano
  vec3 n = normalize(vN);
  vec3 V = normalize(vVista);
  vec3 L = normalize(vec3(0.35, 0.85, 0.4));
  float dif = max(dot(n, L), 0.0);
  float spec = pow(max(dot(n, normalize(L + V)), 0.0), 48.0);
  float borde = pow(1.0 - max(dot(n, V), 0.0), 2.2);
  vec3 caucho = vec3(0.075, 0.08, 0.095);
  vec3 col = caucho * (0.3 + 1.1 * dif) + vec3(0.75) * spec * 0.55;

  // Olas de luz que corren por el cable; cada fase con su tono (dorado, cian, blanco cálido)
  float x = vUv.x * largo;
  float w = fract(x * 0.12 - t * 0.9 - fase * 0.33);
  float ola = smoothstep(0.0, 0.08, w) * (1.0 - smoothstep(0.08, 0.45, w));
  vec3 oro = vec3(1.0, 0.7, 0.16);
  vec3 cian = vec3(0.2, 0.82, 1.0);
  vec3 calido = vec3(1.0, 0.9, 0.65);
  vec3 tono = fase < 0.5 ? oro : (fase < 1.5 ? cian : calido);
  float m = 0.5 + 0.5 * sin(x * 0.08 - t * 1.3 + fase * 2.1);
  tono = mix(tono, oro, m * 0.35);
  vec3 luz = tono * (0.14 + ola * 2.8) * k;
  col += luz * (0.45 + 0.75 * dif) + tono * borde * (0.15 + ola * 0.9) * k;
  gl_FragColor = vec4(col, 1.0);
}`;

/** Desplaza una ruta curva hacia un lado (para armar el grupo de fases en paralelo). */
function desplazar(curva: THREE.Curve<THREE.Vector3>, lado: number, alto: number, n: number) {
  const out: THREE.Vector3[] = [];
  const tg = new THREE.Vector3();
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const p = curva.getPointAt(u);
    curva.getTangentAt(u, tg);
    const s = new THREE.Vector3(-tg.z, 0, tg.x).normalize();
    out.push(p.addScaledVector(s, lado).setY(p.y + alto));
  }
  return new THREE.CatmullRomCurve3(out);
}

/**
 * Ruta de tubería o bandeja: tramos rectos unidos por curvas cortas de radio `radio` en cada quiebre.
 * Los puntos se escriben en ángulo recto (giros a 90°), como se instala en obra.
 */
export function rutaRecta(pts: THREE.Vector3[], radio = 0.15) {
  const limpios = pts.filter((p, i) => i === 0 || p.distanceToSquared(pts[i - 1]) > 1e-8);
  const camino = new THREE.CurvePath<THREE.Vector3>();
  let prev = limpios[0].clone();
  for (let i = 1; i < limpios.length - 1; i++) {
    const a = limpios[i - 1];
    const p = limpios[i];
    const b = limpios[i + 1];
    const r = Math.min(radio, p.distanceTo(a) * 0.45, p.distanceTo(b) * 0.45);
    const entra = p.clone().addScaledVector(a.clone().sub(p).normalize(), r);
    const sale = p.clone().addScaledVector(b.clone().sub(p).normalize(), r);
    if (prev.distanceToSquared(entra) > 1e-8) camino.add(new THREE.LineCurve3(prev, entra));
    camino.add(new THREE.QuadraticBezierCurve3(entra, p.clone(), sale));
    prev = sale;
  }
  camino.add(new THREE.LineCurve3(prev, limpios[limpios.length - 1].clone()));
  return camino;
}

/** Lado de un tramo (horizontal y perpendicular a él); en tramos verticales se hereda el del tramo vecino. */
function lados(pts: THREE.Vector3[]) {
  const out: (THREE.Vector3 | null)[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const d = pts[i + 1].clone().sub(pts[i]).normalize();
    out.push(Math.abs(d.y) < 0.7 ? new THREE.Vector3(-d.z, 0, d.x).normalize() : null);
  }
  let ult = out.find((l) => l) ?? new THREE.Vector3(1, 0, 0);
  for (let i = 0; i < out.length; i++) {
    if (out[i]) ult = out[i]!;
    else out[i] = ult.clone();
  }
  return out as THREE.Vector3[];
}

/** Copia de una ruta en ángulo recto corrida `lado` metros hacia su costado (carriles dentro de una bandeja). */
export function paralela(pts: THREE.Vector3[], lado: number, alto = 0) {
  if (pts.length < 2) return pts.map((p) => p.clone());
  const l = lados(pts);
  return pts.map((p, i) => {
    const la = l[Math.max(0, i - 1)];
    const lb = l[Math.min(l.length - 1, i)];
    const m = la.clone().add(lb).divideScalar(Math.max(0.3, 1 + la.dot(lb)));
    return p.clone().addScaledVector(m, lado).setY(p.y + alto);
  });
}

/**
 * Cables: cada ruta lleva `fases` cables redondos en paralelo. Con `recto` la ruta va en ángulo recto
 * (bandeja o tubería); sin él, sigue una curva libre (conductores aéreos, cable de carga).
 * Si `enterrado`, los tramos a ras de suelo quedan sobre una franja de tierra removida, con mojones de señalización.
 * La luz corre en olas; `nivel` da la intensidad (0 a 1).
 */
export function Cables({
  rutas,
  grosor = 0.07,
  fases = 3,
  enterrado = false,
  mojones = false,
  recto = false,
  nivel,
}: {
  rutas: THREE.Vector3[][];
  grosor?: number;
  fases?: number;
  enterrado?: boolean;
  mojones?: boolean;
  recto?: boolean;
  nivel: () => number;
}) {
  const mats = useRef<THREE.ShaderMaterial[]>([]);
  const tierra = useRef<THREE.InstancedMesh>(null);
  const postes = useRef<THREE.InstancedMesh>(null);
  const tapas = useRef<THREE.InstancedMesh>(null);

  const { tubos, tramos, marcas } = useMemo(() => {
    const tubos: { geo: THREE.TubeGeometry; largo: number; fase: number }[] = [];
    const tramos: { p: THREE.Vector3; ang: number; largo: number; ancho?: number }[] = [];
    const marcas: THREE.Vector3[] = [];
    const radio = Math.max(0.08, grosor * 5);
    const radial = grosor < 0.03 ? 6 : 10;
    rutas.forEach((pts, ri) => {
      const base = recto ? rutaRecta(pts, radio + grosor * fases) : new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.05);
      const largo = base.getLength();
      const n = Math.max(8, Math.round(largo * 2));
      for (let f = 0; f < fases; f++) {
        const lado = (f - (fases - 1) / 2) * grosor * 2.3;
        const alto = f % 2 === 0 ? 0 : grosor * 0.2;
        const c = recto ? rutaRecta(paralela(pts, lado, alto), radio + grosor * fases) : desplazar(base, lado, alto, n);
        const segs = recto ? Math.min(2400, Math.ceil(largo / 0.05)) : n * 2;
        tubos.push({ geo: new THREE.TubeGeometry(c, segs, grosor, radial, false), largo, fase: f % 3 });
      }
      if (enterrado) {
        const k = Math.max(1, Math.round(largo / 0.8));
        const tg = new THREE.Vector3();
        for (let i = 0; i < k; i++) {
          const u = (i + 0.5) / k;
          const p = base.getPointAt(u);
          if (p.y > 0.2) continue; // solo donde el cable va por el suelo
          base.getTangentAt(u, tg);
          p.y = ri;
          tramos.push({ p, ang: Math.atan2(tg.x, tg.z), largo: largo / k + 0.06 });
        }
        // Esquinas de la zanja en cada quiebre
        if (recto)
          pts.forEach((q) => {
            if (q.y < 0.2) tramos.push({ p: new THREE.Vector3(q.x, ri, q.z), ang: 0, largo: 0, ancho: 1 });
          });
      }
      if (mojones) {
        const cada = 9;
        const tg = new THREE.Vector3();
        for (let d = cada / 2; d < largo - 2; d += cada) {
          const u = d / largo;
          const p = base.getPointAt(u);
          if (p.y > 0.2) continue;
          base.getTangentAt(u, tg);
          const s = new THREE.Vector3(-tg.z, 0, tg.x).normalize();
          marcas.push(p.clone().addScaledVector(s, fases * grosor * 1.6 + 0.45));
        }
      }
    });
    return { tubos, tramos, marcas };
  }, [rutas, grosor, fases, enterrado, mojones, recto]);

  useLayoutEffect(() => {
    const m = new THREE.Object3D();
    const ancho = fases * grosor * 2.3 + 0.45;
    if (tierra.current) {
      tramos.forEach((s, i) => {
        // Cada ruta un poco más alta que la anterior para que las zanjas vecinas no parpadeen
        m.position.set(s.p.x, 0.03 + (s.p.y % 5) * 0.002 + grosor * 0.05, s.p.z);
        m.rotation.set(0, s.ang, 0);
        m.scale.set(ancho, 1, s.ancho ? ancho : s.largo);
        m.updateMatrix();
        tierra.current!.setMatrixAt(i, m.matrix);
      });
      tierra.current.instanceMatrix.needsUpdate = true;
    }
    if (postes.current && tapas.current) {
      marcas.forEach((p, i) => {
        m.rotation.set(0, 0, 0);
        m.scale.set(1, 1, 1);
        m.position.set(p.x, 0.28, p.z);
        m.updateMatrix();
        postes.current!.setMatrixAt(i, m.matrix);
        m.position.set(p.x, 0.6, p.z);
        m.updateMatrix();
        tapas.current!.setMatrixAt(i, m.matrix);
      });
      postes.current.instanceMatrix.needsUpdate = true;
      tapas.current.instanceMatrix.needsUpdate = true;
    }
  }, [tramos, marcas, fases, grosor]);

  useFrame(({ clock }) => {
    const k = nivel();
    mats.current.forEach((m) => {
      if (!m) return;
      m.uniforms.t.value = clock.elapsedTime;
      m.uniforms.k.value = k;
    });
  });

  return (
    <group>
      {tubos.map((g, i) => (
        <mesh key={i} geometry={g.geo} castShadow>
          <shaderMaterial
            ref={(m) => void (mats.current[i] = m!)}
            vertexShader={cableVert}
            fragmentShader={cableFrag}
            toneMapped={false}
            uniforms={{ t: { value: 0 }, k: { value: 0.5 }, largo: { value: g.largo }, fase: { value: g.fase } }}
          />
        </mesh>
      ))}
      {enterrado && tramos.length > 0 && (
        <instancedMesh ref={tierra} args={[undefined, undefined, tramos.length]} receiveShadow>
          <boxGeometry args={[1, 0.05, 1]} />
          <meshStandardMaterial color="#5e4b36" roughness={1} envMapIntensity={0.1} />
        </instancedMesh>
      )}
      {marcas.length > 0 && (
        <>
          <instancedMesh ref={postes} args={[undefined, undefined, marcas.length]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.56, 8]} />
            <meshStandardMaterial color="#d9d6cc" roughness={0.8} />
          </instancedMesh>
          <instancedMesh ref={tapas} args={[undefined, undefined, marcas.length]}>
            <cylinderGeometry args={[0.065, 0.065, 0.1, 8]} />
            <meshStandardMaterial color="#ff7a1a" emissive="#ff7a1a" emissiveIntensity={0.25} roughness={0.5} />
          </instancedMesh>
        </>
      )}
    </group>
  );
}

/**
 * Tubería conduit metálica en ángulo recto, con uniones cada pocos metros y en cada codo.
 * Por dentro van los cables: cuando hay energía, una ola de luz dorada recorre el tubo.
 */
export function Tuberia({
  rutas,
  radio = 0.035,
  nivel,
  color = "#b4bcc6",
  cada = 2.5,
}: {
  rutas: THREE.Vector3[][];
  radio?: number;
  nivel: () => number;
  color?: string;
  cada?: number;
}) {
  const uniformes = useMemo(() => ({ t: { value: 0 }, k: { value: 0 } }), []);
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.34 });
    m.defines = { USE_UV: "" };
    m.onBeforeCompile = (s) => {
      s.uniforms.t = uniformes.t;
      s.uniforms.k = uniformes.k;
      s.fragmentShader = s.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform float t;\nuniform float k;")
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
  float w = fract(vUv.x * 0.12 - t * 0.9);
  float ola = smoothstep(0.0, 0.08, w) * (1.0 - smoothstep(0.08, 0.45, w));
  totalEmissiveRadiance += vec3(1.0, 0.7, 0.16) * (0.04 + ola * 0.9) * k;`,
        );
    };
    return m;
  }, [color, uniformes]);
  const uniones = useRef<THREE.InstancedMesh>(null);

  const { geos, juntas } = useMemo(() => {
    const geos: THREE.TubeGeometry[] = [];
    const juntas: { p: THREE.Vector3; d: THREE.Vector3; e: number }[] = [];
    const curva = radio * 5;
    for (const pts of rutas) {
      const c = rutaRecta(pts, curva);
      const largo = c.getLength();
      const g = new THREE.TubeGeometry(c, Math.min(2400, Math.ceil(largo / 0.04) + pts.length * 6), radio, 10, false);
      // uv.x en metros: la ola corre igual de rápido en tubos cortos y largos
      const uv = g.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * largo);
      geos.push(g);
      // Uniones: en los extremos, a la salida de cada codo y cada `cada` metros en los tramos rectos
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const L = a.distanceTo(b);
        if (L < 1e-4) continue;
        const d = b.clone().sub(a).normalize();
        const r0 = i === 0 ? 0 : Math.min(curva, L * 0.45);
        const r1 = i === pts.length - 2 ? 0 : Math.min(curva, L * 0.45);
        const ext = (u: number, e: number) => juntas.push({ p: a.clone().addScaledVector(d, u), d, e });
        ext(r0 + radio * 0.6, i === 0 ? 1.35 : 1.2);
        ext(L - r1 - radio * 0.6, i === pts.length - 2 ? 1.35 : 1.2);
        const n = Math.floor((L - r0 - r1) / cada);
        for (let k = 1; k <= n; k++) {
          const u = r0 + ((L - r0 - r1) * k) / (n + 1);
          ext(u, 1.2);
        }
      }
    }
    return { geos, juntas };
  }, [rutas, radio, cada]);

  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const arriba = new THREE.Vector3(0, 1, 0);
    juntas.forEach((j, i) => {
      o.position.copy(j.p);
      o.quaternion.setFromUnitVectors(arriba, j.d);
      o.scale.set(j.e, 1, j.e);
      o.updateMatrix();
      uniones.current!.setMatrixAt(i, o.matrix);
    });
    uniones.current!.instanceMatrix.needsUpdate = true;
  }, [juntas]);

  useFrame(({ clock }) => {
    uniformes.t.value = clock.elapsedTime;
    uniformes.k.value = nivel();
  });

  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} material={material} castShadow receiveShadow />
      ))}
      <instancedMesh ref={uniones} args={[undefined, undefined, juntas.length]} castShadow frustumCulled={false}>
        <cylinderGeometry args={[radio, radio, radio * 1.8, 12]} />
        <meshStandardMaterial color="#d3d9e1" metalness={0.7} roughness={0.28} />
      </instancedMesh>
    </group>
  );
}

/* ---------- Cielo, sol, luces y niebla según la hora ---------- */

const cieloVert = /* glsl */ `
varying vec3 vPos;
void main() { vPos = (modelMatrix * vec4(position, 1.0)).xyz; gl_Position = projectionMatrix * viewMatrix * vec4(vPos, 1.0); }`;
const cieloFrag = /* glsl */ `
uniform vec3 arriba; uniform vec3 horizonte; uniform vec3 solDir; uniform vec3 solColor;
varying vec3 vPos;
void main() {
  vec3 d = normalize(vPos - cameraPosition);
  float h = clamp(d.y * 1.8 + 0.02, 0.0, 1.0);
  vec3 col = mix(horizonte, arriba, pow(h, 0.65));
  float s = max(dot(d, normalize(solDir)), 0.0);
  col += solColor * (pow(s, 18.0) * 0.6 + pow(s, 3.0) * 0.16);
  gl_FragColor = vec4(col, 1.0);
}`;

export type Momento = { p: number; arriba: string; horizonte: string; sol: string; luz: number };
const col = (h: string) => new THREE.Color(h);

/** Amanecer → mañana → día → atardecer (se puede cambiar por escena). */
export const diaCompleto: Momento[] = [
  { p: 0, arriba: "#0b1d45", horizonte: "#ff8a3d", sol: "#ff9a3c", luz: 1.6 },
  { p: 0.3, arriba: "#2a5fae", horizonte: "#ffc996", sol: "#ffd9a0", luz: 2.6 },
  { p: 0.65, arriba: "#2f74d6", horizonte: "#d4e8ff", sol: "#fff4dc", luz: 3.0 },
  { p: 1, arriba: "#142a5c", horizonte: "#ff9e4a", sol: "#ffb347", luz: 2.1 },
];

/**
 * Cielo con sol, luz principal con sombras, luz ambiente, reflejos y niebla.
 * `hora()` devuelve 0–1 (posición del sol y colores); `centro` es hacia dónde apuntan las sombras.
 */
export function Cielo({
  hora,
  momentos = diaCompleto,
  centro = new THREE.Vector3(),
  sombra = 50,
  calidad = 2048,
  solDesde = -1,
  arco = [0.05, 2.25],
}: {
  hora: () => number;
  momentos?: Momento[];
  centro?: THREE.Vector3;
  sombra?: number;
  calidad?: number;
  solDesde?: 1 | -1;
  /** Ángulo del sol al inicio y al final (rad); más de π lo esconde tras el horizonte. */
  arco?: [number, number];
}) {
  const { scene, gl } = useThree();
  const cielo = useRef<THREE.ShaderMaterial>(null);
  const sol = useRef<THREE.Sprite>(null);
  const luz = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const brillo = useMemo(() => texturaBrillo(), []);
  const paleta = useMemo(
    () => momentos.map((m) => ({ p: m.p, arriba: col(m.arriba), horizonte: col(m.horizonte), sol: col(m.sol), luz: m.luz })),
    [momentos],
  );
  const v = useMemo(() => new THREE.Vector3(), []);

  useLayoutEffect(() => {
    scene.fog = new THREE.Fog("#ff8a3d", 90, 380);
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.55;
    const l = luz.current!;
    l.target.position.copy(centro);
    scene.add(l.target);
    return () => {
      env.dispose();
      pm.dispose();
      scene.remove(l.target);
    };
  }, [scene, gl, centro]);

  useFrame(() => {
    const p = c01(hora());
    let i = 0;
    while (i < paleta.length - 2 && p > paleta[i + 1].p) i++;
    const a = paleta[i];
    const b = paleta[i + 1];
    const t = tramo(p, a.p, b.p);
    const m = cielo.current!;
    m.uniforms.arriba.value.copy(a.arriba).lerp(b.arriba, t);
    m.uniforms.horizonte.value.copy(a.horizonte).lerp(b.horizonte, t);
    m.uniforms.solColor.value.copy(a.sol).lerp(b.sol, t);
    // El sol sale por un lado, sube y baja por el otro
    const ang = lerp(arco[0], arco[1], p);
    v.set(solDesde * Math.cos(ang) * 70, Math.sin(ang) * 55 + 4, -90 + p * 40);
    m.uniforms.solDir.value.copy(v).normalize();
    sol.current!.position.copy(v).normalize().multiplyScalar(300).add(centro);
    sol.current!.material.color.copy(m.uniforms.solColor.value);
    const li = luz.current!;
    li.position.copy(v).normalize().multiplyScalar(90).add(centro);
    li.color.copy(m.uniforms.solColor.value);
    li.intensity = lerp(a.luz, b.luz, t);
    hemi.current!.intensity = 0.15 + li.intensity * 0.35;
    scene.environmentIntensity = Math.min(0.55, 0.1 + li.intensity * 0.16);
    (scene.fog as THREE.Fog).color.copy(m.uniforms.horizonte.value);
  });

  return (
    <>
      <mesh scale={800}>
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
      <sprite ref={sol} scale={[70, 70, 1]}>
        <spriteMaterial map={brillo} transparent depthWrite={false} fog={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <hemisphereLight ref={hemi} args={["#cfe0ff", "#3b3424", 0.8]} />
      <directionalLight
        ref={luz}
        castShadow
        shadow-mapSize={[calidad, calidad]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-camera-left={-sombra}
        shadow-camera-right={sombra}
        shadow-camera-top={sombra}
        shadow-camera-bottom={-sombra}
        shadow-camera-near={1}
        shadow-camera-far={220}
      />
    </>
  );
}
