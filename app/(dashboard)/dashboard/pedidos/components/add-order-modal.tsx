"use client";

import { useState, useEffect } from "react";
import { Plus, X, User, Mail, Phone, ShoppingBag, Hash, Loader2, Package, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AddOrderModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [products, setProducts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [fetchingClients, setFetchingClients] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: "",
    cliente_nome: "",
    cliente_email: "",
    cliente_telefone: "",
    valor_total: "0",
    itens_quantidade: "1",
    produto_id: "",
    preco_unitario: 0,
    sku: "",
  });

  const selectedProduct = products.find(p => p.id === formData.produto_id);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchClients();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setFetchingProducts(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, sku, price")
      .order("name");
    
    if (!error) setProducts(data || []);
    setFetchingProducts(false);
  };

  const fetchClients = async () => {
    setFetchingClients(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn("⚠️ [Modal] Usuário não identificado para busca de clientes.");
        return;
      }

      console.log("🔍 [Modal] Buscando clientes para o usuário:", user.id);
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome, telefone")
        .eq("user_id", user.id)
        .order("nome");
      
      if (error) {
        console.error("❌ [Modal] Erro Supabase ao buscar clientes:", error.message, error.details);
      } else {
        console.log("✅ [Modal] Clientes carregados:", data?.length || 0);
        setClients(data || []);
      }
    } catch (err) {
      console.error("🚨 [Modal] Falha crítica ao buscar clientes:", err);
    } finally {
      setFetchingClients(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClients = clients.filter(c => 
    c.nome.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    c.telefone?.includes(clientSearchTerm)
  );

  const handleProductSelect = (product: any) => {
    setFormData({
      ...formData,
      produto_id: product.id,
      sku: product.sku,
    });
    setSearchTerm(product.name);
    setIsDropdownOpen(false);
  };

  const handleClientSelect = (client: any) => {
    setFormData({
      ...formData,
      cliente_id: client.id,
      cliente_nome: client.nome,
      cliente_telefone: client.telefone || "",
    });
    setClientSearchTerm(client.nome);
    setIsClientDropdownOpen(false);
  };

  const handlePriceChange = (price: string) => {
    const p = parseFloat(price) || 0;
    const quantity = parseInt(formData.itens_quantidade) || 0;
    setFormData({
      ...formData,
      preco_unitario: p,
      valor_total: (p * quantity).toString(),
    });
  };

  const handleQuantityChange = (qty: string) => {
    const quantity = parseInt(qty) || 0;
    const price = formData.preco_unitario || 0;
    setFormData({
      ...formData,
      itens_quantidade: qty,
      valor_total: (price * quantity).toString(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      if (!formData.itens_quantidade || !formData.valor_total || !formData.produto_id) {
        alert("Por favor, selecione um produto e defina a quantidade/valor.");
        setLoading(false);
        return;
      }

      // Gera um código de pedido simples (ex: timestamp ou random)
      const codigo_pedido = Math.floor(1000 + Math.random() * 9000).toString();

      const { error } = await supabase.from("pedidos").insert([
        {
          user_id: user.id,
          cliente_id: formData.cliente_id || null,
          cliente_nome: formData.cliente_nome,
          cliente_email: formData.cliente_email,
          cliente_telefone: formData.cliente_telefone,
          valor_total: Number(formData.valor_total),
          itens_quantidade: Number(formData.itens_quantidade),
          sku: formData.sku,
          codigo_pedido,
          status: "PENDENTE",
        },
      ]);

      if (error) throw error;

      setIsOpen(false);
      setFormData({
        cliente_id: "",
        cliente_nome: "",
        cliente_email: "",
        cliente_telefone: "",
        valor_total: "0",
        itens_quantidade: "1",
        produto_id: "",
        preco_unitario: 0,
        sku: "",
      });
      setSearchTerm("");
      setClientSearchTerm("");
      router.refresh();
    } catch (error: any) {
      console.error("Erro completo ao criar pedido:", error);
      alert(`Erro ao criar pedido: ${error.message || "Verifique os campos."}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#0F1115] px-6 py-3 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105"
      >
        <Plus size={18} className="transition-transform group-hover:rotate-90" />
        <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Novo Pedido</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !loading && setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[#16181D] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">
                    Novo <span className="text-emerald-500">Pedido</span>
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                    Preencha os dados da venda abaixo
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seleção de Cliente */}
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Cliente
                  </label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                      required
                      placeholder={fetchingClients ? "Carregando clientes..." : "Buscar cliente..."}
                      value={clientSearchTerm}
                      onChange={(e) => {
                        setClientSearchTerm(e.target.value);
                        setFormData({ ...formData, cliente_nome: e.target.value, cliente_id: "" });
                        setIsClientDropdownOpen(true);
                      }}
                      onFocus={() => setIsClientDropdownOpen(true)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                    />

                    {/* Lista Dropdown Clientes */}
                    <AnimatePresence>
                      {isClientDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-[170] w-full mt-2 bg-[#1c1f26] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
                        >
                          {fetchingClients ? (
                            <div className="p-6 text-center text-slate-500 text-xs italic flex items-center justify-center gap-2">
                              <Loader2 size={14} className="animate-spin" />
                              Buscando clientes...
                            </div>
                          ) : filteredClients.length > 0 ? (
                            <>
                              {filteredClients.map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => handleClientSelect(c)}
                                  className="w-full text-left p-4 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors border-b border-white/5 last:border-none flex justify-between items-center group/item"
                                >
                                  <div>
                                    <p className="text-sm font-bold">{c.nome}</p>
                                    <p className="text-[10px] uppercase text-slate-500 font-black group-hover/item:text-emerald-500/70">{c.telefone || "Sem telefone"}</p>
                                  </div>
                                  <div className="text-[9px] font-black text-slate-700 uppercase group-hover/item:text-emerald-500/40 tracking-tighter">Existente</div>
                                </button>
                              ))}
                              {clientSearchTerm && !filteredClients.find(c => c.nome.toLowerCase() === clientSearchTerm.toLowerCase()) && (
                                <div className="p-4 bg-emerald-500/5 border-t border-white/5">
                                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">
                                    Nenhum cliente exato para "<span className="text-emerald-500">{clientSearchTerm}</span>". 
                                    O pedido será salvo com este nome.
                                  </p>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="p-6 text-center">
                              <User className="mx-auto text-slate-700/50 mb-3" size={32} />
                              <p className="text-sm text-slate-400 font-medium">Nenhum cliente encontrado</p>
                              {clientSearchTerm && (
                                <p className="text-[10px] text-emerald-500/70 font-black uppercase tracking-widest mt-2 px-2">
                                  Criar pedido para novo cliente: "{clientSearchTerm}"
                                </p>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Clique fora para fechar */}
                  {isClientDropdownOpen && (
                    <div 
                      className="fixed inset-0 z-[165]" 
                      onClick={() => setIsClientDropdownOpen(false)}
                    />
                  )}
                </div>

                {/* Seleção de Produto (Searchable Combobox) */}
                <div className="space-y-2 relative">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Selecionar Produto (Catálogo)
                    </label>
                  </div>
                  <div className="relative group">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder={fetchingProducts ? "Carregando catálogo..." : "Escolha o produto..."}
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      className="w-full bg-[#16181D] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium italic"
                    />

                    {/* Lista Dropdown */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-[160] w-full mt-2 bg-[#1c1f26] border border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
                        >
                          {fetchingProducts ? (
                            <div className="p-4 text-center text-slate-500 text-xs italic">Buscando produtos...</div>
                          ) : filteredProducts.length > 0 ? (
                            filteredProducts.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleProductSelect(p)}
                                className="w-full text-left p-4 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors border-b border-white/5 last:border-none flex justify-between items-center"
                              >
                                <div>
                                  <p className="text-sm font-bold">{p.name}</p>
                                  <p className="text-[10px] uppercase text-slate-500 font-black">SKU: {p.sku}</p>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-center text-slate-500 text-xs italic font-medium flex flex-col items-center gap-2">
                              <AlertCircle size={16} className="text-amber-500" />
                              Nenhum produto encontrado
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Clique fora para fechar */}
                  {isDropdownOpen && (
                    <div 
                      className="fixed inset-0 z-[155]" 
                      onClick={() => setIsDropdownOpen(false)}
                    />
                  )}

                  {selectedProduct && (
                    <div className="flex items-center gap-2 ml-1 mt-1">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        SKU Vinculado: <span className="text-emerald-500/80">{selectedProduct.sku}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Preço Unitário (Negociável) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Preço Unitário (R$)
                    </label>
                    <div className="relative group">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <input
                        required
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        onChange={(e) => handlePriceChange(e.target.value)}
                        className="w-full bg-white/5 border border-emerald-500/20 group-focus-within:border-emerald-500/50 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  {/* Quantidade */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Quantidade
                    </label>
                    <div className="relative group">
                      <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <input
                        required
                        type="number"
                        min="1"
                        value={formData.itens_quantidade}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        placeholder="1"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <input
                        required
                        type="email"
                        value={formData.cliente_email}
                        onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
                        placeholder="email@exemplo.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Telefone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Telefone / Whats
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                      <input
                        required
                        value={formData.cliente_telefone}
                        onChange={(e) => setFormData({ ...formData, cliente_telefone: e.target.value })}
                        placeholder="(11) 99999-9999"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Valor Total do Pedido
                </label>
                <div className="relative group">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input
                    required
                    readOnly
                    type="text"
                    value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(formData.valor_total))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-emerald-500 text-xl focus:outline-none transition-all font-black italic"
                  />
                </div>
              </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#0F1115] font-black uppercase tracking-[0.2em] italic py-5 rounded-[1.8rem] transition-all duration-300 shadow-[0_10px_30px_rgba(16,185,129,0.2)] mt-4 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Confirmar Pedido"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
