import { Search } from "lucide-react";

export function SearchBar({ placeholder = "Buscar en el directorio" }: { placeholder?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <Search size={18} className="shrink-0 text-brand" />
      <input aria-label={placeholder} className="min-h-11 min-w-0 w-full bg-transparent text-base outline-none" placeholder={placeholder} />
    </div>
  );
}
