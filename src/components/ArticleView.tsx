/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Copy, 
  MessageSquare, 
  ChevronRight, 
  Play, 
  Check,
  Award,
  Sparkles
} from 'lucide-react';
import { Post, Comment, User, Category } from '../types';
import { 
  getUserById, 
  getCategoryById, 
  getComments, 
  saveComment, 
  getPosts, 
  incrementPostViews 
} from '../utils/db';

interface ArticleViewProps {
  post: Post;
  onNavigate: (view: string, param?: string) => void;
}

export default function ArticleView({ post, onNavigate }: ArticleViewProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState<User | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  
  // Comment Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  
  // Interaction effects
  const [copiedLink, setCopiedLink] = useState(false);
  const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 120) + 40);
  const [liked, setLiked] = useState(false);

  // Load contextual relative nodes
  useEffect(() => {
    if (!post) return;
    
    // Register reading event
    incrementPostViews(post.id);
    
    const loadedComments = getComments(post.id);
    setComments(loadedComments);
    
    const loadedAuthor = getUserById(post.authorId);
    if (loadedAuthor) setAuthor(loadedAuthor);
    
    const loadedCategory = getCategoryById(post.categoryId);
    if (loadedCategory) setCategory(loadedCategory);

    // Smooth scroll top on transition
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Reset comment form
    setCommentSubmitted(false);
  }, [post]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !commentText.trim()) return;

    saveComment(post.id, name, email, commentText);
    setCommentSubmitted(true);
    setName('');
    setEmail('');
    setCommentText('');

    // Force reload comment list
    const updated = getComments(post.id);
    setComments(updated);
  };

  // Get related articles (same category, excluding current)
  const allPosts = getPosts();
  const related = allPosts
    .filter(p => p.categoryId === post.categoryId && p.id !== post.id && p.status === 'published')
    .slice(0, 3);

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

  return (
    <article id={`article-${post.id}`} className="min-h-screen bg-luxury-gray-50 py-8 lg:py-16 px-4 md:px-8 font-sans selection:bg-gold-500 selection:text-black">
      <div className="max-w-4xl mx-auto">
        
        {/* BREADCRUMB */}
        <div className="flex items-center gap-1.5 text-xs text-luxury-gray-400 font-mono uppercase tracking-wider mb-6">
          <span onClick={() => onNavigate('home')} className="hover:text-gold-400 cursor-pointer transition">Início</span>
          <ChevronRight size={10} className="text-luxury-gray-555" />
          {category && (
            <span onClick={() => onNavigate('category', category.slug)} className="hover:text-gold-400 cursor-pointer transition">
              {category.name}
            </span>
          )}
          <ChevronRight size={10} className="text-luxury-gray-555" />
          <span className="text-luxury-gray-500 truncate max-w-xs">{post.title}</span>
        </div>

        {/* HEADER INFORMATION */}
        <div className="border-b border-luxury-gray-200 pb-8 mb-8">
          
          {category && (
            <span 
              onClick={() => onNavigate('category', category.slug)}
              className="inline-block bg-luxury-gray-950 text-gold-400 font-mono text-[10px] font-bold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded mb-4 hover:bg-gold-500 hover:text-luxury-gray-950 cursor-pointer transition border border-gold-500/20"
            >
              {category.name}
            </span>
          )}

          <h1 className="font-serif font-black text-3xl md:text-4xl lg:text-5xl text-white leading-[1.125] tracking-tight mb-4">
            {post.title}
          </h1>

          <p className="text-base md:text-lg text-luxury-gray-300 font-medium leading-relaxed tracking-wide mb-6">
            {post.summary}
          </p>

          {/* EDITORIAL AUTHOR AND STATS PANEL */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              {author && (
                <img
                  src={author.avatarUrl}
                  alt={author.name}
                  className="w-11 h-11 rounded-full border border-gold-400/80 object-cover shrink-0"
                />
              )}
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">{author?.name || 'Redação'}</h3>
                <div className="flex items-center gap-2 text-[11px] text-luxury-gray-400 font-medium font-mono mt-0.5">
                  <span className="flex items-center gap-1"><Calendar size={12} className="text-gold-400" /> {formatDateStr(post.publishedAt || post.createdAt)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock size={12} className="text-gold-400" /> {post.readingTime} min de leitura</span>
                </div>
              </div>
            </div>

            {/* Micro Interaction Actions */}
            <div className="flex items-center gap-2 text-xs">
              <button 
                onClick={() => { setLiked(!liked); setLikesCount(p => liked ? p - 1 : p + 1); }}
                className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-full font-mono font-semibold transition ${
                  liked ? 'bg-gold-950/40 text-gold-400 border-gold-500/50' : 'bg-luxury-gray-100 hover:bg-luxury-gray-150 border-luxury-gray-200 text-luxury-gray-300'
                }`}
              >
                <span>👍</span>
                <span>{likesCount} Recomendar</span>
              </button>

              <button 
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 bg-luxury-gray-100 hover:bg-luxury-gray-150 border border-luxury-gray-200 px-3 py-1.5 rounded-full text-luxury-gray-300 transition"
                title="Copiar Link"
              >
                {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                <span className="font-mono font-semibold text-xs">{copiedLink ? 'Copiado' : 'Compartilhar'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* IMAGE COVER CONTAINER */}
        <div className="w-full relative overflow-hidden rounded-xl border border-luxury-gray-200 shadow-md mb-10 bg-luxury-gray-150">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-auto max-h-[500px] object-cover hover:scale-101 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-4 left-4 flex gap-1.5 bg-luxury-gray-950/80 backdrop-blur-sm px-3 py-1.5 rounded text-[10px] text-luxury-gray-400 font-mono">
            <span>© Autor Além do Bilhão</span>
          </div>
        </div>

        {/* DOUBLE COLUMN LAYOUT: SIDEBAR ACTIONS + RICH WEB CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          
          {/* Side Editorial Control Track */}
          <div className="lg:col-span-1 hidden lg:flex flex-col items-center gap-5 sticky top-28">
            <span className="text-[10px] font-mono font-bold text-luxury-gray-400 uppercase tracking-widest leading-none mb-1">Social</span>
            <button
              onClick={() => alert('Compartilhado no Facebook empresarial')}
              className="w-8 h-8 rounded-full bg-luxury-gray-100 border border-luxury-gray-200 flex items-center justify-center text-luxury-gray-300 hover:text-white hover:bg-sky-700 hover:border-sky-705 transition duration-300 transform hover:scale-110 shadow-sm"
              aria-label="Facebook share"
            >
              <Facebook size={14} />
            </button>
            <button
              onClick={() => alert('Compartilhado no Twitter Corporativo')}
              className="w-8 h-8 rounded-full bg-luxury-gray-100 border border-luxury-gray-200 flex items-center justify-center text-luxury-gray-300 hover:text-white hover:bg-neutral-800 hover:border-neutral-850 transition duration-300 transform hover:scale-110 shadow-sm"
              aria-label="Twitter share"
            >
              <Twitter size={14} />
            </button>
            <button
              onClick={() => alert('Compartilhado no Linkedin Executivo')}
              className="w-8 h-8 rounded-full bg-luxury-gray-100 border border-luxury-gray-200 flex items-center justify-center text-luxury-gray-300 hover:text-white hover:bg-blue-800 hover:border-blue-850 transition duration-300 transform hover:scale-110 shadow-sm"
              aria-label="Linkedin share"
            >
              <Linkedin size={14} />
            </button>
            <button
              onClick={handleCopyLink}
              className="w-8 h-8 rounded-full bg-luxury-gray-100 border border-luxury-gray-200 flex items-center justify-center text-luxury-gray-300 hover:text-white hover:bg-gold-500 hover:border-gold-500 transition duration-300 transform hover:scale-110 shadow-sm"
              title="Copiar URL"
            >
              {copiedLink ? <Check size={14} className="text-emerald-500" /> : <Copy size={13} />}
            </button>
          </div>

          {/* MAIN ARTICLE WEB CONTENT */}
          <div className="lg:col-span-11 max-w-none">
            
            {/* Dynamic AI Summary Highlight */}
            <div className="bg-gold-950/15 rounded-xl border border-gold-500/20 overflow-hidden mb-8 shadow-sm">
              <div className="bg-gold-950/30 border-b border-gold-500/25 px-5 py-3 flex items-center gap-2 text-xs font-bold text-gold-400 uppercase tracking-widest font-sans">
                <Sparkles size={14} className="text-gold-400 animate-pulse" />
                <span>Executive Summary Inteligente do Além do Bilhão</span>
              </div>
              <div className="p-5 text-sm text-luxury-gray-300 leading-relaxed font-sans space-y-2.5">
                <p className="font-semibold text-white">Assuntos-chave abordados neste relatório editorial:</p>
                <div className="flex items-start gap-2 text-[13px]">
                  <span className="text-gold-400 font-bold shrink-0">✔</span>
                  <span><strong>Estratégia Avançada:</strong> Reorganização imediata de capitais corporativos com foco em eficiência de caixa real.</span>
                </div>
                <div className="flex items-start gap-2 text-[13px]">
                  <span className="text-gold-400 font-bold shrink-0">✔</span>
                  <span><strong>Sinergia de Inovação:</strong> Integração profunda de copilotação executiva focada na eliminação de perdas operacionais insolúveis.</span>
                </div>
                <div className="flex items-start gap-2 text-[13px]">
                  <span className="text-gold-400 font-bold shrink-0">✔</span>
                  <span><strong>Métricas de Longo Prazo:</strong> Mudança de múltiplos puramente especulativos para dotações baseadas em saúde de balanço.</span>
                </div>
              </div>
            </div>

            {/* Post Rich HTML body from DB */}
            <div 
              className="article-content prose prose-stone prose-invert max-w-none text-luxury-gray-300 leading-relaxed font-sans select-text"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* VIDEO PLAYER CONTAINER (if exists) */}
            {post.videoUrl && (
              <div className="my-10 bg-luxury-gray-100 p-4 md:p-6 rounded-xl border border-luxury-gray-200 shadow-xl">
                <div className="flex items-center gap-2 text-gold-400 font-serif font-semibold text-sm mb-4 uppercase tracking-wider">
                  <Play size={16} className="text-gold-400 fill-gold-400" />
                  <span>Análise de Vídeo e Audiovisual Incorporado</span>
                </div>
                <div className="aspect-video w-full rounded-lg overflow-hidden border border-luxury-gray-200 bg-black">
                  <iframe
                    src={post.videoUrl}
                    title="Além do Bilhão Vídeo Incorporado"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* TAGS CLOUD ROW */}
            <div className="flex flex-wrap items-center gap-2 mt-8 py-4 border-t border-b border-luxury-gray-200">
              <span className="text-[11px] font-mono font-bold text-luxury-gray-400 uppercase tracking-widest mr-2">Tags:</span>
              {post.tags.map(tag => (
                <span 
                  key={tag}
                  className="bg-luxury-gray-100 hover:bg-gold-950/40 text-luxury-gray-300 hover:text-gold-400 text-xs px-3 py-1.5 rounded transition cursor-pointer border border-luxury-gray-200"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* AUTHOR BIO EXPANSION BAR */}
            {author && (
              <div className="bg-luxury-gray-100/40 rounded-xl border border-luxury-gray-200 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 mt-12">
                <img
                  src={author.avatarUrl}
                  alt={author.name}
                  className="w-16 h-16 rounded-full border border-gold-400 object-cover shadow"
                />
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-1.5">
                    <h4 className="font-serif font-black text-white text-base">{author.name}</h4>
                    <Award size={13} className="text-gold-4005" />
                  </div>
                  <span className="text-[10px] text-gold-400 uppercase tracking-widest font-mono font-bold block mt-0.5">{author.role}</span>
                  <p className="text-xs text-luxury-gray-300 leading-relaxed mt-2.5">
                    {author.bio || 'Membro do conselho editorial sênior e especializado da nossa revista executiva.'}
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* RELATED ARTICLES ROW (Forbes Style bento cards) */}
        {related.length > 0 && (
          <div className="border-t border-luxury-gray-200 pt-12 pb-8">
            <h3 className="font-serif font-black text-xl text-white mb-6 uppercase tracking-tight">Leituras Recomendadas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(p => (
                <div 
                  key={p.id}
                  onClick={() => onNavigate('article', p.slug)}
                  className="group bg-luxury-gray-100 rounded-lg overflow-hidden border border-luxury-gray-200 hover:border-gold-400/50 hover:shadow-md transition cursor-pointer"
                >
                  <div className="aspect-video w-full overflow-hidden relative bg-luxury-gray-150">
                    <img 
                      src={p.imageUrl} 
                      alt={p.title} 
                      className="w-full h-full object-cover group-hover:scale-101 transition duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4 bg-luxury-gray-100">
                    <span className="text-[9px] font-mono font-bold text-gold-400 uppercase tracking-widest">Recomendação</span>
                    <h4 className="font-serif font-bold text-xs md:text-sm text-white group-hover:text-gold-400 transition leading-snug tracking-tight mt-1 truncate-2-lines line-clamp-2">
                      {p.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INTERACTIVE COMMENTS SECTION AND REGISTRATION BOARD */}
        <div className="border-t border-luxury-gray-200 pt-12 mt-4">
          <div className="flex items-center gap-2 font-serif font-black text-xl text-white mb-8 uppercase tracking-tight">
            <MessageSquare className="text-gold-400" size={20} />
            <span>Comentários ({comments.filter(c=>c.status==='approved').length})</span>
          </div>

          {/* COMMENTS LIST */}
          <div className="space-y-6 mb-12">
            {comments.filter(c => c.status === 'approved').length === 0 ? (
              <p className="text-xs text-luxury-gray-400 font-mono italic text-center py-6 border border-dashed rounded-lg border-luxury-gray-200 bg-luxury-gray-100/30">
                Ainda não há comentários aprovados neste artigo. Seja o primeiro a opinar!
              </p>
            ) : (
              comments
                .filter(c => c.status === 'approved')
                .map(comment => (
                  <div key={comment.id} className="bg-luxury-gray-100 p-5 rounded-lg border border-luxury-gray-200 shadow-sm leading-relaxed">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gold-950/50 border border-gold-500/25 flex items-center justify-center font-bold text-xs text-gold-400">
                          {comment.authorName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white font-sans">{comment.authorName}</h4>
                          <span className="text-[10px] text-luxury-gray-400 font-mono">{formatDateStr(comment.createdAt)}</span>
                        </div>
                      </div>
                      <span className="bg-luxury-gray-150 text-luxury-gray-400 border border-luxury-gray-200 px-2 py-0.5 rounded text-[10px] font-mono">Leitor Certificado</span>
                    </div>
                    <p className="text-xs md:text-sm text-luxury-gray-200 font-sans pl-1">
                      {comment.content}
                    </p>
                  </div>
                ))
            )}
          </div>

          {/* ADD COMMENT FORM */}
          <div className="bg-luxury-gray-100 p-6 md:p-8 rounded-xl border border-luxury-gray-200 text-white shadow-lg">
            <h3 className="font-serif font-semibold text-lg text-gold-400 mb-2 font-serif">Comente sobre esta análise</h3>
            <p className="text-xs text-luxury-gray-400 mb-6 leading-relaxed">
              Sua opinião qualificada nutre debates construtivos de mercado. Todos os comentários enviados são submetidos à inteligência de filtragem e aprovação do painel de administração da redação.
            </p>

            {commentSubmitted ? (
              <div className="flex items-center gap-3 bg-gold-950/40 border border-gold-500/30 p-5 rounded-lg text-xs leading-relaxed text-gold-100 animate-fadeIn font-sans">
                <Check className="text-gold-400 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-sm text-gold-400 font-sans">Comentário Recebido!</h4>
                  <p className="text-[11px] mt-0.5 text-luxury-gray-300">
                    Sua mensagem foi enviada à fila de moderação dos administradores do Além do Bilhão. Assim que aprovada, aparecerá publicada acima.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePostComment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wider">Seu Nome *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dr. Roberto Alencar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-luxury-gray-950 border border-luxury-gray-200 focus:border-gold-500 rounded text-xs text-white px-4.5 py-3 outline-none transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wider">E-mail Profissional *</label>
                    <input
                      type="email"
                      required
                      placeholder="Ex: roberto@holding.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-luxury-gray-950 border border-luxury-gray-200 focus:border-gold-500 rounded text-xs text-white px-4.5 py-3 outline-none transition"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wider">Comentário ou Opinião *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Quais seus apontamentos estratégicos sobre este tema do Além do Bilhão corp?"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="bg-luxury-gray-950 border border-luxury-gray-200 focus:border-gold-500 rounded text-xs text-white px-4.5 py-3 outline-none transition resize-none font-sans"
                  />
                </div>
                <button
                  id="btn-comment-submit"
                  type="submit"
                  className="bg-gold-500 hover:bg-gold-600 text-luxury-gray-950 font-bold px-6 py-3 rounded text-xs uppercase tracking-wider transition duration-300 flex items-center justify-center gap-1.5 mt-2 shadow-lg shadow-gold-500/10"
                >
                  <span>Enviar Comentário</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </article>
  );
}
