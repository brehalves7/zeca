'use client';

import { motion } from 'framer-motion';
import { 
  Mic, MessageSquare, BarChart3, Check, ArrowRight, 
  Zap, Menu, X, Instagram, Twitter, ShieldCheck, 
  HelpCircle, ChevronDown 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ZecaLandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="main-wrapper">
      
      <style jsx global>{`
        .main-wrapper {
          min-height: 100vh;
          background: #ffffff;
          color: #0f172a;
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }

        .container {
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 24px;
          padding-right: 24px;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }

        @media (max-width: 1024px) {
          .hero-grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 48px;
          }
          .hero-content {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-title {
            font-size: 42px !important;
            line-height: 1.1;
          }
          .mobile-full-btn {
            width: 100% !important;
            justify-content: center;
          }
          .nav-links { display: none !important; }
        }

        @keyframes pulse-green {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        .whatsapp-float {
          animation: pulse-green 2s infinite;
        }
      `}</style>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: 'blur(10px)',
        borderBottom: scrolled ? '1px solid #f1f5f9' : 'none',
        transition: '0.3s'
      }}>
        <div className="container" style={{ height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={24} color="#22c55e" fill="#22c55e" />
            <span style={{ fontSize: '22px', fontWeight: '800' }}>Zeca<span style={{ color: '#22c55e' }}>.ai</span></span>
          </div>
          <div className="nav-links" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <a href="#funcionalidades" style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textDecoration: 'none' }}>Funcionalidades</a>
            <a href="#precos" style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', textDecoration: 'none' }}>Preços</a>
            <Link href="/login" style={{ background: '#22c55e', color: '#fff', padding: '10px 24px', borderRadius: '999px', fontWeight: '700', textDecoration: 'none' }}>Entrar</Link>
          </div>
          <button className="md:hidden" style={{ background: '#22c55e', border: 'none', padding: '8px 20px', borderRadius: '999px', color: '#fff', fontWeight: '700' }}>
            Entrar
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="container hero-grid">
          <motion.div className="hero-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '999px', padding: '6px 16px', marginBottom: '24px', width: 'fit-content' }}>
               <span style={{ fontSize: '11px', fontWeight: '800', color: '#16a34a', textTransform: 'uppercase' }}>
                 🟢 Inteligência Artificial para WhatsApp
               </span>
            </div>
            <h1 className="hero-title" style={{ fontSize: '64px', fontWeight: '900', lineHeight: '1.1', marginTop: '0px', marginBottom: '24px' }}>
              Você fala. O Zeca anota.<br />
              <span style={{ color: '#22c55e' }}>A venda acontece.</span>
            </h1>
            <p style={{ fontSize: '18px', color: '#64748b', maxWidth: '480px', marginTop: '0px', marginBottom: '40px', lineHeight: '1.6' }}>
              O assistente de IA que organiza seus pedidos automaticamente. Sem esforço, direto no Zap, para sua distribuidora não parar.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', width: '100%' }}>
              <Link href="/login" className="mobile-full-btn" style={{ background: '#22c55e', color: '#fff', padding: '18px 32px', borderRadius: '16px', fontWeight: '800', textDecoration: 'none' }}>
                Começar a Vender Agora
              </Link>
              <button className="mobile-full-btn" style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#0f172a', padding: '18px 32px', borderRadius: '16px', fontWeight: '700' }}>
                Ver Demonstração
              </button>
            </div>
          </motion.div>

          {/* Mockup CSS Corrigido */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '280px', height: '520px', background: '#0f172a', borderRadius: '40px', border: '8px solid #1e293b', overflow: 'hidden', position: 'relative', boxShadow: '0 40px 80px rgba(0,0,0,0.1)' }}>
              <div style={{ background: '#075e54', height: '65px', padding: '12px', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#22c55e' }} />
                <div style={{ textAlign: 'left' }}>
                    <p style={{ color: '#fff', fontSize: '11px', fontWeight: '700', marginTop: '0px', marginBottom: '0px' }}>Zeca.ai</p>
                    <p style={{ color: '#a7f3d0', fontSize: '9px', marginTop: '0px', marginBottom: '0px' }}>Online</p>
                </div>
              </div>
              <div style={{ background: '#e5ddd5', height: '100%', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#fff', padding: '10px', borderRadius: '12px', maxWidth: '85%', fontSize: '11px', textAlign: 'left' }}>"Zeca, anota 10 fardos de água para o Restaurante Central"</div>
                <div style={{ background: '#dcf8c6', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #22c55e', alignSelf: 'flex-end', maxWidth: '90%', textAlign: 'left' }}>
                  <p style={{ fontSize: '9px', fontWeight: '900', color: '#16a34a', marginTop: '0px', marginBottom: '6px' }}>PEDIDO ANOTADO! ✅</p>
                  <p style={{ fontSize: '12px', fontWeight: '700', marginTop: '0px', marginBottom: '0px' }}>Total: R$ 120,00</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Detalhes (Como Funciona) ── */}
      <section id="funcionalidades" style={{ paddingTop: '100px', paddingBottom: '100px', background: '#f8fafc' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '900', marginTop: '0px', marginBottom: '60px' }}>Vender nunca foi tão simples</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {[
              { icon: <Zap />, t: 'Conecte seu Zap', d: 'Escaneie o QR Code e o Zeca começa a trabalhar para você imediatamente.' },
              { icon: <Mic />, t: 'IA de Voz e Texto', d: 'Ele entende gírias, áudios e abreviações de produtos sem erros.' },
              { icon: <BarChart3 />, t: 'Dashboard Gestor', d: 'Acompanhe as vendas, clientes e estoque em um painel profissional.' }
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff', padding: '40px', borderRadius: '24px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
                <div style={{ color: '#22c55e', marginBottom: '20px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginTop: '0px', marginBottom: '12px' }}>{item.t}</h3>
                <p style={{ color: '#64748b', fontSize: '15px', marginTop: '0px', marginBottom: '0px' }}>{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ── */}
      <section style={{ paddingTop: '100px', paddingBottom: '100px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '60px', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '36px', fontWeight: '900', marginTop: '0px', marginBottom: '24px' }}>Quem usa, aprova.</h2>
              <p style={{ color: '#64748b', fontSize: '18px', marginTop: '0px', marginBottom: '0px' }}>Distribuidoras em todo o Brasil estão economizando horas de digitação manual.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '24px', borderRadius: '20px', background: '#f1f5f9' }}>
                <p style={{ fontStyle: 'italic', marginTop: '0px', marginBottom: '16px' }}>"O Zeca reduziu meus erros de pedido em 90%. É como ter um assistente 24h."</p>
                <p style={{ fontWeight: '800', fontSize: '14px', marginTop: '0px', marginBottom: '0px' }}>Marcos, Distribuidora MF</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Preços ── */}
      <section id="precos" style={{ paddingTop: '100px', paddingBottom: '100px', background: '#0f172a', color: '#fff' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '900', marginTop: '0px', marginBottom: '48px' }}>Plano Único</h2>
          <div style={{ maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', background: 'rgba(255,255,255,0.05)', padding: '48px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: '64px', fontWeight: '900', marginTop: '20px', marginBottom: '20px' }}>R$ 74<span style={{ color: '#22c55e', fontSize: '24px' }}>,99</span></p>
            <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0, marginTop: '0px', marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Pedidos Ilimitados', 'IA de Voz Ativada', 'Exportação para Excel', 'Suporte 24h'].map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '14px' }}><Check size={16} color="#22c55e" /> {f}</li>
              ))}
            </ul>
            <Link href="/login" style={{ display: 'block', background: '#22c55e', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: '800', textDecoration: 'none' }}>Assinar Agora</Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ paddingTop: '100px', paddingBottom: '100px' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h2 style={{ textAlign: 'center', marginTop: '0px', marginBottom: '48px', fontWeight: '900' }}>Dúvidas Frequentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { q: 'É seguro conectar meu WhatsApp?', a: 'Sim, usamos criptografia de ponta e conexão via API oficial para garantir a segurança dos seus dados.' },
              { q: 'Ele entende áudio?', a: 'Com certeza! O Zeca transcreve áudios e identifica itens do pedido mesmo com barulho de fundo.' }
            ].map((faq, i) => (
              <div key={i} style={{ border: '1px solid #f1f5f9', padding: '24px', borderRadius: '16px' }}>
                <p style={{ fontWeight: '800', marginTop: '0px', marginBottom: '8px' }}>{faq.q}</p>
                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '0px', marginBottom: '0px' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ paddingTop: '80px', paddingBottom: '40px', borderTop: '1px solid #f1f5f9' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Zap size={20} color="#22c55e" fill="#22c55e" />
                <span style={{ fontWeight: '800' }}>Zeca.ai</span>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '0px', marginBottom: '0px' }}>© 2026 Zeca.ai Tecnologia Ltda.</p>
            </div>
            <div style={{ display: 'flex', gap: '40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#64748b' }}>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>Produto</span>
                <a href="#">Funcionalidades</a><a href="#">Preços</a>
              </div>
            </div>
            {/* WhatsApp Pulsante */}
            <a href="#" className="whatsapp-float" style={{ width: '56px', height: '56px', background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <MessageSquare size={28} fill="#fff" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}