import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "SOLPOWER X | Energía solar e ingeniería eléctrica en Colombia",
    template: "%s | SOLPOWER X",
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "SOLPOWER X",
    "SolPowerX",
    "paneles solares Colombia",
    "sistema solar híbrido",
    "BESS baterías",
    "Ley 1715 beneficios",
    "memoria de cálculo RETIE",
    "certificación RETIE",
    "diseño eléctrico Colombia",
    "energía solar Colombia",
    "paneles solares on-grid",
    "sistemas off-grid",
    "subestaciones eléctricas",
    "media tensión",
    "baja tensión",
    "ingeniero electricista",
  ],
  authors: [{ name: site.engineer }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "/",
    siteName: site.name,
    title: "SOLPOWER X | Energía solar e ingeniería eléctrica en Colombia",
    description: site.description,
    images: [{ url: "/logo-completo.png", width: 800, height: 527, alt: "SOLPOWER X" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SOLPOWER X | Energía solar en Colombia",
    description: site.description,
    images: ["/logo-completo.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#071733",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  alternateName: ["SolPowerX", "SOLPOWERX", "Sol Power X"],
  slogan: site.slogan,
  description: site.description,
  url: site.url,
  logo: `${site.url}/isotipo.png`,
  image: `${site.url}/logo-completo.png`,
  telephone: site.phoneRaw,
  email: site.email,
  areaServed: { "@type": "Country", name: "Colombia" },
  address: { "@type": "PostalAddress", addressCountry: "CO" },
  founder: { "@type": "Person", name: site.engineer, jobTitle: "Ingeniero electricista" },
  knowsAbout: [
    "RETIE",
    "NTC 2050",
    "Energía solar fotovoltaica",
    "Subestaciones eléctricas",
    "Redes de media y baja tensión",
    "Sistemas de puesta a tierra IEEE 80",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO" className={poppins.variable}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
