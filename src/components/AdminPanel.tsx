/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  FolderTree, 
  MessageCircle, 
  Image as ImageIcon, 
  Users as UsersIcon, 
  LogOut, 
  Globe, 
  Plus, 
  Trash2, 
  Edit2, 
  Copy as CopyIcon, 
  Eye, 
  Database,
  Lock,
  ChevronRight,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileCode,
  Link as LinkIcon,
  Bold,
  Italic,
  Quote,
  List,
  Heading1,
  Heading2,
  Video,
  Instagram,
  ExternalLink,
  X
} from 'lucide-react';

// Recharts imports for the premium analytics view
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

import { Post, Category, Comment, MediaFile, User, UserRole, PostStatus, InstagramReel } from '../types';
import { 
  getPosts, 
  savePost, 
  deletePost, 
  duplicatePost, 
  getCategories, 
  saveCategory, 
  deleteCategory, 
  getComments, 
  approveComment, 
  deleteComment, 
  getMedia, 
  saveMedia, 
  deleteMedia, 
  getUsers, 
  saveUser, 
  deleteUser, 
  getAnalytics, 
  getLoggedUser, 
  setLoggedUser,
  login, 
  logout,
  getReels,
  saveReel,
  deleteReel,
  syncFromSupabase,
  saveImportedReels
} from '../utils/db';

interface AdminPanelProps {
  onNavigate: (view: string, param?: string) => void;
  initialTab?: string;
}

export default function AdminPanel({ onNavigate, initialTab = 'dashboard' }: AdminPanelProps) {
  // Session states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Login Form states
  const [email, setEmail] = useState('contatolinkagencia@gmail.com'); // Prefilled for instant developer eval
  const [password, setPassword] = useState('123456'); // Default pre-seeded password
  const [loginError, setLoginError] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);

  // Core database states (will sync from localStorage on edits)
  const [posts, setPosts] = useState<Post[]>([]);
  const [instagramReels, setInstagramReels] = useState<InstagramReel[]>([]);
  const [editingReel, setEditingReel] = useState<Partial<InstagramReel> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);

  // Search/Filter states inside CMS
  const [postSearch, setPostSearch] = useState('');
  const [postFilterStatus, setPostFilterStatus] = useState<string>('all');
  const [mediaSearch, setMediaSearch] = useState('');
  const [activeDbInspectorTable, setActiveDbInspectorTable] = useState('posts');

  // Active Editor instances
  const [editingPost, setEditingPost] = useState<Partial<Post> | null>(null);
  const [editorPreviewMode, setEditorPreviewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  
  // Profile picture states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [tempProfileUrl, setTempProfileUrl] = useState('');
  
  // Custom media presets for quick registration
  const mediaPresets = [
    { title: 'Bolsa de Valores Executiva', url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200' },
    { title: 'Reunião de Alocação Wealth', url: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&q=80&w=1200' },
    { title: 'Inovação em Nuvem Computacional', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200' },
  ];

  // Supabase states for dashboard status and table creations
  const [supabaseStatus, setSupabaseStatus] = useState<'unconfigured' | 'needs_schema' | 'connected' | 'error' | 'loading'>('loading');
  const [supabaseMessage, setSupabaseMessage] = useState('');
  const [supabaseTables, setSupabaseTables] = useState<Record<string, string>>({});
  const [isSyncing, setIsSyncing] = useState(false);

  const checkSupabaseStatus = async () => {
    try {
      const res = await fetch('/api/supabase/status');
      if (res.ok) {
        const data = await res.json();
        setSupabaseStatus(data.status);
        setSupabaseMessage(data.message || '');
        setSupabaseTables(data.tables || {});
      } else {
        setSupabaseStatus('error');
        setSupabaseMessage('Erro ao obter status do Supabase.');
      }
    } catch (err: any) {
      setSupabaseStatus('error');
      setSupabaseMessage(err.message || 'Erro de rede ao conectar.');
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const result = await syncFromSupabase();
    setIsSyncing(false);
    checkSupabaseStatus();
    loadDatabases();
    alert(result.status === 'connected' ? 'Sincronização com o Supabase concluída!' : 'Aviso: ' + result.message);
  };

  // Instagram connection states
  const [isImportingInsta, setIsImportingInsta] = useState(false);
  const [instaToken, setInstaToken] = useState(localStorage.getItem('instagram_access_token') || '');

  const handleImportInstagram = async (token: string) => {
    if (!token || token.trim().length < 10) {
      alert("Por favor, insira um token de acesso do Instagram válido.");
      return;
    }
    
    setIsImportingInsta(true);
    try {
      const res = await fetch('/api/instagram/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.reels && data.reels.length > 0) {
          saveImportedReels(data.reels);
          loadDatabases();
          alert(data.message || "Sincronização com o Instagram concluída com sucesso!");
        } else {
          alert(data.message || "Sincronização concluída, mas nenhuma publicação correspondente foi importada.");
        }
      } else {
        alert("Falha ao importar mídias do Instagram: " + (data.error || "Erro desconhecido."));
      }
    } catch (error: any) {
      console.error("Instagram sync failed:", error);
      alert("Erro de rede ao conectar com o Instagram: " + error.message);
    } finally {
      setIsImportingInsta(false);
    }
  };

  // Pull context indicators
  useEffect(() => {
    const session = getLoggedUser();
    if (session) {
      setCurrentUser(session);
      loadDatabases();
      checkSupabaseStatus();
    }

    const handleSyncComplete = () => {
      loadDatabases();
      checkSupabaseStatus();
    };
    window.addEventListener('supabase-sync-completed', handleSyncComplete);

    return () => {
      window.removeEventListener('supabase-sync-completed', handleSyncComplete);
    };
  }, []);

  const loadDatabases = () => {
    setPosts(getPosts());
    setInstagramReels(getReels());
    setCategories(getCategories());
    setComments(getComments());
    setMediaFiles(getMedia());
    setUsers(getUsers());
    setAnalytics(getAnalytics());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = login(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      loadDatabases();
      window.dispatchEvent(new Event('auth-session-modified'));
    } else {
      setLoginError(res.error || 'Credenciais inválidas.');
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    window.dispatchEvent(new Event('auth-session-modified'));
    onNavigate('home');
  };

  const handleRecoverPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoverySent(true);
    setTimeout(() => {
      setRecoverySent(false);
      setShowRecoveryForm(false);
    }, 4000);
  };

  // Check if role is authorized based on action + author ownership (Simulating complex Role Permissions)
  // Super Admin: edit everything, create everything, delete everything.
  // Editor: edit everything, create everything, delete posts.
  // Autor: can only create posts, edit ONLY their own posts, cannot delete or duplicate.
  const hasPostPermission = (post: Partial<Post> | null, mode: 'create' | 'edit' | 'delete'): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'Super Admin' || currentUser.role === 'Editor') return true;
    
    // For Autor tier
    if (mode === 'create') return true;
    if (mode === 'edit' && post && post.authorId === currentUser.id) return true;
    
    return false; // Autors cannot delete or edit other author's work
  };

  // === POST ACTIONS ===
  const startNewPost = () => {
    if (!currentUser) return;
    const newDraft: Partial<Post> = {
      title: '',
      content: '',
      summary: '',
      categoryId: categories[0]?.id || 'cat_1',
      authorId: currentUser.id,
      imageUrl: mediaFiles[0]?.url || '',
      status: 'draft',
      tags: [],
      videoUrl: '',
      layoutPosition: 'meio',
      isExclusive: false
    };
    setEditingPost(newDraft);
  };

  const handleSavePost = () => {
    if (!editingPost || !editingPost.title) {
      alert('Favor preencher o título do artigo corporativo.');
      return;
    }

    if (!hasPostPermission(editingPost, editingPost.id ? 'edit' : 'create')) {
      alert('Seu nível administrativo (Autor) não permite publicar ou alterar este artigo.');
      return;
    }

    // Capture Tags from string array
    savePost({
      id: editingPost.id,
      title: editingPost.title,
      summary: editingPost.summary || '',
      content: editingPost.content || '',
      categoryId: editingPost.categoryId || 'cat_1',
      authorId: editingPost.authorId || currentUser!.id,
      imageUrl: editingPost.imageUrl || '',
      videoUrl: editingPost.videoUrl || '',
      status: editingPost.status || 'draft',
      tags: editingPost.tags || [],
      layoutPosition: editingPost.layoutPosition || 'meio',
      isExclusive: editingPost.isExclusive || false
    });

    setEditingPost(null);
    loadDatabases();
  };

  const handleDeletePost = (id: string) => {
    const p = posts.find(item => item.id === id);
    if (!hasPostPermission(p || null, 'delete')) {
      alert('Seu tipo de usuário não possui permissões para apagar artigos.');
      return;
    }
    if (confirm('Tem certeza de que deseja excluir permanentemente esta publicação do banco de dados?')) {
      deletePost(id);
      loadDatabases();
    }
  };

  const handleDuplicatePost = (id: string) => {
    const p = posts.find(item => item.id === id);
    if (!hasPostPermission(p || null, 'edit')) {
      alert('Sua conta administrativa não possui permissões para replicar este material.');
      return;
    }
    duplicatePost(id);
    loadDatabases();
  };

  // Format WYSIWYG rich tags inside textarea
  const wrapSelectedText = (tagOpen: string, tagClose: string) => {
    const el = document.getElementById('rich-text-content-area') as HTMLTextAreaElement;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selected = text.substring(start, end);
    const replacement = tagOpen + selected + tagClose;
    const newValue = text.substring(0, start) + replacement + text.substring(end);
    
    setEditingPost(prev => prev ? { ...prev, content: newValue } : null);
    el.focus();
    // Reset selection pointers
    setTimeout(() => {
      el.setSelectionRange(start + tagOpen.length, start + tagOpen.length + selected.length);
    }, 10);
  };

  // === CATEGORY CRUD ACTIONS ===
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name) return;
    if (currentUser?.role === 'Autor') {
      alert('Autores não podem manipular categorias globais de negócios.');
      return;
    }

    saveCategory({
      id: editingCategory.id,
      name: editingCategory.name,
      description: editingCategory.description || ''
    });

    setEditingCategory(null);
    loadDatabases();
  };

  const handleDeleteCategory = (id: string) => {
    if (currentUser?.role === 'Autor') {
      alert('Nível de acesso do tipo Autor não possui privilégios de exclusão.');
      return;
    }
    // Check if post relies on it
    const relatedCount = posts.filter(p => p.categoryId === id).length;
    if (relatedCount > 0) {
      alert(`Esta categoria possui ${relatedCount} artigos vinculados. Favor re-atribuí-los antes de apagá-la.`);
      return;
    }

    if (confirm('Deseja realmente apagar esta categoria?')) {
      deleteCategory(id);
      loadDatabases();
    }
  };

  // === COMMENT ACTIONS ===
  const handleApproveComment = (id: string) => {
    if (currentUser?.role === 'Autor') {
      alert('Aprovação reservada a editores e super-administradores.');
      return;
    }
    approveComment(id);
    loadDatabases();
  };

  const handleDeleteComment = (id: string) => {
    if (currentUser?.role === 'Autor') {
      alert('Remoção reservada a editores e super-administradores.');
      return;
    }
    if (confirm('Excluir este comentário permanentemente?')) {
      deleteComment(id);
      loadDatabases();
    }
  };

  // === MEDIA ACTIONS ===
  const handlePresetMediaSelect = (preset: { title: string; url: string }) => {
    saveMedia({
      title: preset.title,
      url: preset.url,
      fileSize: '412 KB',
      mimeType: 'image/jpeg'
    });
    loadDatabases();
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const titleInp = document.getElementById('media-upload-title') as HTMLInputElement;
      if (titleInp && !titleInp.value) {
        titleInp.value = file.name.split('.')[0]
          .replace(/[_-]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const urlInp = document.getElementById('media-upload-url') as HTMLInputElement;
        if (urlInp && event.target?.result) {
          urlInp.value = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocalPhotoRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const titleInp = (document.getElementById('media-upload-title') as HTMLInputElement)?.value;
    const urlInp = (document.getElementById('media-upload-url') as HTMLInputElement)?.value;
    
    if (!titleInp || !urlInp) {
      alert('Favor preencher o título e a URL da imagem.');
      return;
    }

    saveMedia({
      title: titleInp,
      url: urlInp,
      fileSize: `${Math.floor(Math.random() * 500) + 100} KB`,
      mimeType: 'image/jpeg'
    });

    (document.getElementById('media-upload-form') as HTMLFormElement)?.reset();
    loadDatabases();
  };

  const handleDeleteMedia = (id: string) => {
    if (confirm('Excluir esta imagem da biblioteca de mídia? Ela continuará visível caso já esteja em posts antigos.')) {
      deleteMedia(id);
      loadDatabases();
    }
  };

  // === USERS ACTIONS ===
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.name || !editingUser.email) return;
    if (currentUser?.role !== 'Super Admin') {
      alert('Apenas o Super Admin principal pode gerenciar usuários administrativos.');
      return;
    }

    saveUser({
      id: editingUser.id,
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role || 'Autor',
      bio: editingUser.bio || '',
      avatarUrl: editingUser.avatarUrl || '',
      active: editingUser.active ?? true
    });

    setEditingUser(null);
    loadDatabases();
    
    // Also dispatch auth modified so local avatar changes propagate
    window.dispatchEvent(new Event('auth-session-modified'));
  };

  const handleUpdateSelfProfilePhoto = (newUrl: string) => {
    if (!currentUser) return;
    const photoToSave = newUrl || currentUser.avatarUrl;
    const updated = saveUser({
      ...currentUser,
      avatarUrl: photoToSave
    });
    setCurrentUser(updated);
    setLoggedUser(updated);
    loadDatabases();
    window.dispatchEvent(new Event('auth-session-modified'));
    setShowProfileModal(false);
  };

  const handleDeleteUser = (id: string) => {
    if (currentUser?.role !== 'Super Admin') {
      alert('Privilégio restrito ao Super Admin.');
      return;
    }
    if (confirm('Deseja excluir este usuário do painel administrativo?')) {
      const deleted = deleteUser(id);
      if (!deleted) {
        alert('Falha ao excluir. Certifique-se de que não esteja apagando o último Super Admin cadastrado.');
      }
      loadDatabases();
    }
  };


  // Filtering logs
  const filteredPosts = posts.filter(p => {
    // Search query match
    const matchesSearch = p.title.toLowerCase().includes(postSearch.toLowerCase()) || 
                          p.summary.toLowerCase().includes(postSearch.toLowerCase());
    
    // Status match
    const matchesStatus = postFilterStatus === 'all' || p.status === postFilterStatus;
    
    // Author filter restriction for standard Autor
    const matchesAuthor = currentUser?.role !== 'Autor' || p.authorId === currentUser.id;

    return matchesSearch && matchesStatus && matchesAuthor;
  });

  const getPostAuthorName = (authorId: string) => {
    return users.find(u => u.id === authorId)?.name || 'Autor';
  };

  const getPostCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || 'Categoria';
  };

  // Calculate high-performance aggregate metrics for CMS dashboards
  const aggregateViews = posts.reduce((sum, p) => sum + p.views, 0);
  const pendingCommentsCount = comments.filter(c => c.status === 'pending').length;

  // ----------------------------------------------------
  // VIEW RENDER: LOGIN FORM SCREEN
  // ----------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-luxury-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-luxury-gray-900 border border-luxury-gray-850 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          
          {/* Top Luxury Gold accent lines */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gold-gradient" />
          
          <div className="text-center mb-8 flex flex-col items-center">
            <div className="flex items-center justify-center select-none h-11 mb-2">
              <img 
                src="/images/logo%20ALB.jpg" 
                alt="Além do Bilhão" 
                className="h-full w-auto object-contain scale-[1.1]"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[9px] tracking-widest text-gold-400 font-mono font-bold uppercase block mt-2">
              Painel Avançado de Controle CMS
            </span>
          </div>

          {showRecoveryForm ? (
            /* Recovery workflow */
            <form onSubmit={handleRecoverPassword} className="space-y-5 animate-fadeIn">
              <h2 className="text-sm font-semibold text-white tracking-wide text-center">Recuperação de Acesso Corporativo</h2>
              <p className="text-xs text-luxury-gray-400 text-center leading-relaxed">
                Digite seu e-mail cadastrado. Enviaremos um link temporário para geração de senha segura de criptografia SHA-256.
              </p>
              
              {recoverySent && (
                <div className="bg-gold-950/40 border border-gold-500 rounded p-3 text-xs text-gold-400 text-center">
                  Redirecionamento ativado! Link enviado ao e-mail informado.
                </div>
              )}

              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wide">E-mail administrativo</label>
                <input
                  type="email"
                  required
                  placeholder="Seu email..."
                  className="bg-luxury-gray-950 border border-luxury-gray-800 focus:border-gold-500 rounded text-xs text-white px-4 py-3 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecoveryForm(false)}
                  className="bg-luxury-gray-850 hover:bg-luxury-gray-800 text-luxury-gray-300 text-xs font-semibold py-3 rounded transition"
                >
                  Voltar ao Login
                </button>
                <button
                  type="submit"
                  className="bg-gold-500 hover:bg-gold-600 text-luxury-gray-950 text-xs font-bold py-3 rounded transition"
                >
                  Recuperar Conta
                </button>
              </div>
            </form>
          ) : (
            /* Login workflow */
            <form onSubmit={handleLogin} className="space-y-4">
              
              {loginError && (
                <div className="bg-rose-950/50 border border-rose-500/50 text-rose-300 rounded p-3 text-xs flex items-center gap-2 animate-pulse">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wider">Acesso - E-mail de Administrador</label>
                <input
                  id="inp-admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-luxury-gray-950 border border-luxury-gray-800 focus:border-gold-500 rounded text-xs text-white px-4 py-3 outline-none transition placeholder-luxury-gray-650"
                  placeholder="Insira seu login cadastrado..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wider">Senha de Segurança *</label>
                  <span 
                    onClick={() => setShowRecoveryForm(true)}
                    className="text-[10px] text-luxury-gray-500 hover:text-gold-400 cursor-pointer transition"
                  >
                    Esqueceu?
                  </span>
                </div>
                <input
                  id="inp-admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-luxury-gray-950 border border-luxury-gray-800 focus:border-gold-500 rounded text-xs text-white px-4 py-3 outline-none transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                id="btn-admin-submit-login"
                type="submit"
                className="w-full bg-gold-500 hover:bg-gold-600 active:scale-98 text-luxury-gray-950 text-xs font-bold uppercase tracking-wider py-4.5 rounded-lg transition duration-300 mt-6 flex items-center justify-center gap-2 shadow-lg hover:shadow-gold-500/10"
              >
                <Lock size={14} />
                <span>Entrar no Sistema</span>
              </button>

              <div className="text-center pt-4">
                <p className="text-[10px] text-luxury-gray-500 leading-relaxed">
                  Sandbox de visualização com preenchimento automático ativo.<br/>
                  Senha de demonstração padrão: <span className="text-gold-400 font-semibold">123456</span>
                </p>
                <span 
                  onClick={() => onNavigate('home')}
                  className="inline-block text-xs text-gold-400 hover:text-gold-500 font-medium mt-4 cursor-pointer underline"
                >
                  ← Voltar para o Portal Público
                </span>
              </div>
            </form>
          )}

        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW RENDER: COMPLETE AUTHENTICATED PANEL
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-luxury-gray-950 text-luxury-gray-100 flex flex-col lg:flex-row font-sans">
      
      {/* Mobile Header Bar for CMS */}
      <div className="lg:hidden bg-luxury-gray-950 border-b border-luxury-gray-900 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2" onClick={() => onNavigate('home')}>
          <div className="font-serif font-black tracking-widest text-xs uppercase text-white leading-none">
            A. B. <span className="text-gold-gradient font-bold font-serif">CMS</span>
          </div>
          <span className="bg-luxury-gray-900 border border-luxury-gray-850 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold text-gold-500">
            v1.4
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-luxury-gray-900 border border-luxury-gray-850 px-2 py-1 rounded text-gold-400 font-mono">
            {activeTab === 'dashboard' ? 'DASHBOARD' :
             activeTab === 'posts' ? 'ARTIGOS' :
             activeTab === 'categories' ? 'CATEGORIAS' :
             activeTab === 'comments' ? 'COMENTÁRIOS' :
             activeTab === 'media' ? 'MÍDIA' :
             activeTab === 'users' ? 'USUÁRIOS' : 'SQL'}
          </span>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 px-2.5 bg-luxury-gray-900 hover:bg-luxury-gray-850 text-luxury-gray-300 rounded border border-luxury-gray-850 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
          >
            {mobileMenuOpen ? 'Fechar' : 'Menu'}
          </button>
        </div>
      </div>
      
      {/* SIDEBAR NAVIGATION CONTROL */}
      <aside className={`w-full lg:w-64 bg-luxury-gray-950 border-r border-luxury-gray-900 shrink-0 flex flex-col justify-between ${mobileMenuOpen ? 'flex' : 'hidden lg:flex'}`}>
        <div className="p-4 md:p-6">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="font-serif font-black tracking-widest text-sm uppercase text-white leading-none">
              A. B. <span className="text-gold-gradient font-bold font-serif">CMS</span>
            </div>
            <span className="bg-luxury-gray-900 border border-luxury-gray-850 px-2 py-0.5 rounded text-[9px] font-mono font-bold text-gold-500">
              v1.4
            </span>
          </div>

          {/* ACTIVE USER SUMMARY INSIDE SIDEBAR */}
          <div 
            onClick={() => {
              setTempProfileUrl(currentUser.avatarUrl || '');
              setShowProfileModal(true);
            }}
            className="group bg-luxury-gray-900/60 p-3 rounded-lg border border-luxury-gray-850 hover:border-gold-500/50 flex items-center gap-2.5 mb-8 cursor-pointer relative transition duration-200"
            title="Alterar minha foto de perfil"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full border border-gold-400 group-hover:border-gold-500 object-cover transition"
              />
              <div className="absolute -bottom-1 -right-1 bg-gold-400 text-luxury-gray-950 rounded-full p-0.5 border border-luxury-gray-950 shadow-md group-hover:bg-gold-500 transition">
                <Plus size={8} className="stroke-[3px]" />
              </div>
            </div>
            <div className="truncate flex-1">
              <h4 className="text-xs font-bold text-white group-hover:text-gold-400 truncate leading-none transition">{currentUser.name}</h4>
              <span className="text-[10px] text-gold-400 font-mono tracking-wider font-semibold block mt-1">{currentUser.role}</span>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold text-luxury-gray-500 uppercase tracking-widest block mb-3">Conteúdo</span>
          
          {/* ACTION BUTTON LINKS */}
          <nav className="flex flex-col gap-1 text-xs">
            <button
              onClick={() => { setActiveTab('dashboard'); setEditingPost(null); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded transition font-medium ${
                activeTab === 'dashboard' ? 'bg-gold-500 text-luxury-gray-950 font-bold' : 'hover:bg-luxury-gray-900 text-luxury-gray-300'
              }`}
            >
              <LayoutDashboard size={14} />
              <span>Painel Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveTab('posts'); setEditingPost(null); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded transition font-medium ${
                activeTab === 'posts' ? 'bg-gold-500 text-luxury-gray-950 font-bold' : 'hover:bg-luxury-gray-900 text-luxury-gray-300'
              }`}
            >
              <FileText size={14} />
              <span>Gerenciar Artigos</span>
              <span className="ml-auto bg-luxury-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                {posts.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('categories'); setEditingPost(null); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded transition font-medium ${
                activeTab === 'categories' ? 'bg-gold-500 text-luxury-gray-950 font-bold' : 'hover:bg-luxury-gray-900 text-luxury-gray-300'
              }`}
            >
              <FolderTree size={14} />
              <span>Categorias</span>
            </button>

            <button
              onClick={() => { setActiveTab('comments'); setEditingPost(null); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded transition font-medium ${
                activeTab === 'comments' ? 'bg-gold-500 text-luxury-gray-950 font-bold' : 'hover:bg-luxury-gray-900 text-luxury-gray-300'
              }`}
            >
              <MessageCircle size={14} />
              <span>Comentários</span>
              {pendingCommentsCount > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                  {pendingCommentsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('media'); setEditingPost(null); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded transition font-medium ${
                activeTab === 'media' ? 'bg-gold-500 text-luxury-gray-950 font-bold' : 'hover:bg-luxury-gray-900 text-luxury-gray-300'
              }`}
            >
              <ImageIcon size={14} />
              <span>Biblioteca de Mídia</span>
            </button>

            <button
              onClick={() => { setActiveTab('reels'); setEditingPost(null); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded transition font-medium ${
                activeTab === 'reels' ? 'bg-gold-500 text-luxury-gray-950 font-bold' : 'hover:bg-luxury-gray-900 text-luxury-gray-300'
              }`}
            >
              <Instagram size={14} className="text-pink-500" />
              <span>Instagram Reels</span>
              <span className="ml-auto bg-luxury-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                {instagramReels.length}
              </span>
            </button>

            <span className="text-[10px] font-mono font-bold text-luxury-gray-500 uppercase tracking-widest block mt-6 mb-3">Sistemas</span>

            <button
              onClick={() => { setActiveTab('users'); setEditingPost(null); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded transition font-medium ${
                activeTab === 'users' ? 'bg-gold-500 text-luxury-gray-950 font-bold' : 'hover:bg-luxury-gray-900 text-luxury-gray-300'
              }`}
            >
              <UsersIcon size={14} />
              <span>Usuários Admins</span>
            </button>

            <button
              onClick={() => { setActiveTab('db-inspector'); setEditingPost(null); setMobileMenuOpen(false); }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded transition font-medium ${
                activeTab === 'db-inspector' ? 'bg-gold-500 text-luxury-gray-950 font-bold' : 'hover:bg-luxury-gray-900 text-luxury-gray-300'
              }`}
            >
              <Database size={14} className="text-gold-400" />
              <span>Tabelas de Dados (SQL)</span>
            </button>
          </nav>
        </div>

        {/* BOTTOM EXITS FOOTERS */}
        <div className="p-4 border-t border-luxury-gray-900 bg-luxury-gray-950/80">
          <button
            onClick={() => onNavigate('home')}
            className="w-full flex items-center gap-2 p-2 rounded text-xs text-luxury-gray-400 hover:text-white hover:bg-luxury-gray-900 transition"
          >
            <Globe size={14} />
            <span>Voltar ao Site Público</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-2 rounded text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition mt-1"
          >
            <LogOut size={14} />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT EXECUTIVE WORKSPACE */}
      <main id="cms-main-stage" className="flex-1 bg-luxury-gray-950 min-h-screen overflow-y-auto p-4 md:p-8">
        
        {/* TAB 1: DASHBOARD metrics view */}
        {activeTab === 'dashboard' && !editingPost && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-luxury-gray-900 pb-5">
              <div>
                <h1 className="font-serif font-black text-2xl md:text-3xl text-white uppercase tracking-tight">Painel Executivo Além do Bilhão</h1>
                <p className="text-xs text-luxury-gray-400 mt-1">Análises consolidadas de acessos, artigos ativos e moderações sistêmicas pendentes.</p>
              </div>
              <div className="flex gap-2 text-xs">
                <button 
                  onClick={startNewPost}
                  className="bg-gold-500 hover:bg-gold-600 text-luxury-gray-950 font-bold px-4 py-2.5 rounded transition flex items-center gap-1.5 uppercase tracking-wider"
                >
                  <Plus size={14} />
                  <span>Novo Artigo</span>
                </button>
              </div>
            </div>

            {/* METRICS COUNT GRID */}
            <div id="dashboard-metric-cards" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-luxury-gray-900 p-5 rounded-xl border border-luxury-gray-850 shadow">
                <span className="text-[10px] font-mono font-bold text-luxury-gray-500 uppercase tracking-widest block">Artigos Publicados</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold text-white">{posts.filter(p => p.status === 'published').length}</span>
                  <span className="text-xs text-emerald-400 font-semibold font-mono tracking-wide">Ativos</span>
                </div>
              </div>

              <div className="bg-luxury-gray-900 p-5 rounded-xl border border-luxury-gray-850 shadow">
                <span className="text-[10px] font-mono font-bold text-luxury-gray-500 uppercase tracking-widest block">Rascunhos Internos</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold text-amber-500">{posts.filter(p => p.status === 'draft').length}</span>
                  <span className="text-xs text-luxury-gray-400 font-mono">Offline</span>
                </div>
              </div>

              <div className="bg-luxury-gray-900 p-5 rounded-xl border border-luxury-gray-850 shadow">
                <span className="text-[10px] font-mono font-bold text-luxury-gray-500 uppercase tracking-widest block">Equipe Administrativa</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold text-white">{users.length}</span>
                  <span className="text-xs text-gold-400 font-mono">Contas</span>
                </div>
              </div>

              <div className="bg-luxury-gray-900 p-5 rounded-xl border border-luxury-gray-850 shadow">
                <span className="text-[10px] font-mono font-bold text-luxury-gray-500 uppercase tracking-widest block">Visualizações (Artigos)</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold text-gold-400">{aggregateViews.toLocaleString('pt-BR')}</span>
                  <span className="text-xs text-emerald-400 font-semibold font-mono tracking-wide">+12%</span>
                </div>
              </div>
            </div>

            {/* RECHARTS INTERACTIVE CHARTS PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              
              {/* ACCESSIBILITY AREA CHART */}
              <div className="lg:col-span-8 bg-luxury-gray-900 p-5 rounded-xl border border-luxury-gray-850 shadow">
                <div className="flex items-center gap-2 mb-4 justify-between">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={16} className="text-gold-500" />
                    <h3 className="font-serif font-black text-sm text-white uppercase tracking-wider">Histórico de Visualizações de Página</h3>
                  </div>
                  <span className="text-[10px] font-mono text-luxury-gray-400">Dados dos últimos 10 dias</span>
                </div>
                <div className="h-72 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPageviews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#c28b2e" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#c28b2e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                      <XAxis dataKey="date" stroke="#78716c" />
                      <YAxis stroke="#78716c" />
                      <Tooltip contentStyle={{ backgroundColor: '#1c1917', borderColor: '#3e3a38', color: '#fff' }} />
                      <Area type="monotone" dataKey="pageviews" stroke="#c28b2e" strokeWidth={2} fillOpacity={1} fill="url(#colorPageviews)" name="Visualizações" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* POSTS POPULARITY RANKING BAR CHART */}
              <div className="lg:col-span-4 bg-luxury-gray-900 p-5 rounded-xl border border-luxury-gray-850 shadow">
                <h3 className="font-serif font-black text-sm text-white uppercase tracking-wider mb-4">Relatório de Desempenho</h3>
                <div className="h-72 w-full text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={posts.slice(0, 4).map(p=>({ name: p.title.substring(0, 15)+'...', 'Views': p.views }))} margin={{ top: 1, right: 1, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                      <XAxis dataKey="name" stroke="#78716c" />
                      <YAxis stroke="#78716c" />
                      <Tooltip contentStyle={{ backgroundColor: '#1c1917', borderColor: '#3e3a38', color: '#fff' }} />
                      <Bar dataKey="Views" fill="#d4af37" radius={[4, 4, 0, 0]} name="Acessos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* ADVISORY PERMISSIONS BANNER */}
            <div className="bg-luxury-gray-900 p-5 rounded-xl border border-luxury-gray-850 shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-950/60 border border-gold-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="text-gold-500" size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Sessão Segura Ativa</h4>
                  <p className="text-[11px] text-luxury-gray-400 mt-0.5 leading-relaxed">
                    Sua conta está operando com permissões de <span className="text-gold-400 font-semibold">{currentUser.role}</span>. 
                    Todas as ações são registradas com chaves de integridade no log transacional.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-luxury-gray-500">SERVER STATUS: PRONTO • PORT 3000</span>
            </div>
          </div>
        )}

        {/* TAB 2: POSTS LISTING */}
        {activeTab === 'posts' && !editingPost && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-luxury-gray-900 pb-5">
              <div>
                <h1 className="font-serif font-black text-2xl text-white uppercase tracking-tight">Conteúdo Editorial</h1>
                <p className="text-xs text-luxury-gray-400 mt-1">Gerenciamento completo do repositório de publicações do portal.</p>
              </div>
              <button 
                onClick={startNewPost}
                className="bg-gold-500 hover:bg-gold-600 text-luxury-gray-950 font-bold px-4 py-2.5 rounded text-xs uppercase tracking-wider transition flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Novo Artigo</span>
              </button>
            </div>

            {/* SEARCH AND FILTERS TOOLBAR */}
            <div className="flex flex-col md:flex-row gap-3 bg-luxury-gray-900 p-4 rounded-xl border border-luxury-gray-850">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Pesquisar títulos ou sumários pela busca rápida..."
                  value={postSearch}
                  onChange={(e) => setPostSearch(e.target.value)}
                  className="w-full bg-luxury-gray-950 border border-luxury-gray-850 focus:border-gold-500 rounded text-xs text-white pl-9 pr-4 py-2.5 outline-none transition placeholder-luxury-gray-500"
                />
                <Search size={14} className="absolute left-3 top-3 text-luxury-gray-500" />
              </div>
              <select
                id="sel-post-filter"
                value={postFilterStatus}
                onChange={(e) => setPostFilterStatus(e.target.value)}
                className="bg-luxury-gray-950 border border-luxury-gray-850 rounded text-xs text-luxury-gray-300 px-4 py-2.5 outline-none focus:border-gold-500"
              >
                <option value="all">Todas as publicações</option>
                <option value="published">Apenas publicados</option>
                <option value="draft">Rascunhos / Offline</option>
              </select>
            </div>

            {/* POSTS TABLE GRID */}
            <div className="bg-luxury-gray-900 rounded-xl border border-luxury-gray-850 overflow-hidden shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-luxury-gray-950 text-luxury-gray-400 font-mono uppercase tracking-wider text-[10px] border-b border-luxury-gray-850">
                      <th className="p-4">Capa</th>
                      <th className="p-4">Título do Artigo</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4">Posição</th>
                      <th className="p-4">Autor</th>
                      <th className="p-4">Views</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-luxury-gray-850">
                    {filteredPosts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-luxury-gray-500 italic">
                          Nenhum artigo encontrado. Tente redefinir os parâmetros de pesquisa.
                        </td>
                      </tr>
                    ) : (
                      filteredPosts.map(post => (
                        <tr key={post.id} className="hover:bg-luxury-gray-850/40 transition">
                          <td className="p-4">
                            <img
                              src={post.imageUrl}
                              alt=""
                              className="w-14 h-9 object-cover rounded border border-luxury-gray-850"
                            />
                          </td>
                          <td className="p-4 max-w-sm">
                            <h4 className="font-serif font-bold text-white leading-snug truncate-2-lines line-clamp-2">{post.title}</h4>
                            <span className="text-[10px] text-luxury-gray-500 font-mono block mt-1">ID: {post.id}</span>
                          </td>
                          <td className="p-4 text-luxury-gray-300 font-mono text-[11px]">
                            {getPostCategoryName(post.categoryId)}
                          </td>
                          <td className="p-4">
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold capitalize bg-luxury-gray-950 text-gold-400 border border-gold-500/10">
                              {post.layoutPosition || 'meio'}
                            </span>
                          </td>
                          <td className="p-4 text-luxury-gray-300">
                            {getPostAuthorName(post.authorId)}
                          </td>
                          <td className="p-4 font-mono font-medium text-gold-400">
                            {post.views.toLocaleString('pt-BR')}
                          </td>
                          <td className="p-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              post.status === 'published' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/20' : 'bg-amber-900/40 text-amber-300 border border-amber-500/10'
                            }`}>
                              {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => onNavigate('article', post.slug)}
                                className="p-1.5 bg-luxury-gray-950 text-luxury-gray-400 hover:text-white rounded transition"
                                title="Visualizar Artigo"
                              >
                                <Eye size={13} />
                              </button>
                              <button 
                                onClick={() => handleDuplicatePost(post.id)}
                                className="p-1.5 bg-luxury-gray-950 text-luxury-gray-400 hover:text-gold-400 rounded transition"
                                title="Duplicar Artigo"
                              >
                                <CopyIcon size={13} />
                              </button>
                              <button 
                                onClick={() => setEditingPost(post)}
                                className="p-1.5 bg-luxury-gray-950 text-luxury-gray-400 hover:text-emerald-400 rounded transition"
                                title="Editar"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button 
                                onClick={() => handleDeletePost(post.id)}
                                className="p-1.5 bg-luxury-gray-950 text-luxury-gray-400 hover:text-rose-450 rounded transition hover:bg-rose-950/20"
                                title="Excluir"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* POSTS RICH EDITOR (SPLIT PANEL MODE) */}
        {editingPost && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-luxury-gray-900 pb-5">
              <div>
                <span className="text-[10px] font-mono uppercase text-gold-400 font-bold">Modo de Edição Avançada</span>
                <h1 className="font-serif font-black text-2xl text-white uppercase mt-0.5">
                  {editingPost.id ? 'Alterar Relatório Editorial' : 'Compor Novo Artigo'}
                </h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingPost(null)}
                  className="bg-luxury-gray-900 hover:bg-luxury-gray-850 text-luxury-gray-300 font-bold px-4 py-2.5 rounded text-xs transition uppercase tracking-wider"
                >
                  Cancelar
                </button>
                <button
                  id="btn-cms-save-post"
                  onClick={handleSavePost}
                  className="bg-gold-500 hover:bg-gold-600 text-luxury-gray-950 font-bold px-5 py-2.5 rounded text-xs transition uppercase tracking-wider"
                >
                  Confirmar e Salvar
                </button>
              </div>
            </div>

            {/* METRICS CONTROL RAIL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* ACCORDION FORM CONTROLS */}
              <div className="lg:col-span-7 bg-luxury-gray-900 p-5 rounded-xl border border-luxury-gray-850 space-y-4">
                
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wider">Título do Artigo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Insira um título corporativo impactante..."
                    value={editingPost.title || ''}
                    onChange={(e) => setEditingPost(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="bg-luxury-gray-950 border border-luxury-gray-850 focus:border-gold-500 rounded text-xs text-white px-4 py-3 outline-none"
                  />
                </div>

                {/* Slug (automatic/custom) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wider">Slug de URL (Ex: titulo-do-artigo)</label>
                  <input
                    type="text"
                    placeholder="Gerado automaticamente com base no título..."
                    value={editingPost.slug || ''}
                    onChange={(e) => setEditingPost(prev => prev ? { ...prev, slug: e.target.value } : null)}
                    className="bg-luxury-gray-950 border border-luxury-gray-850 focus:border-gold-500 rounded text-xs text-luxury-gray-400 px-4 py-3 outline-none font-mono"
                  />
                </div>

                {/* Summary */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wider">Sumário Inicial (Resumo)</label>
                  <textarea
                    rows={2}
                    placeholder="Um breve resumo técnico de duas linhas..."
                    value={editingPost.summary || ''}
                    onChange={(e) => setEditingPost(prev => prev ? { ...prev, summary: e.target.value } : null)}
                    className="bg-luxury-gray-950 border border-luxury-gray-850 focus:border-gold-500 rounded text-xs text-white px-4 py-3 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wider">Categoria Editorial</label>
                    <select
                      value={editingPost.categoryId || 'cat_1'}
                      onChange={(e) => setEditingPost(prev => prev ? { ...prev, categoryId: e.target.value } : null)}
                      className="bg-luxury-gray-950 border border-luxury-gray-850 rounded text-xs text-luxury-gray-300 px-4 py-3 outline-none focus:border-gold-500"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Layout Position Option */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wider">Posição no Portal (Layout)</label>
                    <select
                      value={editingPost.layoutPosition || 'meio'}
                      onChange={(e) => setEditingPost(prev => prev ? { ...prev, layoutPosition: e.target.value as any } : null)}
                      className="bg-luxury-gray-950 border border-luxury-gray-850 rounded text-xs text-luxury-gray-300 px-4 py-3 outline-none focus:border-gold-500 font-sans"
                    >
                      <option value="maior">Maior (Destaque Principal Banner)</option>
                      <option value="esquerda">Esquerda (Coluna Lateral Esquerda)</option>
                      <option value="meio">Meio (Coluna Central)</option>
                      <option value="direita">Direita (Coluna Lateral Direita)</option>
                      <option value="menor">Menor (Artigo Compacto Secundário)</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wider">Status de Publicação</label>
                    <select
                      value={editingPost.status || 'draft'}
                      onChange={(e) => setEditingPost(prev => prev ? { ...prev, status: e.target.value as PostStatus } : null)}
                      className="bg-luxury-gray-950 border border-luxury-gray-850 rounded text-xs text-luxury-gray-300 px-4 py-3 outline-none focus:border-gold-500"
                    >
                      <option value="draft">Rascunho (Salvar Offline)</option>
                      <option value="published">Publicado (Visível Imediato)</option>
                      <option value="scheduled">Agendado (Simulado)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Capa URL */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wider">URL da Imagem de Capa</label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={editingPost.imageUrl || ''}
                      onChange={(e) => setEditingPost(prev => prev ? { ...prev, imageUrl: e.target.value } : null)}
                      className="bg-luxury-gray-950 border border-luxury-gray-850 focus:border-gold-500 rounded text-xs text-white px-4 py-3 outline-none"
                    />
                  </div>

                  {/* Vídeo URL */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wider">Link de Vídeo Integrado (opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: YouTube embed URL..."
                      value={editingPost.videoUrl || ''}
                      onChange={(e) => setEditingPost(prev => prev ? { ...prev, videoUrl: e.target.value } : null)}
                      className="bg-luxury-gray-950 border border-luxury-gray-850 focus:border-gold-500 rounded text-xs text-white px-4 py-3 outline-none"
                    />
                  </div>
                </div>

                {/* Exclusivo Toggle Banner */}
                <div className="flex items-center gap-3.5 p-4 bg-luxury-gray-950/40 rounded-lg border border-luxury-gray-850">
                  <input
                    type="checkbox"
                    id="checkbox-is-exclusive"
                    checked={editingPost.isExclusive || false}
                    onChange={(e) => setEditingPost(prev => prev ? { ...prev, isExclusive: e.target.checked } : null)}
                    className="w-5 h-5 accent-gold-450 border-luxury-gray-800 rounded bg-luxury-gray-950 text-gold-400 focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
                  />
                  <div className="flex flex-col gap-0.5 cursor-pointer select-none">
                    <label htmlFor="checkbox-is-exclusive" className="text-xs font-bold text-red-500 flex items-center gap-1 cursor-pointer">
                      <span>★ MARCAR MATÉRIA COMO EXCLUSIVA</span>
                    </label>
                    <span className="text-[10px] text-luxury-gray-400">Ativa a etiqueta vermelha "EXCLUSIVO" de grande destaque e prioriza este post nas colunas dinâmicas.</span>
                  </div>
                </div>

                {/* Drag / Media Picker Quick Select Row */}
                <div className="border border-dashed border-luxury-gray-850 rounded-lg p-3 bg-luxury-gray-950/40">
                  <span className="text-[10px] font-mono font-bold text-luxury-gray-500 uppercase tracking-wide block mb-2">
                    Selecionador Rápido de Fotos (Biblioteca de Mídia)
                  </span>
                  <div className="flex gap-2.5 overflow-x-auto pb-1">
                    {mediaFiles.map(media => (
                      <img
                        key={media.id}
                        src={media.url}
                        alt=""
                        onClick={() => {
                          setEditingPost(prev => prev ? { ...prev, imageUrl: media.url } : null);
                        }}
                        className={`w-14 h-10 object-cover rounded cursor-pointer transition border ${
                          editingPost.imageUrl === media.url ? 'border-gold-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        title={media.title}
                      />
                    ))}
                  </div>
                </div>

                {/* RICH TEXT WYSIWYG SIMULATOR BAR */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between border-b border-luxury-gray-850 pb-2 mb-1">
                    <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wider">Conteúdo Textual (HTML / Artigo) *</label>
                    
                    {/* BUTTON BAR */}
                    <div className="flex flex-wrap items-center gap-1 bg-luxury-gray-950 p-1 rounded border border-luxury-gray-850">
                      <button 
                        type="button" 
                        onClick={() => wrapSelectedText('<strong>', '</strong>')} 
                        className="p-1 hover:bg-luxury-gray-850 text-luxury-gray-300 rounded" 
                        title="Negrito"
                      >
                        <Bold size={12} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => wrapSelectedText('<em>', '</em>')} 
                        className="p-1 hover:bg-luxury-gray-850 text-luxury-gray-300 rounded" 
                        title="Itálico"
                      >
                        <Italic size={12} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => wrapSelectedText('<a href="#">', '</a>')} 
                        className="p-1 hover:bg-luxury-gray-850 text-luxury-gray-300 rounded" 
                        title="Adicionar Link"
                      >
                        <LinkIcon size={12} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => wrapSelectedText('<blockquote>\n  "', '\n  <br/><span class="text-sm font-sans block mt-1 text-gold-500">— Autor</span>\n</blockquote>')} 
                        className="p-1 hover:bg-luxury-gray-850 text-luxury-gray-300 rounded" 
                        title="Adicionar Citação"
                      >
                        <Quote size={12} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => wrapSelectedText('<h2>', '</h2>')} 
                        className="p-1 hover:bg-luxury-gray-850 text-luxury-gray-300 rounded" 
                        title="Título primário H2"
                      >
                        <Heading1 size={12} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => wrapSelectedText('<h3>', '</h3>')} 
                        className="p-1 hover:bg-luxury-gray-850 text-luxury-gray-300 rounded" 
                        title="Título secundário H3"
                      >
                        <Heading2 size={12} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => wrapSelectedText('<ul>\n  <li>', '</li>\n  <li>Conteúdo</li>\n</ul>')} 
                        className="p-1 hover:bg-luxury-gray-850 text-luxury-gray-300 rounded" 
                        title="Instanciar Lista"
                      >
                        <List size={12} />
                      </button>
                    </div>
                  </div>

                  <textarea
                    id="rich-text-content-area"
                    rows={12}
                    required
                    placeholder="Componha livremente usando tags HTML ou seletores do painel..."
                    value={editingPost.content || ''}
                    onChange={(e) => setEditingPost(prev => prev ? { ...prev, content: e.target.value } : null)}
                    className="w-full bg-luxury-gray-950 border border-luxury-gray-850 focus:border-gold-500 rounded text-xs text-white p-4 outline-none font-mono resize-y"
                  />
                </div>

              </div>

              {/* SPLIT SCREEN LIVE PREVIEW SYSTEM */}
              <div className="lg:col-span-5 bg-white text-luxury-gray-900 rounded-xl border border-luxury-gray-250 p-6 md:p-8 space-y-4 shadow-xl max-h-[750px] overflow-y-auto">
                <span className="bg-gold-500 text-luxury-gray-950 text-[10px] font-mono font-bold uppercase px-3 py-1 rounded">
                  Live Visual Preview
                </span>
                
                <h1 className="font-serif font-black text-2xl tracking-tight leading-snug text-luxury-gray-950 mt-4">
                  {editingPost.title || 'Título provisório do relatório'}
                </h1>

                {editingPost.imageUrl && (
                  <img
                    src={editingPost.imageUrl}
                    alt=""
                    className="w-full h-40 object-cover rounded-lg border border-luxury-gray-200 mt-2"
                  />
                )}

                <div className="border-t border-luxury-gray-200 pt-4 text-xs font-mono text-luxury-gray-500 flex justify-between uppercase">
                  <span>Autor: {getPostAuthorName(editingPost.authorId || currentUser.id)}</span>
                  <span>Categoria ID: {editingPost.categoryId || 'Nenhum'}</span>
                </div>

                <div 
                  className="article-content prose prose-stone max-w-none text-xs md:text-sm leading-relaxed mt-4" 
                  dangerouslySetInnerHTML={{ __html: editingPost.content || '<p class="italic text-luxury-gray-400">Insira conteúdo para exibir o visual renderizado...</p>' }}
                />
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES LISTING & CRUD */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-luxury-gray-900 pb-5">
              <div>
                <h1 className="font-serif font-black text-2xl text-white uppercase tracking-tight">Categorias de Conteúdo</h1>
                <p className="text-xs text-luxury-gray-400 mt-1">Definição dos nichos estratégicos abordados pelo Além do Bilhão.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* CATEGORY FORM SUBMIT */}
              <div className="lg:col-span-4 bg-luxury-gray-900 p-5 rounded-xl border border-luxury-gray-850">
                <h3 className="font-serif font-semibold text-white tracking-wide uppercase text-xs mb-4">
                  {editingCategory ? 'Editar Categoria' : 'Adicionar Nova Categoria'}
                </h3>
                <form onSubmit={handleSaveCategory} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wide">Nome da Categoria *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Startups, Economia..."
                      value={editingCategory?.name || ''}
                      onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-luxury-gray-950 border border-luxury-gray-850 focus:border-gold-500 rounded text-xs text-white px-4 py-3 outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wide">Descrição Comercial *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Qual o escopo de publicações abordado?"
                      value={editingCategory?.description || ''}
                      onChange={(e) => setEditingCategory(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-luxury-gray-950 border border-luxury-gray-850 focus:border-gold-500 rounded text-xs text-white px-4 py-3 outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    {editingCategory && (
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="bg-luxury-gray-850 hover:bg-luxury-gray-800 text-luxury-gray-300 text-xs px-4 py-2.5 rounded transition"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      className="bg-gold-500 hover:bg-gold-600 text-luxury-gray-950 font-bold text-xs px-5 py-2.5 rounded transition"
                    >
                      {editingCategory ? 'Salvar Edição' : 'Cadastrar'}
                    </button>
                  </div>
                </form>
              </div>

              {/* LISTING COLS */}
              <div className="lg:col-span-8 bg-luxury-gray-900 rounded-xl border border-luxury-gray-850 overflow-hidden shadow">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-luxury-gray-950 text-luxury-gray-400 font-mono uppercase tracking-wider text-[10px] border-b border-luxury-gray-850">
                        <th className="p-4">Nome</th>
                        <th className="p-4">Slug (URL amigável)</th>
                        <th className="p-4">Descrição</th>
                        <th className="p-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-luxury-gray-850">
                      {categories.map(cat => (
                        <tr key={cat.id} className="hover:bg-luxury-gray-850/40 transition">
                          <td className="p-4 font-bold text-white font-serif">{cat.name}</td>
                          <td className="p-4 text-luxury-gray-400 font-mono text-[11px]">/{cat.slug}</td>
                          <td className="p-4 text-luxury-gray-300 max-w-sm shrink leading-relaxed truncate">{cat.description}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setEditingCategory(cat)}
                                className="p-1.5 bg-luxury-gray-950 text-luxury-gray-400 hover:text-gold-400 rounded transition"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-1.5 bg-luxury-gray-950 text-luxury-gray-400 hover:text-rose-400 rounded transition hover:bg-rose-950/20"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: COMMENTS MODERATION */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-luxury-gray-900 pb-5">
              <div>
                <h1 className="font-serif font-black text-2xl text-white uppercase tracking-tight">Moderação de Comentários</h1>
                <p className="text-xs text-luxury-gray-400 mt-1">Aprovação ou exclusão de manifestações públicas de leitores.</p>
              </div>
            </div>

            <div className="bg-luxury-gray-900 rounded-xl border border-luxury-gray-850 overflow-hidden shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-luxury-gray-950 text-luxury-gray-400 font-mono uppercase tracking-wider text-[10px] border-b border-luxury-gray-850">
                      <th className="p-4">Leitor</th>
                      <th className="p-4">Artigo Relacionado</th>
                      <th className="p-4">Manifestação (Conteúdo)</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Decisões</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-luxury-gray-850">
                    {comments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-luxury-gray-500 italic">
                          Não há manifestações ou comentários reportados.
                        </td>
                      </tr>
                    ) : (
                      comments.map(comment => {
                        const relPost = posts.find(p => p.id === comment.postId);
                        return (
                          <tr key={comment.id} className="hover:bg-luxury-gray-850/40 transition">
                            <td className="p-4 font-sans">
                              <h4 className="font-bold text-white text-[12px]">{comment.authorName}</h4>
                              <span className="text-[10px] text-luxury-gray-400 font-mono">{comment.authorEmail}</span>
                            </td>
                            <td className="p-4 max-w-xs font-serif italic text-luxury-gray-300 truncate">
                              {relPost ? relPost.title : 'Artigo não localizado'}
                            </td>
                            <td className="p-4 text-luxury-gray-300 max-w-sm whitespace-pre-wrap leading-relaxed">
                              {comment.content}
                            </td>
                            <td className="p-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                                comment.status === 'approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/10' : 'bg-amber-950 text-amber-400 border border-amber-600/10 animate-pulse'
                              }`}>
                                {comment.status === 'approved' ? 'Aprovado' : 'Aguardando'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {comment.status === 'pending' && (
                                  <button
                                    onClick={() => handleApproveComment(comment.id)}
                                    className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[10px] font-bold uppercase transition"
                                  >
                                    Aprovar
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="p-1.5 bg-luxury-gray-950 text-luxury-gray-400 hover:text-rose-400 rounded transition hover:bg-rose-950/20"
                                  title="Excluir"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MEDIA LIBRARY */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-luxury-gray-900 pb-5">
              <div>
                <h1 className="font-serif font-black text-2xl text-white uppercase tracking-tight">Biblioteca de Mídia</h1>
                <p className="text-xs text-luxury-gray-400 mt-1">Administre e armazene arquivos e fotos para embelezar as suas postagens.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* UPLOAD / SIMULATED FILE DROPPING */}
              <div className="lg:col-span-4 bg-luxury-gray-900 p-5 rounded-xl border border-luxury-gray-850 space-y-4">
                <h3 className="font-serif font-semibold text-white uppercase text-xs tracking-wide">Upload de Nova Imagem</h3>
                
                <form id="media-upload-form" onSubmit={handleLocalPhotoRegister} className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wide">Título Corporativo *</label>
                    <input
                      id="media-upload-title"
                      type="text"
                      required
                      placeholder="Ex: Gráfico de Ações Faria Lima..."
                      className="bg-luxury-gray-950 border border-luxury-gray-850 focus:border-gold-500 rounded text-xs text-white px-4 py-3 outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wide font-bold text-gold-500">Selecionar Foto Local (PC)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLocalFileChange}
                      className="bg-luxury-gray-950 border border-luxury-gray-850 hover:border-gold-500 rounded text-xs text-luxury-gray-300 px-3 py-2 cursor-pointer file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-mono file:font-bold file:bg-gold-500 file:text-luxury-gray-950 hover:file:bg-gold-600 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wide">URL de Imagem ou Base64 *</label>
                    <input
                      id="media-upload-url"
                      type="text"
                      required
                      placeholder="Cole um link ou escolha arquivo acima..."
                      className="bg-luxury-gray-950 border border-luxury-gray-850 focus:border-gold-500 rounded text-xs text-white px-4 py-3 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gold-500 hover:bg-gold-600 text-luxury-gray-950 font-bold text-xs py-3 rounded-lg transition duration-200 flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    <Upload size={13} />
                    <span>Cadastrar Imagem</span>
                  </button>
                </form>

                <hr className="border-luxury-gray-850" />

                <div>
                  <span className="text-[10px] font-mono font-bold text-gold-500 uppercase tracking-wide block mb-2">Presetações Rápidas Unsplash</span>
                  <div className="grid grid-cols-3 gap-2">
                    {mediaPresets.map((preset, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handlePresetMediaSelect(preset)}
                        className="relative group aspect-square rounded overflow-hidden border border-luxury-gray-850 cursor-pointer"
                      >
                        <img 
                          src={preset.url} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <Plus size={14} className="text-white bg-gold-500 rounded-full p-0.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MEDIA GALLERY GRID */}
              <div className="lg:col-span-8 bg-luxury-gray-900 p-5 rounded-xl border border-luxury-gray-850">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {mediaFiles.map(media => (
                    <div key={media.id} className="bg-luxury-gray-950 border border-luxury-gray-850 rounded-lg overflow-hidden group relative">
                      <div className="aspect-video w-full overflow-hidden border-b border-luxury-gray-850">
                        <img 
                          src={media.url} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                        />
                      </div>
                      <div className="p-3 text-[11px] space-y-1">
                        <h4 className="font-sans font-bold text-white truncate" title={media.title}>{media.title}</h4>
                        <div className="flex justify-between text-[10px] text-luxury-gray-400 font-mono">
                          <span>{media.fileSize}</span>
                          <span className="text-gold-500">{media.id}</span>
                        </div>
                      </div>
                      {/* Delete Overlay action */}
                      <button
                        onClick={() => handleDeleteMedia(media.id)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-950/80 backdrop-blur border border-rose-500/20 text-rose-300 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5.5: INSTAGRAM REELS MANAGEMENT */}
        {activeTab === 'reels' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-luxury-gray-900 pb-5">
              <div>
                <h1 className="font-serif font-black text-2xl text-white uppercase tracking-tight">Distribuição • Instagram Reels</h1>
                <p className="text-xs text-luxury-gray-400 mt-1">
                  Gerencie a exibição de vídeos curtos do Instagram sincronizados na página inicial ou configure sua API de Integração.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingReel({
                      title: '',
                      videoUrl: 'https://www.instagram.com/reels/',
                      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600&h=1000',
                      username: '@alemdobilhao',
                      viewsCount: '10K',
                      likesCount: '1.2K'
                    });
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-yellow-500 via-pink-600 to-purple-600 hover:brightness-110 text-white rounded text-xs font-bold uppercase transition flex items-center gap-2 shadow"
                >
                  <Plus size={14} />
                  <span>Adicionar Vídeo Manual</span>
                </button>
              </div>
            </div>

            {/* INTEGRATION SETTINGS */}
            <div className="bg-luxury-gray-900 p-6 rounded-xl border border-luxury-gray-850 space-y-6">
              <div className="flex items-center gap-2">
                <Instagram className="text-gold-400 animate-pulse" size={18} />
                <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">Sincronização Direta do Instagram</h3>
              </div>
              <p className="text-xs text-luxury-gray-400 leading-relaxed max-w-4xl">
                Deseja que os Reels apareçam de forma 100% automática e atualizada? Com o Além do Bilhão, você pode integrar diretamente a <strong>API de Exibição Básica do Instagram (Basic Display API)</strong>. Basta gerar o seu <strong>Token de Acesso de Usuário</strong> e salvá-lo abaixo.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-8 flex flex-col gap-1.5">
                  <label className="text-[10px] text-luxury-gray-400 font-mono uppercase font-black tracking-wider">User Access Token (Instagram Graph API)</label>
                  <input 
                    type="password"
                    placeholder="IGQVJxxxxxxxxxxxxxxxxxxxxxxxxxxxxx..."
                    value={instaToken}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInstaToken(val);
                      localStorage.setItem('instagram_access_token', val);
                    }}
                    className="bg-luxury-gray-950 border border-luxury-gray-850 rounded text-xs text-white px-4 py-3 outline-none focus:border-pink-500 w-full font-mono"
                  />
                </div>
                <div className="md:col-span-4 flex gap-2">
                  <button 
                    onClick={() => handleImportInstagram(instaToken)}
                    disabled={isImportingInsta}
                    className="flex-1 px-5 py-3 bg-gradient-to-r from-yellow-500 via-pink-600 to-purple-600 hover:brightness-110 text-white text-xs font-sans font-black uppercase tracking-wider rounded transition disabled:opacity-50 cursor-pointer"
                  >
                    {isImportingInsta ? "Importando..." : "Importar Reels"}
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm("Deseja remover o token de acesso do Instagram?")) {
                        setInstaToken('');
                        localStorage.removeItem('instagram_access_token');
                        alert("Token removido.");
                      }
                    }}
                    className="px-3 py-3 bg-luxury-gray-950 hover:bg-luxury-gray-850 border border-luxury-gray-800 text-rose-450 text-xs rounded transition"
                    title="Remover Token"
                  >
                    Remover
                  </button>
                </div>
              </div>

              {/* INSTAGRAM HELP GUIDE ACCORDION */}
              <div className="bg-luxury-gray-950/60 border border-luxury-gray-850 p-4.5 rounded-lg space-y-3">
                <h4 className="text-xs font-black text-white uppercase tracking-wider text-gold-450">Como obter o Token de Acesso do Instagram?</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px] text-luxury-gray-300 leading-relaxed">
                  <div className="space-y-1 bg-luxury-gray-900/40 p-3 rounded border border-luxury-gray-850">
                    <span className="text-gold-500 font-mono font-bold block text-xs">1. Facebook Developers</span>
                    <p className="text-luxury-gray-400">
                      Acesse o portal <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-gold-400 underline hover:text-white">Facebook Developers</a>, registre uma conta de desenvolvedor e crie um novo aplicativo do tipo <strong>"Consumidor"</strong>.
                    </p>
                  </div>
                  <div className="space-y-1 bg-luxury-gray-900/40 p-3 rounded border border-luxury-gray-850">
                    <span className="text-gold-500 font-mono font-bold block text-xs">2. Adicionar Exibição Básica</span>
                    <p className="text-luxury-gray-400">
                      Vá em "Adicionar Produto" e escolha <strong>"Exibição básica do Instagram"</strong> (Instagram Basic Display). Siga as etapas de registro de domínio rápido.
                    </p>
                  </div>
                  <div className="space-y-1 bg-luxury-gray-900/40 p-3 rounded border border-luxury-gray-850">
                    <span className="text-gold-500 font-mono font-bold block text-xs">3. Gerar Token de Teste</span>
                    <p className="text-luxury-gray-400">
                      Adicione seu usuário do Instagram na seção "User Token Generator", aceite o convite na sua conta do Instagram e clique em <strong>"Generate Token"</strong> para obter seu código de acesso.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-luxury-gray-500 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span>• Status da Integração:</span>
                  {instaToken ? (
                    <span className="text-emerald-400 font-semibold uppercase">Token configurado • Pronto para Importação</span>
                  ) : (
                    <span className="text-amber-400 font-semibold uppercase">Aguardando inserção de Token</span>
                  )}
                </div>
                <span>*O sistema utilizará fallback seguro de mídias curadas caso nenhum token seja configurado.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* EDITING FORM PANEL */}
              {editingReel && (
                <div className="lg:col-span-4 bg-luxury-gray-900 p-5 rounded-xl border border-luxury-gray-850 space-y-4">
                  <div className="flex items-center justify-between border-b border-luxury-gray-850 pb-3">
                    <h3 className="font-serif font-black text-xs text-white uppercase text-gold-450">
                      {editingReel.id ? 'Atualizar Dados do Reel' : 'Publicar Novo Vídeo Recente'}
                    </h3>
                    <button 
                      onClick={() => setEditingReel(null)}
                      title="Fechar"
                      className="text-luxury-gray-500 hover:text-white"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="space-y-4 flex flex-col">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-luxury-gray-400 font-mono uppercase font-black">Título / Descrição do Reel *</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Ex: Como faturar o primeiro milhão sendo um redator sênior de holding familiar..."
                        value={editingReel.title || ''}
                        onChange={(e) => setEditingReel(prev => ({ ...prev!, title: e.target.value }))}
                        className="bg-luxury-gray-950 border border-luxury-gray-850 rounded text-xs text-white px-4 py-3 outline-none focus:border-gold-500 font-sans"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-luxury-gray-400 font-mono uppercase font-black">URL do Vídeo Reel (Instagram) *</label>
                      <input
                        type="url"
                        required
                        placeholder="Ex: https://www.instagram.com/reels/C8T..."
                        value={editingReel.videoUrl || ''}
                        onChange={(e) => setEditingReel(prev => ({ ...prev!, videoUrl: e.target.value }))}
                        className="bg-luxury-gray-950 border border-luxury-gray-850 rounded text-xs text-white px-4 py-3 outline-none focus:border-gold-500 font-sans"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-luxury-gray-400 font-mono uppercase font-black">URL da Capa Thumbnail (Vertical 9:16) *</label>
                      <input
                        type="url"
                        required
                        placeholder="Ex: https://images.unsplash.com/..."
                        value={editingReel.imageUrl || ''}
                        onChange={(e) => setEditingReel(prev => ({ ...prev!, imageUrl: e.target.value }))}
                        className="bg-luxury-gray-950 border border-luxury-gray-850 rounded text-xs text-white px-4 py-3 outline-none focus:border-gold-500 mb-1 font-sans"
                      />
                      <span className="text-[9px] text-luxury-gray-500">Cole um link Unsplash de foto vertical ou utilize o padrão.</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-luxury-gray-400 font-mono uppercase">User Profile</label>
                        <input
                          type="text"
                          value={editingReel.username || ''}
                          onChange={(e) => setEditingReel(prev => ({ ...prev!, username: e.target.value }))}
                          className="bg-luxury-gray-950 border border-luxury-gray-850 rounded text-xs text-white px-3 py-2 outline-none focus:border-gold-500 font-sans"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] text-luxury-gray-400 font-mono uppercase">Views Simuladas</label>
                        <input
                          type="text"
                          value={editingReel.viewsCount || ''}
                          onChange={(e) => setEditingReel(prev => ({ ...prev!, viewsCount: e.target.value }))}
                          className="bg-luxury-gray-950 border border-luxury-gray-850 rounded text-xs text-white px-3 py-2 outline-none focus:border-gold-500 font-sans"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!editingReel.title || !editingReel.videoUrl || !editingReel.imageUrl) {
                          alert('Por favor, preencha todos os campos obrigatórios (*).');
                          return;
                        }
                        saveReel(editingReel as any);
                        setEditingReel(null);
                        loadDatabases();
                      }}
                      className="w-full bg-gradient-to-r from-yellow-500 via-pink-600 to-purple-600 font-sans font-bold text-xs text-white py-3 rounded-lg uppercase tracking-wider shadow hover:brightness-110 active:scale-95 transition"
                    >
                      {editingReel.id ? 'Salvar Alterações' : 'Publicar no Feed'}
                    </button>
                    
                    <button
                      onClick={() => setEditingReel(null)}
                      className="w-full bg-luxury-gray-950 border border-luxury-gray-850 hover:bg-luxury-gray-900 text-xs text-luxury-gray-400 py-3 rounded-lg uppercase transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* REELS GRID/LIST PANEL */}
              <div className={`${editingReel ? 'lg:col-span-8' : 'lg:col-span-12'} bg-luxury-gray-900 rounded-xl border border-luxury-gray-850 p-5 space-y-4`}>
                <h3 className="font-serif font-black text-sm text-white uppercase tracking-wider">Feed Listado de Vídeos</h3>

                {instagramReels.length === 0 ? (
                  <div className="p-12 text-center text-luxury-gray-500 italic">
                    Nenhum Reels cadastrado para exibição na página inicial.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {instagramReels.map(reel => (
                      <div 
                        key={reel.id} 
                        className="group relative aspect-[9/16] bg-luxury-gray-950 rounded-xl overflow-hidden border border-luxury-gray-850 hover:border-gold-500/50 transition flex flex-col shadow-lg"
                      >
                        <img 
                          src={reel.imageUrl} 
                          alt={reel.title} 
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-102 transition duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />

                        <div className="relative p-3 flex flex-col justify-between h-full z-10 text-left">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold text-white/90 truncate bg-black/40 px-2 py-0.5 rounded backdrop-blur">
                              {reel.username}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setEditingReel(reel)}
                                className="p-1 bg-black/65 hover:bg-black text-gold-400 rounded transition"
                                title="Editar"
                              >
                                <Edit2 size={10} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Deseja excluir este Reels do feed público?')) {
                                    deleteReel(reel.id);
                                    loadDatabases();
                                  }
                                }}
                                className="p-1 bg-black/65 hover:bg-rose-900 text-rose-400 rounded transition"
                                title="Excluir"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] font-sans font-bold text-white leading-snug line-clamp-2">
                              {reel.title}
                            </p>
                            <span className="text-[8px] font-mono text-gold-450 block font-normal">
                              Views: {reel.viewsCount}
                            </span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 6: USERS (SUPER ADMIN RESTRICTED) */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-luxury-gray-900 pb-5">
              <div>
                <h1 className="font-serif font-black text-2xl text-white uppercase tracking-tight">Equipe Administrativa</h1>
                <p className="text-xs text-luxury-gray-400 mt-1">Gerencie as contas de Super Admins, Editores e Redatores do Além do Bilhão.</p>
              </div>
            </div>

            {currentUser.role !== 'Super Admin' ? (
              <div className="bg-rose-950/20 border border-rose-500 max-w-lg p-5 rounded-xl text-xs space-y-2 text-rose-300">
                <h3 className="font-bold flex items-center gap-1"><AlertTriangle size={14} /> Permissão Negada</h3>
                <p className="leading-relaxed">
                  Desculpe. Suas credenciais atuais de {currentUser.role} não possuem poderes de Super Admin para visualização ou edição das credenciais e permissões dos outros colaboradores.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* CRUD FORM */}
                <div className="lg:col-span-4 bg-luxury-gray-900 p-5 rounded-xl border border-luxury-gray-850">
                  <h3 className="font-serif font-semibold text-white uppercase text-xs mb-4">
                    {editingUser ? 'Editar Usuário' : 'Cadastrar Novo Redator'}
                  </h3>
                  <form onSubmit={handleSaveUser} className="space-y-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-luxury-gray-400 font-mono uppercase">Nome Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Roberta Kovac"
                        value={editingUser?.name || ''}
                        onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-luxury-gray-950 border border-luxury-gray-850 rounded text-xs text-white px-4 py-3 outline-none focus:border-gold-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-luxury-gray-400 font-mono uppercase white">E-mail Profissional *</label>
                      <input
                        type="email"
                        required
                        placeholder="Ex: roberta@alemdobilhao.com"
                        value={editingUser?.email || ''}
                        onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-luxury-gray-950 border border-luxury-gray-850 rounded text-xs text-white px-4 py-3 outline-none focus:border-gold-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-luxury-gray-400 font-mono uppercase">Função / Tipo de Perfil</label>
                      <select
                        value={editingUser?.role || 'Autor'}
                        onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value as UserRole }))}
                        className="bg-luxury-gray-950 border border-luxury-gray-850 rounded text-xs text-luxury-gray-300 px-4 py-3 outline-none focus:border-gold-500"
                      >
                        <option value="Super Admin">Super Admin (Controle Total)</option>
                        <option value="Editor">Editor (Publicações & Mídias)</option>
                        <option value="Autor">Autor (Apenas posts próprios)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-luxury-gray-400 font-mono uppercase">Biografia Executiva</label>
                      <textarea
                        rows={2}
                        placeholder="Relato de qualificações curtas..."
                        value={editingUser?.bio || ''}
                        onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, bio: e.target.value }) : null)}
                        className="bg-luxury-gray-950 border border-luxury-gray-850 rounded text-xs text-white px-4 py-3 outline-none resize-none focus:border-gold-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-luxury-gray-400 font-mono uppercase font-bold text-gold-500">Foto de Perfil (Avatar) da Equipe</label>
                      <input
                        type="text"
                        placeholder="Cole um link de imagem ou arquivo abaixo..."
                        value={editingUser?.avatarUrl || ''}
                        onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, avatarUrl: e.target.value }) : null)}
                        className="bg-luxury-gray-950 border border-luxury-gray-850 rounded text-xs text-white px-4 py-3 outline-none focus:border-gold-500 mb-1.5"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setEditingUser(prev => prev ? ({ ...prev, avatarUrl: event.target.result as string }) : null);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="bg-luxury-gray-950 border border-luxury-gray-850 hover:border-gold-500 rounded text-[10px] text-luxury-gray-300 px-3 py-1.5 cursor-pointer file:mr-2.5 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-mono file:font-bold file:bg-gold-500 file:text-luxury-gray-950 hover:file:bg-gold-600 focus:outline-none w-full"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      {editingUser && (
                        <button
                          type="button"
                          onClick={() => setEditingUser(null)}
                          className="bg-luxury-gray-850 hover:bg-luxury-gray-800 text-luxury-gray-300 text-xs px-4 py-2.5 rounded transition"
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="submit"
                        className="bg-gold-500 hover:bg-gold-600 text-luxury-gray-950 font-bold text-xs px-5 py-2.5 rounded transition"
                      >
                        Salvar
                      </button>
                    </div>
                  </form>
                </div>

                {/* GRID DISPLAY */}
                <div className="lg:col-span-8 bg-luxury-gray-900 rounded-xl border border-luxury-gray-850 overflow-hidden shadow">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-luxury-gray-950 text-luxury-gray-400 font-mono uppercase tracking-wider text-[10px] border-b border-luxury-gray-850">
                          <th className="p-4">Colaborador</th>
                          <th className="p-4">Credencial (Cargo)</th>
                          <th className="p-4">Descritivo Biográfico</th>
                          <th className="p-4">Permissões</th>
                          <th className="p-4 text-right">Controles</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-luxury-gray-850">
                        {users.map(u => (
                          <tr key={u.id} className="hover:bg-luxury-gray-850/40 transition">
                            <td className="p-4 flex items-center gap-2.5">
                              <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-gold-400 shrink-0" />
                              <div>
                                <h4 className="font-bold text-white leading-none">{u.name}</h4>
                                <span className="text-[10px] text-luxury-gray-400 block mt-1">{u.email}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-[11px] font-mono font-semibold text-gold-400">{u.role}</span>
                            </td>
                            <td className="p-4 text-luxury-gray-300 max-w-xxs truncate leading-relaxed">
                              {u.bio || 'Sem biografia.'}
                            </td>
                            <td className="p-4 text-luxury-gray-400">
                              {u.role === 'Super Admin' ? 'Tudo' : u.role === 'Editor' ? 'Publicações' : 'Apenas Próprios'}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setEditingUser(u)}
                                  className="p-1.5 bg-luxury-gray-950 text-luxury-gray-400 hover:text-gold-400 rounded transition"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-1.5 bg-luxury-gray-950 text-luxury-gray-400 hover:text-rose-450 rounded transition hover:bg-rose-950/20"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 7: RELATIONAL DATABASE INSPECTOR */}
        {activeTab === 'db-inspector' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-luxury-gray-900 pb-5">
              <div>
                <h1 className="font-serif font-black text-2xl text-white uppercase tracking-tight flex items-center gap-2">
                  <Database size={20} className="text-gold-500" />
                  <span>Inspetor de Tabelas Relacionais</span>
                </h1>
                <p className="text-xs text-luxury-gray-400 mt-1">Visualize e audite a integridade das tabelas relacionais do banco de dados Além do Bilhão.</p>
              </div>
            </div>

            {/* SUPABASE CONNECTION MANAGER */}
            <div className="bg-luxury-gray-950 border border-luxury-gray-850 p-6 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-serif font-black text-white text-xs uppercase tracking-wider text-gold-500 flex items-center gap-1.5">
                    <Database size={14} />
                    <span>Conexão do Supabase (Nuvem)</span>
                  </h3>
                  <p className="text-xs text-luxury-gray-400">
                    Sincronize automaticamente os posts criados ou editados no Além do Bilhão diretamente com a sua conta do Supabase.
                  </p>
                </div>
                <div>
                  {supabaseStatus === 'connected' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      SUPABASE_CONECTADO
                    </span>
                  )}
                  {supabaseStatus === 'needs_schema' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      REQUER_TABELAS_SQL
                    </span>
                  )}
                  {supabaseStatus === 'unconfigured' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-luxury-gray-850 text-luxury-gray-400 border border-luxury-gray-700">
                      SUPABASE_NAO_CONFIGURADO
                    </span>
                  )}
                  {supabaseStatus === 'loading' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      VERIFICANDO_CONEXAO...
                    </span>
                  )}
                  {supabaseStatus === 'error' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      ERRO_DE_CONEXAO
                    </span>
                  )}
                </div>
              </div>

              {supabaseStatus === 'unconfigured' && (
                <div className="bg-luxury-gray-900 border border-luxury-gray-850 p-4 rounded-xl space-y-3 text-xs leading-relaxed text-luxury-gray-300">
                  <p>
                    Para ativar a persistência em nuvem, configure as seguintes chaves de ambiente no menu de <strong>Configurações (Secrets) do AI Studio</strong>:
                  </p>
                  <ul className="list-disc pl-5 font-mono text-[10px] text-gold-400 space-y-1">
                    <li>SUPABASE_URL="sua-url-do-supabase-aqui"</li>
                    <li>SUPABASE_ANON_KEY="sua-chave-anon-aqui"</li>
                  </ul>
                  <p className="text-[10px] text-luxury-gray-400">
                    Ao definir essas variáveis, o sistema começará a salvar seus posts de forma permanente na nuvem para evitar qualquer perda de dados.
                  </p>
                  <button
                    onClick={checkSupabaseStatus}
                    className="mt-2 inline-flex items-center gap-1 bg-luxury-gray-850 hover:bg-luxury-gray-800 border border-luxury-gray-700 px-3 py-1.5 rounded text-[11px] text-white font-bold transition cursor-pointer"
                  >
                    Verificar Novamente
                  </button>
                </div>
              )}

              {supabaseStatus === 'connected' && (
                <div className="bg-emerald-950/10 border border-emerald-500/10 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-emerald-400 font-bold">Banco de Dados em Nuvem Ativo</p>
                    <p className="text-luxury-gray-400 text-[11px]">
                      Sua conexão com o Supabase está operacional. Toda criação ou atualização de artigos, categorias e reels feita por aqui está sincronizada.
                    </p>
                  </div>
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="whitespace-nowrap bg-emerald-500 hover:bg-emerald-600 text-luxury-gray-950 px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSyncing ? "Sincronizando..." : "Sincronizar Agora"}
                  </button>
                </div>
              )}

              {supabaseStatus === 'needs_schema' && (
                <div className="bg-luxury-gray-900 border border-luxury-gray-850 p-5 rounded-xl space-y-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-amber-400 font-bold">Criação de Tabelas Requerida</p>
                    <p className="text-luxury-gray-400 text-[11px]">
                      O Supabase está conectado, mas não encontrou as tabelas <strong>categories</strong>, <strong>posts</strong> e <strong>reels</strong>. Copie o script SQL abaixo e cole no seu <strong>SQL Editor do Supabase</strong> para habilitar a sincronização:
                    </p>
                  </div>

                  <div className="relative">
                    <pre className="text-[10px] text-green-400 font-mono bg-luxury-gray-950 p-4 rounded-lg overflow-x-auto max-h-48 leading-relaxed select-all">
{`-- 1. Tabela de Categorias
create table if not exists categories (
  id text primary key,
  name text not null,
  slug text not null,
  description text
);

-- 2. Tabela de Posts / Artigos
create table if not exists posts (
  id text primary key,
  title text not null,
  slug text not null unique,
  summary text,
  content text,
  image_url text,
  video_url text,
  category_id text references categories(id) on delete set null,
  author_id text,
  tags text[],
  status text not null,
  views integer default 0,
  published_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  reading_time integer default 1,
  layout_position text,
  is_exclusive boolean default false
);

-- 3. Tabela de Instagram Reels
create table if not exists reels (
  id text primary key,
  title text not null,
  video_url text not null,
  image_url text not null,
  username text default '@alemdobilhao',
  avatar_url text,
  views_count text default '10K',
  likes_count text default '1.1K',
  created_at timestamp with time zone default now()
);`}
                    </pre>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={checkSupabaseStatus}
                      className="bg-gold-500 hover:bg-gold-600 text-luxury-gray-950 font-bold px-4 py-2 rounded text-[11px] transition cursor-pointer"
                    >
                      Já Executei o Script! Verificar Conexão
                    </button>
                    <button
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="bg-luxury-gray-850 hover:bg-luxury-gray-800 text-luxury-gray-300 px-3 py-2 rounded text-[11px] transition cursor-pointer"
                    >
                      {isSyncing ? "Sincronizando..." : "Sincronizar Forçado"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* TAB SELECTOR */}
            <div className="flex flex-wrap gap-2.5 bg-luxury-gray-900 p-2.5 rounded-xl border border-luxury-gray-850">
              {['users', 'posts', 'categories', 'tags', 'media', 'comments', 'analytics'].map(tbl => (
                <button
                  key={tbl}
                  onClick={() => setActiveDbInspectorTable(tbl)}
                  className={`px-3 py-2 rounded text-[11px] font-mono uppercase tracking-wide transition ${
                    activeDbInspectorTable === tbl ? 'bg-gold-500 text-luxury-gray-950 font-bold' : 'hover:bg-luxury-gray-950 text-luxury-gray-400'
                  }`}
                >
                  TBL_{tbl.toUpperCase()}
                </button>
              ))}
            </div>

            {/* RELATIONAL GRID BOARD */}
            <div className="bg-luxury-gray-900 border border-luxury-gray-850 rounded-xl overflow-hidden shadow">
              <div className="bg-luxury-gray-950 p-4 border-b border-luxury-gray-850 flex items-center justify-between text-xs font-mono text-gold-400">
                <span>Esquema Técnico Relacional: {activeDbInspectorTable.toUpperCase()} (Fidelidade SQL)</span>
                <span className="text-luxury-gray-500">Chaves estrangeiras habilitadas</span>
              </div>
              
              <div className="overflow-x-auto p-4">
                {activeDbInspectorTable === 'users' && (
                  <pre className="text-[11px] text-green-400 font-mono overflow-x-auto leading-relaxed whitespace-pre bg-luxury-gray-950 p-4 rounded-lg">
                    {JSON.stringify(users, null, 2)}
                  </pre>
                )}

                {activeDbInspectorTable === 'posts' && (
                  <pre className="text-[11px] text-green-400 font-mono overflow-x-auto leading-relaxed whitespace-pre bg-luxury-gray-950 p-4 rounded-lg">
                    {JSON.stringify(posts.map(p => ({
                      id: p.id,
                      title: p.title,
                      fk_category_id: p.categoryId, // Explicit foreign keys
                      fk_author_id: p.authorId,
                      slug: p.slug,
                      status: p.status,
                      views: p.views,
                      created_at: p.createdAt
                    })), null, 2)}
                  </pre>
                )}

                {activeDbInspectorTable === 'categories' && (
                  <pre className="text-[11px] text-green-400 font-mono overflow-x-auto leading-relaxed whitespace-pre bg-luxury-gray-950 p-4 rounded-lg">
                    {JSON.stringify(categories, null, 2)}
                  </pre>
                )}

                {activeDbInspectorTable === 'tags' && (
                  <pre className="text-[11px] text-green-400 font-mono overflow-x-auto leading-relaxed whitespace-pre bg-luxury-gray-950 p-4 rounded-lg">
                    {JSON.stringify(getComments(), null, 2)}
                  </pre>
                )}

                {activeDbInspectorTable === 'media' && (
                  <pre className="text-[11px] text-green-400 font-mono overflow-x-auto leading-relaxed whitespace-pre bg-luxury-gray-950 p-4 rounded-lg">
                    {JSON.stringify(mediaFiles, null, 2)}
                  </pre>
                )}

                {activeDbInspectorTable === 'comments' && (
                  <pre className="text-[11px] text-green-400 font-mono overflow-x-auto leading-relaxed whitespace-pre bg-luxury-gray-950 p-4 rounded-lg">
                    {JSON.stringify(comments.map(c => ({
                      id: c.id,
                      fk_post_id: c.postId,
                      author_name: c.authorName,
                      status: c.status,
                      content: c.content
                    })), null, 2)}
                  </pre>
                )}

                {activeDbInspectorTable === 'analytics' && (
                  <pre className="text-[11px] text-green-400 font-mono overflow-x-auto leading-relaxed whitespace-pre bg-luxury-gray-950 p-4 rounded-lg">
                    {JSON.stringify(analytics, null, 2)}
                  </pre>
                )}
              </div>
            </div>

            <div className="bg-luxury-gray-900 border border-luxury-gray-850 p-5 rounded-xl text-xs space-y-2 leading-relaxed">
              <h4 className="font-serif font-black text-white uppercase tracking-wider text-[11px]">Metadados do Banco de Dados Relacional</h4>
              <p className="text-luxury-gray-400">
                O site simula um sistema de relacional PostgreSQL operando com indexadores de busca rápidos no navegador do cliente.<br/>
                Os relacionamentos são estruturados da seguinte forma: <span className="text-gold-400">USERS (1) → (N) POSTS</span>, <span className="text-gold-400">CATEGORIES (1) → (N) POSTS</span>, e <span className="text-gold-400">POSTS (1) → (N) COMMENTS</span>.
              </p>
            </div>
          </div>
        )}

      </main>

      {/* POPUP: EDIT SELF PROFILE PHOTO (AVATAR) */}
      {showProfileModal && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-luxury-gray-900 border border-luxury-gray-850 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-luxury-gray-850 mb-4">
              <h3 className="font-serif font-black text-white uppercase tracking-wider text-xs">Alterar Foto de Perfil</h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-luxury-gray-400 hover:text-white font-mono text-xs leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-4 bg-luxury-gray-950/40 rounded-xl border border-luxury-gray-850">
                <span className="text-[9px] font-mono font-bold text-luxury-gray-500 uppercase tracking-widest mb-3">Prévia do Avatar</span>
                <div className="relative">
                  <img 
                    src={tempProfileUrl || currentUser.avatarUrl} 
                    alt="Preview" 
                    className="w-20 h-20 rounded-full border-2 border-gold-400 object-cover shadow-lg"
                  />
                </div>
                <h4 className="text-xs font-bold text-white mt-2.5 leading-none">{currentUser.name}</h4>
                <span className="text-[10px] text-gold-400 font-mono mt-1.5">{currentUser.role}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wider font-bold text-gold-500">
                  Selecionar Imagem do Computador (PC)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setTempProfileUrl(event.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="bg-luxury-gray-950 border border-luxury-gray-850 hover:border-gold-500 rounded text-xs text-luxury-gray-300 px-3 py-2 cursor-pointer file:mr-2.5 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-mono file:font-bold file:bg-gold-500 file:text-luxury-gray-950 hover:file:bg-gold-600 focus:outline-none w-full"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-luxury-gray-400 font-mono uppercase tracking-wider">
                  Ou URL externa da Web
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/... ou Base64"
                  value={tempProfileUrl.startsWith('data:') ? '' : tempProfileUrl}
                  onChange={(e) => setTempProfileUrl(e.target.value)}
                  className="bg-luxury-gray-950 border border-luxury-gray-850 focus:border-gold-500 rounded text-xs text-white px-3 py-2.5 outline-none w-full"
                />
              </div>

              <div className="flex gap-2.5 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="bg-luxury-gray-850 hover:bg-luxury-gray-800 text-luxury-gray-300 text-xs px-4 py-2.5 rounded font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateSelfProfilePhoto(tempProfileUrl)}
                  className="bg-gold-500 hover:bg-gold-600 text-luxury-gray-950 font-bold text-xs px-5 py-2.5 rounded font-black uppercase tracking-wider transition"
                >
                  Salvar Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
