"use client";

import { Canvas, useThree, type RootState } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { Children, createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

/** Aviso para la animación de entrada: la escena ya está armada y con sus materiales listos. */
export const ESCENA_LISTA = "sx:escena-lista";

const Preparacion = createContext<{ alListo: (msPorCuadro: number) => void; conEfectos: boolean }>({ alListo: () => {}, conEfectos: false });

/**
 * Monta las piezas de la escena una por cuadro y luego prepara los materiales en segundo plano.
 * Así el navegador no se queda congelado armando todo de un solo golpe.
 */
export function PorEtapas({ children }: { children: ReactNode }) {
  const partes = Children.toArray(children);
  const total = partes.length;
  const [n, setN] = useState(1);
  const { alListo, conEfectos } = useContext(Preparacion);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const advance = useThree((s) => s.advance);

  useEffect(() => {
    if (n < total) {
      let t: ReturnType<typeof setTimeout>;
      const id = requestAnimationFrame(() => {
        t = setTimeout(() => setN((v) => v + 1), 0);
      });
      return () => {
        cancelAnimationFrame(id);
        clearTimeout(t);
      };
    }
    let vivo = true;
    // El primer dibujo sube texturas y geometría a la tarjeta gráfica y calcula las sombras: es lo más pesado.
    // Se hace aquí, con la escena todavía oculta, y solo después se avisa que está lista.
    const fin = () => {
      if (!vivo) return;
      let ms = 0;
      try {
        const ctx = gl.getContext();
        advance(performance.now());
        ctx.finish();
        // Con todo ya cargado, mide cuánto tarda de verdad un cuadro en este equipo
        const t0 = performance.now();
        for (let i = 0; i < 3; i++) {
          advance(performance.now());
          ctx.finish();
        }
        ms = (performance.now() - t0) / 3;
      } catch {}
      requestAnimationFrame(() => vivo && alListo(ms));
    };
    // Con efectos la escena se dibuja en un lienzo intermedio: los materiales se preparan para ese destino
    const destino = conEfectos ? new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType }) : null;
    try {
      if (destino) gl.setRenderTarget(destino);
      const espera = gl.compileAsync(scene, camera);
      if (destino) gl.setRenderTarget(null);
      espera.then(fin, fin).finally(() => destino?.dispose());
    } catch {
      if (destino) gl.setRenderTarget(null);
      destino?.dispose();
      fin();
    }
    return () => {
      vivo = false;
    };
  }, [n, total, gl, scene, camera, advance, alListo, conEfectos]);

  return <>{partes.slice(0, n)}</>;
}

/**
 * Lienzo 3D común a todas las escenas.
 * - Se arma por partes y aparece con un fundido cuando está listo.
 * - Solo dibuja mientras se ve en pantalla (al bajar a las demás secciones se detiene del todo).
 * - Mide el equipo antes de mostrarse y, si es justo, arranca ya con menos resolución.
 */
export default function Lienzo({
  movil,
  posicion,
  children,
}: {
  movil: boolean;
  posicion: [number, number, number];
  children: ReactNode;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [lista, setLista] = useState(false);
  const [dpr, setDpr] = useState(movil ? 1.25 : 1.5);
  const estado = useRef<RootState | null>(null);
  const preparacion = useRef({
    alListo: (msPorCuadro: number) => {
      const mostrar = () => {
        setLista(true);
        // El aviso sale dos cuadros después, cuando la escena ya está corriendo, para que la entrada se abra fluida
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            (window as unknown as { __sxEscena?: boolean }).__sxEscena = true;
            window.dispatchEvent(new Event(ESCENA_LISTA));
          }),
        );
      };
      // Equipo justo: baja la resolución ahora, con la escena todavía oculta, para que no dé un tirón después
      if (msPorCuadro > 15) {
        setDpr(msPorCuadro > 30 ? 0.85 : 1);
        setTimeout(() => {
          try {
            estado.current?.advance(performance.now());
          } catch {}
          requestAnimationFrame(mostrar);
        }, 150);
      } else mostrar();
    },
    conEfectos: !movil,
  });
  preparacion.current.conEfectos = !movil;

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={caja} className={`h-full w-full transition-opacity duration-700 ${lista ? "opacity-100" : "opacity-0"}`}>
      <Canvas
        frameloop={visible && lista ? "always" : "never"}
        shadows={movil ? true : "soft"}
        dpr={dpr}
        camera={{ fov: movil ? 55 : 42, near: 0.1, far: 1500, position: posicion }}
        // Con efectos (computador) el suavizado lo hace el compositor; en celular lo hace el navegador
        gl={{ antialias: movil, powerPreference: "high-performance" }}
        onCreated={(st) => {
          estado.current = st;
          st.gl.toneMapping = THREE.ACESFilmicToneMapping;
          st.gl.toneMappingExposure = 1.05;
        }}
      >
        <Preparacion.Provider value={preparacion.current}>{children}</Preparacion.Provider>
        {!movil && (
          <EffectComposer multisampling={2}>
            <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.9} luminanceSmoothing={0.25} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
