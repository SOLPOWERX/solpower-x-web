/** Datos de contacto y de marca usados en toda la web y en el SEO. */
export const site = {
  name: "SOLPOWER X",
  slogan: "Haz del sol tu mejor inversión",
  /** Portada a la que vuelven las demás páginas. En la copia de prueba es /nueva; al publicar la portada nueva, cambiar a "/". */
  inicio: "/nueva",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://solpowerx.com").replace(/\/$/, ""),
  phone: "+57 312 331 2334",
  phoneRaw: "+573123312334",
  whatsapp: "https://wa.me/573123312334?text=Hola%20SOLPOWER%20X%2C%20quiero%20informaci%C3%B3n%20sobre%20",
  email: "contacto@solpowerx.com",
  engineer: "Uriel Antonio Gutiérrez",
  description:
    "Sistemas solares on-grid, off-grid, híbridos y BESS en Colombia con análisis técnico-financiero, legalización y certificación RETIE. Ingeniería eléctrica: redes, subestaciones y calidad de energía.",
};
