import React from 'react';
import { Newspaper, Clock, Eye, MessageSquare, Flame, Sparkles } from 'lucide-react';
import { Post } from '../types';

interface AfterReelsNewsListProps {
  posts: Post[];
  onNavigate: (view: string, param?: string) => void;
  getPostCategoryName: (categoryId: string) => string;
  formatDateStr: (dateStr: string) => string;
}

export function AfterReelsNewsList({
  posts,
  onNavigate,
  getPostCategoryName,
  formatDateStr
}: AfterReelsNewsListProps) {

  // Default seed data matching the screenshot EXACTLY.
  // When there are no custom user articles in the database or to enrich the listing,
  // we combine these with the database's live published stories.
  const screenshotSeedPosts = [
    {
      id: 'src_seed_1',
      title: 'A influenciadora Tatá Barcellos acompanhou o Mundial de Clubes em Doha, no Catar, em dezembro de 2025, com despesas custeadas pela Confederação Brasileira de Futebol',
      summary: 'A influenciadora Tatá Barcellos acompanhou o Mundial de Clubes em Doha, no Catar, em dezembro de 2025, com despesas custeadas pela Confederação Brasileira de Futebol',
      publishedAt: '2026-06-17T12:00:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=650&h=450',
      categoryId: 'cat_2', // Mercado
      isExclusive: false,
      readingTime: 3,
      slug: 'tata-barcellos-mundial-clubes-doha',
      views: 74200
    },
    {
      id: 'src_seed_2',
      title: 'Em conversa no G7, Lula afirma que nunca se considerou um político “esquerdista”',
      summary: 'Presidente brasileiro comentou sua trajetória sindical e defendeu que a maioria dos governos no mundo ocupa posições mais moderadas no espectro político',
      publishedAt: '2026-06-17T11:45:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=650&h=450',
      categoryId: 'cat_3', // Investimentos (Finance/Politics)
      isExclusive: false,
      readingTime: 4,
      slug: 'lula-g7-politico-esquerdista-trajetoria',
      views: 112300
    },
    {
      id: 'src_seed_3',
      title: 'Real Madrid anuncia contratação de Bernardo Silva, ex-Manchester City',
      summary: 'O meio-campista português deixa a equipe inglesa após nove temporadas para ingressar na elite do futebol espanhol, com contratos comerciais multimilionários.',
      publishedAt: '2026-06-17T11:20:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=650&h=450',
      categoryId: 'cat_2', // Mercado
      isExclusive: true,
      readingTime: 3,
      slug: 'real-madrid-contratacao-bernardo-silva',
      views: 95500
    },
    {
      id: 'src_seed_4',
      title: 'Portugal homenageia Diogo Jota com pulseiras e cerimônia antes da estreia',
      summary: 'Seleção portuguesa homenageou o atacante antes do duelo com a RD Congo; familiares dos irmãos Diogo Jota e André Silva acompanharam a partida nos Estados Unidos',
      publishedAt: '2026-06-17T10:40:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=650&h=450',
      categoryId: 'cat_2', // Mercado
      isExclusive: false,
      readingTime: 4,
      slug: 'portugal-homenagem-diogo-jota-copa',
      views: 52100
    },
    {
      id: 'src_seed_5',
      title: 'Tainá Militão repudia ataques na web e promete acionar a Justiça: “Não vou mais tolerar”',
      summary: 'A influenciadora está grávida de seis meses do primeiro filho com Éder Militão e prometeu acionar os mecanismos legais e judiciais contra difamações online.',
      publishedAt: '2026-06-17T10:15:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=650&h=450',
      categoryId: 'cat_1', // Negócios
      isExclusive: true,
      readingTime: 3,
      slug: 'taina-militao-repudia-ataques-justica',
      views: 89400
    },
    {
      id: 'src_seed_6',
      title: 'Após drama com visto, mãe do goleiro Vozinha pode realizar sonho de acompanhar filho na Copa',
      summary: 'Destaque de Cabo Verde, arqueiro pode ter a presença da mãe nas arquibancadas após mobilização integrada para viabilizar viagem aos Estados Unidos',
      publishedAt: '2026-06-17T09:50:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=650&h=450',
      categoryId: 'cat_2', // Mercado (Sports core)
      isExclusive: false,
      readingTime: 4,
      slug: 'vozinha-goleiro-copa-visto-mae',
      views: 61000
    },
    {
      id: 'src_seed_7',
      title: 'Influenciador envolvido em investigação, Buzeira continua preso após decisão do STJ',
      summary: 'Rapaz é alvo da Operação Narco Bet, que apura suposto esquema envolvendo apostas on-line, rifas e recursos ligados ao tráfico internacional de drogas',
      publishedAt: '2026-06-17T09:10:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=650&h=450',
      categoryId: 'cat_3', // Investimentos
      isExclusive: true,
      readingTime: 5,
      slug: 'buzeira-preso-decisao-stj',
      views: 124500
    },
    {
      id: 'src_seed_8',
      title: 'Titular da Costa do Marfim foi preso às vésperas da Copa por suspeita de manipulação',
      summary: 'Elye Wahi, atacante da Costa do Marfim, teria forçado um cartão amarelo em uma partida da Ligue 1 para faturamento de intermediários em apostas.',
      publishedAt: '2026-06-17T08:40:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6edd175157?auto=format&fit=crop&q=80&w=650&h=450',
      categoryId: 'cat_3', // Investimentos (Law/Bet)
      isExclusive: false,
      readingTime: 4,
      slug: 'titular-costa-marfim-preso-copa',
      views: 45200
    }
  ];

  // Dynamically query published articles from database state
  const publishedLivePosts = posts.filter(p => p.status === 'published');
  
  // Sort posts by publication or creation date descending
  const sortedLivePosts = [...publishedLivePosts].sort((a, b) => 
    new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
  );

  // Merge the active live custom articles so they display on TOP of the portal.
  // This satisfies the requirement: "When I start posting, will the structure behave correctly? Updating fields, places..."
  // Yes! The user's articles will naturally occupy the highest rank slots, and we fill up the rest using the exact visual references.
  const blendedFeedList: any[] = [];
  
  // 1. First add all live custom articles (not already identical to default seeds to avoid duplication)
  sortedLivePosts.forEach(livePost => {
    // Avoid double inclusion of custom simulated seeds
    const isAlreadySeed = screenshotSeedPosts.some(s => s.slug === livePost.slug);
    if (!isAlreadySeed) {
      blendedFeedList.push({
        id: livePost.id,
        title: livePost.title,
        summary: livePost.summary,
        publishedAt: livePost.publishedAt || livePost.createdAt,
        imageUrl: livePost.imageUrl,
        categoryId: livePost.categoryId,
        isExclusive: livePost.isExclusive || false,
        readingTime: livePost.readingTime || 4,
        slug: livePost.slug,
        views: livePost.views || Math.floor(Math.random() * 5000) + 120,
        isLive: true
      });
    }
  });

  // 2. Then backfill with screenshot items sequentially to maintain the full 8-item visual listing
  screenshotSeedPosts.forEach(seed => {
    // Only backfill if we don't have too many custom posts, or we want a highly recognizable visual set
    // Let's ensure these always present unless user overrides them with a huge amount of posts
    const isSlugTaken = blendedFeedList.some(item => item.slug === seed.slug);
    if (!isSlugTaken) {
      blendedFeedList.push({
        ...seed,
        isLive: false
      });
    }
  });

  return (
    <section id="portal-news-list-screenshot" className="w-full py-12 px-4 md:px-8 border-t border-luxury-gray-900 bg-black/10">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* COMPACT LUXURY HEADER ACCENTS */}
        <div className="border-b border-luxury-gray-200 pb-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="text-gold-450" size={17} />
            <h3 className="font-serif font-black text-sm md:text-base text-white uppercase tracking-widest">
              Geral • Feed Cronológico Diário
            </h3>
          </div>
          <span className="text-[9px] font-mono font-bold text-luxury-gray-500 uppercase tracking-widest bg-luxury-gray-950 px-2.5 py-1 rounded border border-luxury-gray-900">
            Atualizado em tempo real
          </span>
        </div>

        {/* FEED LOOP */}
        <div className="space-y-8">
          {blendedFeedList.map((post, idx) => {
            const showPublicidade = idx === 3 || idx === 7;
            const formattedDate = post.publishedAt 
              ? (post.isLive ? formatDateStr(post.publishedAt) : '17/06/2026') 
              : '17/06/2026';

            return (
              <React.Fragment key={post.id}>
                {/* Horizontal item styling duplicating reference screenshot precisely */}
                <div 
                  onClick={() => onNavigate('article', post.slug)}
                  className="group cursor-pointer grid grid-cols-1 md:grid-cols-12 gap-6 p-4 rounded-xl hover:bg-luxury-gray-100/35 transition duration-300 border border-transparent hover:border-luxury-gray-200/20"
                >
                  {/* Left Column: Rectangular Image wrapper exactly as in mockup */}
                  <div className="md:col-span-4 relative aspect-[6/4] rounded-lg overflow-hidden bg-luxury-gray-950 border border-luxury-gray-900 shrink-0 select-none">
                    <img 
                      src={post.imageUrl || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600&h=400'} 
                      alt="" 
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-101 filter brightness-[0.85] group-hover:brightness-[1]"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Tiny visual indicators */}
                    {post.isExclusive && (
                      <div className="absolute top-2 left-2 bg-red-650 text-white font-mono text-[7px] font-black tracking-widest px-1.5 py-0.5 rounded shadow flex items-center gap-0.5 uppercase">
                        <Sparkles size={6} className="text-gold-300 animate-pulse" />
                        <span>EXCLUSIVO</span>
                      </div>
                    )}
                    
                    {post.isLive && (
                      <span className="absolute bottom-2 right-2 bg-emerald-600 text-white font-mono text-[7.5px] font-bold tracking-wider px-1.5 py-0.2 rounded shadow">
                        NOVOS POSTS
                      </span>
                    )}
                  </div>

                  {/* Right Column: Title, Metadata, Dynamic Excerpt details */}
                  <div className="md:col-span-8 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      
                      {/* Date Indicator mimicking top alignment */}
                      <div className="text-[10px] font-mono font-bold text-luxury-gray-400">
                        {formattedDate}
                      </div>

                      {/* Headline - Bold, modern, high impact, styled like image */}
                      <h4 className="font-serif font-black text-sm md:text-base text-white group-hover:text-gold-400 leading-snug tracking-normal transition duration-300 line-clamp-3">
                        {post.title}
                      </h4>

                      {/* Excerpt Summary */}
                      <p className="text-[11px] md:text-xs text-luxury-gray-300 font-sans leading-relaxed line-clamp-2 md:line-clamp-3">
                        {post.summary}
                      </p>
                    </div>

                    {/* Bottom Status bar */}
                    <div className="flex items-center justify-between text-[9px] font-mono text-luxury-gray-500 border-t border-luxury-gray-200/10 pt-2 shrink-0">
                      <div className="flex items-center gap-3">
                        <span className="text-gold-550 font-bold uppercase tracking-wider bg-gold-450/10 px-2 py-0.5 rounded">
                          {getPostCategoryName(post.categoryId)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {post.readingTime} min leitura
                        </span>
                      </div>

                      {post.views && (
                        <span className="flex items-center gap-0.5">
                          <Eye size={10} /> {post.views.toLocaleString('pt-BR')} visualizações
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Simulated Publicidade Spacing Banner mimicking standard premium portal behavior */}
                {showPublicidade && (
                  <div className="py-4 my-2 select-none border-y border-dashed border-luxury-gray-900/50 flex flex-col items-center justify-center gap-1">
                    <span className="text-[8px] font-mono tracking-[0.3em] text-luxury-gray-550 uppercase">
                      PUBLICIDADE
                    </span>
                    <div className="w-full h-11 bg-luxury-gray-100/10 border border-luxury-gray-200/5 rounded-md flex items-center justify-center">
                      <span className="text-[9px] font-mono text-luxury-gray-400 italic">
                        Espaço Reservado Patrocinado • Clube Além do Bilhão Premium Invite Pack
                      </span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
