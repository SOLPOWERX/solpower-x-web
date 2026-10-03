import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-noche py-12 text-niebla">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 text-sm md:flex-row md:items-center md:justify-between md:px-8">
        <p>
          <span className="wide font-bold text-white">SOLPOWER X</span>. {site.slogan}.
        </p>
        <p>© {new Date().getFullYear()} SOLPOWER X. Ingeniería eléctrica y solar en Colombia.</p>
      </div>
    </footer>
  );
}
