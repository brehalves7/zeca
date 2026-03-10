'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type AuthMode = 'login' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createClient()

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('E-mail ou senha inválidos. Tente novamente.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
      }
    }
    setLoading(false)
  }

  async function handleGoogleAuth() {
    setGoogleLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError('Erro ao entrar com Google. Tente novamente.')
      setGoogleLoading(false)
    }
  }

  function switchMode(newMode: AuthMode) {
    setMode(newMode)
    setError(null)
    setSuccess(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: '100%',
        maxWidth: '440px',
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(34,197,94,0.35)',
            }}
          >
            <Zap size={22} color="#020617" fill="#020617" />
          </div>
          <span
            style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#ffffff',
              letterSpacing: '-0.5px',
            }}
          >
            Zeca
            <span
              style={{
                background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              .ai
            </span>
          </span>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          Gestão inteligente para distribuidoras
        </p>
      </div>

      {/* Card */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '28px',
          padding: '36px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(15,23,42,0.8)',
            borderRadius: '14px',
            padding: '4px',
            marginBottom: '28px',
          }}
        >
          {(['login', 'signup'] as AuthMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                background: mode === m ? '#22c55e' : 'transparent',
                color: mode === m ? '#020617' : '#64748b',
              }}
            >
              {m === 'login' ? 'Entrar' : 'Criar Conta'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 16 : -16 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            onSubmit={handleEmailAuth}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '4px',
              }}
            >
              {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
            </h2>

            {/* Email field */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#94a3b8',
                  marginBottom: '6px',
                }}
              >
                E-mail
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  color="#475569"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#94a3b8',
                  marginBottom: '6px',
                }}
              >
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  color="#475569"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="input-field"
                  style={{ paddingLeft: '40px', paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#475569',
                    padding: 0,
                    display: 'flex',
                  }}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error / Success messages */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    color: '#f87171',
                    fontSize: '13px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                  }}
                >
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    color: '#4ade80',
                    fontSize: '13px',
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                  }}
                >
                  {success}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ marginTop: '4px', height: '48px', fontSize: '15px' }}
              id="auth-submit-btn"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : mode === 'login' ? (
                'Entrar'
              ) : (
                'Criar Conta'
              )}
            </button>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#475569',
                fontSize: '13px',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: '#1e293b' }} />
              ou
              <div style={{ flex: 1, height: '1px', background: '#1e293b' }} />
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={googleLoading}
              className="btn-ghost"
              id="google-auth-btn"
              style={{ height: '48px' }}
            >
              {googleLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuar com Google
                </>
              )}
            </button>
          </motion.form>
        </AnimatePresence>
      </div>

      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#475569' }}>
        Ao continuar, você concorda com os{' '}
        <a href="#" style={{ color: '#22c55e', textDecoration: 'none' }}>
          Termos de Uso
        </a>{' '}
        e{' '}
        <a href="#" style={{ color: '#22c55e', textDecoration: 'none' }}>
          Política de Privacidade
        </a>
      </p>
    </motion.div>
  )
}
