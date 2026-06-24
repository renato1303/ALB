import React from 'react';
import { Newspaper, Flame, Award, Clock, Sparkles, ChevronRight, Eye } from 'lucide-react';
import { Post } from '../types';
import { handleImageError } from '../utils/db';

interface EditorialAttachedFeedProps {
  onNavigate: (view: string, param?: string) => void;
  posts: Post[];
  getPostCategoryName: (categoryId: string) => string;
  formatDateStr: (dateStr: string) => string;
}

export function EditorialAttachedFeed({ 
  onNavigate, 
  posts, 
  getPostCategoryName, 
  formatDateStr 
}: EditorialAttachedFeedProps) {

  // 1. FILTER AND SORT THE LIVE DATABASE POSTS DYNAMICALLY
  const published = posts.filter(p => p.status === 'published');
  
  // Left Feed: 4 latest published articles (using fallback seed data if there are too few posts)
  const defaultAttachedSeed = [
    {
      id: 'seed_att_1',
      title: 'Após drama com visto, mãe do goleiro Vozinha pode realizar sonho de acompanhar filho na Copa de 2026',
      summary: 'Destaque absoluto de Cabo Verde, arqueiro de elite ganha o apoio de investidores privados e marcas patrocinadoras internacionais em mobilização emergencial de alta relevância para viabilizar viagem aos Estados Unidos.',
      publishedAt: '2026-06-17T11:00:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=800&h=500',
      categoryId: 'cat_2', // Mercado
      isExclusive: false,
      readingTime: 4,
      slug: 'vozinha-copa-visto-mae-lucro'
    },
    {
      id: 'seed_att_2',
      title: 'Confira trecho de música oficial que marca o retorno triunfal de Simaria aos palcos',
      summary: 'Após 4 anos focada em estruturação societária de sua marca e investimentos imobiliários, a renomada artista brasileira prepara o retorno oficial aos holofotes da indústria no segundo semestre de 2026, com parcerias globais de streaming.',
      publishedAt: '2026-06-17T10:30:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800&h=500',
      categoryId: 'cat_1', // Negócios
      isExclusive: true,
      readingTime: 5,
      slug: 'retorno-simaria-exclusivo-holding'
    },
    {
      id: 'seed_att_3',
      title: 'Simaria confirma volta estratégica aos palcos com lançamento de catálogo previsto para o 2º semestre',
      summary: 'A cantora e compositora estava afastada dos palcos profissionalmente desde o fim da aclamada dupla em 2022. Agora, com nova equipe de assessoria executiva e investimentos, ela foca em selos digitais de alto rendimento.',
      publishedAt: '2026-06-17T10:00:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800&h=500',
      categoryId: 'cat_1', // Negócios
      isExclusive: true,
      readingTime: 3,
      slug: 'simaria-novo-contrato-digital'
    },
    {
      id: 'seed_att_4',
      title: 'Influenciador envolvido em investigações, Buzeira continua sob custódia legal após parecer definitivo do STJ',
      summary: 'O influenciador digital e investidor de risco é alvo principal da Operação Narco Bet, que apura volumosos esquemas de lavagem de dinheiro, fluxos bilionários em publicidade não declarada de palpites esportivos e sonegação fiscal de grande porte.',
      publishedAt: '2026-06-17T09:30:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800&h=500',
      categoryId: 'cat_3', // Investimentos
      isExclusive: false,
      readingTime: 4,
      slug: 'buzeira-stj-operacao-narco-bet'
    }
  ];

  // Dynamically resolve left feed: grab published posts
  const sortedByDate = [...published].sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
  
  // Use user posts if they exist, or fill up with our seed items to keep layout perfect
  const attachedFeedPosts = sortedByDate.length >= 4 
    ? sortedByDate.slice(0, 4) 
    : [
        ...sortedByDate,
        ...defaultAttachedSeed.slice(0, 4 - sortedByDate.length)
      ];

  // 2. DYNAMIC SIDEBAR RESOLUTION ("MAIS POPULARES"): Sorted by Views
  const sortedByViews = [...published].sort((a, b) => (b.views || 0) - (a.views || 0));

  // Seed default items for popular sidebar if database has fewer popular articles
  const defaultPopularSeed = [
    {
      id: 'seed_pop_h',
      title: 'Metrô de São Paulo avalia plano estratégico de R$ 4,2 bilhões para robotização e segurança física de passageiros',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600&h=400',
      categoryId: 'cat_2',
      views: 124000,
      slug: 'metro-sp-plano-diretor'
    },
    {
      id: 'seed_pop_1',
      title: 'Vítima de ataque brutal no Metrô de São Paulo relata os minutos de drama em depoimento à polícia e cobra monitoramento ativo de concessionárias',
      imageUrl: '',
      slug: 'metro-vitima-ataque-depoimento',
      isExclusive: false,
      views: 112000
    },
    {
      id: 'seed_pop_2',
      title: 'Médicos associados denunciam atrasos graves em repasses milionários e salários de unidades prisionais de segurança máxima gerenciadas por OSs',
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=150&h=150',
      slug: 'medicos-atrasos-pagamento',
      isExclusive: false,
      views: 98000
    },
    {
      id: 'seed_pop_3',
      title: '"Não vai nem à esquina": segurança tática ostensiva e monitoramento fechado marcam rotina de réus de destaque nacional após decisão provisória de soltura',
      imageUrl: 'https://images.unsplash.com/photo-1557597774-9d2739f85a94?auto=format&fit=crop&q=80&w=150&h=150',
      slug: 'rotina-reus-soltura-stj',
      isExclusive: true,
      views: 82000
    },
    {
      id: 'seed_pop_4',
      title: 'De olho no mercado bilionário de imagem: saiba quem são os atletas internacionais considerados os mais valorizados por patrocínios e marcas na Copa',
      imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=150&h=150',
      slug: 'jogadores-copa-patrocinios-ricos',
      isExclusive: false,
      views: 64000
    },
    {
      id: 'seed_pop_5',
      title: 'Assessoria jurídica de Isis Valverde rebate ação trabalhista litigiosa e aponta indícios de campanha de difamação digital planejada contra atriz',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
      slug: 'isis-valverde-acao-trabalhista',
      isExclusive: true,
      views: 52000
    }
  ];

  // Resolve popularHighlight (Post #1)
  const popularHighlight = sortedByViews.length > 0 
    ? sortedByViews[0] 
    : defaultPopularSeed[0];

  // Resolve popularItems (Ranks 1 to 5)
  // We want a list of 5 items
  const popularItemsResult: any[] = [];
  
  // Make list from sortedByViews
  const remainingLivePopular = sortedByViews.slice(1, 6);
  remainingLivePopular.forEach((post, i) => {
    popularItemsResult.push({
      id: post.id,
      rank: i + 1,
      title: post.title,
      imageUrl: post.imageUrl || '',
      slug: post.slug,
      isExclusive: post.isExclusive || false,
      views: post.views
    });
  });

  // Backfill with defaultPopularSeed if we have fewer than 5 items
  if (popularItemsResult.length < 5) {
    const needed = 5 - popularItemsResult.length;
    // Map defaultPopularSeed items starting from index 1 (since index 0 is highlight)
    const seedSlice = defaultPopularSeed.slice(1, 1 + needed);
    seedSlice.forEach((seed) => {
      popularItemsResult.push({
        id: seed.id,
        rank: popularItemsResult.length + 1,
        title: seed.title,
        imageUrl: seed.imageUrl,
        slug: seed.slug,
        isExclusive: seed.isExclusive,
        views: seed.views
      });
    });
  }

  return (
    <div id="premium-attached-editorial-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 pb-8">
      
      {/* 1. LEFT COLUMN: LUXURY EXPANDED CARDS FEED (Feeds Horizontais com Capas e Badges Exclusivos) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-luxury-gray-200 pb-3 mb-2">
          <Newspaper className="text-gold-400" size={18} />
          <h2 className="font-serif font-black text-lg md:text-xl text-white uppercase tracking-wider">
            Últimas do Portal • Destaques Além do Bilhão
          </h2>
        </div>

        <div className="space-y-6">
          {attachedFeedPosts.map((post) => (
            <div 
              key={post.id}
              onClick={() => onNavigate('article', post.slug)}
              className="group cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-5 p-4.5 bg-luxury-gray-100/50 hover:bg-luxury-gray-100 rounded-xl border border-luxury-gray-200/50 hover:border-gold-450/40 hover:shadow-[0_4px_24px_rgba(212,175,55,0.04)] transition duration-300"
            >
              {/* Image thumbnail Column */}
              <div className="md:col-span-4 relative aspect-[4/3] rounded-lg overflow-hidden shrink-0 border border-luxury-gray-200/60">
                <img 
                  src={post.imageUrl || 'https://picsum.photos/id/1070/600/400'} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                />
                
                {/* Exclusive badge overlay on image exactly as in screenshot of Simaria return */}
                {post.isExclusive && (
                  <div className="absolute top-2.5 left-2.5 bg-red-600 text-white font-mono text-[9px] font-black tracking-widest px-2.5 py-1 rounded shadow-md border border-white/10 uppercase flex items-center gap-1">
                    <Sparkles size={8} className="text-gold-300 animate-spin" />
                    <span>EXCLUSIVO</span>
                  </div>
                )}

                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-gold-300 font-mono text-[8px] font-bold px-1.5 py-0.5 rounded">
                  {getPostCategoryName(post.categoryId) || 'Negócios'}
                </div>
              </div>

              {/* Text specifications Column */}
              <div className="md:col-span-8 flex flex-col justify-between space-y-3.5">
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold text-luxury-gray-400">
                    {post.publishedAt ? formatDateStr(post.publishedAt) : 'Recente'}
                  </span>
                  
                  <h3 className="font-serif font-black text-sm md:text-base text-white group-hover:text-gold-400 leading-snug transition duration-300">
                    {post.title}
                  </h3>
                  
                  <p className="text-[11px] md:text-xs text-luxury-gray-300 font-sans leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-luxury-gray-550 border-t border-luxury-gray-200/25 pt-2">
                  <div className="flex items-center gap-1 text-gold-450 font-bold">
                    <span>Leitura recomendada: {post.readingTime || 3} min</span>
                  </div>
                  <span className="text-luxury-gray-405 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 text-[9px]">
                    Ler Matéria Completa <ChevronRight size={10} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. RIGHT COLUMN: ASYMMETRICAL "MAIS POPULARES" SIDEBAR LAYOUT */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* ASYMMETREICAL SHARP BLACK BANNER TICKET: "MAIS POPULARES" */}
        <div className="relative">
          <div className="bg-luxury-gray-950 border-l-4 border-gold-400 py-3.5 px-5 select-none transform -skew-x-6 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2 transform skew-x-6">
              <Flame size={15} className="text-gold-400 animate-bounce" />
              <h3 className="font-serif font-black text-xs text-white uppercase tracking-widest">
                MAIS POPULARES
              </h3>
            </div>
            <span className="text-[8px] font-mono text-gold-450 uppercase animate-pulse transform skew-x-6">TRENDING</span>
          </div>
        </div>

        {/* POPULAR FEED CONTAINER */}
        <div className="space-y-4 pt-1">
          
          {/* Highlight Popular Item with Wide Aspect Capa Image (Top Rank) */}
          {popularHighlight && (
            <div 
              onClick={() => onNavigate('article', popularHighlight.slug)}
              className="group cursor-pointer bg-luxury-gray-100/40 hover:bg-luxury-gray-100 rounded-xl overflow-hidden border border-luxury-gray-200/50 transition duration-300"
            >
              <div className="aspect-[16/10] w-full relative overflow-hidden">
                <img 
                  src={popularHighlight.imageUrl || 'https://picsum.photos/id/1070/600/400'} 
                  alt="" 
                  className="w-full h-full object-cover group-hover:scale-101 transition duration-500"
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                />
                <span className="absolute top-2.5 left-2.5 bg-gold-400 text-black font-mono text-[8px] font-black tracking-widest px-2 py-0.5 rounded uppercase">
                  Top Cobertura
                </span>
                
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-[9px] font-mono text-white px-2 py-0.5 rounded flex items-center gap-1">
                  <Eye size={10} className="text-gold-300" />
                  <span>{popularHighlight.views ? popularHighlight.views.toLocaleString('pt-BR') : '124K'} v</span>
                </div>
              </div>
              
              <div className="p-4 flex gap-3.5 items-start">
                <span className="font-serif font-black text-3xl md:text-4xl text-gold-400 leading-none mr-1 select-none">
                  1
                </span>
                <div className="space-y-1">
                  <span className="text-[8px] font-mono font-bold tracking-wider text-luxury-gray-500 uppercase">
                    {getPostCategoryName(popularHighlight.categoryId) || 'GERAL'}
                  </span>
                  <p className="font-sans font-bold text-xs text-white group-hover:text-gold-400 leading-snug transition duration-300 line-clamp-3">
                    {popularHighlight.title}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Numbered layout listings corresponding to items 1, 2, 3, 4, 5 (Items 2-5 has thumbnails) */}
          <div className="divide-y divide-luxury-gray-200/40 space-y-3.5">
            {popularItemsResult.map((item) => (
              <div 
                key={item.id}
                onClick={() => onNavigate('article', item.slug)}
                className="group cursor-pointer flex gap-4 pt-3.5 items-start first:pt-0 transition duration-300"
              >
                {/* Ranking Digit */}
                <span className="font-serif font-black text-3xl text-gold-400 leading-none select-none w-6 text-center">
                  {item.rank + 1}
                </span>

                {/* Title */}
                <div className="flex-1 space-y-1">
                  <h4 className="font-sans font-bold text-[11px] md:text-xs text-white group-hover:text-gold-300 leading-snug transition line-clamp-3">
                    {item.title}
                  </h4>
                  <span className="text-[8px] font-mono text-luxury-gray-400 block font-semibold">
                    {item.views ? `${item.views.toLocaleString('pt-BR')} visualizações hoje` : 'Destaque editorial'}
                  </span>
                </div>

                {/* Optional thumbnail column matching screenshot (Item 1 has no thumbnail, 2-5 has small thumbnail) */}
                {item.imageUrl && (
                  <div className="relative w-16 h-12 rounded overflow-hidden border border-luxury-gray-200/40 shrink-0 self-center">
                    <img 
                      src={item.imageUrl} 
                      alt="" 
                      className="w-full h-full object-cover group-hover:scale-104 transition duration-500"
                      referrerPolicy="no-referrer"
                      onError={handleImageError}
                    />
                    
                    {/* Tiny exclusive overlay tag inside thumbnails */}
                    {item.isExclusive && (
                      <div className="absolute top-0.5 left-0.5 bg-red-650 text-white font-mono text-[6px] px-1 py-0.2 rounded font-black max-w-full truncate scale-90 border border-white/5">
                        EXC
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* DESTAQUE DO PATROCINADOR DE LUXO */}
        <div className="bg-gradient-to-br from-luxury-gray-100 to-luxury-gray-900 p-5 rounded-xl border border-gold-550/20 space-y-3.5 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold-400/5 blur-2xl rounded-full"></div>
          <Award className="text-gold-400 mx-auto animate-pulse" size={20} />
          <span className="text-[9px] font-mono font-bold text-gold-400 uppercase tracking-[0.25em] block">Clube Além do Bilhão</span>
          <h4 className="font-serif font-black text-xs text-white uppercase tracking-wider">
            PREMIUM INTELLIGENCE HUB
          </h4>
          <p className="text-[10px] text-luxury-gray-400 leading-relaxed font-sans">
            Tenha acesso prioritário a relatórios de valuation, fusões, bastidores de capital de risco e insights exclusivos de multinacionais e herdeiros de agronegócios.
          </p>
          <button 
            onClick={() => {
              alert('Obrigado pelo seu interesse no hub executivo Além do Bilhão! O onboarding para novos investidores está temporariamente restrito para manter o alto nível de atendimento.');
            }}
            className="w-full bg-gold-400 hover:bg-gold-500 text-black font-sans font-bold text-[10px] uppercase py-2 rounded-md transition duration-300"
          >
            Acessar Exclusive Reports
          </button>
        </div>

      </div>

    </div>
  );
}
