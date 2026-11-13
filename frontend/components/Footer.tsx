export function Footer() {
  const links = ["EsSalud", "IETSI", "RENACYT", "Datos abiertos", "API", "Transparencia", "Contacto", "Redes sociales"];

  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="site-container flex flex-col gap-4 py-6 text-sm text-slate-600 xl:flex-row xl:items-center xl:justify-between">
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
