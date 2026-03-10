'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, X, Check, Edit2, Loader2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Order, OrderItem, OrderStatus } from '@/lib/types'

const statusConfig = {
  pendente: { label: 'Pendente', cls: 'badge badge-yellow' },
  confirmado: { label: 'Confirmado', cls: 'badge badge-green' },
  cancelado: { label: 'Cancelado', cls: 'badge badge-red' },
}

function OrderEditModal({
  order,
  onClose,
  onSave,
}: {
  order: Order
  onClose: () => void
  onSave: (updated: Order) => void
}) {
  const [items, setItems] = useState<OrderItem[]>(order.items)
  const [clientName, setClientName] = useState(order.client_name)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const total = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)

  function updateItem(idx: number, field: keyof OrderItem, value: string | number) {
    setItems((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  async function save() {
    setSaving(true)
    const { error } = await supabase
      .from('orders')
      .update({ client_name: clientName, items, total_value: total, status: 'confirmado' })
      .eq('id', order.id)
    setSaving(false)
    if (!error) onSave({ ...order, client_name: clientName, items, total_value: total, status: 'confirmado' })
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
          borderRadius: '24px', padding: '28px', width: '100%', maxWidth: '560px',
          maxHeight: '80vh', overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>
            Editar Pedido #{order.id}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Client name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>
            Cliente
          </label>
          <input
            className="input-field"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            id="edit-client-name"
          />
        </div>

        {/* Items */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '10px' }}>
            Itens do pedido
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px', padding: '12px',
                }}
              >
                <div 
                  style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}
                  className="order-item-form"
                >
                  <style jsx>{`
                    @media (max-width: 480px) {
                      .order-item-form { flex-direction: column; align-items: stretch !important; }
                      .order-item-form input { width: 100% !important; }
                    }
                  `}</style>
                  <input
                    className="input-field"
                    value={item.product_name}
                    onChange={(e) => updateItem(idx, 'product_name', e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '13px', minWidth: '150px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                    <input
                      className="input-field"
                      type="number"
                      value={item.quantity}
                      min={1}
                      onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                      style={{ width: '70px', padding: '8px', fontSize: '13px', textAlign: 'center' }}
                    />
                    <input
                      className="input-field"
                      type="number"
                      value={item.unit_price}
                      min={0}
                      step={0.01}
                      onChange={(e) => updateItem(idx, 'unit_price', Number(e.target.value))}
                      style={{ flex: 1, padding: '8px', fontSize: '13px' }}
                    />
                    <button
                      onClick={() => removeItem(idx)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: '4px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 16px', background: 'rgba(34,197,94,0.05)',
          border: '1px solid rgba(34,197,94,0.15)', borderRadius: '12px', marginBottom: '20px',
        }}>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Total</span>
          <span style={{ fontSize: '18px', fontWeight: '800', color: '#22c55e' }}>
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1, padding: '12px' }}>
            Cancelar
          </button>
          <button
            className="btn-primary"
            onClick={save}
            disabled={saving}
            id="save-order-btn"
            style={{ flex: 1, padding: '12px' }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Confirmar</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'todos'>('todos')
  const supabase = createClient()

  const fetchOrders = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setOrders((data as Order[]) ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchOrders()

    // Realtime subscription
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchOrders, supabase])

  async function updateStatus(id: number, status: OrderStatus) {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o))
  }

  const filtered = filterStatus === 'todos' ? orders : orders.filter((o) => o.status === filterStatus)

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>Pedidos</h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>Gerencie e confirme pedidos recebidos via WhatsApp</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {(['todos', 'pendente', 'confirmado', 'cancelado'] as const).map((s) => (
          <button
            key={s}
            id={`filter-${s}`}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: '7px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: '600', fontFamily: 'Inter, sans-serif',
              background: filterStatus === s ? '#22c55e' : 'rgba(30,41,59,0.8)',
              color: filterStatus === s ? '#020617' : '#64748b',
              transition: 'all 0.2s ease',
            }}
          >
            {s === 'todos' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={32} className="animate-spin" color="#22c55e" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: '#475569' }}>
          <ShoppingCart size={40} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
          <p style={{ fontSize: '16px', fontWeight: '600' }}>Nenhum pedido encontrado</p>
          <p style={{ fontSize: '14px', marginTop: '4px', opacity: 0.7 }}>
            Pedidos recebidos via WhatsApp aparecerão aqui em tempo real
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <AnimatePresence initial={false}>
            {filtered.map((order) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="glass-card-sm"
                style={{ padding: '16px 20px', cursor: 'default' }}
              >                <div 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}
                  className="order-card-header"
                >
                  <style jsx>{`
                    @media (max-width: 640px) {
                      .order-card-header { align-items: flex-start !important; }
                      .order-card-actions { width: 100%; justify-content: space-between; margin-top: 12px; }
                      .order-total-price { order: -1; text-align: left !important; min-width: 0 !important; font-size: 14px !important; }
                    }
                  `}</style>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '150px' }}>
                    <div
                      style={{
                        width: '40px', height: '40px', background: 'rgba(34,197,94,0.1)',
                        border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      <ShoppingCart size={16} color="#22c55e" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {order.client_name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#475569' }}>
                        #{order.id} · {new Date(order.created_at!).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="order-card-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span className={statusConfig[order.status].cls}>
                      {statusConfig[order.status].label}
                    </span>
                    <p className="order-total-price" style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', minWidth: '100px', textAlign: 'right' }}>
                      R$ {Number(order.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      {order.status === 'pendente' && (
                        <button
                          onClick={() => setEditingOrder(order)}
                          id={`edit-order-${order.id}`}
                          title="Editar e confirmar"
                          style={{
                            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                            borderRadius: '8px', cursor: 'pointer', padding: '6px', color: '#22c55e',
                            display: 'flex', alignItems: 'center',
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {order.status === 'pendente' && (
                        <button
                          onClick={() => updateStatus(order.id, 'cancelado')}
                          title="Cancelar"
                          style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: '8px', cursor: 'pointer', padding: '6px', color: '#f87171',
                            display: 'flex', alignItems: 'center',
                          }}
                        >
                          <X size={14} />
                        </button>
                      )}

                      <button
                        onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}
                      >
                        {expandedId === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable items */}
                <AnimatePresence>
                  {expandedId === order.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '14px', paddingTop: '14px' }}>
                        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Itens
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {order.items.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                              <span>{item.product_name} × {item.quantity}</span>
                              <span>R$ {(item.quantity * item.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingOrder && (
          <OrderEditModal
            order={editingOrder}
            onClose={() => setEditingOrder(null)}
            onSave={(updated) => {
              setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o))
              setEditingOrder(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
