'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Phone, Save, Loader2, Check, Shield, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

const planLabels: Record<string, { label: string; color: string; bg: string }> = {
  trial: { label: 'Trial', color: '#fbbf24', bg: 'rgba(234,179,8,0.1)' },
  starter: { label: 'Starter', color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
  pro: { label: 'Pro', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
}

export default function ConfiguracoesPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setCompanyName(data.company_name ?? '')
        setWhatsapp(data.whatsapp_business_number ?? '')
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({
      id: user.id,
      company_name: companyName,
      whatsapp_business_number: whatsapp,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const plan = profile?.plan_status ?? 'trial'
  const planInfo = planLabels[plan] ?? planLabels.trial

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Loader2 size={32} className="animate-spin" color="#22c55e" />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff', marginBottom: '4px' }}>
          Configurações
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>Gerencie os dados da sua distribuidora e plano</p>
      </div>

      {/* Company Info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ padding: '28px', marginBottom: '20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{
            width: '36px', height: '36px', background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={16} color="#22c55e" />
          </div>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>Dados da Distribuidora</h2>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Nome da Distribuidora
            </label>
            <div style={{ position: 'relative' }}>
              <Building2 size={16} color="#475569" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="settings-company-name"
                className="input-field"
                style={{ paddingLeft: '40px' }}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nome da empresa"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Número do WhatsApp Business
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="#475569" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="settings-whatsapp"
                className="input-field"
                style={{ paddingLeft: '40px' }}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+55 11 99999-9999"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
            id="save-settings-btn"
            style={{ alignSelf: 'flex-start', padding: '10px 24px' }}
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : saved ? (
              <><Check size={16} /> Salvo!</>
            ) : (
              <><Save size={16} /> Salvar Alterações</>
            )}
          </button>
        </form>
      </motion.div>

      {/* Plan Info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
        style={{ padding: '28px', marginBottom: '20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{
            width: '36px', height: '36px', background: 'rgba(129,140,248,0.1)',
            border: '1px solid rgba(129,140,248,0.2)', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CreditCard size={16} color="#818cf8" />
          </div>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>Plano Atual</h2>
        </div>

        <div 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}
          className="plan-container"
        >
          <div>
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '999px',
                background: planInfo.bg, border: `1px solid ${planInfo.color}30`,
                marginBottom: '8px',
              }}
            >
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: planInfo.color }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: planInfo.color }}>{planInfo.label}</span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              {plan === 'trial' ? 'Você está no período de avaliação gratuita' : `Plano ${planInfo.label} ativo`}
            </p>
          </div>
          <button
            className="btn-primary"
            id="upgrade-plan-btn"
            style={{ padding: '10px 20px', fontSize: '13px' }}
          >
            Fazer Upgrade
          </button>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
        style={{ padding: '28px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            width: '36px', height: '36px', background: 'rgba(56,189,248,0.1)',
            border: '1px solid rgba(56,189,248,0.2)', borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={16} color="#38bdf8" />
          </div>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>Segurança</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Autenticação de dois fatores', status: 'Desativado', id: '2fa-btn' },
            { label: 'Sessões ativas', status: '1 sessão', id: 'sessions-btn' },
          ].map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', background: 'rgba(15,23,42,0.5)',
                border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px',
                gap: '12px', flexWrap: 'wrap'
              }}
            >
              <p style={{ fontSize: '14px', color: '#cbd5e1' }}>{item.label}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>{item.status}</span>
                <button
                  id={item.id}
                  className="btn-ghost"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  Gerenciar
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
