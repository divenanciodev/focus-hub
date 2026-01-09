import { 
  Discipline, 
  Training, 
  Contest, 
  BankSimulado, 
  Course, 
  FinancialEntry, 
  Consortium, 
  Objective, 
  Plan, 
  UserProfile,
  Question 
} from '@/types';

export const mockDisciplines: Discipline[] = [
  { 
    id: '1', 
    name: 'Direito Constitucional', 
    subject: 'Direito', 
    specificSubject: 'Constitucional',
    grade: 'Superior', 
    progress: 65, 
    hoursStudied: 42, 
    createdAt: new Date('2024-01-15'),
    tags: ['Princípios', 'Direitos Fundamentais', 'Organização do Estado'],
    color: '#3b82f6',
    studyPlan: { days: ['monday', 'wednesday', 'friday'], hoursPerDay: 2, blockDuration: 30 }
  },
  { 
    id: '2', 
    name: 'Gramática', 
    subject: 'Português', 
    specificSubject: 'Gramática',
    grade: 'Superior', 
    progress: 78, 
    hoursStudied: 56, 
    createdAt: new Date('2024-01-10'),
    tags: ['Verbos', 'Sintaxe', 'Concordância'],
    color: '#22c55e',
    studyPlan: { days: ['tuesday', 'thursday'], hoursPerDay: 1.5, blockDuration: 45 }
  },
  { 
    id: '3', 
    name: 'Matemática Financeira', 
    subject: 'Exatas', 
    specificSubject: 'Matemática Financeira',
    grade: 'Superior', 
    progress: 45, 
    hoursStudied: 28, 
    createdAt: new Date('2024-02-01'),
    tags: ['Juros', 'Investimentos'],
    color: '#f97316'
  },
  { 
    id: '4', 
    name: 'Raciocínio Lógico', 
    subject: 'Exatas', 
    grade: 'Superior', 
    progress: 52, 
    hoursStudied: 35, 
    createdAt: new Date('2024-01-20'),
    tags: ['Lógica', 'Proposições'],
    color: '#8b5cf6',
    studyPlan: { days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], hoursPerDay: 1, blockDuration: 25 }
  },
  { 
    id: '5', 
    name: 'Informática', 
    subject: 'Tecnologia', 
    grade: 'Médio', 
    progress: 88, 
    hoursStudied: 20, 
    createdAt: new Date('2024-02-10'),
    color: '#ec4899'
  },
];

export const mockTrainings: Training[] = [
  { id: '1', name: 'Treino Constitucional #1', discipline: 'Direito Constitucional', subject: 'Princípios Fundamentais', questionCount: 20, timeMinutes: 30, status: 'completed', score: 85, createdAt: new Date('2024-03-01') },
  { id: '2', name: 'Treino Português #1', discipline: 'Português', subject: 'Interpretação de Texto', questionCount: 15, timeMinutes: 25, status: 'completed', score: 73, createdAt: new Date('2024-03-05') },
  { id: '3', name: 'Treino Matemática #1', discipline: 'Matemática Financeira', subject: 'Juros Compostos', questionCount: 10, timeMinutes: 20, status: 'pending', createdAt: new Date('2024-03-10') },
];

export const mockQuestions: Question[] = [
  {
    id: '1',
    text: 'A Constituição Federal de 1988 estabelece que a República Federativa do Brasil tem como fundamentos:',
    options: [
      'A soberania, a cidadania, a dignidade da pessoa humana e os valores sociais do trabalho e da livre iniciativa',
      'A independência nacional, a prevalência dos direitos humanos e a autodeterminação dos povos',
      'A defesa da paz, a solução pacífica dos conflitos e o repúdio ao terrorismo',
      'A construção de uma sociedade livre, justa e solidária',
      'A erradicação da pobreza e a redução das desigualdades sociais'
    ],
    correctIndex: 0
  },
  {
    id: '2',
    text: 'São direitos sociais previstos no artigo 6º da Constituição Federal:',
    options: [
      'Apenas educação, saúde e trabalho',
      'Educação, saúde, alimentação, trabalho, moradia, transporte, lazer, segurança, previdência social, proteção à maternidade e à infância, assistência aos desamparados',
      'Somente os direitos relacionados ao trabalho',
      'Educação e saúde apenas para brasileiros natos',
      'Nenhuma das alternativas'
    ],
    correctIndex: 1
  },
  {
    id: '3',
    text: 'O princípio da legalidade, previsto na Constituição Federal, estabelece que:',
    options: [
      'O Estado pode fazer tudo o que a lei não proíbe',
      'Os particulares só podem fazer o que a lei permite',
      'Ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei',
      'A lei deve ser igual para todos',
      'O Estado está acima da lei em situações excepcionais'
    ],
    correctIndex: 2
  },
];

export const mockContests: Contest[] = [
  { id: '1', name: 'Concurso TRT-SP', position: 'Analista Judiciário', examDate: new Date('2024-06-15'), institution: 'TRT', status: 'active' },
  { id: '2', name: 'Concurso INSS', position: 'Técnico do Seguro Social', examDate: new Date('2024-07-20'), institution: 'INSS', status: 'active' },
  { id: '3', name: 'Concurso Banco do Brasil', position: 'Escriturário', examDate: new Date('2024-05-10'), institution: 'BB', status: 'completed' },
];

export const mockBankSimulados: BankSimulado[] = [
  { id: '1', title: 'Simulado CESPE - Direito Administrativo', area: 'Direito', banca: 'CESPE', grade: 'Superior', questionCount: 40, difficulty: 'hard' },
  { id: '2', title: 'Simulado FCC - Português', area: 'Línguas', banca: 'FCC', grade: 'Superior', questionCount: 30, difficulty: 'medium' },
  { id: '3', title: 'Simulado FGV - Raciocínio Lógico', area: 'Exatas', banca: 'FGV', grade: 'Superior', questionCount: 25, difficulty: 'hard' },
  { id: '4', title: 'Simulado VUNESP - Atualidades', area: 'Conhecimentos Gerais', banca: 'VUNESP', grade: 'Médio', questionCount: 20, difficulty: 'easy' },
  { id: '5', title: 'Simulado CESPE - Informática', area: 'Tecnologia', banca: 'CESPE', grade: 'Médio', questionCount: 15, difficulty: 'medium' },
];

export const mockBankCourses: Course[] = [
  { id: 'b1', name: 'Direito Constitucional Completo', theme: 'Direito', workload: 120, deadline: new Date('2024-12-31'), progress: 0, platform: 'Estratégia Concursos', imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400', links: [], curriculum: [{ id: 'c1', title: 'Módulo 1 - Princípios Fundamentais', completed: false }, { id: 'c2', title: 'Módulo 2 - Direitos e Garantias', completed: false }] },
  { id: 'b2', name: 'Português para Concursos', theme: 'Línguas', workload: 80, deadline: new Date('2024-12-31'), progress: 0, platform: 'Gran Cursos', imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400', links: [], curriculum: [{ id: 'c1', title: 'Aula 1 - Interpretação de Texto', completed: false }] },
  { id: 'b3', name: 'Matemática e RLM', theme: 'Exatas', workload: 100, deadline: new Date('2024-12-31'), progress: 0, platform: 'Direção Concursos', imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400', links: [], curriculum: [] },
];

export const mockUserCourses: Course[] = [
  { id: '1', name: 'Curso de Excel Avançado', theme: 'Tecnologia', workload: 40, deadline: new Date('2024-04-30'), progress: 75, links: [{ id: '1', title: 'Aula 1', type: 'youtube', url: 'https://youtube.com' }], curriculum: [{ id: 'c1', title: 'Introdução ao Excel', completed: true }, { id: 'c2', title: 'Fórmulas Avançadas', completed: true }, { id: 'c3', title: 'Macros e VBA', completed: false }] },
  { id: '2', name: 'Inglês para Concursos', theme: 'Línguas', workload: 60, deadline: new Date('2024-05-15'), progress: 30, links: [], curriculum: [{ id: 'c1', title: 'Basic Grammar', completed: true }, { id: 'c2', title: 'Reading Comprehension', completed: false }] },
];

export const mockFinancialEntries: FinancialEntry[] = [
  { id: '1', type: 'income', description: 'Salário', amount: 5000, date: new Date('2024-03-01'), category: 'Trabalho' },
  { id: '2', type: 'expense', description: 'Aluguel', amount: 1500, date: new Date('2024-03-05'), category: 'Moradia' },
  { id: '3', type: 'expense', description: 'Curso Estratégia', amount: 300, date: new Date('2024-03-10'), category: 'Educação' },
  { id: '4', type: 'expense', description: 'Livros Concurso', amount: 150, date: new Date('2024-03-12'), category: 'Educação' },
  { id: '5', type: 'expense', description: 'Internet', amount: 120, date: new Date('2024-03-15'), category: 'Serviços' },
];

export const mockConsortiums: Consortium[] = [
  { id: '1', goal: 'Notebook para estudos', totalAmount: 5000, installments: 10, paidInstallments: 6 },
  { id: '2', goal: 'Fundo de emergência', totalAmount: 12000, installments: 24, paidInstallments: 8 },
];

export const mockObjectives: Objective[] = [
  { 
    id: '1', 
    title: 'Passar no concurso TRT', 
    description: 'Meta principal do ano', 
    status: 'in_progress',
    steps: [
      { id: '1', title: 'Estudar 4h por dia', completed: true },
      { id: '2', title: 'Fazer 50 questões diárias', completed: true },
      { id: '3', title: 'Revisar todo o conteúdo', completed: false },
      { id: '4', title: 'Fazer simulados semanais', completed: false },
    ],
    createdAt: new Date('2024-01-01')
  },
  { 
    id: '2', 
    title: 'Economizar R$ 10.000', 
    description: 'Reserva financeira', 
    status: 'in_progress',
    steps: [
      { id: '1', title: 'Guardar 20% do salário', completed: true },
      { id: '2', title: 'Cortar gastos desnecessários', completed: false },
      { id: '3', title: 'Investir em renda fixa', completed: false },
    ],
    createdAt: new Date('2024-01-15')
  },
  { 
    id: '3', 
    title: 'Aprender inglês intermediário', 
    description: 'Melhorar o currículo', 
    status: 'pending',
    steps: [
      { id: '1', title: 'Fazer curso online', completed: false },
      { id: '2', title: 'Praticar 30min por dia', completed: false },
    ],
    createdAt: new Date('2024-02-01')
  },
];

export const mockPlans: Plan[] = [
  { 
    id: '1', 
    name: 'Gratuito', 
    price: 0, 
    period: 'free',
    benefits: [
      'Acesso a 3 disciplinas',
      '10 questões por dia',
      'Dashboard básico',
      'Cronômetro de estudos'
    ]
  },
  { 
    id: '2', 
    name: 'Mensal', 
    price: 29.90, 
    period: 'monthly',
    popular: true,
    benefits: [
      'Disciplinas ilimitadas',
      'Questões ilimitadas',
      'Simulados completos',
      'Estatísticas avançadas',
      'Flashcards',
      'Suporte prioritário'
    ]
  },
  { 
    id: '3', 
    name: 'Anual', 
    price: 239.90, 
    period: 'yearly',
    benefits: [
      'Tudo do plano mensal',
      '2 meses grátis',
      'Cursos exclusivos',
      'Mentoria mensal',
      'Certificados',
      'Acesso vitalício ao conteúdo'
    ]
  },
];

export const mockUserProfile: UserProfile = {
  name: 'João Silva',
  email: 'joao.silva@email.com',
  currentPlan: mockPlans[1],
  totalProgress: 62,
  studyHoursTotal: 181,
  joinedAt: new Date('2024-01-01'),
};

export const mockDashboardStats = {
  hoursToday: 3.5,
  generalProgress: 62,
  financialProgress: 45,
  pendingTasks: 8,
  questionsToday: 45,
  correctRate: 78,
};
