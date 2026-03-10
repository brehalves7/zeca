'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from './components/Sidebar'
import { Menu, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [profileComplete, setProfileComplete] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_name, whatsapp_business_number')
        .eq('id', user.id)
        .single()

      if (!profile?.company_name || !profile?.whatsapp_business_number) {
        router.push('/onboarding')
        return
      }

      setProfileComplete(true)
      setLoading(false)
    }
    checkAuth()
  }, [supabase, router])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(34,197,94,0.1)', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style jsx>{` @keyframes spin { to { transform: rotate(360deg); } } `}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#ffffff' }}>
      <Sidebar />

      {/* Mobile Header */}
      <header
        style={{
          height: 'var(--mobile-header-height)',
          background: '#020617',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
        }}
        className="mobile-header"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={14} color="#020617" fill="#020617" />
          </div>
          <span style={{ fontSize: '16px', fontWeight: '800' }}>Zeca<span style={{ color: '#22c55e' }}>.ai</span></span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(4px)', zIndex: 100 }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ position: 'fixed', top: 0, left: 0, width: '280px', height: '100vh', background: '#020617', zIndex: 110, boxShadow: '10px 0 30px rgba(0,0,0,0.5)' }}
            >
              <Sidebar isMobile onClose={() => setIsSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          padding: '32px',
          paddingTop: 'calc(var(--mobile-header-height) + 32px)',
          minHeight: '100vh',
        }}
        className="dashboard-main"
      >
        <style jsx>{`
          .dashboard-main {
            padding-top: 32px;
          }
          @media (max-width: 768px) {
            .mobile-header {
              display: flex !important;
            }
            .dashboard-main {
              margin-left: 0 !important;
              padding: 20px;
              padding-top: calc(var(--mobile-header-height) + 20px) !important;
            }
          }
        `}</style>
        {children}
      </main>
    </div>
  )
}
