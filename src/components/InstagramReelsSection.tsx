import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Instagram, Play, X, Eye, Heart, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';
import { InstagramReel } from '../types';
import { getReels } from '../utils/db';

export function InstagramReelsSection() {
  const [reels, setReels] = useState<InstagramReel[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [activeReel, setActiveReel] = useState<InstagramReel | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Read current visible based on viewport width
  const [currentVisible, setCurrentVisible] = useState(5);

  useEffect(() => {
    // Initial fetch
    setReels(getReels());

    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCurrentVisible(1);
      } else if (window.innerWidth < 1024) {
        setCurrentVisible(3);
      } else {
        setCurrentVisible(5);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNext = () => {
    setStartIndex((prev) => {
      const maxIndex = reels.length - currentVisible;
      if (prev >= maxIndex) return 0; // wrap around
      return prev + 1;
    });
  };

  const handlePrev = () => {
    setStartIndex((prev) => {
      if (prev <= 0) {
        return Math.max(0, reels.length - currentVisible); // wrap to end
      }
      return prev - 1;
    });
  };

  // Slice visible items
  const visibleReels = reels.slice(startIndex, startIndex + currentVisible);
  // Loop helper
  if (visibleReels.length < currentVisible && reels.length > 0) {
    const piecesNeeded = currentVisible - visibleReels.length;
    visibleReels.push(...reels.slice(0, piecesNeeded));
  }

  if (reels.length === 0) {
    return null;
  }

  return (
    <section id="portal-reels" className="w-full py-8 px-4 md:px-8 border-y border-luxury-gray-900 bg-black/40">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 p-2 rounded-xl text-white shadow-lg animate-pulse">
              <Instagram size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="font-sans font-black tracking-tighter text-xl md:text-2xl uppercase text-white flex items-center gap-1.5">
                Além do Bilhão <span className="text-gold-400 font-serif lowercase italic font-normal">reels</span>
              </h2>
              <p className="text-[10px] text-luxury-gray-400 font-mono tracking-wider uppercase">
                Conexão Direta Instagram • Drops Diários de Insights
              </p>
            </div>
          </div>

          {/* ACTIONS & ARROWS */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-luxury-gray-900 border border-luxury-gray-850 hover:border-gold-500/50 hover:text-gold-450 transition active:scale-95 text-luxury-gray-400"
              aria-label="Voltar reels"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <button 
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-luxury-gray-900 border border-luxury-gray-850 hover:border-gold-500/50 hover:text-gold-450 transition active:scale-95 text-luxury-gray-400"
              aria-label="Avançar reels"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* REELS GRID MOCKUP ROW */}
        <div 
          ref={sliderRef}
          className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4.5 transition-all duration-300"
        >
          {visibleReels.map((reel, idx) => (
            <div 
              key={`${reel.id}-${idx}`}
              onClick={() => setActiveReel(reel)}
              className="group relative aspect-[9/16] bg-luxury-gray-950 rounded-2xl overflow-hidden border border-luxury-gray-900 hover:border-gold-500/40 shadow-xl cursor-pointer transition duration-300"
            >
              {/* REEL COVER IMAGE */}
              <img 
                src={reel.imageUrl} 
                alt={reel.title} 
                className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105 filter brightness-[0.835] group-hover:brightness-[0.7]"
                loading="lazy"
                referrerPolicy="no-referrer"
              />

              {/* GRADIENTS OVERLAYS */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60 pointer-events-none" />

              {/* TOP HEADER: INSTAGRAM USER PROFILE */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center gap-2">
                <img 
                  src={reel.avatarUrl} 
                  alt={reel.username} 
                  className="w-7 h-7 rounded-full border border-white/45 object-cover shadow"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <h4 className="text-[11px] font-sans font-extrabold text-white truncate drop-shadow">
                    {reel.username}
                  </h4>
                  <span className="text-[8px] text-white/70 font-mono tracking-widest drop-shadow block -mt-0.5">
                    REELS
                  </span>
                </div>
              </div>

              {/* CENTER PLAY BUTTON */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 flex items-center justify-center text-white shadow-2xl transition duration-300 transform scale-90 group-hover:scale-100 opacity-80 group-hover:opacity-100">
                  <Play size={20} className="fill-current ml-0.5" />
                </div>
              </div>

              {/* BOTTOM TITLE & CAPTION */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 space-y-1.5 text-left">
                <p className="text-xs font-semibold text-white leading-snug font-sans line-clamp-3 group-hover:text-amber-100 transition duration-300 drop-shadow">
                  {reel.title}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-white/80">
                  <span className="flex items-center gap-0.5">
                    <Eye size={10} className="text-gold-400" />
                    {reel.viewsCount} views
                  </span>
                  {reel.likesCount && (
                    <span className="text-white/60">• {reel.likesCount} curtidas</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FEEDBACK INCENTIVE BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-luxury-gray-900/65 border border-luxury-gray-850 text-xs font-mono text-luxury-gray-400">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-gold-450" />
            <span>Conecte-se com os bastidores do Além do Bilhão em tempo real.</span>
          </div>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gold-450 hover:text-gold-300 font-bold transition whitespace-nowrap"
          >
            Seguir no Instagram
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* REELS INTERACTIVE MODAL PLAYER */}
      {activeReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-luxury-gray-950 border border-luxury-gray-850 rounded-2xl w-full max-w-sm md:max-w-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
            
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => setActiveReel(null)}
              className="absolute top-4 right-4 z-10 bg-black/60 p-2.5 rounded-full text-white hover:text-gold-400 transition hover:scale-105 active:scale-95"
            >
              <X size={18} />
            </button>

            {/* VIDEO/IFRAME SIDE */}
            <div className="w-full md:w-[60%] aspect-[9/16] bg-black relative flex items-center justify-center border-b md:border-b-0 md:border-r border-luxury-gray-850">
              {/* Fallback Beautiful video preview mockup to prevent sandbox errors */}
              <div className="absolute inset-0 overflow-hidden flex flex-col items-center justify-center text-center p-6 space-y-6">
                <img 
                  src={activeReel.imageUrl} 
                  alt={activeReel.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-sm"
                  referrerPolicy="no-referrer"
                />
                
                <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 flex items-center justify-center text-white shadow-2xl animate-bounce">
                  <Instagram size={40} />
                </div>

                <div className="relative z-10 space-y-2">
                  <h4 className="font-serif font-black text-lg text-white">Assista Diretamente</h4>
                  <p className="text-xs text-luxury-gray-300 max-w-xs leading-relaxed">
                    Devido às diretrizes de segurança aplicadas pelo navegador e pela sandbox do Instagram, os Reels protegidos devem ser abertos no aplicativo ou site oficial de destino.
                  </p>
                </div>

                <a 
                  href={activeReel.videoUrl === 'https://www.instagram.com/reels/' ? 'https://instagram.com/reels' : activeReel.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="relative z-10 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 via-pink-600 to-purple-600 text-white font-sans font-bold text-xs rounded-full shadow-lg hover:scale-105 hover:brightness-110 active:scale-95 transition"
                >
                  Abrir no Instagram
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>

            {/* CONTEXT SIDE */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between space-y-6 text-left">
              <div className="space-y-4">
                {/* Profile Header */}
                <div className="flex items-center gap-3">
                  <img 
                    src={activeReel.avatarUrl} 
                    alt={activeReel.username} 
                    className="w-10 h-10 rounded-full object-cover border border-gold-450"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-sans font-black text-sm text-white">{activeReel.username}</h3>
                    <p className="text-[10px] text-luxury-gray-400 font-mono">Vídeos Rápidos do Líder</p>
                  </div>
                </div>

                <hr className="border-luxury-gray-850" />

                {/* Reels Description */}
                <div className="space-y-2">
                  <span className="text-[9px] bg-gold-550/10 text-gold-400 font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-gold-500/20">
                    SÉRIE ORIGINAL
                  </span>
                  <h4 className="font-serif font-bold text-base md:text-lg text-white leading-snug">
                    "{activeReel.title}"
                  </h4>
                </div>
              </div>

              {/* Engagement Stats Form */}
              <div className="space-y-4 pt-4 border-t border-luxury-gray-850">
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="bg-luxury-gray-900 border border-luxury-gray-850 p-2 rounded-lg">
                    <span className="text-luxury-gray-400 text-[10px] block uppercase">Views</span>
                    <strong className="text-white text-sm font-sans">{activeReel.viewsCount}</strong>
                  </div>
                  <div className="bg-luxury-gray-900 border border-luxury-gray-850 p-2 rounded-lg">
                    <span className="text-luxury-gray-400 text-[10px] block uppercase">Likes</span>
                    <strong className="text-rose-450 text-sm font-sans">{activeReel.likesCount || 'N/D'}</strong>
                  </div>
                  <div className="bg-luxury-gray-900 border border-luxury-gray-850 p-2 rounded-lg">
                    <span className="text-luxury-gray-400 text-[10px] block uppercase">Rede</span>
                    <strong className="text-purple-400 text-sm font-sans flex items-center justify-center gap-0.5">
                      Insta
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveReel(null)}
                    className="flex-1 py-2.5 rounded-xl border border-luxury-gray-850 text-luxury-gray-300 hover:text-white hover:bg-luxury-gray-900 transition font-sans font-bold text-xs"
                  >
                    Fechar Player
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
