/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  TrendingUp, 
  Building2, 
  Globe2, 
  Video, 
  Layers, 
  Target, 
  HelpCircle,
  ExternalLink,
  Lock,
  X
} from 'lucide-react';
import { saveBrandedLead } from '../utils/db';

interface BrandedContentPageProps {
  onNavigate: (view: string, param?: string) => void;
}

// Configuração do WhatsApp da Empresa (Fácil de alterar)
export const WHATSAPP_NUMBER = "5521972736030";

export default function BrandedContentPage({ onNavigate }: BrandedContentPageProps) {
  // SEO title & meta sync
  useEffect(() => {
    document.title = "Branded Content | Além do Bilhão";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Campanhas de Branded Content personalizadas com produção de conteúdo, distribuição digital, mídia paga e parcerias estratégicas.');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Analytics event: view page
    console.log('[Analytics] Branded Content page viewed');
  }, []);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [instagram, setInstagram] = useState('');
  const [segment, setSegment] = useState('');
  const [scope, setScope] = useState('Nacional');
  const [demand, setDemand] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Anti-spam honeypot

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // WhatsApp mask helper: (00) 00000-0000
  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.substring(0, 11);
    
    if (val.length > 6) {
      val = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
    } else if (val.length > 2) {
      val = `(${val.substring(0, 2)}) ${val.substring(2)}`;
    } else if (val.length > 0) {
      val = `(${val}`;
    }
    setWhatsapp(val);
    if (touched.whatsapp) validateField('whatsapp', val);
  };

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors };

    if (field === 'companyName') {
      if (!value.trim()) newErrors.companyName = 'Nome da empresa é obrigatório.';
      else delete newErrors.companyName;
    }
    if (field === 'responsibleName') {
      if (!value.trim()) newErrors.responsibleName = 'Nome do responsável é obrigatório.';
      else delete newErrors.responsibleName;
    }
    if (field === 'whatsapp') {
      const cleanWpp = value.replace(/\D/g, '');
      if (!cleanWpp || cleanWpp.length < 10) {
        newErrors.whatsapp = 'Informe um WhatsApp válido com DDD ((00) 00000-0000).';
      } else {
        delete newErrors.whatsapp;
      }
    }
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim() || !emailRegex.test(value)) {
        newErrors.email = 'Informe um e-mail corporativo válido.';
      } else {
        delete newErrors.email;
      }
    }
    if (field === 'segment') {
      if (!value) newErrors.segment = 'Selecione o segmento de atuação.';
      else delete newErrors.segment;
    }
    if (field === 'demand') {
      if (!value.trim() || value.trim().length < 10) {
        newErrors.demand = 'Descreva brevemente sua demanda (mínimo de 10 caracteres).';
      } else {
        delete newErrors.demand;
      }
    }
    if (field === 'privacyConsent') {
      if (!value) newErrors.privacyConsent = 'Você deve aceitar a Política de Privacidade.';
      else delete newErrors.privacyConsent;
    }

    setErrors(newErrors);
  };

  const handleBlur = (field: string, value: any) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check honeypot anti-spam
    if (honeypot) {
      console.warn("Spam detected via honeypot.");
      return;
    }

    // Touch all fields to trigger validation
    setTouched({
      companyName: true,
      responsibleName: true,
      whatsapp: true,
      email: true,
      segment: true,
      demand: true,
      privacyConsent: true
    });

    validateField('companyName', companyName);
    validateField('responsibleName', responsibleName);
    validateField('whatsapp', whatsapp);
    validateField('email', email);
    validateField('segment', segment);
    validateField('demand', demand);
    validateField('privacyConsent', privacyConsent);

    const hasErrors = 
      !companyName.trim() || 
      !responsibleName.trim() || 
      whatsapp.replace(/\D/g, '').length < 10 || 
      !email.trim() || 
      !segment || 
      !demand.trim() || 
      !privacyConsent;

    if (hasErrors) {
      const formEl = document.getElementById('formulario');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setIsSubmitting(true);

    // Analytics event: form submission attempt
    console.log('[Analytics] Branded Content form submission started');

    setTimeout(() => {
      // Save lead to persistent storage database
      saveBrandedLead({
        companyName,
        responsibleName,
        whatsapp,
        email,
        instagram: instagram || undefined,
        segment,
        scope,
        demand,
        privacyConsent,
        privacyTimestamp: new Date().toISOString(),
        origin: 'branded-content'
      });

      setIsSubmitting(false);
      setSubmittedSuccessfully(true);

      // Analytics event: form submission success
      console.log('[Analytics] Branded Content form submitted successfully');

      // Open WhatsApp automatically
      triggerWhatsAppOpen();
    }, 600);
  };

  const triggerWhatsAppOpen = () => {
    const textMsg = "Olá! Acabei de preencher o formulário para uma campanha de Branded Content com o Além do Bilhão. Gostaria de agendar uma reunião para conversarmos sobre meu projeto.";
    const encoded = encodeURIComponent(textMsg);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    
    console.log('[Analytics] Opening WhatsApp link:', waUrl);
    window.open(waUrl, '_blank');
  };

  const scrollToForm = () => {
    console.log('[Analytics] Hero CTA clicked - scrolling to form');
    const el = document.getElementById('formulario');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-luxury-gray-950 text-white font-sans selection:bg-gold-500 selection:text-black">
      
      {/* 1. HERO SECTION WITH GLASSMORPHISM BACKDROP */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 lg:px-8 border-b border-luxury-gray-850 bg-gradient-to-b from-luxury-gray-950 via-luxury-gray-900 to-luxury-gray-950">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.1]">
            Sua marca. Nossa audiência. <br className="hidden sm:inline" />
            <span className="text-gold-gradient font-serif italic font-normal">Uma estratégia personalizada.</span>
          </h1>

          <p className="text-base sm:text-lg text-luxury-gray-300 max-w-3xl mx-auto leading-relaxed font-sans">
            No Além do Bilhão, criamos campanhas publicitárias que vão além de uma publicação. Unimos produção de conteúdo, distribuição digital, mídia paga e parcerias estratégicas para fortalecer marcas, apresentar soluções e gerar oportunidades de negócio.
          </p>

          <p className="text-xs sm:text-sm text-luxury-gray-400 max-w-2xl mx-auto font-mono italic">
            Cada projeto é desenvolvido de acordo com os objetivos, o público e o mercado de atuação da empresa.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollToForm}
              className="w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-luxury-gray-950 font-bold px-8 py-4 rounded text-sm uppercase tracking-wider transition duration-300 shadow-lg hover:shadow-gold-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Desenvolver Minha Campanha</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                const stepEl = document.getElementById('jornada');
                if (stepEl) stepEl.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-luxury-gray-900/60 backdrop-blur-md hover:bg-luxury-gray-850 text-luxury-gray-300 font-semibold px-6 py-4 rounded text-sm uppercase tracking-wider border border-luxury-gray-800 transition flex items-center justify-center gap-2"
            >
              <span>Conhecer o Processo</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. O QUE PODEMOS DESENVOLVER? (3 GLASSMORPHIC CARDS) */}
      <section className="py-20 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-[10px] font-mono tracking-[0.25em] text-gold-400 uppercase font-bold">Soluções Sob Medida</span>
          <h2 className="font-serif font-black text-2xl md:text-4xl uppercase text-white tracking-tight">O que podemos desenvolver?</h2>
          <p className="text-sm text-luxury-gray-400">Formatos projetados para engajar decisores, executivos, investidores e formadores de opinião.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-luxury-gray-900/40 backdrop-blur-xl border border-luxury-gray-800/80 hover:border-gold-500/60 rounded-2xl p-8 relative overflow-hidden transition-all duration-300 group flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:shadow-[0_12px_40px_0_rgba(212,175,55,0.12)]">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gold-500 group-hover:bg-gold-400 transition-colors"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-luxury-gray-850/60 backdrop-blur-md border border-gold-500/20 flex items-center justify-center text-gold-400">
                <Video size={22} />
              </div>
              <h3 className="font-serif font-bold text-xl text-white group-hover:text-gold-400 transition">Conteúdo de Marca</h3>
              <p className="text-sm text-luxury-gray-300 leading-relaxed font-sans">
                Reels, vídeos, stories, publicações e narrativas personalizadas com alto padrão estético e editorial, alinhadas à autoridade da sua empresa.
              </p>
            </div>
            <div className="pt-6 border-t border-luxury-gray-800/60 mt-6 flex items-center text-xs font-mono text-gold-400">
              <span>Produção & Roteiro Multimídia</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-luxury-gray-900/40 backdrop-blur-xl border border-luxury-gray-800/80 hover:border-gold-500/60 rounded-2xl p-8 relative overflow-hidden transition-all duration-300 group flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:shadow-[0_12px_40px_0_rgba(212,175,55,0.12)]">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gold-500 group-hover:bg-gold-400 transition-colors"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-luxury-gray-850/60 backdrop-blur-md border border-gold-500/20 flex items-center justify-center text-gold-400">
                <Layers size={22} />
              </div>
              <h3 className="font-serif font-bold text-xl text-white group-hover:text-gold-400 transition">Campanhas Integradas</h3>
              <p className="text-sm text-luxury-gray-300 leading-relaxed font-sans">
                Conteúdo, mídia paga direcionada, criadores parceiros e páginas de conversão estruturadas para transformar leitores em leads qualificados.
              </p>
            </div>
            <div className="pt-6 border-t border-luxury-gray-800/60 mt-6 flex items-center text-xs font-mono text-gold-400">
              <span>Distribuição & Performance</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-luxury-gray-900/40 backdrop-blur-xl border border-luxury-gray-800/80 hover:border-gold-500/60 rounded-2xl p-8 relative overflow-hidden transition-all duration-300 group flex flex-col justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] hover:shadow-[0_12px_40px_0_rgba(212,175,55,0.12)]">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gold-500 group-hover:bg-gold-400 transition-colors"></div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-lg bg-luxury-gray-850/60 backdrop-blur-md border border-gold-500/20 flex items-center justify-center text-gold-400">
                <Globe2 size={22} />
              </div>
              <h3 className="font-serif font-bold text-xl text-white group-hover:text-gold-400 transition">Expansão de Mercado</h3>
              <p className="text-sm text-luxury-gray-300 leading-relaxed font-sans">
                Campanhas regionais, nacionais ou internacionais, conforme o projeto e o perfil de expansão institucional ou comercial desejado.
              </p>
            </div>
            <div className="pt-6 border-t border-luxury-gray-800/60 mt-6 flex items-center text-xs font-mono text-gold-400">
              <span>Alcance Estratégico</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. JORNADA COMERCIAL – "Um processo simples" (4 GLASSMORPHIC STEPS) */}
      <section id="jornada" className="py-20 px-4 lg:px-8 bg-luxury-gray-900/30 backdrop-blur-md border-y border-luxury-gray-850">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-mono tracking-[0.25em] text-gold-400 uppercase font-bold">Metodologia Comercial</span>
            <h2 className="font-serif font-black text-2xl md:text-4xl uppercase text-white tracking-tight">Um processo simples</h2>
            <p className="text-sm text-luxury-gray-300">Do primeiro contato à proposta personalizada, em quatro etapas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Passo 01 */}
            <div className="bg-luxury-gray-900/40 backdrop-blur-xl p-6 rounded-2xl border border-luxury-gray-800/80 hover:border-gold-500/40 transition shadow-[0_4px_24px_0_rgba(0,0,0,0.3)] relative space-y-4">
              <span className="font-mono text-3xl font-black text-gold-400/80 block">01</span>
              <h3 className="font-serif font-bold text-base text-white">Conte sobre sua empresa</h3>
              <p className="text-xs text-luxury-gray-400 leading-relaxed">
                Preencha o formulário com os dados da sua marca e o que pretende desenvolver.
              </p>
            </div>

            {/* Passo 02 */}
            <div className="bg-luxury-gray-900/40 backdrop-blur-xl p-6 rounded-2xl border border-luxury-gray-800/80 hover:border-gold-500/40 transition shadow-[0_4px_24px_0_rgba(0,0,0,0.3)] relative space-y-4">
              <span className="font-mono text-3xl font-black text-gold-400/80 block">02</span>
              <h3 className="font-serif font-bold text-base text-white">Conversamos pelo WhatsApp</h3>
              <p className="text-xs text-luxury-gray-400 leading-relaxed">
                Nossa equipe recebe sua solicitação e entra em contato para compreender a demanda.
              </p>
            </div>

            {/* Passo 03 */}
            <div className="bg-luxury-gray-900/40 backdrop-blur-xl p-6 rounded-2xl border border-luxury-gray-800/80 hover:border-gold-500/40 transition shadow-[0_4px_24px_0_rgba(0,0,0,0.3)] relative space-y-4">
              <span className="font-mono text-3xl font-black text-gold-400/80 block">03</span>
              <h3 className="font-serif font-bold text-base text-white">Agendamos uma reunião</h3>
              <p className="text-xs text-luxury-gray-400 leading-relaxed">
                Realizamos uma reunião estratégica pelo Google Meet para entender seus objetivos.
              </p>
            </div>

            {/* Passo 04 */}
            <div className="bg-luxury-gray-900/40 backdrop-blur-xl p-6 rounded-2xl border border-luxury-gray-800/80 hover:border-gold-500/40 transition shadow-[0_4px_24px_0_rgba(0,0,0,0.3)] relative space-y-4">
              <span className="font-mono text-3xl font-black text-gold-400/80 block">04</span>
              <h3 className="font-serif font-bold text-base text-white">Criamos sua proposta</h3>
              <p className="text-xs text-luxury-gray-400 leading-relaxed">
                Apresentamos um planejamento com formatos, canais, entregáveis, cronograma e investimento.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. FORMULÁRIO (id="formulario") - GLASSMORPHIC CONTAINER */}
      <section id="formulario" className="py-24 px-4 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-luxury-gray-900/50 backdrop-blur-2xl border border-luxury-gray-800/90 rounded-3xl p-6 sm:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
            <span className="text-[10px] font-mono tracking-[0.25em] text-gold-400 uppercase font-bold">Inicie sua Jornada</span>
            <h2 className="font-serif font-black text-2xl md:text-3xl uppercase text-white tracking-tight">Vamos desenvolver sua campanha?</h2>
            <p className="text-xs sm:text-sm text-luxury-gray-300">Preencha os dados abaixo para iniciarmos uma conversa sobre o seu projeto.</p>
          </div>

          {submittedSuccessfully ? (
            <div className="bg-emerald-950/50 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-8 text-center space-y-6 animate-fadeIn">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-xl text-white">Solicitação Enviada com Sucesso!</h3>
                <p className="text-sm text-luxury-gray-300 max-w-md mx-auto">
                  Registramos os dados da sua empresa em nossa base comercial. O WhatsApp foi aberto automaticamente com sua mensagem pronta.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={triggerWhatsAppOpen}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <MessageSquare size={16} />
                  <span>Abrir WhatsApp Novamente</span>
                  <ExternalLink size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedSuccessfully(false);
                    setCompanyName('');
                    setResponsibleName('');
                    setWhatsapp('');
                    setEmail('');
                    setInstagram('');
                    setSegment('');
                    setScope('Nacional');
                    setDemand('');
                    setPrivacyConsent(false);
                  }}
                  className="w-full sm:w-auto bg-luxury-gray-850 hover:bg-luxury-gray-800 text-luxury-gray-300 font-semibold px-6 py-3 rounded text-xs uppercase tracking-wider transition"
                >
                  Enviar Outra Solicitação
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
              
              {/* Anti-spam Honeypot (Hidden) */}
              <div className="hidden" aria-hidden="true">
                <label>Se você é humano, deixe este campo em branco</label>
                <input 
                  type="text" 
                  name="hp_field" 
                  value={honeypot} 
                  onChange={(e) => setHoneypot(e.target.value)} 
                  tabIndex={-1} 
                  autoComplete="off" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nome da empresa */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-luxury-gray-300 uppercase tracking-wider">
                    Nome da empresa <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Grupo Alpha Investimentos"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      if (touched.companyName) validateField('companyName', e.target.value);
                    }}
                    onBlur={(e) => handleBlur('companyName', e.target.value)}
                    className={`w-full bg-luxury-gray-950/60 backdrop-blur-sm border rounded-xl text-sm text-white px-4 py-3 outline-none transition font-sans ${touched.companyName && errors.companyName ? 'border-rose-500 focus:border-rose-500' : 'border-luxury-gray-800 focus:border-gold-500'}`}
                  />
                  {touched.companyName && errors.companyName && (
                    <span className="text-[11px] text-rose-400 font-mono block">{errors.companyName}</span>
                  )}
                </div>

                {/* Nome do responsável */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-luxury-gray-300 uppercase tracking-wider">
                    Nome do responsável <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo Silveira"
                    value={responsibleName}
                    onChange={(e) => {
                      setResponsibleName(e.target.value);
                      if (touched.responsibleName) validateField('responsibleName', e.target.value);
                    }}
                    onBlur={(e) => handleBlur('responsibleName', e.target.value)}
                    className={`w-full bg-luxury-gray-950/60 backdrop-blur-sm border rounded-xl text-sm text-white px-4 py-3 outline-none transition font-sans ${touched.responsibleName && errors.responsibleName ? 'border-rose-500 focus:border-rose-500' : 'border-luxury-gray-800 focus:border-gold-500'}`}
                  />
                  {touched.responsibleName && errors.responsibleName && (
                    <span className="text-[11px] text-rose-400 font-mono block">{errors.responsibleName}</span>
                  )}
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* WhatsApp */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-luxury-gray-300 uppercase tracking-wider">
                    WhatsApp com DDD <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 99999-9999"
                    value={whatsapp}
                    onChange={handleWhatsappChange}
                    onBlur={(e) => handleBlur('whatsapp', e.target.value)}
                    className={`w-full bg-luxury-gray-950/60 backdrop-blur-sm border rounded-xl text-sm text-white px-4 py-3 outline-none transition font-mono ${touched.whatsapp && errors.whatsapp ? 'border-rose-500 focus:border-rose-500' : 'border-luxury-gray-800 focus:border-gold-500'}`}
                  />
                  {touched.whatsapp && errors.whatsapp ? (
                    <span className="text-[11px] text-rose-400 font-mono block">{errors.whatsapp}</span>
                  ) : (
                    <span className="text-[10px] text-luxury-gray-400 font-mono">Formato: (00) 00000-0000</span>
                  )}
                </div>

                {/* E-mail */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-luxury-gray-300 uppercase tracking-wider">
                    E-mail corporativo <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="carlos@empresa.com.br"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) validateField('email', e.target.value);
                    }}
                    onBlur={(e) => handleBlur('email', e.target.value)}
                    className={`w-full bg-luxury-gray-950/60 backdrop-blur-sm border rounded-xl text-sm text-white px-4 py-3 outline-none transition font-sans ${touched.email && errors.email ? 'border-rose-500 focus:border-rose-500' : 'border-luxury-gray-800 focus:border-gold-500'}`}
                  />
                  {touched.email && errors.email && (
                    <span className="text-[11px] text-rose-400 font-mono block">{errors.email}</span>
                  )}
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Instagram da empresa (Opcional) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-luxury-gray-300 uppercase tracking-wider">
                    Instagram da empresa <span className="text-luxury-gray-400 text-[10px] lowercase font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="@suaempresa"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-luxury-gray-950/60 backdrop-blur-sm border border-luxury-gray-800 focus:border-gold-500 rounded-xl text-sm text-white px-4 py-3 outline-none transition font-sans"
                  />
                </div>

                {/* Segmento de atuação (Select Obrigatório) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-luxury-gray-300 uppercase tracking-wider">
                    Segmento de atuação <span className="text-gold-400">*</span>
                  </label>
                  <select
                    required
                    value={segment}
                    onChange={(e) => {
                      setSegment(e.target.value);
                      if (touched.segment) validateField('segment', e.target.value);
                    }}
                    onBlur={(e) => handleBlur('segment', e.target.value)}
                    className={`w-full bg-luxury-gray-950/60 backdrop-blur-sm border rounded-xl text-sm text-white px-4 py-3 outline-none transition font-sans ${touched.segment && errors.segment ? 'border-rose-500' : 'border-luxury-gray-800 focus:border-gold-500'}`}
                  >
                    <option value="">Selecione o segmento...</option>
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Mercado Financeiro">Mercado Financeiro</option>
                    <option value="Investimentos">Investimentos</option>
                    <option value="Imobiliário">Imobiliário</option>
                    <option value="Luxo">Luxo</option>
                    <option value="Agronegócio">Agronegócio</option>
                    <option value="Indústria">Indústria</option>
                    <option value="Varejo">Varejo</option>
                    <option value="Educação">Educação</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Serviços">Serviços</option>
                    <option value="Outros">Outros</option>
                  </select>
                  {touched.segment && errors.segment && (
                    <span className="text-[11px] text-rose-400 font-mono block">{errors.segment}</span>
                  )}
                </div>

                {/* Abrangência desejada */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-luxury-gray-300 uppercase tracking-wider">
                    Abrangência desejada
                  </label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full bg-luxury-gray-950/60 backdrop-blur-sm border border-luxury-gray-800 focus:border-gold-500 rounded-xl text-sm text-white px-4 py-3 outline-none transition font-sans"
                  >
                    <option value="Regional">Regional</option>
                    <option value="Nacional">Nacional</option>
                    <option value="Internacional">Internacional</option>
                    <option value="Ainda não definida">Ainda não definida</option>
                  </select>
                </div>

              </div>

              {/* Conte sobre sua demanda */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-luxury-gray-300 uppercase tracking-wider">
                  Conte sobre sua demanda <span className="text-gold-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Descreva brevemente os objetivos da marca, público-alvo ou produtos/serviços que gostaria de destacar..."
                  value={demand}
                  onChange={(e) => {
                    setDemand(e.target.value);
                    if (touched.demand) validateField('demand', e.target.value);
                  }}
                  onBlur={(e) => handleBlur('demand', e.target.value)}
                  className={`w-full bg-luxury-gray-950/60 backdrop-blur-sm border rounded-xl text-sm text-white p-4 outline-none transition font-sans resize-none ${touched.demand && errors.demand ? 'border-rose-500 focus:border-rose-500' : 'border-luxury-gray-800 focus:border-gold-500'}`}
                ></textarea>
                {touched.demand && errors.demand && (
                  <span className="text-[11px] text-rose-400 font-mono block">{errors.demand}</span>
                )}
              </div>

              {/* Checkbox obrigatório de Privacidade */}
              <div className="space-y-2 pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    checked={privacyConsent}
                    onChange={(e) => {
                      setPrivacyConsent(e.target.checked);
                      if (touched.privacyConsent) validateField('privacyConsent', e.target.checked);
                    }}
                    onBlur={() => handleBlur('privacyConsent', privacyConsent)}
                    className="mt-1 w-4 h-4 rounded border-luxury-gray-800 text-gold-500 focus:ring-gold-500 bg-luxury-gray-950 shrink-0 cursor-pointer"
                  />
                  <span className="text-xs text-luxury-gray-300 leading-relaxed font-sans">
                    Li e estou ciente da <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-gold-400 underline hover:text-gold-300">Política de Privacidade</button> e do tratamento dos meus dados para que a equipe responda à minha solicitação. <span className="text-gold-400">*</span>
                  </span>
                </label>
                {touched.privacyConsent && errors.privacyConsent && (
                  <span className="text-[11px] text-rose-400 font-mono block pl-7">{errors.privacyConsent}</span>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-luxury-gray-950 font-black py-4 px-8 rounded-xl text-sm uppercase tracking-wider transition duration-300 shadow-xl flex items-center justify-center gap-3 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-luxury-gray-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>Processando solicitação...</span>
                    </span>
                  ) : (
                    <>
                      <span>Enviar Solicitação e Continuar no WhatsApp</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>
      </section>

      {/* PRIVACY POLICY MODAL */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-luxury-gray-900/90 backdrop-blur-2xl border border-luxury-gray-800 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-4 right-4 text-luxury-gray-400 hover:text-white p-2"
            >
              <X size={20} />
            </button>
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-widest text-gold-400 uppercase">LGPD & Compliance</span>
              <h3 className="font-serif font-black text-xl text-white">Política de Privacidade de Dados Comerciais</h3>
            </div>
            <div className="text-xs text-luxury-gray-300 space-y-3 font-sans leading-relaxed">
              <p>
                No Além do Bilhão, respeitamos estritamente a privacidade das empresas e executivos que solicitam propostas de Branded Content.
              </p>
              <p>
                Os dados preenchidos neste formulário (nome da empresa, responsável, WhatsApp, e-mail, segmento e demanda) são armazenados em ambiente seguro e restrito exclusivamente à equipe comercial corporativa.
              </p>
              <p>
                As informações fornecidas não são comercializadas, cedidas ou compartilhadas com terceiros sob nenhuma hipótese, sendo utilizadas unicamente para o contato direto e a elaboração da proposta estratégica solicitada.
              </p>
            </div>
            <div className="pt-4 border-t border-luxury-gray-800 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="bg-gold-500 hover:bg-gold-600 text-luxury-gray-950 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
              >
                Compreendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
