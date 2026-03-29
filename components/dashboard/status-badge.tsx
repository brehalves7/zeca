"use client";

import { CheckCircle2, Clock, AlertTriangle, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  interactive?: boolean;
}

export function StatusBadge({ status, onClick, className, interactive = false }: StatusBadgeProps) {
  const s = status ? status.toUpperCase() : "PENDENTE";

  const getStatusConfig = () => {
    switch (s) {
      case "PAGO":
        return {
          label: "Aprovado",
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          icon: CheckCircle2,
        };
      case "PENDENTE":
        return {
          label: "Aguardando",
          color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
          icon: Clock,
        };
      case "ENVIADO":
        return {
          label: "Despachado",
          color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
          icon: Truck,
        };
      case "CANCELADO":
        return {
          label: "Cancelado",
          color: "bg-red-500/10 text-red-400 border-red-500/20",
          icon: AlertTriangle,
        };
      default:
        return {
          label: status,
          color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
          icon: Clock,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      disabled={!interactive || !onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
        config.color,
        interactive && onClick ? "hover:scale-105 active:scale-95 cursor-pointer" : "cursor-default",
        className
      )}
    >
      <Icon size={12} className={cn(s === "PENDENTE" || s === "PAGO" ? "animate-pulse" : "")} />
      {config.label}
    </button>
  );
}
