/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ArticleView from './components/ArticleView';
import AdminPanel from './components/AdminPanel';
import { ColumnistsSection } from './components/ColumnistsSection';
import { InstagramReelsSection } from './components/InstagramReelsSection';
import { EditorialAttachedFeed } from './components/EditorialAttachedFeed';
import { AfterReelsNewsList } from './components/AfterReelsNewsList';
import { Post, Category } from './types';
import { 
  getPosts, 
  getCategories, 
  initDB, 
  getLoggedUser,
  syncFromSupabase
} from './utils/db';
import { 
  TrendingUp, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  Award,
  Calendar,
  Clock
} from 'lucide-react';

export default function App() {
  // Navigation states: 'home' | 'category' | 'article' | 'admin-login' | 'admin-dashboard'
  const [view, setView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string>(''); // slug for categories, id or slug for articles
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Storage lists
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Auto boot the client storage relational DB
  useEffect(() => {
    initDB();
    reloadDatasets();

    // Trigger asynchronous download sync from Supabase on start
    syncFromSupabase().then(() => {
      reloadDatasets();
    });

    const handleSyncComplete = () => {
      reloadDatasets();
    };
    window.addEventListener('supabase-sync-completed', handleSyncComplete);

    // Catch routing dynamically via popstate (browser back/forward) & hashes
    const handleUrlAndHashRouting = () => {
      const path = window.location.pathname;
      const hStr = window.location.hash;

      if (path === '/admin' || hStr === '#/admin' || hStr === '#admin') {
        const logged = getLoggedUser();
        if (logged) {
          setView('admin-dashboard');
        } else {
          setView('admin-login');
        }
      } else if (path.startsWith('/category/')) {
        const slug = path.replace('/category/', '');
        setView('category');
        setViewParam(slug);
      } else if (path.startsWith('/article/')) {
        const slug = path.replace('/article/', '');
        setView('article');
        setViewParam(slug);
      } else {
        setView('home');
      }
    };

    handleUrlAndHashRouting();
    window.addEventListener('hashchange', handleUrlAndHashRouting);
    window.addEventListener('popstate', handleUrlAndHashRouting);
    
    // Listen for state changes to synchronize view on session change
    const handleAuthMod = () => {
      const path = window.location.pathname;
      const hStr = window.location.hash;
      if (path === '/admin' || hStr === '#/admin' || hStr === '#admin') {
        const logged = getLoggedUser();
        if (logged) {
          setView('admin-dashboard');
        } else {
          setView('admin-login');
        }
      }
    };
    window.addEventListener('auth-session-modified', handleAuthMod);

    return () => {
      window.removeEventListener('hashchange', handleUrlAndHashRouting);
      window.removeEventListener('popstate', handleUrlAndHashRouting);
      window.removeEventListener('auth-session-modified', handleAuthMod);
      window.removeEventListener('supabase-sync-completed', handleSyncComplete);
    };
  }, []);

  const reloadDatasets = () => {
    setPosts(getPosts());
    setCategories(getCategories());
  };

  const handleNavigate = (newView: string, param?: string) => {
    setSearchQuery(''); // Clear search on menu clicking
    reloadDatasets(); // Fetch fresh edits from local storage DB
    setView(newView);
    if (param) setViewParam(param);

    // Elegant browser history sync so address bar shows pristine routes
    let targetPath = '/';
    if (newView === 'admin-dashboard' || newView === 'admin-login') {
      targetPath = '/admin';
    } else if (newView === 'category' && param) {
      targetPath = `/category/${param}`;
    } else if (newView === 'article' && param) {
      targetPath = `/article/${param}`;
    }
    
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    
    // Scroll top seamlessly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (view !== 'home' && view !== 'category') {
      setView('home'); // Bring them back to the portal grid to see results
    }
  };

  // Format date helper
  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Published, sorted posts for public views
  const publishedPosts = posts.filter(p => p.status === 'published');

  // Filter listings based on search query or categories
  const searchedPosts = searchQuery.trim() === '' 
    ? publishedPosts 
    : publishedPosts.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const displayedPosts = view === 'category' 
    ? searchedPosts.filter(p => {
        const cat = categories.find(c => c.slug === viewParam);
        return p.categoryId === cat?.id;
      })
    : searchedPosts;

  const currentCategory = view === 'category' 
    ? categories.find(c => c.slug === viewParam) 
    : null;

  // --- CUSTOM ADAPTIVE PORTAL LAYOUT RESOLVER ---
  // 1. Identify the 'maior' featured article (Hero). If none labeled as 'maior' exists, fall back to first article in list.
  const featuredPost = searchedPosts.find(p => p.layoutPosition === 'maior') || searchedPosts[0];

  // 2. Filter other articles excluding the main hero
  const otherPosts = searchedPosts.filter(p => p.id !== featuredPost?.id);

  // 3. Collect explicit lane designations
  const explicitLeft = otherPosts.filter(p => p.layoutPosition === 'esquerda');
  const explicitCenter = otherPosts.filter(p => p.layoutPosition === 'meio');
  const explicitRight = otherPosts.filter(p => p.layoutPosition === 'direita');
  const explicitMinor = otherPosts.filter(p => p.layoutPosition === 'menor');

  // Any other post with unassigned / default layouts will be auto-distributed evenly across left, center, right to keep layout visually rich
  const unassignedHomePosts = otherPosts.filter(p => !p.layoutPosition || !['esquerda', 'meio', 'direita', 'menor', 'maior'].includes(p.layoutPosition));

  const finalLeft: typeof searchedPosts = [...explicitLeft];
  const finalCenter: typeof searchedPosts = [...explicitCenter];
  const finalRight: typeof searchedPosts = [...explicitRight];
  const finalMinor: typeof searchedPosts = [...explicitMinor];

  unassignedHomePosts.forEach((post, index) => {
    if (index % 3 === 0) {
      finalLeft.push(post);
    } else if (index % 3 === 1) {
      finalCenter.push(post);
    } else {
      finalRight.push(post);
    }
  });
  
  // Categorized sections displays
  const negociosPosts = publishedPosts.filter(p => p.categoryId === 'cat_1').slice(0, 3);
  const mercadoPosts = publishedPosts.filter(p => p.categoryId === 'cat_2').slice(0, 3);
  const tecnologiaPosts = publishedPosts.filter(p => p.categoryId === 'cat_4').slice(0, 3);
  const investimentosPosts = publishedPosts.filter(p => p.categoryId === 'cat_3').slice(0, 3);

  // ----------------------------------------------------
  // ROUTER: CONDITIONAL WORKSPACE SCREENS
  // ----------------------------------------------------
  
  // ADMIN CMS SYSTEM (Replaces primary layout when viewing Dashboard/Logs)
  if (view === 'admin-dashboard' || view === 'admin-login') {
    return (
      <AdminPanel 
        onNavigate={handleNavigate} 
        initialTab={view === 'admin-login' ? 'login' : 'dashboard'} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-luxury-gray-50 flex flex-col justify-between font-sans selection:bg-gold-500 selection:text-black">
      
      {/* 1. PUBLIC GENERAL HEADER */}
      <Header 
        onNavigate={handleNavigate} 
        activeView={view} 
        activeCategorySlug={view === 'category' ? viewParam : undefined}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />

      {/* 2. MAIN BLOG STAGE AREA */}
      <main className="flex-1">

        {/* SEARCH OVERLAY NOTIFIER HEADER */}
        {searchQuery && (
          <div className="w-full bg-luxury-gray-900 text-white py-8 border-b border-luxury-gray-800">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <span className="text-[10px] text-gold-400 font-mono tracking-wider block uppercase">Portal de Busca Inteligente</span>
              <h2 className="font-serif font-black text-xl md:text-3xl uppercase tracking-tight mt-1 text-white">
                Resultados para: <span className="font-serif italic text-gold-gradient font-bold">"{searchQuery}"</span>
              </h2>
              <span className="text-xs text-luxury-gray-400 block mt-2 font-mono">
                Localizados {displaysCountStr(displayedPosts.length)} no indexador de Além do Bilhão.
              </span>
            </div>
          </div>
        )}

        {/* VIEW A: HOME PAGE */}
        {view === 'home' && !searchQuery && (
          <div className="space-y-16 py-8 lg:py-12 max-w-7xl mx-auto px-4 lg:px-8">
            
            {/* 1. FEATURED ARTICLE GRAND HERO (Bloomberg style dual-column) */}
            {featuredPost && (
              <div 
                onClick={() => handleNavigate('article', featuredPost.slug)}
                className="group grid grid-cols-1 lg:grid-cols-12 gap-8 bg-luxury-gray-100 border border-luxury-gray-200 hover:border-gold-400/50 hover:shadow-[0_0_24px_rgba(212,175,55,0.1)] rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
              >
                {/* Visual Capa (Large) */}
                <div className="lg:col-span-7 h-[300px] md:h-[420px] overflow-hidden relative">
                  <img
                    src={featuredPost.imageUrl}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category tag bubble overlay */}
                  <div className="absolute top-4 left-4 bg-luxury-gray-950 font-bold font-mono tracking-[0.2em] text-[10px] text-gold-400 px-3 py-1.5 rounded uppercase shadow-lg border border-gold-550/25">
                    {featuredPost.layoutPosition === 'maior' ? '★ Destaque Principal (Maior)' : 'Destaque Principal'}
                  </div>
                </div>

                {/* Editorial text summaries */}
                <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-between bg-luxury-gray-100">
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-gold-400 uppercase block">
                      {getPostCategoryName(featuredPost.categoryId)}
                    </span>
                    
                    <h2 className="font-serif font-black text-2xl md:text-3xl text-white leading-[1.125] tracking-tight group-hover:text-gold-400 transition duration-350">
                      {featuredPost.title}
                    </h2>
                    
                    <p className="text-sm text-luxury-gray-300 leading-relaxed font-sans">
                      {featuredPost.summary}
                    </p>
                  </div>

                  {/* Authors profiles footer */}
                  <div className="border-t border-luxury-gray-200 pt-4 mt-6 flex items-center justify-between text-xs font-mono text-luxury-gray-400">
                    <div className="flex items-center gap-1">
                      <Award size={13} className="text-gold-400" />
                      <span className="font-sans font-bold text-luxury-gray-300 text-[11px] uppercase">Redação Corp</span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-luxury-gray-400" />
                      {featuredPost.readingTime} min leitura
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* NEW ATTACHED HIGH-TECH EDITORIAL STRUCTURE REPLICATING ATTACHMENT */}
            <EditorialAttachedFeed 
              onNavigate={handleNavigate} 
              posts={posts} 
              getPostCategoryName={getPostCategoryName} 
              formatDateStr={formatDateStr} 
            />

            {/* 2. THE CUSTOM THREE-COLUMN EDITORIAL PANELS (Esquerda | Meio | Direita) */}
            {(finalLeft.length > 0 || finalCenter.length > 0 || finalRight.length > 0) && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-luxury-gray-200 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={16} className="text-gold-400" />
                    <h3 className="font-serif font-black text-sm md:text-base text-white uppercase tracking-widest">Painel Editorial Distribuído</h3>
                  </div>
                  <span className="text-[10px] font-mono tracking-wider text-luxury-gray-400 uppercase">Esquerda • Meio • Direita</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* LEFT COLUMN */}
                  <div className="space-y-6 lg:border-r lg:border-luxury-gray-200/40 lg:pr-6">
                    <div className="flex items-center gap-2 border-b border-luxury-gray-200/20 pb-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>
                      <h4 className="font-mono text-[10px] font-black uppercase text-luxury-gray-300 tracking-wider">Coluna Esquerda</h4>
                    </div>
                    {finalLeft.length === 0 ? (
                      <p className="text-xs text-luxury-gray-400 italic">Sem artigos nesta coluna.</p>
                    ) : (
                      finalLeft.map(post => (
                        <div 
                          key={post.id}
                          onClick={() => handleNavigate('article', post.slug)}
                          className="group cursor-pointer space-y-3 block bg-luxury-gray-100/30 hover:bg-luxury-gray-100/60 p-4 border border-luxury-gray-200/40 rounded-xl transition duration-300"
                        >
                          <div className="aspect-video w-full overflow-hidden relative rounded-lg">
                            <img 
                              src={post.imageUrl} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-101 transition duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute bottom-2 left-2 bg-luxury-gray-950/90 backdrop-blur-sm text-gold-400 border border-white/5 font-mono text-[9px] font-bold tracking-widest px-2.5 py-1 rounded uppercase">
                              {getPostCategoryName(post.categoryId)}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-serif font-bold text-sm text-white group-hover:text-gold-400 transition leading-snug line-clamp-2">
                              {post.title}
                            </h5>
                            <p className="text-[11px] text-luxury-gray-300 leading-normal line-clamp-2 font-sans">
                              {post.summary}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[9px] font-mono text-luxury-gray-400 border-t border-luxury-gray-200/20 pt-2 mt-2">
                            <span className="text-gold-400/80 uppercase tracking-widest text-[8px] font-bold">[ Esquerda ]</span>
                            <span>{post.readingTime} min</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* CENTER COLUMN */}
                  <div className="space-y-6 lg:border-r lg:border-luxury-gray-200/40 lg:pr-6">
                    <div className="flex items-center gap-2 border-b border-luxury-gray-200/20 pb-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"></span>
                      <h4 className="font-mono text-[10px] font-black uppercase text-luxury-gray-300 tracking-wider">Coluna Central (Meio)</h4>
                    </div>
                    {finalCenter.length === 0 ? (
                      <p className="text-xs text-luxury-gray-400 italic">Sem artigos nesta coluna.</p>
                    ) : (
                      finalCenter.map(post => (
                        <div 
                          key={post.id}
                          onClick={() => handleNavigate('article', post.slug)}
                          className="group cursor-pointer space-y-3 block bg-luxury-gray-100/30 hover:bg-luxury-gray-100/60 p-4 border border-luxury-gray-200/40 rounded-xl transition duration-300"
                        >
                          <div className="aspect-video w-full overflow-hidden relative rounded-lg">
                            <img 
                              src={post.imageUrl} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-101 transition duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute bottom-2 left-2 bg-luxury-gray-950/90 backdrop-blur-sm text-gold-400 border border-white/5 font-mono text-[9px] font-bold tracking-widest px-2.5 py-1 rounded uppercase">
                              {getPostCategoryName(post.categoryId)}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-serif font-bold text-sm text-white group-hover:text-gold-400 transition leading-snug line-clamp-2">
                              {post.title}
                            </h5>
                            <p className="text-[11px] text-luxury-gray-300 leading-normal line-clamp-2 font-sans">
                              {post.summary}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[9px] font-mono text-luxury-gray-400 border-t border-luxury-gray-200/20 pt-2 mt-2">
                            <span className="text-gold-400/80 uppercase tracking-widest text-[8px] font-bold">[ Centro ]</span>
                            <span>{post.readingTime} min</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b border-luxury-gray-200/20 pb-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>
                      <h4 className="font-mono text-[10px] font-black uppercase text-luxury-gray-300 tracking-wider">Coluna Direita</h4>
                    </div>
                    {finalRight.length === 0 ? (
                      <p className="text-xs text-luxury-gray-400 italic">Sem artigos nesta coluna.</p>
                    ) : (
                      finalRight.map(post => (
                        <div 
                          key={post.id}
                          onClick={() => handleNavigate('article', post.slug)}
                          className="group cursor-pointer space-y-3 block bg-luxury-gray-100/30 hover:bg-luxury-gray-100/60 p-4 border border-luxury-gray-200/40 rounded-xl transition duration-300"
                        >
                          <div className="aspect-video w-full overflow-hidden relative rounded-lg">
                            <img 
                              src={post.imageUrl} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-101 transition duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute bottom-2 left-2 bg-luxury-gray-950/90 backdrop-blur-sm text-gold-400 border border-white/5 font-mono text-[9px] font-bold tracking-widest px-2.5 py-1 rounded uppercase">
                              {getPostCategoryName(post.categoryId)}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-serif font-bold text-sm text-white group-hover:text-gold-400 transition leading-snug line-clamp-2">
                              {post.title}
                            </h5>
                            <p className="text-[11px] text-luxury-gray-300 leading-normal line-clamp-2 font-sans">
                              {post.summary}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[9px] font-mono text-luxury-gray-400 border-t border-luxury-gray-200/20 pt-2 mt-2">
                            <span className="text-gold-400/80 uppercase tracking-widest text-[8px] font-bold">[ Direita ]</span>
                            <span>{post.readingTime} min</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* COLUMNISTS SLIDER SECTION (Replicating red banner in screenshot) */}
            <ColumnistsSection />

            {/* INSTAGRAM REELS SECTION (As requested by the user, mimicking YouTube Shorts attachment style) */}
            <InstagramReelsSection />

            {/* DYNAMIC ATTACHED SCREENSHOT-REPLICATING NEWS LIST */}
            <AfterReelsNewsList 
              posts={posts} 
              onNavigate={handleNavigate} 
              getPostCategoryName={getPostCategoryName} 
              formatDateStr={formatDateStr} 
            />

            {/* 3. MINOR SPECIAL FEED (Destaque Menor) */}
            {finalMinor.length > 0 && (
              <div className="space-y-6 pt-6">
                <div className="flex items-center justify-between border-b border-luxury-gray-200 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={15} className="text-gold-400 animate-spin" />
                    <h3 className="font-serif font-black text-sm md:text-base text-white uppercase tracking-widest">Destaques Menores / Leituras Rápidas</h3>
                  </div>
                  <span className="text-[10px] font-mono tracking-wider text-gold-400 uppercase font-black">Fast Read</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {finalMinor.map(post => (
                    <div 
                      key={post.id}
                      onClick={() => handleNavigate('article', post.slug)}
                      className="group cursor-pointer p-3.5 bg-luxury-gray-900 border border-luxury-gray-850 hover:border-gold-400/30 rounded-lg transition flex flex-col justify-between space-y-2.5"
                    >
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-mono text-gold-400 uppercase tracking-widest bg-luxury-gray-950 px-2 py-0.5 rounded border border-white/5">
                          {getPostCategoryName(post.categoryId)}
                        </span>
                        <h5 className="font-serif font-semibold text-xs text-white leading-normal group-hover:text-gold-400 line-clamp-2 transition mt-1.5 font-bold">
                          {post.title}
                        </h5>
                        <p className="text-[10px] text-luxury-gray-400 line-clamp-2 leading-relaxed">
                          {post.summary}
                        </p>
                      </div>
                      <div className="text-[8px] font-mono text-luxury-gray-500 flex items-center justify-between pt-1 border-t border-luxury-gray-850 animate-pulse">
                        <span>Leitura: {post.readingTime} min</span>
                        <span className="text-gold-400 font-bold uppercase">[ Menor ]</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


            {/* 3. BENTO SEGREGATED BY ROOT CORPORATE CATEGORIES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
              
              {/* Box A: NEGÓCIOS & MERCADO */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-luxury-gray-200 pb-2">
                  <h3 className="font-serif font-black text-sm text-white uppercase tracking-wider">Negócios & Mercado</h3>
                  <span onClick={() => handleNavigate('category', 'negocios')} className="text-[10px] font-mono text-gold-400 hover:text-gold-500 cursor-pointer transition uppercase font-bold flex items-center gap-0.5">
                    <span>Ver todos</span> <ChevronRight size={12} />
                  </span>
                </div>
                <div className="bg-luxury-gray-100 rounded-xl border border-luxury-gray-200 overflow-hidden divide-y divide-luxury-gray-200">
                  {negociosPosts.length === 0 ? (
                    <p className="p-4 text-xs italic text-luxury-gray-400">Conteúdo sendo preparado.</p>
                  ) : (
                    negociosPosts.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => handleNavigate('article', p.slug)}
                        className="p-4.5 hover:bg-luxury-gray-150 flex gap-4 cursor-pointer transition group"
                      >
                        <img src={p.imageUrl} className="w-16 h-12 object-cover rounded border border-luxury-gray-200 shrink-0" alt="" referrerPolicy="no-referrer" />
                        <div>
                          <h4 className="font-serif font-bold text-xs md:text-sm text-white group-hover:text-gold-400 transition leading-tight line-clamp-2">{p.title}</h4>
                          <span className="text-[10px] text-luxury-gray-400 font-mono block mt-1">{formatDateStr(p.publishedAt || p.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Box B: INVESTIMENTOS & TECNOLOGIA */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-luxury-gray-200 pb-2">
                  <h3 className="font-serif font-black text-sm text-white uppercase tracking-wider">Investimentos & Tecnologia</h3>
                  <span onClick={() => handleNavigate('category', 'tecnologia')} className="text-[10px] font-mono text-gold-400 hover:text-gold-500 cursor-pointer transition uppercase font-bold flex items-center gap-0.5">
                    <span>Ver todos</span> <ChevronRight size={12} />
                  </span>
                </div>
                <div className="bg-luxury-gray-100 rounded-xl border border-luxury-gray-200 overflow-hidden divide-y divide-luxury-gray-200">
                  {tecnologiaPosts.length === 0 ? (
                    <p className="p-4 text-xs italic text-luxury-gray-400">Conteúdo sendo preparado.</p>
                  ) : (
                    tecnologiaPosts.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => handleNavigate('article', p.slug)}
                        className="p-4.5 hover:bg-luxury-gray-150 flex gap-4 cursor-pointer transition group"
                      >
                        <img src={p.imageUrl} className="w-16 h-12 object-cover rounded border border-luxury-gray-200 shrink-0" alt="" referrerPolicy="no-referrer" />
                        <div>
                          <h4 className="font-serif font-bold text-xs md:text-sm text-white group-hover:text-gold-400 transition leading-tight line-clamp-2">{p.title}</h4>
                          <span className="text-[10px] text-luxury-gray-400 font-mono block mt-1">{formatDateStr(p.publishedAt || p.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VIEW B: CATEGORIES LIST INTERFACE OR SEARCH GRIDS */}
        {(view === 'category' || searchQuery) && (
          <div className="py-8 lg:py-16 max-w-7xl mx-auto px-4 lg:px-8 space-y-10">
            
            {/* Category summary header description */}
            {view === 'category' && currentCategory && (
              <div className="border-b border-luxury-gray-200 pb-6 mb-2">
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-gold-400 block uppercase">Canal De Notícias</span>
                <h1 className="font-serif font-black text-3xl md:text-4xl text-white uppercase mt-1 leading-none">
                  {currentCategory.name}
                </h1>
                <p className="text-xs md:text-sm text-luxury-gray-300 max-w-2xl leading-relaxed mt-2.5">
                  {currentCategory.description}
                </p>
              </div>
            )}

            {/* List entries */}
            {displayedPosts.length === 0 ? (
              <div className="text-center py-16 bg-luxury-gray-100 rounded-xl border border-dashed border-luxury-gray-200">
                <p className="text-sm text-luxury-gray-400 font-serif italic">
                  Não existem artigos de negócios publicados nesta categoria no momento.
                </p>
                <button 
                  onClick={() => handleNavigate('home')}
                  className="bg-gold-500 text-luxury-gray-950 font-bold px-4 py-2 rounded text-xs uppercase mt-4 hover:bg-gold-600 transition"
                >
                  Voltar ao Portal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
                {displayedPosts.map(post => (
                  <div 
                    key={post.id}
                    onClick={() => handleNavigate('article', post.slug)}
                    className="group bg-luxury-gray-100 border border-luxury-gray-205 hover:border-gold-400/55 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition flex flex-col justify-between"
                  >
                    <div className="aspect-video w-full overflow-hidden relative bg-luxury-gray-150">
                      <img 
                        src={post.imageUrl} 
                        alt="" 
                        className="w-full h-full object-cover group-hover:scale-101 transition duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 bg-luxury-gray-950 font-mono text-[9px] font-bold text-gold-400 px-2 py-0.5 rounded shadow border border-white/5">
                        {getPostCategoryName(post.categoryId)}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="font-serif font-bold text-base text-white leading-tight group-hover:text-gold-400 transition line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-luxury-gray-300 leading-relaxed font-sans line-clamp-2">
                          {post.summary}
                        </p>
                      </div>

                      <div className="border-t border-luxury-gray-200 pt-3 mt-5 flex items-center justify-between text-[10px] font-mono text-luxury-gray-400">
                        <span>{formatDateStr(post.publishedAt || post.createdAt)}</span>
                        <span>{post.readingTime} min leitura</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW C: FULL EDITORIAL ARTICLE DISCOVERY CONTAINER */}
        {view === 'article' && (
          <ArticleView 
            post={posts.find(p => p.slug === viewParam)!} 
            onNavigate={handleNavigate} 
          />
        )}

      </main>

      {/* 3. PUBLIC GENERAL FOOTER */}
      <Footer onNavigate={handleNavigate} />

    </div>
  );
}

// Low-level helper string mapper
function displaysCountStr(count: number): string {
  if (count === 0) return 'nenhum artigo';
  if (count === 1) return '1 relatório de negócios';
  return `${count} relatórios corporativos`;
}

function getPostCategoryName(catId: string) {
  // Direct matching mapping
  const cats: Record<string, string> = {
    cat_1: 'Negócios',
    cat_2: 'Mercado',
    cat_3: 'Investimentos',
    cat_4: 'Tecnologia',
    cat_5: 'Startups',
    cat_6: 'Liderança'
  };
  return cats[catId] || 'Editorial';
}
