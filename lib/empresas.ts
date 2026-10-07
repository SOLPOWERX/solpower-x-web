/** Contenido de la página /empresas (aterrizaje de Google Ads). Para cambiar textos o fotos, edita este archivo. */

const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb`;

export const waEmpresas = `https://wa.me/573123312334?text=${encodeURIComponent(
  "Hola SOLPOWER X, quiero un estudio de energía solar para mi empresa. Les envío la factura de energía.",
)}`;

export const empresasMedia = {
  hero: px(29923348),
  cierre: px(8783541),
};

export const sectores = [
  {
    title: "Industria y bodegas",
    body: "Techos grandes y consumo de día: el caso ideal para generar su propia energía.",
    image: px(29923357),
  },
  {
    title: "Comercio y centros comerciales",
    body: "Aires, iluminación y refrigeración que trabajan justo cuando hay sol.",
    image: px(9799726),
  },
  {
    title: "Hoteles, clínicas y colegios",
    body: "Consumo alto todo el año y una factura que pesa en el presupuesto.",
    image: px(37824217),
  },
  {
    title: "Agroindustria",
    body: "Bombeo, frío y procesos donde la energía es cara o se va.",
    image: "https://images.unsplash.com/photo-1723133371535-1412bc2e412e",
  },
];

export const ganancias = [
  {
    kicker: "Ahorro",
    title: "Paga menos energía cada mes",
    body: "Cada kWh que produce en su techo deja de comprarlo a la tarifa comercial o industrial y, si su empresa la paga, sin la contribución del 20 %.",
  },
  {
    kicker: "Ley 1715",
    title: "Deduce el 50 % de la inversión",
    body: "Deducción en renta del 50 % de la inversión hasta en 15 años, exclusión de IVA, exención de aranceles y depreciación acelerada. Requiere certificación de la UPME y le acompañamos en el trámite.",
  },
  {
    kicker: "Excedentes",
    title: "Lo que sobra, se reconoce",
    body: "La energía que no consume se entrega a la red y se reconoce en su factura, según la Resolución CREG 174 de 2021.",
  },
  {
    kicker: "+25 años",
    title: "Un activo que dura",
    body: "Los paneles producen más de 25 años. El sistema se paga en los primeros y el resto es ahorro.",
  },
];

export const pasos = [
  { title: "Nos envía la factura", body: "Por WhatsApp, una foto basta. Con ella vemos su consumo y su tarifa." },
  { title: "Visita técnica", body: "Medimos el techo y revisamos el tablero, la acometida y el transformador." },
  {
    title: "Propuesta técnico-financiera",
    body: "Tamaño del sistema, ahorro mensual, retorno de la inversión y beneficios tributarios, con cifras de su caso.",
  },
  { title: "Instalación y legalización", body: "Montaje, trámite con el operador de red y certificación RETIE. Llave en mano." },
];

/** Preguntas reales de Google Colombia (AlsoAsked, octubre de 2026). */
export const faqsEmpresas = [
  {
    q: "¿Cuánto cuesta un sistema solar para una empresa?",
    a: "Depende de cuánta energía consume, del espacio en el techo y de su tarifa. Por eso empezamos por la factura: con ella le damos una cifra para su caso, el ahorro mensual y en cuánto tiempo se paga.",
  },
  {
    q: "¿Cuántos paneles solares necesita mi negocio?",
    a: "Se calcula con su consumo mensual en kWh y el sol de su ciudad. Como referencia, cada kWp ocupa unos 5 m² de techo: un sistema de 100 kWp necesita alrededor de 500 m² y produce cerca de 10.000 kWh al mes.",
  },
  {
    q: "¿Qué beneficios tributarios tienen los paneles solares en Colombia?",
    a: "Por la Ley 1715 de 2014: deducción en renta del 50 % de la inversión, exclusión de IVA en equipos, exención de aranceles y depreciación acelerada. Todos exigen la certificación de la UPME del proyecto.",
  },
  {
    q: "¿Puedo deducir los paneles solares de la renta?",
    a: "Sí, si la empresa declara renta y el proyecto tiene la certificación de la UPME. Deduce el 50 % de la inversión en un plazo de hasta 15 años, sin pasar del 50 % de la renta líquida de cada año. Su contador confirma cómo aplicarlo.",
  },
  {
    q: "¿Qué pasa con la energía que sobra?",
    a: "Se entrega a la red del operador y se reconoce en su factura, según la Resolución CREG 174 de 2021. Para eso el sistema debe estar legalizado y con certificación RETIE, que nosotros tramitamos.",
  },
  {
    q: "¿En qué ciudades trabajan?",
    a: "En Bogotá, la Sabana y el resto de Colombia. La visita técnica se programa según la ubicación del proyecto.",
  },
];

