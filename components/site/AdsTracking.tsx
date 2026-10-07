"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * Etiqueta de Google Ads + conversión al tocar WhatsApp o "llamar" en cualquier página.
 * No hace nada hasta que en Vercel existan:
 *   NEXT_PUBLIC_GOOGLE_ADS_ID      (ej. AW-123456789)
 *   NEXT_PUBLIC_GOOGLE_ADS_LABEL   (etiqueta de la conversión "Clic en WhatsApp")
 */
const ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL;

type Gtag = (...args: unknown[]) => void;

export default function AdsTracking() {
  useEffect(() => {
    if (!ID) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      const href = a?.getAttribute("href") ?? "";
      const tipo = href.startsWith("https://wa.me") ? "whatsapp" : href.startsWith("tel:") ? "llamada" : null;
      const gtag = (window as unknown as { gtag?: Gtag }).gtag;
      if (!tipo || !gtag) return;
      if (LABEL) gtag("event", "conversion", { send_to: `${ID}/${LABEL}`, value: 1.0, currency: "COP" });
      gtag("event", `clic_${tipo}`, { pagina: window.location.pathname });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  if (!ID) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${ID}`} strategy="afterInteractive" />
      <Script id="google-ads" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ID}');`}
      </Script>
    </>
  );
}
