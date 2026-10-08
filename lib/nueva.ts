/** Contenido de la portada de prueba (/nueva). Para cambiar textos o fotos, edita este archivo. */

import { engineering, media } from "./content";
import { empresasMedia, waEmpresas } from "./empresas";

const u = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=70&auto=format`;

export { waEmpresas };

/** Las tres puertas de la portada: cada público va a su sección. */
export const puertas = [
  {
    kicker: "01 · Empresas",
    title: "Empresas",
    body: "Industria, comercio, hoteles, clínicas y agroindustria.",
    points: ["Estudio con su factura, sin costo", "Deducción de renta del 50 % (Ley 1715)", "Respaldo para cargas críticas"],
    cta: "Ver soluciones para empresas",
    href: "/empresas",
    image: u("photo-1613665813446-82a78c468a1d"),
  },
  {
    kicker: "02 · Hogares",
    title: "Hogares",
    body: "Pague menos luz y tenga respaldo cuando se va la energía.",
    points: ["Paneles en el techo de su casa", "Baterías para no quedarse sin luz", "Instalación y legalización completas"],
    cta: "Ver soluciones para el hogar",
    href: "#calculadora",
    image: u("photo-1600585154340-be6161a56a0c"),
  },
  {
    kicker: "03 · Ingeniería",
    title: "Ingeniería",
    body: "Diseño solar para clientes e instaladores, e ingeniería eléctrica.",
    points: ["Diseño PVsyst y memorias RETIE", "Subestaciones y redes de media y baja tensión", "Calidad de energía"],
    cta: "Ver servicios de ingeniería",
    href: "#ingenieria",
    image: `${engineering[1].image}?w=1200&q=70&auto=format`,
  },
];

/** Buscador "¿Qué necesita?": cada problema lleva a su solución. */
export const necesidades = [
  {
    q: "Mi factura de energía es muy alta",
    title: "Sistema solar conectado a la red",
    body: "Genera su propia energía de día y paga mucho menos cada mes. Lo que sobra se entrega a la red y se reconoce en su factura.",
    dato: "Hasta 90 % menos en la factura",
    cta: { label: "Calcular mi ahorro", href: "#calculadora" },
  },
  {
    q: "Me cobran energía reactiva",
    title: "Estudio de calidad de energía",
    body: "Medimos su red con analizador, encontramos la causa y dimensionamos el banco de condensadores o filtros para que deje de pagar reactiva.",
    dato: "Medición, diagnóstico y solución",
    cta: { label: "Pedir un estudio", href: "#contacto" },
  },
  {
    q: "Se va la luz y pierdo producción",
    title: "Sistema híbrido o BESS",
    body: "Baterías que entran solas cuando falla la red y mantienen funcionando sus cargas críticas: neveras, servidores, máquinas.",
    dato: "Respaldo automático 24/7",
    cta: { label: "Ver sistemas con baterías", href: "#soluciones" },
  },
  {
    q: "Necesito el certificado RETIE",
    title: "Certificación y legalización",
    body: "Revisamos la instalación, hacemos las correcciones y le acompañamos en la inspección hasta tener el certificado y la conexión con el operador.",
    dato: "Inspección con organismo acreditado ONAC",
    cta: { label: "Hablar con un ingeniero", href: "#contacto" },
  },
  {
    q: "Voy a construir o ampliar mi planta",
    title: "Subestación y redes de media tensión",
    body: "Diseñamos la subestación, la acometida en media tensión y las redes internas, con su malla de puesta a tierra y el trámite ante el operador.",
    dato: "Del poste al tablero",
    cta: { label: "Ver ingeniería eléctrica", href: "#ingenieria" },
  },
  {
    q: "Soy instalador y necesito ingeniería",
    title: "Ingeniería solar para instaladores",
    body: "Usted instala, nosotros firmamos: simulación PVsyst, planos, memorias de cálculo RETIE y legalización ante el operador de red.",
    dato: "Aliados como MC4 Solar y Xantia",
    cta: { label: "Trabajar con nosotros", href: "#contacto" },
  },
];

/** Sección del panel que se desarma: los cuatro pasos del proyecto. */
export const pasosPanel = [
  {
    title: "Estudio de su factura",
    body: "Con su factura y una visita técnica sabemos cuánta energía necesita y dónde instalarla.",
  },
  {
    title: "Diseño y simulación",
    body: "Simulamos la producción en PVsyst y elegimos cada componente: paneles, inversor, estructura y protecciones.",
  },
  {
    title: "Instalación",
    body: "Montaje con personal certificado y equipos de marcas reconocidas, sin interrumpir su operación.",
  },
  {
    title: "Certificación RETIE y legalización",
    body: "Inspección RETIE y conexión ante el operador de red. Usted solo empieza a ahorrar.",
  },
];

/** Las dos ramas de ingeniería. */
export const ingenierias = [
  {
    id: "ingenieria-solar",
    kicker: "Para clientes e instaladores",
    title: "Ingeniería solar",
    body: "Todo lo técnico de un proyecto solar, con diseño y firma de ingeniería eléctrica.",
    image: `${media.engineerRoof}?w=1400&q=70&auto=format`,
    items: [
      { title: "Diseño y simulación PVsyst", body: "Producción esperada, pérdidas y tamaño óptimo del sistema." },
      { title: "Planos y memorias de cálculo RETIE", body: "Diagrama unifilar, protecciones, cableado y puesta a tierra." },
      { title: "Legalización ante el operador", body: "Trámite de conexión y entrega de excedentes (CREG 174)." },
      { title: "Apoyo a instaladores", body: "Usted instala y nosotros entregamos la ingeniería completa." },
    ],
  },
  {
    id: "ingenieria-electrica",
    kicker: "Otros servicios",
    title: "Servicios de ingeniería eléctrica",
    body: "Infraestructura eléctrica segura y con cumplimiento normativo, del poste al tablero.",
    image: `${engineering[1].image}?w=1400&q=70&auto=format`,
    items: engineering.map((e) => ({ title: e.title, body: e.body })),
  },
];

export const cierre = {
  video: media.heroVideo,
  poster: `${empresasMedia.cierre}&w=1600`,
};
