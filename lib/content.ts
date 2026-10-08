/** Contenido de la web. Para cambiar textos o fotos, edita este archivo. */

const u = (id: string) => `https://images.unsplash.com/${id}`;

export const media = {
  heroVideo: "https://videos.pexels.com/video-files/32966305/14050790_1920_1080_25fps.mp4",
  heroVideoMobile: "https://videos.pexels.com/video-files/32966305/14050789_1280_720_25fps.mp4",
  heroPoster: u("photo-1497435334941-8c899ee9e8e9"),
  aerialRows: u("photo-1723133371535-1412bc2e412e"),
  engineerRoof: u("photo-1660330589243-4c640d878052"),
  meter: u("photo-1604177420682-0c840feb01de"),
};

export const stats = [
  { value: 90, prefix: "Hasta ", suffix: "%", label: "menos en tu factura de energía" },
  { value: 5, prefix: "3 a ", suffix: " años", label: "de retorno de la inversión" },
  { value: 25, prefix: "+", suffix: " años", label: "de vida útil de los paneles" },
  { value: 100, prefix: "", suffix: "%", label: "de los diseños bajo RETIE" },
];

export const solar = [
  {
    id: "on-grid",
    title: "Sistemas On-Grid",
    tag: "Conectado a la red",
    image: u("photo-1707247111552-aaf74241058b"),
    body: "Conéctate a la red y reduce tu factura hasta en un 90% vendiendo tus excedentes con la regulación CREG 174.",
    points: ["Retorno de inversión en 3 a 5 años", "Venta de excedentes al operador", "Mantenimiento simplificado"],
  },
  {
    id: "off-grid",
    title: "Sistemas Off-Grid",
    tag: "Autónomo",
    image: u("photo-1592833159057-6faf163494a9"),
    body: "Energía propia donde la red no llega: fincas, zonas rurales, telecomunicaciones y bombeo.",
    points: ["Dimensionamiento de baterías por autonomía", "Ideal para zonas no interconectadas", "Diseño y certificación RETIE"],
  },
  {
    id: "hibridos",
    title: "Sistemas Híbridos",
    tag: "Ahorro + respaldo",
    image: u("photo-1591344011733-2af60f598737"),
    body: "Lo mejor de ambos mundos: ahorro en tu factura y respaldo total cuando se va la luz.",
    points: ["Respaldo de energía 24/7", "Gestión inteligente de baterías", "Prioriza el sol, luego la batería, luego la red"],
  },
  {
    id: "bess",
    title: "BESS a gran escala",
    tag: "Almacenamiento",
    image: u("photo-1742899273038-67ff67477663"),
    body: "Sistemas de almacenamiento con baterías para industria y comercio: recorte de picos, respaldo de cargas críticas y arbitraje de energía.",
    points: ["Recorte de picos de demanda", "Respaldo para cargas críticas", "Integración con solar y red"],
  },
  {
    id: "gran-escala",
    title: "Granjas y plantas solares",
    tag: "Generación",
    image: u("photo-1642950863398-1fc3600a5313"),
    body: "Ingeniería para plantas solares en suelo y cubiertas industriales, desde la prefactibilidad hasta la conexión.",
    points: ["Estudios de conexión", "Ingeniería de detalle MT/BT", "Simulación de producción en PVsyst"],
  },
];

export const process = [
  {
    title: "Estudio de consumo",
    body: "Analizamos tus facturas, curva de carga y el sitio para saber cuánta energía necesitas y dónde instalarla.",
  },
  {
    title: "Simulación y diseño RETIE",
    body: "Simulamos la producción en PVsyst y entregamos planos de planta, diagrama unifilar y memorias de cálculo.",
  },
  {
    title: "Certificación RETIE",
    body: "Acompañamos la inspección hasta obtener el certificado emitido por un organismo acreditado ante ONAC.",
  },
  {
    title: "Legalización",
    body: "Gestionamos la conexión y la entrega de excedentes ante el operador de red: Celsia, Enel, EPM, Air-e y otros.",
  },
];

export const incentives = [
  { title: "Deducción de renta", body: "Hasta el 50% del valor de la inversión, durante 15 años (Ley 1715 de 2014)." },
  { title: "Exclusión de IVA", body: "Los equipos para generación solar están excluidos de IVA." },
  { title: "Exención de aranceles", body: "Sin aranceles en la importación de equipos certificados." },
  { title: "Depreciación acelerada", body: "Deprecia los activos del proyecto en menos tiempo." },
];

export const engineering = [
  {
    title: "Redes de media y baja tensión",
    body: "Diseño y ejecución de infraestructura eléctrica.",
    image: u("photo-1613421633868-24fdb1b07d15"),
  },
  {
    title: "Subestaciones eléctricas",
    body: "Subestaciones tipo poste, pedestal y patio con su malla de puesta a tierra.",
    image: u("photo-1780396140802-52309c205050"),
  },
  {
    title: "Instalaciones eléctricas",
    body: "Soluciones residenciales, comerciales e industriales.",
    image: u("photo-1621905251189-08b45d6a269e"),
  },
  {
    title: "Auditoría y certificación RETIE",
    body: "Inspección y cumplimiento de los estándares de seguridad eléctrica.",
    image: u("photo-1758101755915-462eddc23f57"),
  },
  {
    title: "Calidad de energía",
    body: "Estudios de armónicos, factor de potencia y compensación.",
    image: u("photo-1553873002-785d775854c9"),
  },
];

export const brands = ["Huawei", "Growatt", "Canadian Solar", "Trina Solar", "Jinko Solar", "Fronius", "Victron Energy", "PVsyst"];
export const norms = [
  { name: "RETIE", body: "Cumplimiento normativo integral" },
  { name: "NTC 2050", body: "Código eléctrico colombiano" },
  { name: "IEC", body: "Estándares internacionales" },
  { name: "IEEE 80", body: "Mallas de puesta a tierra" },
];

export const values = [
  { title: "Ética e ingeniería", body: "Transparencia total en presupuestos y proyecciones de ahorro a largo plazo." },
  { title: "Un solo responsable", body: "El mismo equipo diseña, firma y responde ante el inspector y el operador de red." },
  { title: "Simulación antes de invertir", body: "Sabes cuánto vas a generar y ahorrar antes de comprar un solo panel." },
  { title: "Impacto sostenible", body: "Comprometidos con la transición energética justa y normada en Colombia." },
];

export const faqs = [
  {
    q: "¿Cuánto cuesta un sistema solar en Colombia?",
    a: "Depende de tu consumo y del tipo de sistema. Como referencia, un sistema on-grid residencial está entre 3,5 y 4,5 millones de pesos por kWp instalado. Con un estudio de tu factura te damos el valor exacto.",
  },
  {
    q: "¿En cuánto tiempo recupero la inversión?",
    a: "Un sistema on-grid bien dimensionado se paga en 3 a 5 años, y los paneles producen más de 25 años. Las empresas además pueden usar los beneficios de la Ley 1715.",
  },
  {
    q: "¿Qué diferencia hay entre on-grid, off-grid e híbrido?",
    a: "On-grid se conecta a la red y no usa baterías. Off-grid funciona solo, con baterías, donde no hay red. Híbrido combina ambos: ahorra con el sol y te respalda cuando se va la luz.",
  },
  {
    q: "¿Mi sistema solar necesita certificación RETIE?",
    a: "Sí. Toda instalación eléctrica en Colombia debe cumplir el RETIE, y el operador de red exige el certificado para conectar tu sistema y recibir excedentes.",
  },
  {
    q: "¿Pueden legalizar un sistema que ya está instalado?",
    a: "Sí. Revisamos la instalación, hacemos las correcciones necesarias, elaboramos la memoria de cálculo y gestionamos la certificación y la conexión con el operador.",
  },
  {
    q: "¿En qué ciudades trabajan?",
    a: "En toda Colombia. Las visitas técnicas se programan según la ubicación del proyecto.",
  },
];

/** Empresas que confían en SOLPOWER X. Para agregar un cliente: pon su logo en public/clientes y añádelo aquí. */
export const clients = [
  { name: "MC4 Solar", logo: "/clientes/mc4-solar.png", url: "https://mc4energiasolar.com/" },
  { name: "Xantia Xamuels", logo: "/clientes/xantia-xamuels.png", url: "https://xantia-xamuels.com/" },
];
