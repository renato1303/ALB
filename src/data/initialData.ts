/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Category, Tag, Post, Comment, MediaFile, DailyAnalytics } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_1',
    name: 'Bruno Ramos',
    email: 'contatolinkagencia@gmail.com', // Pre-configured Super Admin based on viewer metadata
    passwordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', // password '123456' mockup
    role: 'Super Admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    bio: 'Fundador e Diretor de Redação do Além do Bilhão. Investidor de risco e entusiasta de inovação no mercado latino-americano.',
    active: true,
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 'user_2',
    name: 'Mariana Alencar',
    email: 'mariana.alencar@alemdobilhao.com',
    passwordHash: '123456',
    role: 'Editor',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    bio: 'Editora-chefe especializada em Macroeconomia, fusões e aquisições (M&A). Ex-analista sênior de investimentos.',
    active: true,
    createdAt: '2026-02-15T09:30:00Z'
  },
  {
    id: 'user_3',
    name: 'Roberto Kovac',
    email: 'roberto.kovac@alemdobilhao.com',
    passwordHash: '123456',
    role: 'Autor',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    bio: 'Correspondente de tecnologia e startups. Escreve sobre inteligência artificial, web3 e scaleups brasileiras.',
    active: true,
    createdAt: '2026-03-20T10:15:00Z'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Negócios', slug: 'negocios', description: 'Estratégias corporativas, fusões e aquisições, governança e histórias de sucesso empresarial.' },
  { id: 'cat_2', name: 'Mercado', slug: 'mercado', description: 'Cobertura em tempo real de bolsas globais, commodities, inflação e políticas macroeconômicas.' },
  { id: 'cat_3', name: 'Investimentos', slug: 'investimentos', description: 'Análises de ativos, fundos imobiliários, renda variável, renda fixa e alocações patrimoniais.' },
  { id: 'cat_4', name: 'Tecnologia', slug: 'tecnologia', description: 'O impacto de inteligência artificial, semicondutores, cibersegurança e infraestruturas digitais.' },
  { id: 'cat_5', name: 'Startups', slug: 'startups', description: 'Venture Capital, rodadas de investimento (Série A/B/C) e novos modelos disruptivos de negócios.' },
  { id: 'cat_6', name: 'Liderança', slug: 'lideranca', description: 'Conselhos de administração, coaching executivo, metodologias de gestão e perfis de grandes CEOs.' }
];

export const INITIAL_TAGS: Tag[] = [
  { id: 'tag_1', name: 'Inteligência Artificial', slug: 'inteligencia-artificial' },
  { id: 'tag_2', name: 'Venture Capital', slug: 'venture-capital' },
  { id: 'tag_3', name: 'M&A', slug: 'm-and-a' },
  { id: 'tag_4', name: 'Selic', slug: 'selic' },
  { id: 'tag_5', name: 'Fintech', slug: 'fintech' },
  { id: 'tag_6', name: 'ESG', slug: 'esg' },
  { id: 'tag_7', name: 'Unicórnios', slug: 'unicornios' }
];

export const INITIAL_MEDIA: MediaFile[] = [
  {
    id: 'media_1',
    title: 'Painéis Bloomberg de Linhas Financeiras',
    url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1200',
    fileSize: '482 KB',
    mimeType: 'image/jpeg',
    uploadedAt: '2026-06-01T12:00:00Z'
  },
  {
    id: 'media_2',
    title: 'Inteligência Artificial & Robótica Avançada',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
    fileSize: '312 KB',
    mimeType: 'image/jpeg',
    uploadedAt: '2026-06-02T14:30:00Z'
  },
  {
    id: 'media_3',
    title: 'Análise de Gráficos e Reunião Executiva',
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200',
    fileSize: '512 KB',
    mimeType: 'image/jpeg',
    uploadedAt: '2026-06-03T09:15:00Z'
  },
  {
    id: 'media_4',
    title: 'CEO Executivo Planejando Finanças',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=1200',
    fileSize: '290 KB',
    mimeType: 'image/jpeg',
    uploadedAt: '2026-06-04T16:45:00Z'
  },
  {
    id: 'media_5',
    title: 'Plataforma Digital de Fintechs',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=1200',
    fileSize: '380 KB',
    mimeType: 'image/jpeg',
    uploadedAt: '2026-06-05T11:20:00Z'
  },
  {
    id: 'media_6',
    title: 'Edifício Corporativo Moderno',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
    fileSize: '620 KB',
    mimeType: 'image/jpeg',
    uploadedAt: '2026-06-06T15:00:00Z'
  }
];

export const INITIAL_POSTS: Post[] = [];

export const INITIAL_COMMENTS: Comment[] = [];

export const INITIAL_ANALYTICS: DailyAnalytics[] = [
  { id: 'an_1', date: '06-05', pageviews: 2420, visitors: 1100, sessions: 980, bounceRate: 41.2 },
  { id: 'an_2', date: '06-06', pageviews: 2890, visitors: 1250, sessions: 1100, bounceRate: 40.5 },
  { id: 'an_3', date: '06-07', pageviews: 3105, visitors: 1400, sessions: 1210, bounceRate: 39.8 },
  { id: 'an_4', date: '06-08', pageviews: 4210, visitors: 1850, sessions: 1530, bounceRate: 38.2 },
  { id: 'an_5', date: '06-09', pageviews: 3890, visitors: 1690, sessions: 1420, bounceRate: 42.1 },
  { id: 'an_6', date: '06-10', pageviews: 4560, visitors: 2020, sessions: 1800, bounceRate: 40.4 },
  { id: 'an_7', date: '06-11', pageviews: 5210, visitors: 2310, sessions: 1950, bounceRate: 38.9 },
  { id: 'an_8', date: '06-12', pageviews: 7420, visitors: 3410, sessions: 2890, bounceRate: 36.5 },
  { id: 'an_9', date: '06-13', pageviews: 8900, visitors: 4120, sessions: 3510, bounceRate: 35.2 },
  { id: 'an_10', date: '06-14', pageviews: 12430, visitors: 5690, sessions: 4890, bounceRate: 34.0 }
];
