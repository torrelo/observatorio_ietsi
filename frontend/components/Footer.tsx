export function Footer() {
  const links = ["EsSalud", "IETSI", "RENACYT", "Datos abiertos", "API", "Transparencia", "Contacto", "Redes sociales"];

  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="site-container flex flex-col gap-4 py-6 text-sm text-slate-600 xl:flex-row xl:items-center xl:justify-between">
        <p className="font-semibold text-brand-dark">Observatorio Nacional de Investigacion de EsSalud</p>
        <div>
        <div role="group" className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Referencias institucionales">
          {links.map((link) => (
            <span key={link}>
              {link}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">Enlaces institucionales pendientes de configuración.</p>
        </div>
      </div>
    </footer>
  );
}
