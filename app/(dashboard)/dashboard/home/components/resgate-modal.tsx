"use client";

import { useState } from "react";
import { Wallet, X, ArrowUpRight, CheckCircle2, DollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ResgateProps {
  saldoDisponivel: number;
  userId: string;
}

export function ResgateModal({ saldoDisponivel, userId }: ResgateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pix, setPix] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleResgate = async () => {
    if (saldoDisponivel <= 0) return alert("Saldo insuficiente.");
    if (!pix) return alert("Informe sua chave PIX.");

    setLoading(true);
    const { error } = await supabase.from("saques").insert({
      user_id: userId,
      valor: saldoDisponivel,
      chave_pix: pix,
      status: "PENDENTE",
    });

    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        router.refresh();
      }, 3000);
    } else {
      alert("Erro ao solicitar: " + error.message);
    }
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-white text-emerald-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all shadow-xl active:scale-95 group"
      >
        SOLICITAR RESGATE
        <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#16181D] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        {success ? (
          <div className="text-center py-10 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Solicitação Enviada!</h3>
            <p className="text-slate-400 text-sm mt-2 font-bold">O Zeca está processando seu pagamento.</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Wallet className="text-emerald-500" size={20} />
                </div>
                <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Resgate de Comissão</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-black/40 border border-white/5 p-6 rounded-3xl text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Valor Disponível</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">
                  R$ {saldoDisponivel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </h3>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Chave PIX para Recebimento</label>
                <input 
                  type="text"
                  value={pix}
                  onChange={(e) => setPix(e.target.value)}
                  placeholder="CPF, E-mail ou Celular"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-700"
                />
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex gap-3">
                <DollarSign size={32} className="text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-500/70 font-bold leading-relaxed uppercase">
                  O prazo para liquidação é de até 24h úteis após a conferência dos pedidos pela nossa IA.
                </p>
              </div>

              <button 
                onClick={handleResgate}
                disabled={loading || saldoDisponivel <= 0}
                className="w-full bg-white text-emerald-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {loading ? "PROCESSANDO..." : "CONFIRMAR RESGATE AGORA"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}