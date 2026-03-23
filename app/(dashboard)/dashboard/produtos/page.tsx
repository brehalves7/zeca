"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Plus,
  Trash2,
  Upload,
  X,
  Loader2,
  Search,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  Pencil,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";
import {
  extrairProdutosDaImagem,
  extrairProdutosDoPDFv2,
} from "@/app/actions/catalog-actions";
import { PDFDocument } from "pdf-lib";

// Função auxiliar para evitar erro 429 (Too Many Requests)
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

// --- COMPONENTE DE EDIÇÃO ÚNICA ---
function EditProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Product;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [edited, setEdited] = useState<Product>(product);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(edited);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#0f172a] border border-white/10 rounded-[2rem] p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Pencil className="text-emerald-500" size={24} /> Editar Produto
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold text-slate-500 ml-1">
              Nome do Produto
            </label>
            <input
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none"
              value={edited.name}
              onChange={(e) => setEdited({ ...edited, name: e.target.value })}
            />
          </div>

          <div className="flex gap-4">
            <div className="space-y-1 flex-1">
              <label className="text-xs uppercase font-bold text-slate-500 ml-1">
                SKU
              </label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none"
                value={edited.sku || ""}
                onChange={(e) => setEdited({ ...edited, sku: e.target.value })}
              />
            </div>
            <div className="space-y-1 flex-1">
              <label className="text-xs uppercase font-bold text-slate-500 ml-1">
                Preço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none"
                value={edited.price}
                onChange={(e) =>
                  setEdited({
                    ...edited,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              Salvar
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// --- COMPONENTE DO MODAL DE REVISÃO DA IA ---
function ReviewAIModal({
  products,
  onClose,
  onConfirm,
}: {
  products: any[];
  onClose: () => void;
  onConfirm: (finalProducts: any[]) => void;
}) {
  const [list, setList] = useState(products);

  const updateItem = (index: number, field: string, value: string) => {
    const newList = [...list];
    newList[index] = { ...newList[index], [field]: value };
    setList(newList);
  };

  const removeItem = (index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#0f172a] border border-white/10 rounded-[2rem] p-6 w-full max-w-4xl max-h-[80vh] flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <AlertCircle className="text-emerald-500" /> Revisar Dados do Zeca
            </h3>
            <p className="text-slate-400 text-sm">
              Confirme os códigos e nomes antes de salvar no banco.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {list.map((item, idx) => (
            <div
              key={idx}
              className="bg-white/5 p-4 rounded-2xl border border-white/5 flex gap-4 items-end"
            >
              <div className="flex-1 space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">
                  Produto
                </label>
                <input
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  value={item.name}
                  onChange={(e) => updateItem(idx, "name", e.target.value)}
                />
              </div>
              <div className="w-32 space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">
                  Código (SKU)
                </label>
                <input
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  value={item.sku || ""}
                  onChange={(e) => updateItem(idx, "sku", e.target.value)}
                />
              </div>
              <button
                onClick={() => removeItem(idx)}
                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 px-4 py-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
          <p className="text-emerald-400 text-sm font-bold">
            📊 {list.length} produtos encontrados pela IA
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-bold hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(list)}
            className="flex-1 py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
          >
            Salvar {list.length} Produtos no Banco
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- PÁGINA PRINCIPAL ---
export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // ESTADOS DA IA
  const [extractionLoading, setExtractionLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, type: "" });
  const [aiReviewList, setAiReviewList] = useState<any[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pdfRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)
        .order("name");
      setProducts((data as Product[]) ?? []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  // --- HANDLER: IMAGENS ---
  const handleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setExtractionLoading(true);
    setAiReviewList(null);
    setErrorMessage(null);

    try {
      const fileArray = Array.from(files);
      setProgress({ current: 0, total: fileArray.length, type: "imagem" });

      let todosProdutos: any[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        setProgress((prev) => ({ ...prev, current: i + 1 }));

        const file = fileArray[i];
        const mimeType = file.type; // image/jpeg, image/png, image/webp

        // Converte arquivo para base64 de forma robusta usando FileReader
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const result = await extrairProdutosDaImagem(base64, mimeType);

        if (result && !("error" in result) && Array.isArray(result)) {
          todosProdutos = [...todosProdutos, ...result];
        } else if (result && "error" in result) {
          throw new Error(
            (result as any).message || "Erro na extração da imagem.",
          );
        }

        // Espera de segurança entre imagens (4s para evitar rate limit)
        if (i < fileArray.length - 1) {
          await wait(4000);
        }
      }

      if (todosProdutos.length > 0) {
        setAiReviewList(todosProdutos);
      } else {
        setErrorMessage(
          "Nenhum produto encontrado nas imagens. Verifique se as imagens contêm catálogos legíveis.",
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message ||
          "O Zeca teve um problema ao ler as imagens. Tente novamente em instantes.",
      );
      // Se for o erro genérico de produção do Next.js, logar o erro real se possível
      if (err.message?.includes("Server Components render")) {
        console.error("DEBUG: Erro de transporte do Server Action detectado.");
      }
    } finally {
      setExtractionLoading(false);
      setProgress({ current: 0, total: 0, type: "" });
      if (imageRef.current) imageRef.current.value = "";
    }
  };

  // --- HANDLER: PDF ---
  const handlePDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExtractionLoading(true);
    setAiReviewList(null);
    setErrorMessage(null);

    try {
      // Importa e configura o pdfjs-dist dinamicamente no client-side
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      // Lê o PDF
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const pageCount = pdf.numPages;

      setProgress({ current: 0, total: pageCount, type: "pdf" });
      let todosProdutos: any[] = [];

      for (let i = 1; i <= pageCount; i++) {
        setProgress((prev) => ({ ...prev, current: i }));

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Escala maior para melhor precisão do OCR/IA

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) throw new Error("Erro ao criar canvas");

        // Renderiza a página no canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
        } as any).promise;

        // Pega PNG base64 "puro"
        const base64Url = canvas.toDataURL("image/png");
        const base64Data = base64Url.replace(/^data:image\/png;base64,/, "");

        const result = await extrairProdutosDoPDFv2(base64Data);

        if (result && !("error" in result) && Array.isArray(result)) {
          todosProdutos = [...todosProdutos, ...result];
        } else if (result && "error" in result) {
          throw new Error(
            (result as any).message || "Erro na extração do PDF.",
          );
        }

        // Espera de segurança entre páginas (4s para evitar rate limit)
        if (i < pageCount) {
          await wait(4000);
        }
      }

      if (todosProdutos.length > 0) {
        setAiReviewList(todosProdutos);
      } else {
        setErrorMessage(
          "Nenhum dado legível encontrado neste PDF. Verifique se o arquivo é um catálogo de produtos.",
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message ||
          "O Zeca teve um problema ao ler o arquivo. Tente novamente em instantes.",
      );
    } finally {
      setExtractionLoading(false);
      setProgress({ current: 0, total: 0, type: "" });
      if (pdfRef.current) pdfRef.current.value = "";
    }
  };

  const confirmAIProducts = async (finalList: any[]) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const rows = finalList.map((p) => ({
      user_id: user.id,
      name: p.name,
      price: p.price || 0,
      sku: String(p.sku),
    }));

    const { data, error } = await supabase
      .from("products")
      .insert(rows)
      .select();

    if (!error && data) {
      setProducts((prev) => [...(data as Product[]), ...prev]);
      setAiReviewList(null);
    } else {
      console.error("Erro Supabase:", error);
      alert("Erro ao salvar produtos. Verifique se os códigos já existem.");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    // Optimistic UI update can also be done, but let's wait for the db
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.error("Erro ao deletar produto:", error);
      alert(
        "Não foi possível excluir o produto. Ele pode estar atrelado a algum pedido.",
      );
    } else {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleSaveEdit = async (updatedProduct: Product) => {
    // Atualiza preço, sku e nome
    const { error } = await supabase
      .from("products")
      .update({
        name: updatedProduct.name,
        sku: updatedProduct.sku,
        price: updatedProduct.price,
      })
      .eq("id", updatedProduct.id);

    if (error) {
      console.error("Erro ao editar produto:", error);
      alert("Não foi possível salvar as alterações.");
    } else {
      setProducts(
        products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)),
      );
      setEditingProduct(null);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  // Texto de progresso dinâmico
  const progressLabel =
    progress.type === "imagem"
      ? `Analisando imagem ${progress.current}/${progress.total}`
      : `Lendo pág. ${progress.current}/${progress.total}`;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Catálogo
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            Extração inteligente de produtos via PDF ou Imagem
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Botão: Importar Imagem */}
          <button
            onClick={() => imageRef.current?.click()}
            disabled={extractionLoading}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all border ${
              extractionLoading
                ? "bg-blue-500/10 border-blue-500/20 text-blue-400 cursor-wait"
                : "bg-white/5 border-white/10 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30"
            }`}
          >
            {extractionLoading && progress.type === "imagem" ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>{progressLabel}</span>
              </>
            ) : (
              <>
                <ImageIcon size={18} />
                <span>Importar Imagem</span>
              </>
            )}
          </button>
          <input
            ref={imageRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleImages}
          />

          {/* Botão: Importar PDF */}
          <button
            onClick={() => pdfRef.current?.click()}
            disabled={extractionLoading}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all border ${
              extractionLoading
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 cursor-wait"
                : "bg-white/5 border-white/10 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30"
            }`}
          >
            {extractionLoading && progress.type === "pdf" ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>{progressLabel}</span>
              </>
            ) : (
              <>
                <FileText size={18} />
                <span>Importar PDF</span>
              </>
            )}
          </button>
          <input
            ref={pdfRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handlePDF}
          />

          {/* Botão: Novo Produto Manual */}
          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-500 text-slate-950 px-6 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-emerald-400 transition-colors"
          >
            <Plus size={20} /> Novo
          </button>
        </div>
      </div>

      {/* Barra de progresso visual */}
      <AnimatePresence>
        {extractionLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="animate-spin text-emerald-400" size={20} />
              <span className="text-white font-bold text-sm">
                🧠 O Zeca está analisando o catálogo...
              </span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{
                  width:
                    progress.total > 0
                      ? `${(progress.current / progress.total) * 100}%`
                      : "0%",
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-slate-400 text-xs mt-2">
              {progress.type === "imagem"
                ? `Imagem ${progress.current} de ${progress.total}`
                : `Página ${progress.current} de ${progress.total}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner de erro */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
          >
            <AlertCircle
              className="text-red-400 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="flex-1">
              <p className="text-red-400 font-bold text-sm">Erro na extração</p>
              <p className="text-red-300/80 text-xs mt-1">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400/50 hover:text-red-400"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Busca */}
      <div className="relative mb-8 max-w-md">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          size={20}
        />
        <input
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white outline-none focus:border-emerald-500/50"
          placeholder="Filtrar por nome ou código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid de produtos */}
      {loading ? (
        <Loader2
          className="animate-spin text-emerald-500 mx-auto mt-20"
          size={40}
        />
      ) : filtered.length === 0 ? (
        <div className="text-center mt-20">
          <Package className="mx-auto text-slate-700 mb-4" size={48} />
          <p className="text-slate-500 font-bold text-lg">
            Nenhum produto cadastrado
          </p>
          <p className="text-slate-600 text-sm mt-1">
            Importe um catálogo em PDF ou imagem para começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 p-6 rounded-[2rem] hover:border-emerald-500/30 transition-colors group relative overflow-hidden"
            >
              {/* Botões de Ação Dinâmicos (Hover) */}
              <div className="absolute top-4 right-4 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                <button
                  onClick={() => setEditingProduct(product)}
                  className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-colors backdrop-blur-md border border-emerald-500/20"
                  title="Editar produto"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-colors backdrop-blur-md border border-red-500/20"
                  title="Excluir produto"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 w-fit mb-4 group-hover:bg-emerald-500/20 transition-colors">
                <Package size={20} />
              </div>
              <h3 className="font-bold text-white text-sm h-10 line-clamp-2 pr-12">
                {product.name}
              </h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase mb-4">
                SKU: {product.sku || "N/A"}
              </p>
              <p className="text-xl font-black text-emerald-500">
                {product.price > 0
                  ? `R$ ${product.price.toFixed(2).replace(".", ",")}`
                  : "R$ 0,00"}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de revisão da Extração */}
      <AnimatePresence>
        {aiReviewList && (
          <ReviewAIModal
            products={aiReviewList}
            onClose={() => setAiReviewList(null)}
            onConfirm={confirmAIProducts}
          />
        )}
      </AnimatePresence>

      {/* Modal de Edição Manual */}
      <AnimatePresence>
        {editingProduct && (
          <EditProductModal
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
            onSave={handleSaveEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
