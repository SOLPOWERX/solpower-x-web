import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import EstudioCliente from "./EstudioCliente";

/** Estudio interno para crear las imágenes 3D de la web. Solo abre en este computador (localhost), nunca en el sitio publicado. */
export const metadata: Metadata = { title: "Estudio", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const host = (await headers()).get("host") ?? "";
  if (!host.startsWith("localhost") && !host.startsWith("127.0.0.1")) notFound();
  const { d = "" } = await searchParams;
  return <EstudioCliente d={d} />;
}
