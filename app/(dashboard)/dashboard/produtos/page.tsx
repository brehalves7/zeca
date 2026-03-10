'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Plus, Edit2, Trash2, Upload, X, Loader2, Search, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'

interface ProductFormData {
  name: string
  price: string
  sku: string
  category: string
}

function ProductModal({
  product,
  onClose,
  onSave,
}: {
  product: Product | null
  onClose: () => void
  onSave: (p: Product) => void
}) {
  const [form, setForm] = useState<ProductFormData>({
    name: product?.name ?? '',
    price: product?.price?.toString() ?? '',
    sku: product?.sku ?? '',
    category: product?.category ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      name: form.name,
      price: parseFloat(form.price),
      sku: form.sku || null,
      category: form.category || null,
    }

    let data: Product | null = null
    let err: any = null

    if (product) {
      const res = await supabase.from('products').update(payload).eq('id', product.id).select().single()
      data = res.data
      err = res.error
    } else {
      const res = await supabase.from('products').insert(payload).select().single()
      data = res.data
      err = res.error
    }

    if (err) {
      setError('Erro ao salvar produto. Tente novamente.')
    } else if (data) {
      onSave(data)
    }
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.8)',
        backdropFilter: 'blur(8px)', zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 24 }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
        style={{
          background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px', padding: '28px', width: '100%', maxWidth: '480px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>
            {product ? 'Editar Produto' : 'Novo Produto'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { label: 'Nome do produto', id: 'prod-name', field: 'name' as const, placeholder: 'Ex: Cerveja Heineken 600ml', required: true },
            { label: 'Preço (R$)', id: 'prod-price', field: 'price' as const, placeholder: '12.50', type: 'number', required: true },
            { label: 'SKU / Código', id: 'prod-sku', field: 'sku' as const, placeholder: 'HNK-600', required: false },
            { label: 'Categoria', id: 'prod-category', field: 'category' as const, placeholder: 'Cervejas', required: false },
          ].map((f) => (
            <div key={f.id}>
              <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>{f.label}</label>
              <input
                id={f.id}
                className="input-field"
                type={f.field === 'price' ? 'number' : 'text'}
                value={form[f.field]}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.field]: e.target.value }))}
                placeholder={f.placeholder}
                required={f.required}
                step={f.field === 'price' ? '0.01' : undefined}
                min={f.field === 'price' ? '0' : undefined}
              />
            </div>
          ))}

          {error && (
            <p style={{ color: '#f87171', fontSize: '13px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={saving} id="save-product-btn" style={{ flex: 1 }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Salvar</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalProduct, setModalProduct] = useState<Product | null | 'new'>('new' as any)
  const [showModal, setShowModal] = useState(false)
  const [csvLoading, setCsvLoading] = useState(false)
  const [csvSuccess, setCsvSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('products').select('*').eq('user_id', user.id).order('name')
      setProducts((data as Product[]) ?? [])
      setLoading(false)
    }
    load()
  }, [supabase])

  async function handleDelete(id: number) {
    if (!confirm('Remover este produto?')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  async function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvLoading(true)
    setCsvSuccess(false)

    const Papa = (await import('papaparse')).default
    const { data: { user } } = await supabase.auth.getUser()

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = (results.data as any[]).map((row) => ({
          user_id: user!.id,
          name: row.name || row.nome || '',
          price: parseFloat(row.price || row.preco || row.preço || '0'),
          sku: row.sku || row.codigo || null,
          category: row.category || row.categoria || null,
        })).filter((r) => r.name)

        if (rows.length) {
          const { data } = await supabase.from('products').insert(rows).select()
          if (data) setProducts((prev) => [...prev, ...(data as Product[])])
        }
        setCsvLoading(false)
        setCsvSuccess(true)
        setTimeout(() => setCsvSuccess(false), 3000)
        if (fileRef.current) fileRef.current.value = ''
      },
    })
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.sku ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>Produtos</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Gerencie o catálogo de produtos da sua distribuidora</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-ghost"
            onClick={() => fileRef.current?.click()}
            disabled={csvLoading}
            id="import-csv-btn"
            style={{ gap: '6px', fontSize: '13px', padding: '10px 16px' }}
          >
            {csvLoading ? <Loader2 size={14} className="animate-spin" /> : csvSuccess ? <Check size={14} color="#22c55e" /> : <Upload size={14} />}
            {csvSuccess ? 'Importado!' : 'Importar CSV'}
          </button>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCSV} id="csv-file-input" />
          <button
            className="btn-primary"
            onClick={() => { setModalProduct(null); setShowModal(true) }}
            id="add-product-btn"
            style={{ gap: '6px', fontSize: '13px', padding: '10px 16px' }}
          >
            <Plus size={14} /> Novo Produto
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
        <Search size={16} color="#475569" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          id="product-search"
          className="input-field"
          style={{ paddingLeft: '40px' }}
          placeholder="Buscar produto, categoria, SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <span className="badge badge-green"><Package size={12} /> {products.length} produtos</span>
        {search && <span className="badge badge-slate">{filtered.length} resultados</span>}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={32} className="animate-spin" color="#22c55e" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: '#475569' }}>
          <Package size={40} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <p style={{ fontSize: '16px', fontWeight: '600' }}>Nenhum produto encontrado</p>
          <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '4px' }}>
            {search ? 'Tente outro termo de busca' : 'Adicione produtos ou importe um CSV'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          <AnimatePresence>
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card-sm"
                style={{ padding: '18px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div
                    style={{
                      width: '40px', height: '40px', background: 'rgba(129,140,248,0.1)',
                      border: '1px solid rgba(129,140,248,0.2)', borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Package size={16} color="#818cf8" />
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => { setModalProduct(product); setShowModal(true) }}
                      id={`edit-product-${product.id}`}
                      style={{
                        background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '8px', cursor: 'pointer', padding: '5px', color: '#94a3b8', display: 'flex',
                      }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      id={`delete-product-${product.id}`}
                      style={{
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                        borderRadius: '8px', cursor: 'pointer', padding: '5px', color: '#f87171', display: 'flex',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '15px', fontWeight: '700', color: '#e2e8f0', marginBottom: '4px' }}>{product.name}</p>
                {product.sku && <p style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>SKU: {product.sku}</p>}
                {product.category && (
                  <span className="badge badge-slate" style={{ marginBottom: '10px' }}>{product.category}</span>
                )}
                <p style={{ fontSize: '20px', fontWeight: '800', color: '#22c55e' }}>
                  R$ {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <ProductModal
            product={modalProduct as Product | null}
            onClose={() => setShowModal(false)}
            onSave={(saved) => {
              setProducts((prev) => {
                const idx = prev.findIndex((p) => p.id === saved.id)
                if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n }
                return [saved, ...prev]
              })
              setShowModal(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
