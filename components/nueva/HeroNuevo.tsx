"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { media } from "@/lib/content";
import Panel3D from "./Panel3D";
import { useIntroListo } from "./Intro";

const line1 = ["Haz", "del", "sol", "tu"];
const line2 = ["mejor", "inversión"];

export default function HeroNuevo() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const listo = useIntroListo();

  // Posición del mouse (-1 a 1) suavizada: mueve el video, el panel y el resplandor
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 16 });
  const sy = useSpring(my, { stiffness: 50, damping: 16 });
  const vidX = useTransform(sx, (v) => v * -18);
  const vidY = useTransform(sy, (v) => v * -12);
  const rotX = useTransform(sy, (v) => 58 - v * 9);
  const rotZ = useTransform(sx, (v) => -38 + v * 14);
  const glowX = useTransform(sx, (v) => `${55 + v * 25}%`);
  const glowY = useTransform(sy, (v) => `${45 + v * 25}%`);
  const glow = useMotionTemplate`radial-gradient(650px circle at ${glowX} ${glowY}, rgba(255,194,61,.16), transparent 60%)`;

  // El panel llega desarmado y se arma solo
  const gap = useMotionValue(70);

  // Al bajar: el texto sube y se desvanece, el panel se queda atrás (profundidad)
  const { scrollYProgress } = useScroll({ target: root, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const textO = useTransform(scrollYProgress, (v) => Math.max(0, 1 - v / 0.7));
  const panelY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  useEffect(() => {
    const v = video.current;
    if (v && window.matchMedia("(max-width: 767px)").matches) v.src = media.heroVideoMobile;
    v?.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (!listo) return;
    const c = animate(gap, 3, { duration: 1.8, delay: 0.35, ease: [0.7, 0, 0.2, 1] });
    return () => c.stop();
  }, [listo, gap]);

  const onMove = (e: React.MouseEvent) => {
    mx.set((e.clientX / window.innerWidth - 0.5) * 2);
    my.set((e.clientY / window.innerHeight - 0.5) * 2);
  };

  const show = (delay: number) => ({
    initial: { opacity: 0, y: 30, filter: "blur(8px)" },
    animate: listo ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined,
    transition: { delay, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] as const },
  });

  return (
    <section
      id="inicio"
      ref={root}
      onMouseMove={onMove}
      className="relative h-svh min-h-[660px] overflow-hidden bg-azul-950 text-white"
    >
      {/* Video de fondo con movimiento de profundidad */}
      <motion.div className="absolute -inset-8" style={{ x: vidX, y: vidY }}>
        <motion.video
          ref={video}
          className="h-full w-full object-cover"
          src={media.heroVideo}
          poster={`${media.heroPoster}?w=1600&q=70&auto=format`}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          initial={{ scale: 1.25 }}
          animate={listo ? { scale: 1.05 } : undefined}
          transition={{ duration: 2.4, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-azul-950/95 via-azul-950/65 to-azul-950/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-azul-950/40 via-transparent to-azul-950" />
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: glow }} />

      <div className="relative z-10 mx-auto grid h-full max-w-7xl grid-rows-[auto_1fr] items-center gap-4 px-5 pb-10 pt-24 lg:grid-cols-[1.05fr_.95fr] lg:grid-rows-1 lg:pt-20">
        {/* Panel 3D flotando con anillo de luz */}
        <motion.div
          className="relative order-first grid h-[24svh] place-items-center lg:order-last lg:h-[72svh]"
          style={{ y: panelY }}
          initial={{ opacity: 0 }}
          animate={listo ? { opacity: 1 } : undefined}
          transition={{ duration: 1.2, delay: 0.2 }}
        >
          <span aria-hidden className="anillo absolute aspect-square w-[min(58vw,250px)] rounded-full lg:w-[min(36vw,480px)]" />
          <span
            aria-hidden
            className="absolute aspect-square w-[min(58vw,250px)] rounded-full bg-[radial-gradient(circle,rgba(255,194,61,.32)_0%,rgba(240,165,0,.08)_45%,transparent_70%)] blur-xl lg:w-[min(36vw,480px)]"
          />
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="lg:hidden">
              <Panel3D width="min(26vw,118px)" rotX={rotX} rotZ={rotZ} gap={gap} />
            </div>
            <div className="hidden lg:block">
              <Panel3D width="min(15vw,215px)" rotX={rotX} rotZ={rotZ} gap={gap} />
            </div>
          </motion.div>
        </motion.div>

        <motion.div className="text-center lg:text-left" style={{ y: textY, opacity: textO }}>
          <motion.p
            {...show(0.1)}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs backdrop-blur-md md:text-sm"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sol-claro" />
            Energía solar e ingeniería eléctrica en toda Colombia
          </motion.p>
          <h1 className="text-[clamp(2.4rem,6.4vw,5.6rem)] font-bold leading-[1.02] tracking-tight">
            {[line1, line2].map((line, l) => (
              <span key={l} className="block">
                {line.map((w, i) => (
                  <span key={w} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                    <motion.span
                      className={`mr-[0.25em] inline-block ${
                        l ? "bg-gradient-to-r from-sol to-sol-claro bg-clip-text text-transparent" : ""
                      }`}
                      initial={{ y: "110%" }}
                      animate={listo ? { y: 0 } : undefined}
                      transition={{ delay: 0.15 + (l * 4 + i) * 0.07, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {w}
                    </motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <motion.p {...show(0.7)} className="mx-auto mt-5 max-w-xl text-[0.95rem] leading-relaxed text-white/80 md:mt-6 md:text-lg lg:mx-0">
            Generamos su propia energía con sistemas solares diseñados, certificados y legalizados por ingenieros. Usted
            solo empieza a ahorrar.
          </motion.p>
          <motion.div {...show(0.85)} className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a href="#calculadora" className="btn-sol shine max-sm:py-3">
              Calcular mi ahorro
            </a>
            <a href="/empresas" className="btn-ghost max-sm:px-5 max-sm:py-3 max-sm:text-sm">
              ¿Es una empresa? Vea cómo ahorrar
            </a>
          </motion.div>
        </motion.div>
      </div>

      <motion.a
        href="#puertas"
        aria-label="Bajar"
        className="absolute bottom-6 left-1/2 z-10 hidden h-12 w-8 -translate-x-1/2 justify-center rounded-full border-2 border-white/50 pt-2 md:grid"
        initial={{ opacity: 0 }}
        animate={listo ? { opacity: 1 } : undefined}
        transition={{ delay: 1.4 }}
      >
        <span className="h-2.5 w-1 animate-bounce rounded-full bg-white" />
      </motion.a>
    </section>
  );
}
