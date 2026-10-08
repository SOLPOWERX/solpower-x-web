/** Contenido de la página /ingenieria. Para cambiar textos, edita este archivo. */

export const waIngenieria = `https://wa.me/573123312334?text=${encodeURIComponent(
  "Hola SOLPOWER X, necesito un servicio de ingeniería eléctrica.",
)}`;
export const waInstaladores = `https://wa.me/573123312334?text=${encodeURIComponent(
  "Hola SOLPOWER X, soy instalador y necesito ingeniería para un proyecto solar.",
)}`;

/** Ingeniería solar: para clientes finales e instaladores. */
export const ingenieriaSolar = [
  { title: "Diseño y simulación de producción", body: "Producción esperada, pérdidas, sombras y el tamaño óptimo del sistema." },
  { title: "Planos y memorias de cálculo RETIE", body: "Diagrama unifilar, protecciones, cableado, puesta a tierra y apantallamiento." },
  { title: "Legalización ante el operador", body: "Trámite de conexión y entrega de excedentes (CREG 174) con el operador de red de su zona." },
  { title: "Apoyo a instaladores", body: "Usted instala y nosotros entregamos la ingeniería completa, firmada por ingeniero." },
];

/** Otros servicios de ingeniería eléctrica, con lo que incluye cada uno. */
export const serviciosElectricos = [
  {
    title: "Subestaciones eléctricas",
    body: "Tipo poste, pedestal y patio, del diseño a la puesta en servicio.",
    incluye: ["Selección del transformador", "Protecciones y celdas de media tensión", "Malla de puesta a tierra (IEEE 80)", "Trámite ante el operador de red"],
  },
  {
    title: "Redes de media y baja tensión",
    body: "Aéreas y subterráneas, para urbanizaciones, industrias y fincas.",
    incluye: ["Cálculo de regulación y pérdidas", "Postes, crucetas y conductores", "Canalizaciones y cámaras", "Planos para aprobación"],
  },
  {
    title: "Instalaciones eléctricas",
    body: "Residenciales, comerciales e industriales, seguras y bajo norma.",
    incluye: ["Acometidas y tableros", "Iluminación y tomacorrientes", "Circuitos para maquinaria", "Memorias de cálculo"],
  },
  {
    title: "Auditoría y certificación RETIE",
    body: "Revisamos su instalación y le acompañamos hasta tener el certificado.",
    incluye: ["Inspección previa", "Corrección de no conformidades", "Dictamen con organismo acreditado ONAC", "Documentación completa"],
  },
  {
    title: "Calidad de energía",
    body: "Encontramos por qué le cobran reactiva o se le dañan los equipos.",
    incluye: ["Medición con analizador de redes", "Armónicos y factor de potencia", "Bancos de condensadores y filtros", "Informe con recomendaciones"],
  },
];
