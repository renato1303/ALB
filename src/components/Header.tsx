/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, User as UserIcon, Menu, X, LogIn, TrendingUp, LogOut } from 'lucide-react';
import { User } from '../types';
import { getLoggedUser, logout } from '../utils/db';

interface HeaderProps {
  onNavigate: (view: string, param?: string) => void;
  activeView: string;
  activeCategorySlug?: string;
  onSearch: (query: string) => void;
  searchQuery: string;
}

export default function Header({ onNavigate, activeView, activeCategorySlug, onSearch, searchQuery }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tickerItems, setTickerItems] = useState<{
    label: string;
    symbol: string;
    price: number;
    prevClose: number;
    change: number;
    percentage: number;
    isPoints?: boolean;
  }[]>([
    { label: 'IBOVESPA', symbol: '^BVSP', price: 115230, prevClose: 116972, change: -1742, percentage: -1.49, isPoints: true },
    { label: 'BBDC4', symbol: 'BBDC4.SA', price: 17.80, prevClose: 17.68, change: 0.12, percentage: 0.68 },
    { label: 'PETR3', symbol: 'PETR3.SA', price: 46.19, prevClose: 46.85, change: -0.66, percentage: -1.41 },
    { label: 'ABEV3', symbol: 'ABEV3.SA', price: 16.61, prevClose: 16.64, change: -0.03, percentage: -0.18 },
    { label: 'MGLU3', symbol: 'MGLU3.SA', price: 5.22, prevClose: 5.33, change: -0.11, percentage: -2.06 },
    { label: 'WEGE3', symbol: 'WEGE3.SA', price: 42.61, prevClose: 42.52, change: 0.09, percentage: 0.21 },
    { label: 'USD', symbol: 'USDBRL=X', price: 5.062, prevClose: 5.062, change: 0, percentage: 0.00 },
    { label: 'EUR', symbol: 'EURBRL=X', price: 5.856, prevClose: 5.856, change: 0, percentage: 0.00 },
  ]);

  useEffect(() => {
    setCurrentUser(getLoggedUser());
    
    // Listen for custom login events from other components
    const handleAuthChange = () => {
      setCurrentUser(getLoggedUser());
    };
    window.addEventListener('auth-session-modified', handleAuthChange);
    return () => {
      window.removeEventListener('auth-session-modified', handleAuthChange);
    };
  }, [activeView]);

  // Fetch real-time tickers from Express Backend API
  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const res = await fetch('/api/ticker');
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setTickerItems(data);
            }
          } else {
            console.warn("API de tickers não retornou JSON. Usando valores locais/simulados.");
          }
        }
      } catch (e) {
        console.error("Erro ao obter cotações da API:", e);
      }
    };

    fetchTickers();
    // Refresh every 45 seconds for active feel
    const interval = setInterval(fetchTickers, 45000);
    return () => clearInterval(interval);
  }, []);

  // Update prices in real-time with tiny realistic market fluctuations every 3 seconds for continuous visual updates
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setTickerItems(prevItems => 
        prevItems.map(item => {
          // Subtle fluctuation between -0.04% and +0.04% for elegant realism
          const changePercent = (Math.random() * 0.08 - 0.04) / 100;
          const priceDelta = item.price * changePercent;
          const newPrice = Math.max(0.01, item.price + priceDelta);
          const newChange = newPrice - item.prevClose;
          const newPercentage = item.prevClose !== 0 ? (newChange / item.prevClose) * 100 : 0;
          
          return {
            ...item,
            price: newPrice,
            change: newChange,
            percentage: newPercentage
          };
        })
      );
    }, 3000);

    return () => clearInterval(simulationInterval);
  }, []);

  const formatPrice = (item: typeof tickerItems[0]) => {
    if (item.isPoints) {
      return Math.round(item.price).toLocaleString('pt-BR');
    }
    const decimals = (item.label === 'USD' || item.label === 'EUR') ? 3 : 2;
    const formattedNum = item.price.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    return `R$ ${formattedNum}`;
  };

  const renderTrend = (percentage: number) => {
    const isPositive = percentage > 0.005;
    const isNegative = percentage < -0.005;

    if (isPositive) {
      return (
        <span className="text-emerald-400 font-bold inline-flex items-center gap-1 select-none text-[11px]">
          <span>▲</span>
          <span>{percentage.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span>
        </span>
      );
    } else if (isNegative) {
      return (
        <span className="text-rose-500 font-bold inline-flex items-center gap-1 select-none text-[11px]">
          <span>▼</span>
          <span>-{Math.abs(percentage).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span>
        </span>
      );
    } else {
      return (
        <span className="text-luxury-gray-400 font-bold inline-flex items-center gap-1 select-none text-[11px]">
          <span>−</span>
          <span>0,00%</span>
        </span>
      );
    }
  };

  const menuCategories = [
    { name: 'Negócios', slug: 'negocios' },
    { name: 'Mercado', slug: 'mercado' },
    { name: 'Investimentos', slug: 'investimentos' },
    { name: 'Tecnologia', slug: 'tecnologia' },
    { name: 'Startups', slug: 'startups' },
    { name: 'Liderança', slug: 'lideranca' }
  ];

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    window.dispatchEvent(new Event('auth-session-modified'));
    onNavigate('home');
  };

  return (
    <header id="main-header" className="w-full bg-luxury-gray-950 border-b border-luxury-gray-800 sticky top-0 z-50 transition-all">
      {/* 1. FINANCIAL STOCK TICKER (CNN Style) */}
      <div className="w-full bg-luxury-gray-950 border-b border-luxury-gray-800 font-sans select-none overflow-hidden py-2 px-3 sm:py-2.5 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Live Indicator Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 border-r border-luxury-gray-850 pr-3 sm:pr-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-gold-400 uppercase">MERCADOS</span>
          </div>

          {/* Scrolling items track (Infinite Marquee) */}
          <div className="flex-1 overflow-hidden relative flex items-center">
            <div className="flex items-center gap-8 animate-marquee whitespace-nowrap hover:[animation-play-state:paused] min-w-max">
              {/* Loop 1 of ticker items */}
              {tickerItems.map((item, idx) => (
                <div
                  key={`t1-${idx}`}
                  className="flex items-center gap-2.5 text-[11px] shrink-0"
                >
                  <span className="text-luxury-gray-400 font-bold uppercase">{item.label}:</span>
                  <span className="text-white font-extrabold font-mono transition-all duration-300">{formatPrice(item)}</span>
                  {renderTrend(item.percentage)}
                  <span className="text-luxury-gray-800/80 ml-3 select-none font-sans">|</span>
                </div>
              ))}
              {/* Loop 2 of ticker items (Seamless transition copy) */}
              {tickerItems.map((item, idx) => (
                <div
                  key={`t2-${idx}`}
                  className="flex items-center gap-2.5 text-[11px] shrink-0"
                >
                  <span className="text-luxury-gray-400 font-bold uppercase">{item.label}:</span>
                  <span className="text-white font-extrabold font-mono transition-all duration-300">{formatPrice(item)}</span>
                  {renderTrend(item.percentage)}
                  <span className="text-luxury-gray-800/80 ml-3 select-none font-sans">|</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Status */}
          <div className="shrink-0 pl-3 sm:pl-4 border-l border-luxury-gray-850 text-[9px] sm:text-[10px] text-gold-400 font-extrabold font-mono uppercase tracking-wider italic">
            AO VIVO
          </div>
        </div>
      </div>

      {/* 2. MAIN BRAND HEADER */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 lg:py-2.5 flex items-center justify-between">
        
        {/* Toggle Mobile Menu Button */}
        <button
          id="btn-mobile-menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-luxury-gray-300 hover:text-white rounded transition"
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* LOGO: ALÉM DO BILHÃO (Image replacing text with seamless design) */}
        <div 
          onClick={() => { onNavigate('home'); onSearch(''); }}
          className="flex items-center justify-start cursor-pointer select-none ml-2 mr-auto lg:ml-0 lg:mr-0 h-10 md:h-12 lg:h-14"
        >
          <img 
            src="/images/logo_alb.jpg" 
            alt="Além do Bilhão" 
            className="h-full w-auto object-contain transition-all duration-300 hover:scale-[1.03]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* SEARCH AND ADMIN LOGIN ACTIONS */}
        <div className="hidden lg:flex items-center gap-6">
          
          {/* Internal Search Bar */}
          <div className="relative w-64 xl:w-80">
            <input
              id="inp-desktop-search"
              type="text"
              placeholder="Pesquisar artigos e análises..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-luxury-gray-900 border border-luxury-gray-800 focus:border-gold-500 rounded text-xs text-white pl-9 pr-4 py-2 outline-none transition font-sans placeholder-luxury-gray-500"
            />
            <Search size={14} className="absolute left-3 top-2.5 text-luxury-gray-500" />
            {searchQuery && (
              <button
                onClick={() => onSearch('')}
                className="absolute right-3 top-2 text-[10px] text-luxury-gray-400 hover:text-white"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Admin Redirect Login Action */}
          {currentUser ? (
            <div className="flex items-center gap-3 bg-luxury-gray-900/60 border border-luxury-gray-800 rounded-full py-1.5 pl-2.5 pr-4 transition hover:border-gold-500/50">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full border border-gold-500 object-cover"
              />
              <div className="flex flex-col">
                <span className="text-[11px] text-luxury-gray-200 font-medium leading-none">{currentUser.name}</span>
                <span className="text-[9px] text-gold-400 font-mono leading-none mt-1">{currentUser.role}</span>
              </div>
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="text-[10px] bg-luxury-gray-850 hover:bg-gold-500 hover:text-luxury-gray-950 text-luxury-gray-300 font-semibold px-2 py-1 rounded ml-1 transition"
              >
                Painel
              </button>
              <button
                onClick={handleLogout}
                title="Sair da sessão"
                className="text-luxury-gray-400 hover:text-rose-400 p-1 transition"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              id="btn-admin-login-link"
              onClick={() => onNavigate('admin-login')}
              className="p-1.5 text-luxury-gray-700 hover:text-gold-550 rounded-full transition duration-300 transform active:scale-95 cursor-pointer"
              title="Acesso Restrito"
            >
              <LogIn size={13} className="opacity-30 hover:opacity-100 transition duration-300" />
            </button>
          )}
        </div>
      </div>

      {/* 3. DESKTOP NAVIGATION MENU */}
      <nav className="w-full bg-luxury-gray-950 border-t border-luxury-gray-900 hidden lg:block">
        <div className="max-w-7xl mx-auto px-8">
          <ul className="flex flex-wrap items-center justify-center lg:justify-between gap-x-4 gap-y-2 lg:gap-x-0 text-xs font-semibold text-luxury-gray-300 tracking-wider uppercase font-sans py-3 text-center">
            <li 
              onClick={() => { onNavigate('home'); onSearch(''); }}
              className={`hover:text-gold-400 transition cursor-pointer py-1 ${activeView === 'home' && !activeCategorySlug ? 'text-gold-400 border-b-2 border-gold-500' : ''}`}
            >
              Início
            </li>
            {menuCategories.map((cat) => (
              <li 
                key={cat.slug}
                onClick={() => { onSearch(''); onNavigate('category', cat.slug); }}
                className={`hover:text-gold-400 transition cursor-pointer py-1 ${activeCategorySlug === cat.slug ? 'text-gold-400 border-b-2 border-gold-500' : ''}`}
              >
                {cat.name}
              </li>
            ))}
            {/* Standard hardcoded luxury links requested in prompt */}
            <li 
              onClick={() => onNavigate('category', 'negocios')}
              className="text-luxury-gray-500 hover:text-gold-400 transition cursor-pointer py-1"
            >
              Empresas
            </li>
            <li 
              onClick={() => onNavigate('category', 'mercado')}
              className="text-luxury-gray-500 hover:text-gold-400 transition cursor-pointer py-1"
            >
              Finanças
            </li>
            <li 
              onClick={() => onNavigate('category', 'lideranca')}
              className="text-luxury-gray-500 hover:text-gold-400 transition cursor-pointer py-1"
            >
              Opinião
            </li>
          </ul>
        </div>
      </nav>

      {/* 4. MOBILE DRAWER NAVIGATION MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden w-full bg-luxury-gray-950 border-t border-luxury-gray-800 px-4 py-6 text-white flex flex-col gap-6 animate-fadeIn transition-all">
          
          {/* Interactive Mobile Search */}
          <div className="relative">
            <input
              id="inp-mobile-search"
              type="text"
              placeholder="Pesquisar..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-luxury-gray-900 border border-luxury-gray-800 focus:border-gold-500 rounded text-sm text-white pl-10 pr-4 py-2.5 outline-none transition"
            />
            <Search size={16} className="absolute left-3.5 top-3 text-luxury-gray-500" />
          </div>

          {/* Primary Mobile Links */}
          <div className="flex flex-col gap-4 text-base font-semibold uppercase tracking-wider">
            <span 
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className={`hover:text-gold-400 cursor-pointer ${activeView === 'home' && !activeCategorySlug ? 'text-gold-400' : 'text-luxury-gray-300'}`}
            >
              Início
            </span>
            {menuCategories.map((cat) => (
              <span 
                key={cat.slug}
                onClick={() => { onNavigate('category', cat.slug); setMobileMenuOpen(false); }}
                className={`hover:text-gold-400 cursor-pointer ${activeCategorySlug === cat.slug ? 'text-gold-400' : 'text-luxury-gray-300'}`}
              >
                {cat.name}
              </span>
            ))}
          </div>

          <hr className="border-luxury-gray-850" />

          {/* Profile Sessions mobile */}
          <div className="flex flex-col gap-4">
            {currentUser ? (
              <div className="flex flex-col gap-3 bg-luxury-gray-900/80 p-4 rounded-lg border border-luxury-gray-850">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-full border border-gold-500 object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-semibold">{currentUser.name}</h4>
                    <span className="text-[10px] text-gold-400 font-mono tracking-wider">{currentUser.role}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => { onNavigate('admin-dashboard'); setMobileMenuOpen(false); }}
                    className="bg-gold-500 hover:bg-gold-600 text-luxury-gray-950 font-bold py-2 rounded text-xs transition text-center"
                  >
                    Painel CMS
                  </button>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="bg-luxury-gray-800 hover:bg-rose-950 text-rose-400 py-2 rounded text-xs transition text-center"
                  >
                    Sair
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <span
                  onClick={() => { onNavigate('admin-login'); setMobileMenuOpen(false); }}
                  className="text-[10px] text-luxury-gray-650 hover:text-gold-550 cursor-pointer font-mono tracking-wider uppercase underline decoration-luxury-gray-850 decoration-dashed underline-offset-4"
                >
                  Restrito - Redação
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
