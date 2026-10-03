const steps = [
  {
    title: "Visita y levantamiento",
    body: "Revisamos el sitio, las cargas, la acometida y lo que pide el operador de red.",
  },
  {
    title: "Diseño y cálculos",
    body: "Dimensionamos conductores, protecciones, puesta a tierra y equipos. Todo queda en la memoria de cálculo.",
  },
  {
    title: "Planos y documentos RETIE",
    body: "Entregamos planos, memoria firmada y declaración de cumplimiento listos para radicar.",
  },
  {
    title: "Acompañamiento a la inspección",
    body: "Respondemos las observaciones del inspector y del operador hasta la conexión.",
  },
];

export default function Process() {
  return (
    <section id="proceso" className="bg-papel py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <h2 className="display max-w-3xl text-[clamp(2.2rem,5vw,4rem)] text-azul">Cómo trabajamos</h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-tinta/75">
          Un solo responsable de principio a fin, con documentos que el inspector puede revisar sin vueltas.
        </p>

        <ol className="mt-16 grid gap-12 md:grid-cols-4 md:gap-8">
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <div className="mb-6 flex items-center gap-3">
                <span className="wide grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-azul font-bold text-azul">
                  {i + 1}
                </span>
                <span className="hidden h-px flex-1 bg-linea/60 md:block" aria-hidden />
              </div>
              <h3 className="wide text-xl font-bold text-azul">{s.title}</h3>
              <p className="mt-3 leading-relaxed text-tinta/75">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
