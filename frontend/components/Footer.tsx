export function Footer() {
  const links = ["EsSalud", "IETSI", "RENACYT", "Datos abiertos", "API", "Transparencia", "Contacto", "Redes sociales"];

  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-slate-600 md:flex-row md:items-center md:justify-between lg:px-8">
        <p className="font-semibold text-brand-dark">Observatorio Nacional de Investigacion de EsSalud</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          {links.map((link) => (
            <a key={link} href="#" className="hover:text-brand-dark">
              {link}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
