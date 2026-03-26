
export const DUMMY_CATEGORIES = [
  { id: 'cat-1', name: 'Gastronomia', slug: 'gastronomia', icon: 'UtensilsCrossed', color: 'rose' },
  { id: 'cat-2', name: 'Tecnologia', slug: 'tecnologia', icon: 'Laptop', color: 'blue' },
  { id: 'cat-3', name: 'Moda e Beleza', slug: 'moda-beleza', icon: 'Shirt', color: 'pink' },
  { id: 'cat-4', name: 'Saúde', slug: 'saude', icon: 'HeartPulse', color: 'emerald' },
  { id: 'cat-5', name: 'Serviços', slug: 'servicos', icon: 'Briefcase', color: 'slate' },
  { id: 'cat-6', name: 'Automotivo', slug: 'automotivo', icon: 'CarFront', color: 'zinc' },
  { id: 'cat-7', name: 'Educação', slug: 'educacao', icon: 'GraduationCap', color: 'indigo' },
  { id: 'cat-8', name: 'Academia', slug: 'academia', icon: 'Dumbbell', color: 'amber' },
  { id: 'cat-9', name: 'Pet Shop', slug: 'pet-shop', icon: 'Dog', color: 'orange' },
  { id: 'cat-10', name: 'Contabilidade', slug: 'contabilidade', icon: 'FileText', color: 'cyan' },
  { id: 'cat-11', name: 'Imobiliária', slug: 'imobiliaria', icon: 'Building2', color: 'violet' },
  { id: 'cat-12', name: 'Turismo', slug: 'turismo', icon: 'Palmtree', color: 'teal' }
];

export const DUMMY_BUSINESSES = [
  {
    id: 'biz-gym-1',
    name: 'Elite Fitness Center',
    slug: 'elite-fitness',
    description: 'A academia mais completa da região com equipamentos de última geração e profissionais certificados.',
    category_id: 'cat-8',
    address: 'Av. Principal, 1000',
    phone: '(11) 91234-5678',
    whatsapp: '5511912345678',
    image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800',
    active: true,
    featured: true,
    average_rating: 4.8,
    total_reviews: 45,
    plan_tier: 'MAX',
    has_menu: false,
    has_booking: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'biz-pet-1',
    name: 'Pet Love & Care',
    slug: 'pet-love-care',
    description: 'Tudo para o seu melhor amigo. Banho, tosa e atendimento veterinário especializado.',
    category_id: 'cat-9',
    address: 'Rua das Patas, 50',
    phone: '(11) 98765-4321',
    whatsapp: '5511987654321',
    image_url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800',
    active: true,
    featured: true,
    average_rating: 4.9,
    total_reviews: 32,
    plan_tier: 'PRO',
    has_menu: false,
    has_booking: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'biz-dentist-1',
    name: 'Sorriso Premium',
    slug: 'sorriso-premium',
    description: 'Clínica odontológica de alta tecnologia. Implantes, estética e ortodontia.',
    category_id: 'cat-4',
    address: 'Edifício Medical, Sala 202',
    phone: '(11) 3344-5566',
    whatsapp: '551133445566',
    image_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800',
    active: true,
    featured: false,
    average_rating: 5.0,
    total_reviews: 28,
    plan_tier: 'BASIC',
    has_menu: false,
    has_booking: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'biz-mech-1',
    name: 'Mecânica Precision',
    slug: 'mecanica-precision',
    description: 'Oficina especializada em veículos importados e nacionais. Diagnóstico computadorizado.',
    category_id: 'cat-6',
    address: 'Rodovia Sul, Km 15',
    phone: '(11) 99988-7766',
    whatsapp: '5511999887766',
    image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800',
    active: true,
    featured: true,
    average_rating: 4.7,
    total_reviews: 67,
    plan_tier: 'MAX',
    has_menu: false,
    has_booking: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'biz-pizza-1',
    name: 'Don Corleone Pizzaria',
    slug: 'don-corleone',
    description: 'A verdadeira pizza napolitana com bordas aeradas e ingredientes premium.',
    category_id: 'cat-1',
    address: 'Rua Gastronômica, 12',
    phone: '(11) 3212-4455',
    whatsapp: '551132124455',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800',
    active: true,
    featured: true,
    average_rating: 4.9,
    total_reviews: 156,
    plan_tier: 'MAX',
    has_menu: true,
    has_booking: false,
    created_at: new Date().toISOString()
  },
  {
    id: 'biz-estate-1',
    name: 'Horizonte Imóveis',
    slug: 'horizonte-imoveis',
    description: 'Encontre o lar dos seus sonhos. Venda, locação e administração de imóveis com confiança.',
    category_id: 'cat-11',
    address: 'Av. das Nações, 500',
    phone: '(11) 4004-1234',
    whatsapp: '551140041234',
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800',
    active: true,
    featured: true,
    average_rating: 4.6,
    total_reviews: 89,
    plan_tier: 'PRO',
    has_menu: false,
    has_booking: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'biz-travel-1',
    name: 'Destino Certo Viagens',
    slug: 'destino-certo',
    description: 'Pacotes turísticos, passagens aéreas e as melhores experiências de viagem para você e sua família.',
    category_id: 'cat-12',
    address: 'Shopping Central, Loja 15',
    phone: '(11) 97766-5544',
    whatsapp: '5511977665544',
    image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800',
    active: true,
    featured: true,
    average_rating: 4.8,
    total_reviews: 120,
    plan_tier: 'MAX',
    has_menu: false,
    has_booking: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'biz-acc-1',
    name: 'Alpha Business Solutions',
    slug: 'alpha-business',
    description: 'Assessoria contábil e consultoria empresarial de alto nível. Planejamento tributário e gestão eficiente.',
    category_id: 'cat-10',
    address: 'Empresarial Faria Lima, 10º Andar',
    phone: '(11) 3300-4400',
    whatsapp: '551133004400',
    image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800',
    active: true,
    featured: true,
    average_rating: 4.9,
    total_reviews: 42,
    plan_tier: 'MAX',
    has_menu: false,
    has_booking: true,
    created_at: new Date().toISOString()
  }
];

export const DUMMY_PRODUCTS = [
  { id: 'p1', business_id: 'biz-pizza-1', name: 'Margherita Speciale', price: 45.90, category: 'Pizzas Clássicas', active: true, image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?q=80&w=400' },
  { id: 'p2', business_id: 'biz-pizza-1', name: 'Pepperoni Premium', price: 52.00, category: 'Pizzas Clássicas', active: true, image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=400' },
  { id: 'p3', business_id: 'biz-pizza-1', name: 'Coca-Cola 2L', price: 14.00, category: 'Bebidas', active: true, image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400' },
  { id: 'p4', business_id: 'biz-pizza-1', name: 'Brotinho de Nutella', price: 29.90, category: 'Sobremesas', active: true, image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=400' }
];

export const DUMMY_SERVICES = [
  { id: 's1', business_id: 'biz-gym-1', name: 'Avaliação Física', price: 80.00, duration_minutes: 45, active: true },
  { id: 's2', business_id: 'biz-gym-1', name: 'Treino Personalizado', price: 150.00, duration_minutes: 60, active: true },
  { id: 's3', business_id: 'biz-pet-1', name: 'Banho & Tosa (Pequeno)', price: 65.00, duration_minutes: 90, active: true },
  { id: 's4', business_id: 'biz-pet-1', name: 'Consulta Veterinária', price: 120.00, duration_minutes: 30, active: true },
  { id: 's5', business_id: 'biz-dentist-1', name: 'Limpeza Profissional', price: 180.00, duration_minutes: 40, active: true },
  { id: 's6', business_id: 'biz-mech-1', name: 'Troca de Óleo', price: 250.00, duration_minutes: 30, active: true }
];

export const DUMMY_TESTIMONIALS = [
  {
    id: 'test-1',
    name: 'Roberto Mendonça',
    role: 'Empresário - Elite Fitness',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200',
    text: 'O Meu Guia Comercial transformou a visibilidade da minha academia. O número de consultas via WhatsApp dobrou no primeiro mês de uso!',
    rating: 5,
    location: 'Centro, SP'
  },
  {
    id: 'test-2',
    name: 'Juliana Cavalcante',
    role: 'Usuária Frequente',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
    text: 'Sempre que preciso de um serviço de confiança na cidade, recorro ao guia. As avaliações reais me ajudam a escolher o melhor lugar sempre.',
    rating: 5,
    location: 'Bairro Nobre, SP'
  },
  {
    id: 'test-3',
    name: 'Carlos Alberto',
    role: 'Dono de Restaurante',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    text: 'A facilidade do cardápio digital integrado é fantástica. Nossos clientes elogiam a modernidade e a velocidade para fazer pedidos.',
    rating: 4.9,
    location: 'Polo Gastronômico, SP'
  },
  {
    id: 'test-4',
    name: 'Beatriz Fontes',
    role: 'Consultora Imobiliária',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200',
    text: 'Finalmente uma plataforma local que valoriza o corretor. O suporte da equipe é impecável e as leads são de altíssima qualidade.',
    rating: 5,
    location: 'Jardins, SP'
  }
];

export const DUMMY_POSTS = [
  { 
    id: 'post-1', 
    slug: 'como-aumentar-suas-vendas-locais', 
    title: 'Como aumentar suas vendas locais', 
    excerpt: 'Descubra estratégias práticas para lojistas dominarem o mercado da sua região.',
    content: '# Estratégias de Venda Local\n\nDicas práticas para lojistas...\n\n1. Use redes sociais...\n2. Mantenha seu cadastro atualizado...', 
    category: 'Vendas',
    cover_image_url: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=800',
    author: 'Equipe Guia', 
    date: new Date().toISOString() 
  },
  { 
    id: 'post-2', 
    slug: 'novas-tendencias-comerciais-2026', 
    title: 'Novas tendências comerciais para 2026', 
    excerpt: 'O que há de novo no comércio regional e como se preparar para as mudanças tecnológicas.',
    content: '# Tendências 2026\n\nO que há de novo na cidade...\n\nO mercado está mudando...', 
    category: 'Tecnologia',
    cover_image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800',
    author: 'Redação', 
    date: new Date().toISOString() 
  }
];
