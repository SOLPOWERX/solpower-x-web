"use client";

import dynamic from "next/dynamic";

const Estudio = dynamic(() => import("@/components/estudio/Estudio"), { ssr: false });

export default function EstudioCliente({ d }: { d: string }) {
  return <Estudio d={d} />;
}
