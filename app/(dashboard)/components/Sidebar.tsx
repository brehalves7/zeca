'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Settings,
  LogOut,
  Zap,
  MessageSquare,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard/home', label: 'Visão Geral', icon: LayoutDashboard },
  { href: '/dashboard/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/dashboard/produtos', label: 'Produtos', icon: Package },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
]

interface SidebarProps {
  isMobile?: boolean
  onClose?: () => void
}

export default function Sidebar({ isMobile, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '20px 12px',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(34,197,94,0.3)',
              flexShrink: 0,
            }}
          >
            <Zap size={18} color="#020617" fill="#020617" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.3px' }}>
            Zeca<span style={{ color: '#22c55e' }}>.ai</span>
          </span>
        </div>
        {isMobile && (
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
              style={{ textDecoration: 'none', position: 'relative' }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(34,197,94,0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(34,197,94,0.2)',
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  color: isActive ? '#22c55e' : '#64748b',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '14px',
                  transition: 'color 0.2s ease',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <Icon size={18} />
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* WhatsApp status */}
      <div
        style={{
          padding: '12px 14px',
          background: 'rgba(34,197,94,0.05)',
          border: '1px solid rgba(34,197,94,0.15)',
          borderRadius: '12px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <MessageSquare size={16} color="#22c55e" />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#22c55e' }}>WhatsApp Bot</p>
          <p style={{ fontSize: '11px', color: '#64748b' }}>Online</p>
        </div>
        <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 6px #22c55e' }} />
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          borderRadius: '12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#64748b',
          fontSize: '14px',
          fontWeight: '500',
          width: '100%',
          textAlign: 'left',
        }}
      >
        <LogOut size={18} />
        Sair
      </button>
    </div>
  )

  if (isMobile) {
    return content
  }

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minHeight: '100vh',
        background: '#020617',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
      }}
      className="desktop-sidebar"
    >
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none !important;
          }
        }
      `}</style>
      {content}
    </aside>
  )
}
