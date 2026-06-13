import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Award, 
  CheckCircle, 
  TrendingUp, 
  Gift, 
  Users, 
  MessageSquare, 
  ArrowRight, 
  Shield, 
  Calendar, 
  DollarSign, 
  Grid, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Star,
  Clock,
  Heart,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NailCourseProps {
  onAddClientNotification?: (title: string, message: string) => void;
  onNavigateToBooking?: () => void;
}

export default function NailCourse({ onAddClientNotification, onNavigateToBooking }: NailCourseProps) {
  // Modules expansion state
  const [expandedModule, setExpandedModule] = useState<number | null>(0);

  // Active batch selection
  const [selectedBatchId, setSelectedBatchId] = useState<string>('turma_master_2026');

  // Contact form state
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [selectedCohort, setSelectedCohort] = useState('julho_2026');
  const [selectedFormat, setSelectedFormat] = useState('presencial_grupo');
  const [studentExperience, setStudentExperience] = useState('iniciante');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Interactive gallery selection
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const modules = [
    {
      id: 0,
      title: "Módulo 1: Biossegurança, Anatomia e Química dos Produtos",
      description: "A base de toda Nail Designer profissional com segurança cirúrgica e maestria química.",
      duration: "4 Horas de Aula Prática + Teoria",
      details: [
        "Iniciação e biossegurança: esterilização correta em autoclave e EPIs obrigatórios.",
        "Anatomia complexa das unhas, desordens patológicas e identificação de contraindicações.",
        "Fundamentos químicos dos acrilatos, monômeros, géis UV/LED e neutralizadores de pH.",
        "Preparação perfeita da lâmina ungueal (controle mecânico e químico) para evitar infiltração."
      ]
    },
    {
      id: 1,
      title: "Módulo 2: Engenharia de Alongamento (Gel na Fibra & Molde F1)",
      description: "Aprenda a estruturar alongamentos ultrafinos, resistentes e esteticamente impecáveis.",
      duration: "12 Horas de Treinamento Intensivo com Modelos",
      details: [
        "Aplicação premium de Fibra de Vidro: distribuição correta, aderência invisível e sem bolhas.",
        "Técnica inovadora no Dual Form / Molde F1: simetria perfeita e celeridade extrema de bancada.",
        "Ponto de tensão arquitetado e balanceado de acordo com as necessidades biomecânicas da unha.",
        "Mapeamento do lixamento técnico simétrico com motor e lixa manual de forma didática."
      ]
    },
    {
      id: 2,
      title: "Módulo 3: Arte Moderna, Encapsulados de Luxo e Cutilagem de Precisão",
      description: "Eleve o valor médio da sua agenda oferecendo as técnicas de decoração mais cobiçadas do mercado.",
      duration: "8 Horas Práticas Avançadas",
      details: [
        "Cutilagem técnica russa/combinada de altíssima precisão com brocas (Cuticle Drill).",
        "Esmaltação em Gel milimétrica com acabamento premium rente à cutícula.",
        "Decorações de luxo: Encapsulada com Glitter 3D, Francesa Reversa Esculpida e efeito Marmorizado.",
        "Manutenção eficiente e remoção segura sem agressão à lâmina natural da cliente."
      ]
    },
    {
      id: 3,
      title: "Módulo 4: Business, Marketing de Atração e Faturamento R$ 5.000+",
      description: "O diferencial que transforma técnicas em um negócio ultra lucrativo e sustentável.",
      duration: "4 Horas de Mentoria de Negócios Gravada + Presencial",
      details: [
        "Precificação estratégica considerando tempo de bancada, depreciação e insumos de alta performance.",
        "Criação de portfólio magnético: segredos de iluminação, fotos e vídeos de alta conversão para o Reels.",
        "Estratégia de funil de vendas local e atendimento encantador de alto valor por WhatsApp.",
        "Rotina operacional livre de estresse, atração contínua e fidelização imediata no primeiro encontro."
      ]
    }
  ];

  const pastBatches = [
    {
      id: 'turma_master_2026',
      name: "Turma Master Premium - Abr/2026",
      subtitle: "Nossa turma recente focada em técnicas híbridas de alta rapidez",
      graduatedCount: 16,
      avatarHighlight: "Fernanda Ribeiro",
      avatarImage: "🌸",
      avgSuccessTerm: "30 dias para retorno do investimento",
      highlightWork: "Alongamento Ultra Slim na Fibra de Vidro",
      description: "Uma turma dedicada e revolucionária! Das 16 formadas, 12 já estão atuando profissionalmente no mercado com suas próprias mesas de atendimento ou em estúdios de renome.",
      studentPhotos: [
        { label: "Formatura Oficial", img: "🎉 Entrega de Certificados de Ouro" },
        { label: "Prática Real", img: "🧤 Treinamento Intensivo em Modelos Reais" },
        { label: "Trabalho Final", img: "💎 Francesa Reversa Premium da aluna Júlia" }
      ],
      testimony: "O curso da Isabel mudou completamente minha perspectiva profissional. Antes eu tinha medo de trabalhar com motor e fibra, hoje meu alongamento dura mais de 30 dias intacto!"
    },
    {
      id: 'turma_elite_2025',
      name: "Turma Elite de Sucesso - Out/2025",
      subtitle: "Foco total na transição de carreira e estruturação de estúdios",
      graduatedCount: 12,
      avatarHighlight: "Juliana Mendes",
      avatarImage: "💅",
      avgSuccessTerm: "Primeiro mês com faturamento médio de R$ 3.800",
      highlightWork: "Arte Gel Encapsulado Moderno",
      description: "Turma com foco personalizado cujo principal indicador foi a fidelização imediata. As alunas dominaram as técnicas modernas de esmaltação e engenharia do alongamento sem segredos.",
      studentPhotos: [
        { label: "Graduação de Elite", img: "📜 Cerimônia de Graduação e Brinde" },
        { label: "Mesa de Prática", img: "💅 Alunas dominando o Controle de Produto" },
        { label: "Finalização", img: "✨ Alongamento de Luxo da Aluna Amanda" }
      ],
      testimony: "Fiz outros cursos mas nenhum me ensinou a cutilagem russa tão bem quanto a Isabel. A atenção individualizada em cada detalhe de postura de mão fez toda a diferença!"
    },
    {
      id: 'turma_iniciante_2026',
      name: "Formação Express - Jan/2026",
      subtitle: "Turma intensiva projetada para iniciantes que começaram do mais absoluto zero",
      graduatedCount: 10,
      avatarHighlight: "Camila Nogueira",
      avatarImage: "💫",
      avgSuccessTerm: "Conquista do certificado em 3 dias intensivos",
      highlightWork: "Dual Form / Molde F1 Veloz",
      description: "Projetada para quebrar as barreiras de quem nunca segurou um motor de lixamento. Alunas aprenderam a aplicar unhas simétricas com acabamento de alta qualidade em tempo reduzido.",
      studentPhotos: [
        { label: "Primeira Prática", img: "📐 Mapeamento e Simetria de Lâminas" },
        { label: "Apresentação", img: "🏆 Apresentação dos Primeiros Alongamentos de Fibra" },
        { label: "Kit Oficial", img: "🎁 Alunas recebendo seus Kits de Cabine UV" }
      ],
      testimony: "Eu nunca tinha mexido com unhas e saí do curso fazendo alongamentos maravilhosos. O suporte pós-curso no grupo de WhatsApp me salvou muito nas primeiras clientes!"
    }
  ];

  const galleryImages = [
    { title: "Dia de Prática Real", desc: "Nossas alunas treinam com modelos voluntárias reais em mesas completas individuais com cabines, micromotores e produtos premium.", label: "Prática em Modelo" },
    { title: "Dominando Controle de Produto", desc: "Aulas focadas em economizar tempo e produto na mesa. O segredo da simetria perfeita ensinado individualmente pela equipe Isabel Santos.", label: "Controle de Gel" },
    { title: "Cerimônia de Formatura", desc: "Momentos inesquecíveis da entrega do Certificado Premium de Conclusão, celebrando o início de uma nova jornada profissional de sucesso.", label: "Formatura de Sucesso" },
    { title: "Técnicas de Fotografia de Unhas", desc: "Ensinamos iluminação profissional, ângulos e tratamento básico de celular para as estudantes atraírem clientes pelo Instagram desde o primeiro dia.", label: "Fotomultiplicadora" }
  ];

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentPhone || !studentEmail) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      
      if (onAddClientNotification) {
        onAddClientNotification(
          "Inscrição de Estudante Recebida!",
          `Futura aluna ${studentName} demonstrou interesse no formato ${selectedFormat === 'presencial_grupo' ? 'Presencial Coletivo' : 'Mentoria VIP'} para ${selectedCohort === 'julho_2026' ? 'Julho/2026' : 'Setembro/2026'}.`
        );
      }
    }, 1200);
  };

  const currentBatch = pastBatches.find(b => b.id === selectedBatchId) || pastBatches[0];

  return (
    <div className="bg-[#FCFAF8] min-h-screen text-[#2E1E1C] pb-24">
      {/* 1. HERO HEADER INTENSO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/70 via-rose-50/20 to-transparent pt-12 pb-20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-200/20 rounded-full blur-3xl pointer-events-none -mr-16" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100/10 rounded-full blur-3xl pointer-events-none -ml-16" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center space-x-3 bg-rose-100/80 border border-rose-200 rounded-full px-4.5 py-1.5 text-rose-800 text-[11px] font-extrabold uppercase tracking-widest leading-none shadow-5xs animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Formação Profissional Nails Academy</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black text-[#2E1E1C] tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Mude de vida faturando <span className="text-rose-600 underline decoration-rose-200 decoration-wavy">R$ 5.000+ por mês</span> como Nail Designer
          </h2>
          
          <p className="text-neutral-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Aprenda do absoluto zero as técnicas mais lucrativas de alongamento em Fibra de Vidro e Molde F1, cutilagem russa e business direto em modelos sob a supervisão pessoal de <strong>Isabel Santos</strong>.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                const element = document.getElementById('enroll_form_section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-rose-600 text-white hover:bg-rose-700 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all shadow-md hover:scale-103 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Garantir Minha Vaga com Desconto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('past_batches_section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#2E1E1C] hover:bg-neutral-50 font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all border border-rose-200 shadow-3xs cursor-pointer"
            >
              Ver Turmas Anteriores
            </button>
          </div>

          {/* Social Proof Stats Bar */}
          <div className="pt-10 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-xs border border-rose-100 p-4 rounded-2xl shadow-5xs">
              <span className="block text-xl sm:text-2xl font-black font-serif text-rose-600">300+</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mt-1">Alunas Formadas</span>
            </div>
            <div className="bg-white/80 backdrop-blur-xs border border-rose-100 p-4 rounded-2xl shadow-5xs">
              <span className="block text-xl sm:text-2xl font-black font-serif text-rose-600">94.3%</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mt-1">Ativas no Mercado</span>
            </div>
            <div className="bg-white/80 backdrop-blur-xs border border-rose-100 p-4 rounded-2xl shadow-5xs">
              <span className="block text-xl sm:text-2xl font-black font-serif text-rose-600">100%</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mt-1">Prático em Modelos</span>
            </div>
            <div className="bg-white/80 backdrop-blur-xs border border-rose-100 p-4 rounded-2xl shadow-5xs">
              <span className="block text-xl sm:text-2xl font-black font-serif text-rose-600">Lifetime</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-neutral-500 uppercase tracking-wider block mt-1">Suporte Pós-Curso</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CURRÍCULO TOTAL / O QUE VOCÊ APRENDE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#2E1E1C]">Grade Curricular Completa</h3>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            Metodologia didática desenvolvida para garantir segurança de bancada, rapidez de aplicação e faturamento alto.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Timeline / Module Toggles */}
          <div className="lg:col-span-7 space-y-4">
            {modules.map((m, idx) => {
              const isSelected = expandedModule === idx;
              return (
                <div 
                  key={m.id} 
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isSelected ? 'border-rose-400 shadow-xs' : 'border-rose-100 hover:border-rose-200'
                  }`}
                >
                  <button
                    onClick={() => setExpandedModule(isSelected ? null : idx)}
                    className="w-full p-5 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-start space-x-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-serif font-black text-sm text-[#2E1E1C] leading-snug">{m.title}</h4>
                        <p className="text-neutral-500 text-[11px] mt-1 line-clamp-1">{m.description}</p>
                      </div>
                    </div>
                    {isSelected ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                  </button>

                  <AnimatePresence initial={false}>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-[#FCFAF8]/40 border-t border-rose-50"
                      >
                        <div className="p-5 pl-17 space-y-4">
                          <div className="flex items-center space-x-1.5 text-rose-700 font-bold text-[10px] tracking-wider uppercase">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{m.duration}</span>
                          </div>
                          
                          <ul className="space-y-2.5">
                            {m.details.map((detail, dIdx) => (
                              <li key={dIdx} className="flex items-start space-x-2 text-xs text-neutral-600 leading-relaxed">
                                <CheckCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Premium Kit Box */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#2D1F1D] to-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-rose-400">
                <Gift className="w-5 h-5 animate-pulse" />
                <span className="text-[10px] uppercase font-extrabold tracking-widest">Incluso no Investimento</span>
              </div>

              <h4 className="font-serif text-xl sm:text-2xl font-extrabold leading-tight">
                Você recebe gratuitamente o Super Kit Inicial de Luxo 🎁
              </h4>

              <p className="text-neutral-300 text-xs leading-relaxed">
                Não gaste fortunas com produtos no início. Nós fornecemos todo o material profissional homologado pela Anvisa para você já iniciar seus atendimentos comerciais imediatamente.
              </p>

              <div className="divide-y divide-neutral-800 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-neutral-300">1x Cabine UV/LED Híbrida Inteligente</span>
                  <span className="bg-rose-500/10 text-rose-350 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-500/20 font-mono">Original</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-neutral-300">2x Géis Construtores Premium (Nude/Pink)</span>
                  <span className="bg-rose-500/10 text-rose-350 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-500/20 font-mono">Potes Full</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-neutral-300">1x Caixa de Fibra de Vidro Importada em Fio</span>
                  <span className="bg-rose-500/10 text-rose-350 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-500/20 font-mono">100 unidades</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-neutral-300">Kit Preparadores (Desidratador, Primer, Top Coat)</span>
                  <span className="bg-rose-500/10 text-rose-350 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-500/20 font-mono">Completo</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-neutral-300">Lixas técnicas, Pinça Curvatura C e Pincel</span>
                  <span className="bg-rose-500/10 text-rose-350 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-500/20 font-mono">Acessórios</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start space-x-3">
                <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-xs">Certificação Chancela de Ouro</h5>
                  <p className="text-[10px] text-neutral-400 mt-0.5 leading-relaxed">
                    Certificado físico luxuoso incluso, reconhecido e valorizado em todo território nacional para colocar em seu estúdio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. EXPERIÊNCIA DE PREPARAÇÃO & GALERIA DA ACADEMIA */}
      <section className="bg-white border-y border-rose-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            
            <div className="lg:col-span-2 space-y-6">
              <div className="inline-flex items-center space-x-1 bg-amber-50 rounded-full px-3 py-1 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>Infraestrutura Completa</span>
              </div>
              
              <h3 className="font-serif text-2xl sm:text-3.5xl font-black text-[#2E1E1C] leading-tight">
                Espaço e Recursos Dedicados para você Brilhar
              </h3>
              
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Nossa academia oferece mesas exclusivas e ergonômicas para que cada aluna tenha acesso garantido a insumos modernos. Não dividimos materiais nem equipamentos! Você desenvolve posturas corretas que evitam dores ao mesmo tempo em que aprimora o tempo de mesa.
              </p>

              <div className="space-y-3">
                {galleryImages.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveGalleryIndex(idx)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      activeGalleryIndex === idx 
                        ? 'bg-rose-50/60 border-rose-200 shadow-5xs' 
                        : 'bg-transparent border-transparent hover:bg-neutral-50'
                    }`}
                  >
                    <span className={`text-xs font-bold ${activeGalleryIndex === idx ? 'text-rose-700' : 'text-neutral-600'}`}>
                      {item.label}
                    </span>
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${activeGalleryIndex === idx ? 'text-rose-600 translate-x-1' : 'text-neutral-400'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Display Box for Active Gallery Feature */}
            <div className="lg:col-span-3 bg-[#FCFAF8] border border-rose-100 rounded-3xl p-6 sm:p-8 shadow-3xs relative flex flex-col justify-between min-h-96">
              <div>
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest font-mono">Galeria do Treinamento</span>
                <h4 className="font-serif text-lg sm:text-2xl font-extrabold text-[#2E1E1C] mt-2 mb-3">
                  {galleryImages[activeGalleryIndex].title}
                </h4>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                  {galleryImages[activeGalleryIndex].desc}
                </p>
              </div>

              {/* Generative Visual representation */}
              <div className="mt-6 border border-rose-100/60 bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-5xs overflow-hidden py-12 relative">
                <div className="absolute top-0 right-0 p-3">
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-150 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                    Foto Real da Academia
                  </span>
                </div>
                <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center border border-rose-100 shadow-5xs text-xl animate-pulse">
                  ✨
                </div>
                <div>
                  <p className="font-serif text-xs font-bold text-neutral-800">Ambiente de Estudos Isabel Santos</p>
                  <p className="text-[10px] text-rose-500 font-medium mt-0.5">Infraestrutura Profissional Premium</p>
                </div>
                <p className="text-[9px] text-[#2D1F1D]/65 max-w-sm italic">
                  &quot;Cada aluna conta com seu próprio micromotor profissional de 35.000 RPM e fotopolimerizador UV de alta potência.&quot;
                </p>
              </div>

              <div className="mt-4 flex justify-between items-center text-[10px] text-neutral-400">
                <span>Passo {activeGalleryIndex + 1} de {galleryImages.length}</span>
                <span className="font-serif italic text-rose-600">isabelsantos.naildesigner</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SEÇÃO DO MODELO: TURMAS ANTERIORES E DEPOIMENTOS */}
      <section id="past_batches_section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-1.5 text-amber-600 font-extrabold text-[10px] tracking-wider uppercase bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-2">
            <Users className="w-3 h-3" />
            <span>Nossa Comunidade</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3.5xl font-black text-[#2E1E1C]">Evolução das Nossas Turmas</h3>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2 leading-relaxed">
            Selecione uma turma para ver o sucesso das alunas graduadas e o portfólio desenvolvido por elas durante as aulas práticas.
          </p>
        </div>

        {/* Interactive Cohort Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {pastBatches.map(batch => (
            <button
              key={batch.id}
              onClick={() => setSelectedBatchId(batch.id)}
              className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                selectedBatchId === batch.id
                  ? 'bg-[#2D1F1D] text-white border-[#2D1F1D] shadow-4xs'
                  : 'bg-white text-neutral-600 border-rose-100 hover:border-rose-200'
              }`}
            >
              {batch.name.split(' - ')[0]}
            </button>
          ))}
        </div>

        {/* Past Batch Data Card View */}
        <div className="bg-white rounded-3xl border border-rose-100 p-6 sm:p-8 shadow-3xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-black tracking-widest text-rose-600 uppercase font-mono block">Relatório da Formatura</span>
              <h4 className="font-serif text-xl sm:text-2.5xl font-black text-[#2E1E1C] leading-snug">{currentBatch.name}</h4>
              <p className="text-rose-900/70 text-xs font-semibold">{currentBatch.subtitle}</p>
              
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed pt-2">
                {currentBatch.description}
              </p>
            </div>

            {/* Microstats block */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-rose-50">
              <div className="bg-[#FCFAF8] p-3.5 rounded-xl border border-rose-100/50">
                <span className="block text-rose-600 font-extrabold font-serif text-base">{currentBatch.graduatedCount} Alunas</span>
                <span className="text-[9px] text-[#2D1F1D]/60 uppercase font-bold block mt-0.5">Formação Concluída</span>
              </div>
              <div className="bg-[#FCFAF8] p-3.5 rounded-xl border border-rose-100/50">
                <span className="block text-amber-600 font-extrabold font-serif text-xs truncate" title={currentBatch.highlightWork}>
                  {currentBatch.highlightWork}
                </span>
                <span className="text-[9px] text-[#2D1F1D]/60 uppercase font-bold block mt-1.5">Trabalho Destaque</span>
              </div>
              <div className="bg-[#FCFAF8] p-3.5 rounded-xl border border-rose-100/50">
                <span className="block text-emerald-600 font-extrabold font-serif text-[11px] truncate" title={currentBatch.avgSuccessTerm}>
                  {currentBatch.avgSuccessTerm}
                </span>
                <span className="text-[9px] text-[#2D1F1D]/60 uppercase font-bold block mt-1.5">Meta de Sucesso</span>
              </div>
            </div>

            {/* Graduation interactive gallery pics */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Atividades e Ensaios da Turma</h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentBatch.studentPhotos.map((photo, pIdx) => (
                  <div key={pIdx} className="bg-gradient-to-br from-rose-50/50 to-amber-50/40 p-4 rounded-xl border border-rose-100 text-center flex flex-col items-center justify-center">
                    <span className="text-xl">📸</span>
                    <span className="text-[9px] text-[#2D1F1D]/90 font-bold block mt-1.5 leading-snug">{photo.label}</span>
                    <span className="text-[8px] text-neutral-400 block mt-0.5 truncate max-w-full">{photo.img}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Student Testimony of this Cohort */}
          <div className="lg:col-span-5 bg-rose-50/40 border border-rose-100 rounded-2xl p-6 flex flex-col justify-between items-start space-y-6">
            <div className="space-y-4">
              <span className="text-[9px] bg-rose-150 text-rose-800 font-extrabold border border-rose-200 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                Depoimento com Foto de Aluna
              </span>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-lg shadow-5xs border border-rose-200 shrink-0">
                  {currentBatch.avatarImage}
                </div>
                <div>
                  <h5 className="font-bold text-xs text-[#2E1E1C]">{currentBatch.avatarHighlight}</h5>
                  <p className="text-[9px] text-neutral-400">Excelente em Cutilagem Russa • Aluna Premium</p>
                </div>
              </div>

              <div className="relative">
                <span className="absolute -top-3 -left-2 text-4xl text-rose-300 pointer-events-none italic font-serif">&ldquo;</span>
                <p className="text-[11px] sm:text-xs text-neutral-600 leading-relaxed italic relative pl-3.5">
                  {currentBatch.testimony}
                </p>
                <div className="flex items-center space-x-0.5 mt-2.5 pl-3.5">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                </div>
              </div>
            </div>

            <div className="w-full bg-white/70 backdrop-blur-xs border border-rose-100 p-3 rounded-xl flex items-center space-x-3">
              <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[9px] text-neutral-400 uppercase font-extrabold">Carreira Pós-Curso</p>
                <p className="text-[10px] text-[#2E1E1C] font-semibold mt-0.5 leading-tight">Abriu seu próprio estúdio no primeiro mês</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. FORMULÁRIO DE CADASTRO / INTERACTIVE RESERVATION */}
      <section id="enroll_form_section" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-24">
        <div className="bg-white rounded-3xl border border-rose-200/80 shadow-lg p-6 sm:p-10 relative overflow-hidden">
          {/* Decorative background vectors */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-rose-50 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl pointer-events-none -ml-10 -mb-10" />

          {!formSubmitted ? (
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              <div className="md:col-span-5 space-y-4">
                <span className="text-[10px] font-black tracking-widest text-[#2E1E1C] uppercase font-mono block">Reserve Sua Vaga</span>
                <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#2E1E1C] leading-tight">Próxima Turma Presencial</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  As vagas são limitadas para apenas <strong>8 estudantes por turma</strong>, garantindo foco individual e qualidade cirúrgica de aprendizado.
                </p>

                <div className="space-y-2.5 pt-3">
                  <div className="flex items-center space-x-2 text-xs text-neutral-600">
                    <Check className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Início em 20 de Julho de 2026</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-neutral-600">
                    <Check className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Incluso Coffeebreak de Luxo</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-neutral-600">
                    <Check className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Certificado de Extensão Universitária</span>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl p-3 border border-amber-250/60 text-center">
                  <span className="text-[9px] font-black uppercase text-amber-900 tracking-wide block">Preço Promocional Exclusivo</span>
                  <p className="text-xl font-serif font-black text-[#2E1E1C] mt-0.5">
                    12x R$ 149,90 <span className="text-neutral-450 text-[10px] font-sans font-normal">ou s/ juros no Pix</span>
                  </p>
                </div>
              </div>

              {/* Form block */}
              <form onSubmit={handleRegisterSubmit} className="md:col-span-7 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">Seu Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria Paula Silva Alves"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full text-xs font-medium bg-[#FCFAF8]/70 border border-rose-100 rounded-xl px-4 py-3 outline-none focus:border-rose-350 focus:bg-white transition-all text-[#2E1E1C] placeholder:text-neutral-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">WhatsApp para Contato *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+55 (11) 99999-9999"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      className="w-full text-xs font-medium bg-[#FCFAF8]/70 border border-rose-100 rounded-xl px-4 py-3 outline-none focus:border-rose-350 focus:bg-white transition-all text-[#2E1E1C] placeholder:text-neutral-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">E-mail para Notificação *</label>
                    <input
                      type="email"
                      required
                      placeholder="email@dominio.com"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full text-xs font-medium bg-[#FCFAF8]/70 border border-rose-100 rounded-xl px-4 py-3 outline-none focus:border-rose-350 focus:bg-white transition-all text-[#2E1E1C] placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">Período de Preferência</label>
                    <select
                      value={selectedCohort}
                      onChange={(e) => setSelectedCohort(e.target.value)}
                      className="w-full text-xs font-medium bg-[#FCFAF8]/70 border border-rose-100 rounded-xl px-3 py-3 outline-none focus:border-rose-350 focus:bg-white transition-all text-[#2E1E1C] cursor-pointer"
                    >
                      <option value="julho_2026">Julho/2026 (Presencial)</option>
                      <option value="setembro_2026">Setembro/2026 (Presencial)</option>
                      <option value="individual_vip">Novembro/2026 (Presencial)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">Formato do Curso</label>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="w-full text-xs font-medium bg-[#FCFAF8]/70 border border-rose-100 rounded-xl px-3 py-3 outline-none focus:border-rose-350 focus:bg-white transition-all text-[#2E1E1C] cursor-pointer"
                    >
                      <option value="presencial_grupo">Presencial Coletivo (8 Alunas)</option>
                      <option value="vip_individual">Mentoria VIP Individual (1 Aluna)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">Nível de Experiência</label>
                    <select
                      value={studentExperience}
                      onChange={(e) => setStudentExperience(e.target.value)}
                      className="w-full text-xs font-medium bg-[#FCFAF8]/70 border border-rose-100 rounded-xl px-3 py-3 outline-none focus:border-rose-350 focus:bg-white transition-all text-[#2E1E1C] cursor-pointer"
                    >
                      <option value="iniciante">Começando do zero</option>
                      <option value="intermediario">Já sou manicure e quero evoluir</option>
                      <option value="avancado">Quero aprender técnicas russas</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#2D1F1D] text-white hover:bg-neutral-900 font-extrabold uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer shadow-4xs flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Shield className="w-3.5 h-3.5 text-rose-400" />
                        <span>Confirmar Minha Pré-Semana de Inscrição</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="relative z-10 text-center py-8 space-y-5 animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center border border-rose-200 mx-auto text-rose-700 font-serif font-black text-2xl shadow-3xs">
                💯
              </div>
              
              <div className="space-y-2">
                <h4 className="font-serif text-2xl sm:text-3.5xl font-extrabold text-[#2E1E1C]">Pré-Inscrição Recebida! 🎉</h4>
                <p className="text-neutral-600 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
                  Perfeito, <strong>{studentName}</strong>! Seus dados foram computados com sucesso na plataforma de estudantes da Isabel Santos. 
                </p>
              </div>

              <div className="bg-rose-50/40 border border-rose-100 p-4 rounded-2xl max-w-md mx-auto text-left text-xs text-rose-800 space-y-1.5 leading-relaxed">
                <p className="font-bold">O que acontece agora?</p>
                <p className="text-[11px] text-neutral-600">
                  1. Enviaremos as instruções completas do kit e da agenda oficial para o e-mail: <strong>{studentEmail}</strong>.
                </p>
                <p className="text-[11px] text-neutral-600">
                  2. Nossa assessora de vendas entrará em contato via WhatsApp <strong>{studentPhone}</strong> para definir as opções facilitadas de parcelamento e finalizar a matrícula oficial.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setFormSubmitted(false);
                    setStudentName('');
                    setStudentPhone('');
                    setStudentEmail('');
                  }}
                  className="px-6 py-2.5 bg-[#2D1F1D] text-white hover:bg-neutral-900 border-none rounded-xl font-bold uppercase text-[10px] tracking-widest cursor-pointer shadow-4xs"
                >
                  Novo Cadastro de Aluna
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 6. PERGUNTAS FREQUENTES (FAQ) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h4 className="font-serif text-xl sm:text-2xl font-black text-[#2E1E1C] text-center mb-6">Informações e Dúvidas Frequentes</h4>
        
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-rose-100 p-5 space-y-2">
            <h5 className="font-serif font-bold text-xs sm:text-sm">Preciso levar algum material para o curso?</h5>
            <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed">
              Não! Todo o material técnico essencial (produtos preparadores, motor portátil, luz ultravioleta e insumos extras) é 100% disponibilizado para uso coletivo durante as aulas presenciais. Além disso, você leva o seu Kit Premium próprio para começar sua caminhada profissional logo no último dia de aula.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-rose-100 p-5 space-y-2">
            <h5 className="font-serif font-bold text-xs sm:text-sm">Como funciona o suporte pós-curso de Isabel Santos?</h5>
            <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed">
              As alunas têm acesso garantido a um grupo vitalício e fechado de mentoria no WhatsApp direto com a Isabel. Lá você envia fotos dos seus primeiros atendimentos pós-curso para avaliação corretiva individual do ponto de tensão, simetria e dúvidas operacionais gerais em até 6 meses.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-rose-100 p-5 space-y-2">
            <h5 className="font-serif font-bold text-xs sm:text-sm">Qual a duração total do curso e os formatos de parcelamento?</h5>
            <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed">
              O curso tem duração total de 28 horas intensivas de grade presencial dividida em 3 ou 4 dias. O parcelamento pode ser feito em até 12 vezes corrigidas de R$ 149,90 no cartão de crédito, ou pagamento integral de R$ 1.490,00 s/ juros no Pix diretamente.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
