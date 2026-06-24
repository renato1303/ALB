import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, User, X, Sparkles, Clock, Globe } from 'lucide-react';

interface Columnist {
  id: string;
  name: string;
  avatarUrl: string;
  title: string;
  content: string;
  category: string;
  date: string;
}

const INITIAL_COLUMNISTS: Columnist[] = [
  {
    id: 'col_1',
    name: 'Flávio Ricco',
    avatarUrl: '/images/avatar_flavio_ricco.jpg',
    title: 'Danilo Sacramento volta à Record e reforça elenco de "A Ira do Herdeiro"',
    content: 'O renomado ator Danilo Sacramento está de volta aos bastidores da teledramaturgia da Record. Com um papel de extrema densidade, sua entrada promete reequilibrar as forças dramáticas do núcleo principal da novela "A Ira do Herdeiro". A escalação reforça o investimento tático da emissora em produções épicas de altíssimo orçamento.',
    category: 'Mídia e TV',
    date: 'Hoje'
  },
  {
    id: 'col_2',
    name: 'Carla Bittencourt',
    avatarUrl: '/images/avatar_carla_bittencourt.jpg',
    title: 'Globo aposta em história sobre amizade e maternidade na próxima novela das sete',
    content: 'A Rede Globo definiu a sinopse central para a vaga da próxima novela das 19h. Apostando no carisma cotidiano, a trama será costurada pelas vivências cotidianas de três mulheres que redescobrem os limites da amizade e da maternidade em tempos de telas conectadas. A produção busca resgatar a audiência leve e descontraída com pitadas clássicas de melodrama.',
    category: 'Entretenimento',
    date: 'Há 2h'
  },
  {
    id: 'col_3',
    name: 'Julinho Casares',
    avatarUrl: '/images/avatar_julinho_casares.jpg',
    title: 'Ataque de pitbull a apresentador da Globo reacende debate sobre responsabilidade dos tutores',
    content: 'Mais um triste episódio envolvendo cães de grande porte reacende a urgência de regulamentações estritas sobre a guarda de raças predispostas a agressividades extremas. O debate em torno de focinheiras obrigatórias e adestramentos controlados ganha força nos legislativos municipais após o acidente com o apresentador, demandando campanhas de conscientização pública.',
    category: 'Causa Animal',
    date: 'Ontem'
  },
  {
    id: 'col_4',
    name: 'Adriane Dias',
    avatarUrl: '/images/avatar_adriane_dias.jpg',
    title: 'Quer engravidar? A nutrição pode ser sua grande aliada nessa fase',
    content: 'A ciência obstétrica moderna comprova anualmente que a modulação nutricional pré-concepção é um dos fatores com maior peso na taxa de sucesso da fertilização. O consumo programado de antioxidantes naturais, regulação lipídica e balanço de folatos criam a fundação ideal para um desenvolvimento embrionário sadio e seguro.',
    category: 'Saúde e Bem-estar',
    date: 'Ontem'
  },
  {
    id: 'col_5',
    name: 'Daniel Castro',
    avatarUrl: '/images/avatar_daniel_castro.jpg',
    title: 'As novas diretrizes de investimentos e fundações que ditam o rumo do agronegócio',
    content: 'Os principais fundos de pensão globais estão recalculando as taxas de desconto para ativos florestais e de pecuária integrada na América do Sul. A nova ordem financeira internacional exige rastreabilidade integral baseada em tecnologia de sensoriamento remoto, transformando custos de conformidade em ativos de captação premium.',
    category: 'Agrobusiness',
    date: 'Há 2 dias'
  },
  {
    id: 'col_6',
    name: 'Laura Montenegro',
    avatarUrl: '/images/avatar_laura_montenegro.jpg',
    title: 'Como as pressões cambiais americanas afetam as startups brasileiras de tecnologia',
    content: 'Com as taxas de juros americanas mantendo patamares resilientes, desenvolvedores nacionais de aplicações SaaS precisam acelerar suas estratégias de exportação de serviços. Faturar em dólares com custo de engenharia em reais desponta como o principal porto seguro de liquidez corporativa para garantir rodadas Series B sem extrema diluição.',
    category: 'Finanças Digitais',
    date: 'Há 3 dias'
  }
];

export function ColumnistsSection() {
  const [columnists] = useState<Columnist[]>(INITIAL_COLUMNISTS);
  const [startIndex, setStartIndex] = useState(0);
  const [activeCol, setActiveCol] = useState<Columnist | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const visibleCount = {
    mobile: 1,
    tablet: 2,
    desktop: 4
  };

  // Determine current screen categories shown based on viewport sizing mockup
  const [currentVisible, setCurrentVisible] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCurrentVisible(1);
      } else if (window.innerWidth < 1024) {
        setCurrentVisible(2);
      } else {
        setCurrentVisible(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNext = () => {
    setStartIndex((prev) => {
      const maxIndex = columnists.length - currentVisible;
      if (prev >= maxIndex) return 0; // Return to start
      return prev + 1;
    });
  };

  const handlePrev = () => {
    setStartIndex((prev) => {
      const maxIndex = columnists.length - currentVisible;
      if (prev <= 0) return Math.max(0, maxIndex); // Loop to end
      return prev - 1;
    });
  };

  // Autoplay functionality
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 6000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [currentVisible, columnists.length]);

  const pauseAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  const resumeAutoPlay = () => {
    if (!autoPlayRef.current) {
      autoPlayRef.current = setInterval(() => {
        handleNext();
      }, 6000);
    }
  };

  // Slice visible columnists
  const visibleColumnists = columnists.slice(startIndex, startIndex + currentVisible);

  // If we don't have enough items to fill the current visible window at the end, append from start to loop smoothly
  if (visibleColumnists.length < currentVisible) {
    const piecesNeeded = currentVisible - visibleColumnists.length;
    visibleColumnists.push(...columnists.slice(0, piecesNeeded));
  }

  // Calculate pages for dots indicator
  const totalSlots = columnists.length;
  const currentActiveDot = Math.min(startIndex, totalSlots - 1);

  return (
    <section 
      id="portal-columnists" 
      className="bg-gold-500 text-luxury-gray-950 w-full py-7 px-4 md:px-8 rounded-2xl border border-gold-450/20 shadow-2xl relative overflow-hidden select-none"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER BAR */}
        <div className="flex items-center justify-between border-b border-black/10 pb-2">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="font-serif font-black tracking-tight text-2xl md:text-3xl uppercase text-black pr-2">
              Colunas <span className="text-black/65 font-sans font-normal normal-case">Exclusivas</span>
            </h2>
            <div className="h-[1px] bg-black/10 flex-1 hidden md:block"></div>
          </div>
          
          {/* NAVIGATION ARROWS */}
          <div className="flex items-center gap-2.5 ml-4">
            <button 
              onClick={handlePrev}
              className="p-1 px-2 rounded hover:bg-black/10 transition active:scale-95 text-black/75 hover:text-black"
              aria-label="Voltar colunistas"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <button 
              onClick={handleNext}
              className="p-1 px-2 rounded hover:bg-black/10 transition active:scale-95 text-black/75 hover:text-black"
              aria-label="Avançar colunistas"
            >
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* CONTAINER AND SLIDER LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-1">
          {visibleColumnists.map((col, idx) => (
            <div 
              key={`${col.id}-${idx}`}
              onClick={() => setActiveCol(col)}
              className="flex items-start gap-4 cursor-pointer group hover:bg-black/5 hover:border-black/5 p-3 rounded-xl border border-transparent transition duration-300"
            >
              {/* AVATAR */}
              <div className="relative flex-shrink-0">
                <img 
                  src={col.avatarUrl} 
                  alt={col.name} 
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-black/10 shadow-md transition duration-300 group-hover:scale-105 group-hover:border-black/30"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* DETAILS */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="font-sans font-black text-xs md:text-sm text-black group-hover:text-black transition truncate uppercase tracking-wide">
                  {col.name}
                </h4>
                <p className="font-sans text-[11px] md:text-xs text-black/80 group-hover:text-black transition leading-snug line-clamp-3 font-normal">
                  {col.title}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* DOTS PAGINATION */}
        <div className="flex justify-center items-center gap-1.5 pt-1">
          {columnists.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setStartIndex(Math.min(index, columnists.length - currentVisible));
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentActiveDot === index 
                  ? 'w-4 bg-black/90' 
                  : 'w-1.5 bg-black/20 hover:bg-black/40'
              }`}
              aria-label={`Ir para coluna slot ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* FULL COLUMN MODAL FOR DETAILED INSIGHTS */}
      {activeCol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-luxury-gray-900 border border-luxury-gray-850 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            {/* Elegant Header Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gold-gradient" />
            
            {/* Modal Body */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Profile Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-left">
                  <img 
                    src={activeCol.avatarUrl} 
                    alt={activeCol.name} 
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-3 border-gold-500/35 shadow"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <span className="text-[10px] bg-gold-500/10 text-gold-400 font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border border-gold-500/20">
                      Colunista Premium
                    </span>
                    <h3 className="font-serif font-black text-xl text-white mt-1 uppercase tracking-tight">
                      {activeCol.name}
                    </h3>
                    <p className="text-xs text-luxury-gray-400 font-mono tracking-wider">
                      Cadeira Editorial {activeCol.category}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveCol(null)}
                  className="bg-luxury-gray-950 p-2.5 rounded-full text-luxury-gray-400 hover:text-white border border-luxury-gray-850 transition active:scale-95 self-start"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Col Content */}
              <div className="space-y-4 border-t border-luxury-gray-850 pt-5 text-left">
                <div className="flex items-center gap-2 text-gold-400 text-xs font-mono">
                  <Sparkles size={14} className="animate-pulse" />
                  <span>DESTAQUE EDITORIAL</span>
                  <span className="text-luxury-gray-600">•</span>
                  <Clock size={12} />
                  <span className="uppercase">{activeCol.date}</span>
                </div>
                
                <h4 className="font-serif font-bold text-lg md:text-xl text-white leading-normal">
                  "{activeCol.title}"
                </h4>

                <p className="text-sm text-luxury-gray-300 leading-relaxed font-sans first-letter:text-3xl first-letter:font-serif first-letter:font-black first-letter:text-gold-400 first-letter:mr-1.5 first-letter:float-left">
                  {activeCol.content}
                </p>
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between border-t border-luxury-gray-850 pt-4 text-xs font-mono text-luxury-gray-400">
                <div className="flex items-center gap-1">
                  <Globe size={13} className="text-gold-550" />
                  <span>Portal Além do Bilhão • 2026</span>
                </div>
                <button 
                  onClick={() => setActiveCol(null)}
                  className="text-gold-400 hover:text-gold-300 font-mono hover:underline font-bold"
                >
                  Fechar Leitura
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
