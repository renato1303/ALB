/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Globe, Shield, ArrowRight, CheckCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const [emailInput, setEmailInput] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeInfo, setActiveInfo] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    // Simulate newsletter subscription in analytics tables
    setSuccess(true);
    setEmailInput('');
    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

  return (
    <footer id="main-footer" className="bg-luxury-gray-950 border-t border-luxury-gray-900 text-luxury-gray-400 font-sans mt-auto">
      
      {/* 1. NEWSLETTER BRIEF AND LOGO HERO SECTION */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-luxury-gray-900">
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center select-none h-10 md:h-11">
            <img 
              src="/images/logo_alb.jpg" 
              alt="Além do Bilhão" 
              className="h-full w-auto object-contain scale-[1.1] origin-left"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-sm text-luxury-gray-400 font-sans leading-relaxed tracking-wide">
            O principal veículo jornalístico focado no ecossistema de alta performance empresarial, 
            estratégias de investimentos institucionais, novas vertentes de tecnologia disruptiva, capital de risco e liderança executiva na América Latina.
          </p>
          <div className="flex items-center gap-4 text-xs font-mono text-gold-400 mt-2">
            <span className="flex items-center gap-1">
              <Globe size={13} className="text-gold-500" />
              Portal Premium
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Shield size={13} className="text-gold-500" />
              CMS Verificado
            </span>
          </div>
        </div>

        {/* Dynamic Interactive Newsletter Forms */}
        <div className="lg:col-span-7 flex flex-col justify-center bg-luxury-gray-900/50 p-6 md:p-8 rounded-xl border border-luxury-gray-850">
          <div className="flex items-center gap-2 text-gold-400 font-serif font-medium text-lg mb-2">
            <Mail size={18} className="text-gold-500" />
            <span>Newsletter Exclusiva do Além do Bilhão</span>
          </div>
          <p className="text-xs text-luxury-gray-300 mb-6 leading-relaxed">
            Receba diretamente em seu e-mail corporativo os principais relatórios estratégicos de mercado, as movimentações de M&A brasileiras e insights de investidores qualificados.
          </p>

          {success ? (
            <div className="flex items-center gap-2.5 bg-gold-950/40 border border-gold-600/50 rounded-lg p-4 text-xs text-gold-200 animate-fadeIn">
              <CheckCircle size={16} className="text-gold-500 shrink-0" />
              <span>Inscrição realizada! Seu acesso prioritário aos informativos matinais foi ativado com sucesso.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                id="inp-newsletter-email"
                type="email"
                required
                placeholder="Insira seu e-mail executivo corporativo..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 bg-luxury-gray-950 border border-luxury-gray-800 focus:border-gold-500 rounded text-xs text-white px-4 py-3 outline-none transition font-sans placeholder-luxury-gray-500"
              />
              <button
                id="btn-newsletter-submit"
                type="submit"
                className="bg-gold-500 hover:bg-gold-600 text-luxury-gray-950 font-bold px-6 py-3 rounded text-xs uppercase tracking-wider transition duration-300 flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Inscrever-se</span>
                <ArrowRight size={13} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 2. SITEMAP/ROBOTS DIRECT LINKS */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-xs border-b border-luxury-gray-900">
        
        {/* Col 1: Editorial */}
        <div className="flex flex-col gap-3">
          <h4 className="text-gold-400 font-serif font-semibold tracking-wider uppercase text-[10px]">Portal de Notícias</h4>
          <ul className="flex flex-col gap-2 font-medium">
            <li onClick={() => onNavigate('home')} className="hover:text-white cursor-pointer transition">Página Inicial</li>
            <li onClick={() => onNavigate('category', 'negocios')} className="hover:text-white cursor-pointer transition">Negócios & M&A</li>
            <li onClick={() => onNavigate('category', 'mercado')} className="hover:text-white cursor-pointer transition">Mercado Financeiro</li>
            <li onClick={() => onNavigate('category', 'investimentos')} className="hover:text-white cursor-pointer transition">Portfólios de Investimento</li>
          </ul>
        </div>

        {/* Col 2: Inovacao */}
        <div className="flex flex-col gap-3">
          <h4 className="text-gold-400 font-serif font-semibold tracking-wider uppercase text-[10px]">Inovação e Gestão</h4>
          <ul className="flex flex-col gap-2 font-medium">
            <li onClick={() => onNavigate('category', 'tecnologia')} className="hover:text-white cursor-pointer transition">Tecnologia & IA</li>
            <li onClick={() => onNavigate('category', 'startups')} className="hover:text-white cursor-pointer transition">Venture Capital & Startups</li>
            <li onClick={() => onNavigate('category', 'lideranca')} className="hover:text-white cursor-pointer transition">Conselhos & Liderança</li>
          </ul>
        </div>

        {/* Col 3: SEO Docs */}
        <div className="flex flex-col gap-3">
          <h4 className="text-gold-400 font-serif font-semibold tracking-wider uppercase text-[10px]">Mecanismos de busca (SEO)</h4>
          <ul className="flex flex-col gap-2 font-medium font-mono text-[11px]">
            <li 
              onClick={() => setActiveInfo('sitemap')}
              className="hover:text-white cursor-pointer transition flex items-center gap-1 filter grayscale active:grayscale-0"
            >
              <span>/sitemap.xml</span>
            </li>
            <li 
              onClick={() => setActiveInfo('robots')}
              className="hover:text-white cursor-pointer transition flex items-center gap-1"
            >
              <span>/robots.txt</span>
            </li>
            <li className="text-luxury-gray-500">Schema.org Article Integrado</li>
            <li className="text-luxury-gray-500">OpenGraph & Social Metas</li>
          </ul>
        </div>

        {/* Col 4: Corporate Contacts */}
        <div className="flex flex-col gap-3">
          <h4 className="text-gold-400 font-serif font-semibold tracking-wider uppercase text-[10px]">Além do Bilhão SA</h4>
          <p className="text-[11px] leading-relaxed text-luxury-gray-500">
            Avenida Faria Lima, 3500 - Itaim Bibi, São Paulo - SP<br />
            Redação: redacao@alemdobilhao.com.br<br />
            Suporte: contato@alemdobilhao.com
          </p>
        </div>
      </div>

      {/* 3. MOCK CREDITS */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between text-[10px] text-luxury-gray-650 font-mono">
        <span>
          © 2026 Além do Bilhão S.A. Todos os direitos reservados. CNPJ 12.345.678/0001-90.
          <span 
            onClick={() => onNavigate('admin-login')} 
            className="ml-1.5 opacity-30 hover:opacity-100 text-luxury-gray-700 hover:text-gold-550 cursor-pointer transition duration-300 inline-block align-middle select-none text-[8px]"
            title="Sindicado"
          >
            🔑
          </span>
        </span>
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          <span className="hover:text-luxury-gray-400 cursor-pointer transition">Política de Privacidade</span>
          <span>•</span>
          <span className="hover:text-luxury-gray-400 cursor-pointer transition">Termos de Uso Corporativo</span>
        </div>
      </div>

      {activeInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in font-sans">
          <div className="bg-luxury-gray-900 border border-luxury-gray-850 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between text-gold-400 font-serif font-semibold border-b border-luxury-gray-850 pb-3">
              <span className="text-white text-sm font-bold tracking-tight uppercase">
                {activeInfo === 'sitemap' ? 'Sitemap XML Automático' : 'Robots.txt Schema'}
              </span>
              <button 
                onClick={() => setActiveInfo(null)}
                className="text-luxury-gray-400 hover:text-white text-xs px-2.5 py-1.5 rounded bg-luxury-gray-950 transition font-mono border border-luxury-gray-800"
              >
                Fechar
              </button>
            </div>
            
            <div className="text-xs text-emerald-400 font-mono leading-relaxed whitespace-pre bg-luxury-gray-950 p-4 rounded-lg overflow-x-auto border border-luxury-gray-850 max-h-[180px]">
              {activeInfo === 'sitemap' 
                ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://alemdobilhao.com.br/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <!-- URLs corporativas indexadas em tempo real -->\n</urlset>`
                : `User-agent: *\nDisallow: /admin\nAllow: /\n\n# Sitemap indexation rule\nSitemap: https://alemdobilhao.com.br/sitemap.xml`
              }
            </div>
            
            <p className="text-[10px] text-luxury-gray-400 leading-normal">
              Este arquivo de configuração é gerado dinamicamente pela infraestrutura SEO consolidada do portal Além do Bilhão para maximizar o alcance editorial orgânico no Google Search Console.
            </p>
          </div>
        </div>
      )}

    </footer>
  );
}
