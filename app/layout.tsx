import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "SOLPOWER X | Energía Inteligente para el Futuro",
  description: "Soluciones avanzadas en energía solar, ingeniería eléctrica y eficiencia energética. Integramos el poder para su industria y hogar con ingeniería de precisión en Colombia.",
  keywords: ["Energía Solar", "Ingeniería Eléctrica", "Eficiencia Energética", "Paneles Solares Colombia", "RETIE"],
  icons: {
    icon: "/favicon.ico",
  },
};

import WhatsAppButton from "@/components/WhatsAppButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${montserrat.variable} bg-background text-on-background selection:bg-primary selection:text-on-primary-fixed antialiased`}>
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
