import { Search } from "lucide-react";

export function SearchInput() {
  return (
    <form action="/dashboard/admin/clientes" method="GET" className="relative w-full md:w-96">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
      <input 
        type="text" 
        name="query"
        placeholder="Buscar clientes por ID ou Nome..." 
        className="w-full bg-[#16181D] border border-white/5 pl-12 pr-4 py-4 rounded-2xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
      />
      <button type="submit" className="hidden">Buscar</button>
    </form>
  );
}
