/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Category, Tag, Post, Comment, MediaFile, DailyAnalytics, InstagramReel } from '../types';

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

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    title: 'A Nova Era de M&As Multibilionários na América Latina: Consolidação Industrial e Venture Capital em 2026',
    slug: 'a-nova-era-de-m-and-as-multibilionarios-na-america-latina-consolidacao-industrial-e-venture-capital-em-2026',
    summary: 'Um guia completo sobre as fusões e aquisições corporativas que estão reconfigurando os mercados financeiros, da infraestrutura energética à revolução digital nas principais fintechs latinas.',
    content: `<p>O cenário corporativo na América Latina está passando por uma das transições mais intensas de sua história recente. Em 2026, com a consolidação da estabilização monetária e a busca agressiva por sinergias operacionais, presenciamos uma onda sem precedentes de fusões e aquisições (M&As) que cruzam fronteiras tradicionais e envolvem transações com valores superiores a dez dígitos.</p>
<h4>Consolidação de Setores Tradicionais</h4>
<p>Os setores de infraestrutura, concessões rodoviárias e energia lideram o apetite de grandes holdings de investimento. A necessidade de digitalizar canais operacionais e descarbonizar portfólios tem forçado players nacionais a buscarem parcerias com consórcios globais que possuem custo de capital mais favorável.</p>
<blockquote>"Não se trata apenas de expandir a participação de mercado, mas de adquirir competências em sustentabilidade e eficiência robótica para mitigar as contingências operacionais do final da década." – afirma Bruno Ramos, analista-geral do Além do Bilhão.</blockquote>
<h4>A Resiliência do Venture Capital Sênior</h4>
<p>Diferente do frenesi puramente especulativo do início dos anos 2020, o Venture Capital foca agora em scaleups que comprovam lucro líquido sustentável e cashflow equilibrado. Startups brasileiras, mexicanas e colombianas de software como serviço (SaaS) e transações industriais integradas tornaram-se alvos preferenciais para consolidadoras globais.</p>
<p>O resultado é um ecossistema mais racional, onde as sinergias corporativas impulsionam margens operacionais mais limpas, desenhando a arquitetura financeira da região para os próximos vinte anos.</p>`,
    imageUrl: '/images/post_ma_latin_america.jpg',
    categoryId: 'cat_1', // Negócios
    authorId: 'user_1',
    tags: ['Inteligência Artificial', 'Venture Capital', 'M&A'],
    status: 'published',
    views: 12543,
    publishedAt: '2026-06-15T14:30:00Z',
    createdAt: '2026-06-15T14:30:00Z',
    readingTime: 6,
    layoutPosition: 'maior'
  },
  {
    id: 'post_2',
    title: 'Como a Alta de Juros no Federal Reserve Impacta os Fundos Imobiliários Brasileiros',
    slug: 'como-a-alta-de-juros-no-federal-reserve-impacta-os-fundos-imobiliarios-brasileiros',
    summary: 'Uma análise profunda sobre a forte correlação entre as taxas de juros dos títulos do tesouro americano (Treasuries) e a volatilidade dos rendimentos de FIIs no mercado brasileiro.',
    content: `<p>A macroeconomia moderna é um sistema globalmente integrado onde o bater de asas de uma decisão do Federal Reserve em Washington reverbera de forma imediata nos dividendos distribuídos por fundos imobiliários corporativos na Avenida Faria Lima, em São Paulo.</p>
<h4>A Taxa Livre de Risco Global e a Arbitragem</h4>
<p>Quando os rendimentos das Treasuries americanas de 10 anos sobem, a barreira de investimento em mercados emergentes aumenta. Investidores institucionais estrangeiros e fundos de pensão globais tendem a repatriar seus recursos em direção aos títulos mais seguros do mundo, drenando a liquidez dos mercados de renda variável periféricos.</p>
<p>No Brasil, isso exerce pressão nos Fundos de Investimento Imobiliário (FIIs), principalmente os focados em lajes corporativas premium e galpões logísticos classe A. Para manterem-se atrativos frente ao aumento do prêmio de risco, os Fundos Imobiliários brasileiros precisam entregar yields proporcionalmente maiores, o que por consequência deprime a cotação patrimonial das cotas negociadas em bolsa.</p>
<h4>Oportunidades em Período de Transição</h4>
<p>Contudo, analistas apontam que a desvalorização das cotas abre janelas raras de entrada para investidores de longo prazo (value investing). Ativos de alta qualidade com contratos indexados à inflação (IPCA) e inquilinos multinacionais operando em contratos "Built to Suit" atípicos agora estão sendo negociados abaixo de seu valor real de reposição de tijolo, representando um excelente desconto patrimonial.</p>`,
    imageUrl: '/images/post_fed_rates_fiis.jpg',
    categoryId: 'cat_3', // Investimentos
    authorId: 'user_2',
    tags: ['Selic', 'ESG'],
    status: 'published',
    views: 8930,
    publishedAt: '2026-06-16T09:00:00Z',
    createdAt: '2026-06-16T09:00:00Z',
    readingTime: 5,
    layoutPosition: 'esquerda'
  },
  {
    id: 'post_3',
    title: 'Além do Algoritmo: Como Semicondutores Viraram a Nova Commodity Geopolítica',
    slug: 'alem-do-algoritmo-como-semicondutores-viraram-a-nova-commodity-geopolitica',
    summary: 'Do Vale do Silício à Ásia, compreenda a impressionante corrida armamentista tecnológica pelas GPUs mais avançadas do planeta e seu impacto direto no PIB e na inflação global.',
    content: `<p>A areia quartzita que um dia serviu apenas para fabricar garrafas de vidro hoje dita o destino de potências econômicas e a governança de corporações multibilionárias. Os microchips e semicondutores tornaram-se o equivalente moderno ao petróleo no século XX, uma commodity central altamente valorizada e de cadeias produtivas extremamente monopolizadas.</p>
<h4>A Corrida pelo Silício de Alta Performance</h4>
<p>A explosão na demanda por Inteligência Artificial generativa corporativa elevou as especificações de hardware ao extremo. Chips de altíssima densidade de transistores, fabricados majoritariamente pela taiwanesa TSMC sob patentes holandesas da ASML, tornaram-se itens de segurança nacional.</p>
<p>Estados Unidos, China e União Europeia aportaram, juntos, mais de 250 bilhões de dólares em subsídios de manufatura doméstica. O objetivo é reduzir a dependência logística extrema de Taiwan, uma das zonas de maior atrito geopolítico contemporâneo.</p>
<h4>Sons do Amanhã: Sinais de Alerta</h4>
<p>Para além da ficção de ficção científica, os semicondutores influenciam diretamente a inflação industrial. Componentes mais caros geram reajustes em cascata na indústria automotiva, in datacenters globais e até em equipamentos médicos complexos. Quem detiver a maior infraestrutura de processamento dominará o vetor de produtividade industrial do século.</p>`,
    imageUrl: '/images/post_semiconductors.jpg',
    categoryId: 'cat_4', // Tecnologia
    authorId: 'user_3',
    tags: ['Inteligência Artificial', 'Fintech'],
    status: 'published',
    views: 11421,
    publishedAt: '2026-06-16T11:15:00Z',
    createdAt: '2026-06-16T11:15:00Z',
    readingTime: 4,
    layoutPosition: 'meio'
  },
  {
    id: 'post_4',
    title: 'O Guia Prático da Sucessão Familiar nos Fundos de Private Equity e Multi-Family Offices',
    slug: 'o-guia-pratico-da-sucessao-familiar-nos-fundos-de-private-equity-e-multi-family-offices',
    summary: 'Herdando e protegendo bilhões: conheça os bastidores das estratégias jurídicas inovadoras adotadas por herdeiros do agronegócio e holding familiares para gerir grandes fortunas.',
    content: `<p>A preservação de grandes patrimônios ao longo de gerações é um desafio de governança tão complexo quanto a própria criação das empresas de grande porte. Estimativas indicam que mais de 80% das empresas familiares não sobrevivem à transição da segunda para a terceira geração de gestores.</p>
<h4>Profissionalização de Fundos de Investimento Exclusivos</h4>
<p>Para blindar seus ativos contra decisões impulsivas e instabilidades familiares, as mentes mais experientes do agronegócio, mineração e finanças estão abandonando a clássica holding patrimonial limitada. O caminho moderno envolve criar um Multi-Family Office focado em governança corporativa ativa de longo curso.</p>
<p>Essas estruturas criam conselhos compostos majoritariamente por membros independentes e utilizam regras rígidas de distribuição de dividendos (como o alinhamento com índices de performance semestrais). Os herdeiros ganham direitos de liquidez regulamentada, e a governança tática passa a ser orquestrada por profissionais sêniores de mercado recrutados de bancos globais de investimento.</p>
<p>Dessa forma, as famílias mantêm seu legado intocado sob custódia, diversificando os investimentos imobiliários originais em ativos líquidos internacionais, infraestrutura privada e private equity.</p>`,
    imageUrl: '/images/post_family_office_succession.jpg',
    categoryId: 'cat_6', // Liderança
    authorId: 'user_1',
    tags: ['ESG', 'M&A'],
    status: 'published',
    views: 7421,
    publishedAt: '2026-06-16T15:00:00Z',
    createdAt: '2026-06-16T15:00:00Z',
    readingTime: 6,
    layoutPosition: 'direita'
  },
  {
    id: 'post_5',
    title: 'Unicórnios de Volta: Série B e C Voltam a Aquecer o Mercado em São Paulo',
    slug: 'unicornios-de-volta-serie-b-e-c-voltam-a-aquecer-o-mercado-em-sao-paulo',
    summary: 'O fluxo de capital norte-americano e europeu reabre as rodadas de investimentos volumosos em scaleups de alto impacto nas capitais latino-americanas.',
    content: `<p>Após anos de escassez de liquidez e ajustes de "valuation" brutais pós-pandemia, o mercado de Venture Capital para startups em estágio acelerado (late-stage) dá os primeiros sinais sólidos de reaquecimento sistemático.</p>
<h4>Investimento Consciente e Rigor Contábil</h4>
<p>Diferente da era dos custos marginais de capital próximos de zero, as rodadas milionárias lideradas por fundos institucionais exigem análises contábeis rigorosas. Startups que apresentam unidade econômica clarificada, receita recorrente anual (ARR) auditada e uma taxa de retenção de clientes acima da média de mercado estão assinando rodadas de financiamento robustas.</p>
<p>São Paulo se consagra como o epicentro deste rali de final de ano, conectando investidores americanos com as fintechs e logtechs que se preparavam e enxugavam suas operações desde 2023.</p>`,
    imageUrl: '/images/post_unicorns_sp.jpg',
    categoryId: 'cat_5', // Startups
    authorId: 'user_3',
    tags: ['Venture Capital', 'Unicórnios'],
    status: 'published',
    views: 4890,
    publishedAt: '2026-06-17T08:30:00Z',
    createdAt: '2026-06-17T08:30:00Z',
    readingTime: 3,
    layoutPosition: 'menor'
  },
  {
    id: 'post_6',
    title: 'Crédito Privado Bate Recorde de Emissões de Debêntures Incentivadas',
    slug: 'credito-privado-bate-recorde-de-emissoes-de-debentures-incentivadas',
    summary: 'A busca por isenção fiscal e rendimentos atrativos canaliza recursos para os de investimentos em saneamento básico e ferrovias.',
    content: `<p>A atratividade do crédito privado no Brasil alcançou novos patamares históricos neste semestre. Com as taxas de juros de mercado mantendo prêmios consistentes, as empresas de saneamento e infraestrutura encontraram nas debêntures de projeto incentivadas o instrumento perfeito de captação de recursos de baixo custo junto ao varejo de alta renda.</p>
<p>As debêntures contam com isenção total de imposto de renda para pessoas físicas no Brasil, o que as torna ativos de resiliência formidável em momentos de ajuste tributário federal, oferecendo prêmios robustos acima do IPCA mais recentes.</p>`,
    imageUrl: '/images/post_credit_debentures.jpg',
    categoryId: 'cat_2', // Mercado
    authorId: 'user_2',
    tags: ['Selic', 'ESG'],
    status: 'published',
    views: 5210,
    publishedAt: '2026-06-17T09:45:00Z',
    createdAt: '2026-06-17T09:45:00Z',
    readingTime: 3,
    layoutPosition: 'menor'
  },
  {
    id: 'post_7',
    title: 'Gestão Científica: A Filosofia de Performance que Impulsionou a Techcorp',
    slug: 'gestao-cientifica-a-filosofia-de-performance-que-impulsionou-a-techcorp',
    summary: 'Entenda os pilares operacionais de accountability radical e métricas precisas desenhados pela liderança executiva da gigante nacional de ERP SaaS.',
    content: `<p>Em um mercado de capitais altamente competitivo, a diferença entre o sucesso e a irrelevância operacional reside puramente na precisão da execução estratégica de seus quadros humanos.</p>
<h4>A Disciplina das Métricas Reais</h4>
<p>A liderança sênior da Techcorp redesenhou todas as linhas de operação de desenvolvimento utilizando um framework adaptado de engenharia organizacional científica. A descentralização de decisões guiada puramente por inteligência de dados históricos garantiu o corte sistemático de custos desperdiçados e o redirecionamento de capital humano para projetos com retorno operacional comprovado de alto valor.</p>`,
    imageUrl: '/images/post_techcorp_management.jpg',
    categoryId: 'cat_6', // Liderança
    authorId: 'user_2',
    tags: ['ESG'],
    status: 'published',
    views: 3120,
    publishedAt: '2026-06-17T10:10:00Z',
    createdAt: '2026-06-17T10:10:00Z',
    readingTime: 3,
    layoutPosition: 'menor'
  },
  {
    id: 'post_8',
    title: 'O Futuro da Inteligência Artificial Generativa no Segmento de Wealth Management',
    slug: 'o-futuro-da-inteligencia-artificia-generativa-no-segmento-of-wealth-management',
    summary: 'Bancos globais e boutiques de investimentos começam a empregar agentes autônomos cognitivos para automatizar inteligência de mercado e análises complexas.',
    content: `<p>A tecnologia generativa de IA deixou de ser curiosidade de laboratório de computação para tornar-se uma ferramenta básica de pesquisa em mesas de arbitragem de ativos regulados de alta complexidade.</p>
<h4>Sistemas Cognitivos em Portfólios Executivos</h4>
<p>Agentes dotados de visão de mercado avançada processam em milissegundos balanços contábeis, notas regulatórias da CVM e discursos das autoridades econômicas globais. Tais relatórios são consolidados para que gestores de patrimônios exclusivos possam calibrar posições em tempo recorde, minimizando perdas inesperadas e antecipando movimentos de bolhas.</p>`,
    imageUrl: '/images/post_wealth_management_ai.jpg',
    categoryId: 'cat_4', // Tecnologia
    authorId: 'user_3',
    tags: ['Inteligência Artificial', 'Fintech'],
    status: 'published',
    views: 4567,
    publishedAt: '2026-06-17T10:20:00Z',
    createdAt: '2026-06-17T10:20:00Z',
    readingTime: 3,
    layoutPosition: 'menor'
  }
];

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

export const INITIAL_INSTAGRAM_REELS: InstagramReel[] = [
  {
    id: 'reel_1',
    title: 'Como faturar seu primeiro Milhão através do modelo SaaS de alta margem rápida',
    videoUrl: 'https://www.instagram.com/reels/',
    imageUrl: '/images/reel_saas_million.jpg',
    username: '@alemdobilhao',
    avatarUrl: 'https://picsum.photos/id/338/150/150',
    viewsCount: '1.2M',
    likesCount: '89K',
    createdAt: new Date().toISOString()
  },
  {
    id: 'reel_2',
    title: '3 grandes erros que os herdeiros do Agronegócio comentem em Holding Familiar',
    videoUrl: 'https://www.instagram.com/reels/',
    imageUrl: '/images/reel_agribusiness_holding.jpg',
    username: '@alemdobilhao',
    avatarUrl: 'https://picsum.photos/id/338/150/150',
    viewsCount: '840K',
    likesCount: '52K',
    createdAt: new Date().toISOString()
  },
  {
    id: 'reel_3',
    title: 'O verdadeiro segredo por trás do Valuation de novas Startups brasileiras',
    videoUrl: 'https://www.instagram.com/reels/',
    imageUrl: '/images/reel_startup_valuation.jpg',
    username: '@alemdobilhao',
    avatarUrl: 'https://picsum.photos/id/338/150/150',
    viewsCount: '450K',
    likesCount: '27K',
    createdAt: new Date().toISOString()
  },
  {
    id: 'reel_4',
    title: 'O que o Federal Reserve dos EUA não te conta sobre a inflação estrutural',
    videoUrl: 'https://www.instagram.com/reels/',
    imageUrl: '/images/reel_fed_inflation.jpg',
    username: '@alemdobilhao',
    avatarUrl: 'https://picsum.photos/id/338/150/150',
    viewsCount: '2.1M',
    likesCount: '154K',
    createdAt: new Date().toISOString()
  },
  {
    id: 'reel_5',
    title: 'Liderança de Elite: os pilares inegociáveis de disciplina para Executivos',
    videoUrl: 'https://www.instagram.com/reels/',
    imageUrl: '/images/reel_elite_leadership.jpg',
    username: '@alemdobilhao',
    avatarUrl: 'https://picsum.photos/id/338/150/150',
    viewsCount: '1.5M',
    likesCount: '112K',
    createdAt: new Date().toISOString()
  }
];

