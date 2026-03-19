"use client";

import { useState } from "react";
import { Edit2, X, Loader2 } from "lucide-react";
import { updateCliente } from "./actions";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
}

export function EditClienteModal({ cliente }: { cliente: Cliente }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estado para controlar o valor do telefone com a máscara
  const [phoneValue, setPhoneValue] = useState(cliente.telefone || "");

  // Função que aplica a máscara de telefone (Padrão Brasil)
  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, "") // Remove tudo o que não é número
      .replace(/(\d{2})(\d)/, "($1) $2") // Coloca parênteses em volta dos dois primeiros dígitos
      .replace(/(\d{5})(\d)/, "$1-$2") // Coloca o hífen após o quinto dígito
      .replace(/(-\d{4})\d+?$/, "$1"); // Limita a 11 números (9 dígitos + DDD)
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneValue(maskPhone(e.target.value));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    // Garantimos que o valor enviado é o que está no estado (com máscara)
    const result = await updateCliente(cliente.id, formData);

    setLoading(false);
    if (!result.error) setIsOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 text-slate-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-2xl transition-all"
        title="Editar Cliente"
      >
        <Edit2 size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#16181D] border border-white/10 w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-white">
                  Editar Cliente
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                    Nome Completo
                  </label>
                  <input
                    name="nome"
                    defaultValue={cliente.nome}
                    required
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Telefone com Máscara */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                      Telefone
                    </label>
                    <input
                      name="telefone"
                      value={phoneValue}
                      onChange={handlePhoneChange}
                      placeholder="(00) 00000-0000"
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>

                  {/* Cidade */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                      Cidade
                    </label>
                    <input
                      name="cidade"
                      defaultValue={cliente.cidade}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-[#0F1115] font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-emerald-500/20"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Salvar Alterações"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
