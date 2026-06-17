/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// User administrative roles as specified in instructions
export type UserRole = 'Super Admin' | 'Editor' | 'Autor';

export interface User {
  id: string; // BIGINT/UUID equivalent
  name: string;
  email: string;
  passwordHash: string; // Simulated encrypted credentials
  role: UserRole;
  avatarUrl: string;
  bio?: string;
  active: boolean;
  createdAt: string;
}

export type PostStatus = 'draft' | 'published' | 'scheduled';

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string; // Full HTML content from the rich text editor simulation
  imageUrl: string;
  videoUrl?: string; // Optional embedded video link
  categoryId: string; // Foreign Key pointing to Category
  authorId: string; // Foreign Key pointing to User
  tags: string[]; // List of Tag names or relative IDs
  status: PostStatus;
  views: number;
  publishedAt: string;
  createdAt: string;
  readingTime: number; // calculated in minutes
  layoutPosition?: 'esquerda' | 'direita' | 'meio' | 'maior' | 'menor';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface MediaFile {
  id: string;
  title: string;
  url: string;
  fileSize: string; // e.g. "450 KB"
  mimeType: string; // e.g. "image/jpeg"
  uploadedAt: string;
}

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export interface Comment {
  id: string;
  postId: string; // Foreign Key pointing to Post
  authorName: string;
  authorEmail: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
}

// Analytics and access history tables
export interface DailyAnalytics {
  id: string;
  date: string; // YYYY-MM-DD
  pageviews: number;
  visitors: number;
  sessions: number;
  bounceRate: number; // e.g., 42%
}

export interface PostAnalytics {
  postId: string;
  title: string;
  views: number;
  commentsCount: number;
  sharesCount: number;
}
