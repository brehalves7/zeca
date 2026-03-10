'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Building2, Phone, Loader2, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [companyName, setCompanyName] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      company_name: companyName,
      whatsapp_business_number: whatsappNumber,
      plan_status: 'trial',
    })

    if (error) {
      setError('Erro ao salvar dados. Tente novamente.')
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: '100%', maxWidth: '440px' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 32px rgba(34,197,94,0.3)',
            margin: '0 auto 16px',
          }}
        >
          <Zap size={26} color="#020617" fill="#020617" />
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#ffffff', marginBottom: '8px' }}>
          Configure sua distribuidora
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Preencha os dados para começar a usar o Zeca.ai
        </p>
      </div>

      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '28px',
          padding: '36px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>
              Nome da Distribuidora
            </label>
            <div style={{ position: 'relative' }}>
              <Building2 size={16} color="#475569" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="company-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ex: Distribuidora Silva & Cia"
                required
                className="input-field"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#94a3b8', marginBottom: '6px' }}>
              Número do WhatsApp Business
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="#475569" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="whatsapp-number"
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+55 11 99999-9999"
                required
                className="input-field"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          {error && (
            <p style={{
              color: '#f87171',
              fontSize: '13px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px',
              padding: '10px 14px',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            id="onboarding-submit-btn"
            style={{ height: '48px', fontSize: '15px' }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Começar a usar o Zeca.ai →'}
          </button>
        </form>
      </div>
    </motion.div>
  )
}
