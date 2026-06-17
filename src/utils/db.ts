/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Post, Category, Tag, User, MediaFile, Comment, DailyAnalytics, InstagramReel } from '../types';
import {
  INITIAL_POSTS,
  INITIAL_CATEGORIES,
  INITIAL_TAGS,
  INITIAL_USERS,
  INITIAL_MEDIA,
  INITIAL_COMMENTS,
  INITIAL_ANALYTICS,
  INITIAL_INSTAGRAM_REELS
} from '../data/initialData';

// Constants for storage keys
const KEYS = {
  POSTS: 'ab_db_posts',
  CATEGORIES: 'ab_db_categories',
  TAGS: 'ab_db_tags',
  USERS: 'ab_db_users',
  MEDIA: 'ab_db_media',
  COMMENTS: 'ab_db_comments',
  ANALYTICS: 'ab_db_analytics',
  CURRENT_USER: 'ab_db_current_user',
  REELS: 'ab_db_reels'
};

// Auto initialisation of database tables
export function initDB() {
  // One-time forced reset of posts, comments, and media to give a clean slate as requested
  if (!localStorage.getItem('ab_db_force_reset_clean_slate_v5')) {
    localStorage.setItem(KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify([]));
    localStorage.setItem(KEYS.MEDIA, JSON.stringify(INITIAL_MEDIA));
    localStorage.setItem(KEYS.REELS, JSON.stringify(INITIAL_INSTAGRAM_REELS));
    localStorage.setItem('ab_db_force_reset_clean_slate_v5', 'true');
  }

  // Force pre-logged admin clear once to ensure guest view is active by default
  if (!localStorage.getItem('ab_db_logout_guest_once')) {
    localStorage.removeItem(KEYS.CURRENT_USER);
    localStorage.setItem('ab_db_logout_guest_once', 'true');
  }

  if (!localStorage.getItem(KEYS.POSTS)) {
    localStorage.setItem(KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
  }
  if (!localStorage.getItem(KEYS.CATEGORIES)) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(KEYS.TAGS)) {
    localStorage.setItem(KEYS.TAGS, JSON.stringify(INITIAL_TAGS));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(KEYS.MEDIA)) {
    localStorage.setItem(KEYS.MEDIA, JSON.stringify(INITIAL_MEDIA));
  }
  if (!localStorage.getItem(KEYS.COMMENTS)) {
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify(INITIAL_COMMENTS));
  }
  if (!localStorage.getItem(KEYS.ANALYTICS)) {
    localStorage.setItem(KEYS.ANALYTICS, JSON.stringify(INITIAL_ANALYTICS));
  }
  if (!localStorage.getItem(KEYS.REELS)) {
    localStorage.setItem(KEYS.REELS, JSON.stringify(INITIAL_INSTAGRAM_REELS));
  }
}

// Low-level helper functions
function getTable<T>(key: string): T[] {
  initDB();
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}

function saveTable<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Helper to calculate reading time
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 180;
  const cleanInput = text.replace(/<[^>]*>/g, ''); // strip HTML tags
  const wordCount = cleanInput.split(/\s+/).filter(word => word.length > 0).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

// ----------------------------------------------------
// READ & WRITE METHODS (Relational CRUD Interfaces)
// ----------------------------------------------------

// === POSTS ===
export function getPosts(): Post[] {
  return getTable<Post>(KEYS.POSTS).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getPostBySlug(slug: string): Post | undefined {
  const posts = getPosts();
  return posts.find(p => p.slug === slug);
}

export function getPostById(id: string): Post | undefined {
  const posts = getPosts();
  return posts.find(p => p.id === id);
}

export function savePost(postData: Partial<Post> & { title: string; content: string; categoryId: string; authorId: string }): Post {
  const posts = getPosts();
  const author = getUserById(postData.authorId);
  const readingTime = calculateReadingTime(postData.content);

  // Generate automated slug
  const cleanSlug = postData.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove brazilian portuguese accents
    .replace(/[^a-z0-9\s-]/g, '')   // remove symbols
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/-+/g, '-');           // avoid consecutive hyphens

  let finalPost: Post;

  if (postData.id) {
    // EDIT Existing
    const index = posts.findIndex(p => p.id === postData.id);
    const existing = posts[index];
    finalPost = {
      ...existing,
      ...postData,
      slug: postData.slug || existing.slug || cleanSlug,
      readingTime,
      publishedAt: postData.status === 'published' && existing.status !== 'published' ? new Date().toISOString() : existing.publishedAt || new Date().toISOString()
    } as Post;
    posts[index] = finalPost;
  } else {
    // CREATE New
    finalPost = {
      id: 'post_' + Math.random().toString(36).substr(2, 9),
      title: postData.title,
      slug: cleanSlug,
      summary: postData.summary || postData.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
      content: postData.content,
      imageUrl: postData.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
      videoUrl: postData.videoUrl || '',
      categoryId: postData.categoryId,
      authorId: postData.authorId,
      tags: postData.tags || [],
      status: postData.status || 'draft',
      views: 0,
      publishedAt: postData.status === 'published' ? new Date().toISOString() : '',
      createdAt: new Date().toISOString(),
      readingTime,
      layoutPosition: postData.layoutPosition || 'meio'
    };
    posts.unshift(finalPost);

    // Dynamic SEO Tracker: increment post metrics in general logs
    logGlobalEvent('post_creation', finalPost.id);
  }

  saveTable(KEYS.POSTS, posts);
  return finalPost;
}

export function deletePost(postId: string): boolean {
  const posts = getPosts();
  const filtered = posts.filter(p => p.id !== postId);
  saveTable(KEYS.POSTS, filtered);
  return posts.length !== filtered.length;
}

export function duplicatePost(postId: string): Post | null {
  const post = getPostById(postId);
  if (!post) return null;

  const duplicated: Post = {
    ...post,
    id: 'post_' + Math.random().toString(36).substr(2, 9),
    title: `${post.title} (Cópia)`,
    slug: `${post.slug}-copia-${Math.floor(Math.random() * 1000)}`,
    status: 'draft',
    views: 0,
    createdAt: new Date().toISOString(),
    publishedAt: ''
  };

  const posts = getPosts();
  posts.unshift(duplicated);
  saveTable(KEYS.POSTS, posts);
  return duplicated;
}

export function incrementPostViews(postId: string) {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === postId);
  if (index !== -1) {
    posts[index].views += 1;
    saveTable(KEYS.POSTS, posts);

    // Also increment global daily charts
    incrementDailyAnalytics();
  }
}

// === CATEGORIES ===
export function getCategories(): Category[] {
  return getTable<Category>(KEYS.CATEGORIES);
}

export function getCategoryById(id: string): Category | undefined {
  const cats = getCategories();
  return cats.find(c => c.id === id);
}

export function saveCategory(catData: Partial<Category> & { name: string; description: string }): Category {
  const cats = getCategories();
  const slug = catData.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();

  let finalCat: Category;

  if (catData.id) {
    const idx = cats.findIndex(c => c.id === catData.id);
    finalCat = { ...cats[idx], ...catData, slug } as Category;
    cats[idx] = finalCat;
  } else {
    finalCat = {
      id: 'cat_' + Math.random().toString(36).substr(2, 5),
      name: catData.name,
      description: catData.description,
      slug
    };
    cats.push(finalCat);
  }

  saveTable(KEYS.CATEGORIES, cats);
  return finalCat;
}

export function deleteCategory(id: string): boolean {
  const cats = getCategories();
  // Prevent deleting critical business category default
  if (cats.length <= 1) return false;
  const filtered = cats.filter(c => c.id !== id);
  saveTable(KEYS.CATEGORIES, filtered);
  return cats.length !== filtered.length;
}

// === TAGS ===
export function getTags(): Tag[] {
  return getTable<Tag>(KEYS.TAGS);
}

export function saveTag(tagName: string): Tag {
  const tags = getTags();
  const existing = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
  if (existing) return existing;

  const slug = tagName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const newTag: Tag = {
    id: 'tag_' + Math.random().toString(36).substr(2, 5),
    name: tagName,
    slug
  };
  tags.push(newTag);
  saveTable(KEYS.TAGS, tags);
  return newTag;
}

// === USERS ===
export function getUsers(): User[] {
  return getTable<User>(KEYS.USERS);
}

export function getUserById(id: string): User | undefined {
  const users = getUsers();
  return users.find(u => u.id === id);
}

export function saveUser(userData: Partial<User> & { name: string; email: string; role: 'Super Admin' | 'Editor' | 'Autor' }): User {
  const users = getUsers();
  let finalUser: User;

  if (userData.id) {
    const idx = users.findIndex(u => u.id === userData.id);
    finalUser = { ...users[idx], ...userData } as User;
    users[idx] = finalUser;
  } else {
    finalUser = {
      id: 'user_' + Math.random().toString(36).substr(2, 5),
      name: userData.name,
      email: userData.email,
      passwordHash: '123456', // default password simulation
      role: userData.role,
      avatarUrl: userData.avatarUrl || `https://images.unsplash.com/photo-${['1534528741775-53994a69daeb', '1507003211169-0a1dd7228f2d', '1573496359142-b8d87734a5a2'][Math.floor(Math.random() * 3)]}?auto=format&fit=crop&q=80&w=150`,
      bio: userData.bio || 'Membro correspondente da redação Além do Bilhão.',
      active: true,
      createdAt: new Date().toISOString()
    };
    users.push(finalUser);
  }

  saveTable(KEYS.USERS, users);
  
  // Update active current user in session if edits applied to itself
  const current = getLoggedUser();
  if (current && current.id === finalUser.id) {
    setLoggedUser(finalUser);
  }

  return finalUser;
}

export function deleteUser(id: string): boolean {
  const users = getUsers();
  // Prevent deleting all administrators
  const adminsCount = users.filter(u => u.role === 'Super Admin').length;
  const targetUser = users.find(u => u.id === id);
  if (targetUser?.role === 'Super Admin' && adminsCount <= 1) {
    return false; // Can't delete lone administrator
  }

  const filtered = users.filter(u => u.id !== id);
  saveTable(KEYS.USERS, filtered);
  return users.length !== filtered.length;
}

// === MEDIA LIBRARY ===
export function getMedia(): MediaFile[] {
  return getTable<MediaFile>(KEYS.MEDIA);
}

export function saveMedia(media: Omit<MediaFile, 'id' | 'uploadedAt'>): MediaFile {
  const mediaList = getMedia();
  const file: MediaFile = {
    ...media,
    id: 'media_' + Math.random().toString(36).substr(2, 6),
    uploadedAt: new Date().toISOString()
  };
  mediaList.unshift(file);
  saveTable(KEYS.MEDIA, mediaList);
  return file;
}

export function deleteMedia(id: string): boolean {
  const mediaList = getMedia();
  const filtered = mediaList.filter(m => m.id !== id);
  saveTable(KEYS.MEDIA, filtered);
  return mediaList.length !== filtered.length;
}

// === COMMENTS ===
export function getComments(postId?: string): Comment[] {
  const Comments = getTable<Comment>(KEYS.COMMENTS).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  if (postId) {
    return Comments.filter(c => c.postId === postId);
  }
  return Comments;
}

export function saveComment(postId: string, authorName: string, authorEmail: string, content: string): Comment {
  const comments = getComments();
  const newComment: Comment = {
    id: 'comm_' + Math.random().toString(36).substr(2, 9),
    postId,
    authorName,
    authorEmail,
    content,
    status: 'pending', // CMS moderation requested by default
    createdAt: new Date().toISOString()
  };
  comments.unshift(newComment);
  saveTable(KEYS.COMMENTS, comments);
  return newComment;
}

export function approveComment(commentId: string): boolean {
  const comments = getComments();
  const index = comments.findIndex(c => c.id === commentId);
  if (index !== -1) {
    comments[index].status = 'approved';
    saveTable(KEYS.COMMENTS, comments);
    return true;
  }
  return false;
}

export function deleteComment(commentId: string): boolean {
  const comments = getComments();
  const filtered = comments.filter(c => c.id !== commentId);
  saveTable(KEYS.COMMENTS, filtered);
  return comments.length !== filtered.length;
}

// === ANALYTICS LOGGER ===
export function getAnalytics(): DailyAnalytics[] {
  return getTable<DailyAnalytics>(KEYS.ANALYTICS);
}

function incrementDailyAnalytics() {
  const stats = getAnalytics();
  if (stats.length === 0) return;

  // We find or update the entry of "today" (last element is 06-14 in initialData)
  const lastIndex = stats.length - 1;
  stats[lastIndex].pageviews += 1;
  if (Math.random() > 0.4) {
    stats[lastIndex].visitors += 1;
  }
  if (Math.random() > 0.3) {
    stats[lastIndex].sessions += 1;
  }
  saveTable(KEYS.ANALYTICS, stats);
}

// Log general action trackers
function logGlobalEvent(event: string, objectId: string) {
  console.log(`[RELATIONAL ENGINE LOG]: Event triggered - ${event} on ${objectId}`);
}

// === AUTHENTICATION SIMULATOR ===
export function getLoggedUser(): User | null {
  const user = localStorage.getItem(KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
}

export function setLoggedUser(user: User | null) {
  if (user) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.CURRENT_USER);
  }
}

export function login(email: string, passwordPlain: string): { success: boolean; user?: User; error?: string } {
  const users = getUsers();
  const found = users.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());

  if (!found) {
    return { success: false, error: 'E-mail administrativo não cadastrado.' };
  }
  if (!found.active) {
    return { success: false, error: 'Esta conta administrativa está atualmente inativa.' };
  }

  // Support plain text match or standard pre-seeded admin key '123456'
  if (passwordPlain === '123456' || passwordPlain === found.passwordHash) {
    setLoggedUser(found);
    return { success: true, user: found };
  }

  return { success: false, error: 'Senha incorreta para a conta selecionada.' };
}

export function logout() {
  setLoggedUser(null);
}

// === INSTAGRAM REELS ===
export function getReels(): InstagramReel[] {
  return getTable<InstagramReel>(KEYS.REELS).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveReel(reelData: Partial<InstagramReel> & { title: string; videoUrl: string; imageUrl: string }): InstagramReel {
  const reels = getTable<InstagramReel>(KEYS.REELS);
  let finalReel: InstagramReel;

  if (reelData.id) {
    const index = reels.findIndex(r => r.id === reelData.id);
    const existing = reels[index];
    finalReel = {
      ...existing,
      ...reelData
    } as InstagramReel;
    reels[index] = finalReel;
  } else {
    finalReel = {
      id: 'reel_' + Math.random().toString(36).substr(2, 9),
      title: reelData.title,
      videoUrl: reelData.videoUrl,
      imageUrl: reelData.imageUrl,
      username: reelData.username || '@alemdobilhao',
      avatarUrl: reelData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      viewsCount: reelData.viewsCount || '10K',
      likesCount: reelData.likesCount || '1.1K',
      createdAt: new Date().toISOString()
    };
    reels.push(finalReel);
  }

  saveTable(KEYS.REELS, reels);
  return finalReel;
}

export function deleteReel(id: string) {
  const reels = getTable<InstagramReel>(KEYS.REELS);
  const filtered = reels.filter(r => r.id !== id);
  saveTable(KEYS.REELS, filtered);
}

