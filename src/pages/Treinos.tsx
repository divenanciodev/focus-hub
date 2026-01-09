import { useState, useRef } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FlashcardGroup } from '@/types/flashcards';
import { FlashcardCreator } from '@/components/flashcards/FlashcardCreator';
import { FlashcardGroupList } from '@/components/flashcards/FlashcardGroupList';
import { FlashcardPractice } from '@/components/flashcards/FlashcardPractice';
import { CreateSimuladoModal } from '@/components/training/simulado/CreateSimuladoModal';
import { SimuladoSession } from '@/components/training/simulado/SimuladoSession';
import { ContentLibrary } from '@/components/training/ContentLibrary';
import { Simulado, TrainingType, TrainingMetrics, SavedMindMap, SavedSummary, SavedHandwriting, SavedAudioExplanation } from '@/types/training';
import { 
  Layers, 
  FileQuestion, 
  PenTool,
  Brain,
  FileText,
  PenLine,
  Mic,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  FolderOpen,
  Eye,
  Upload,
  Image,
  FileIcon,
  Square,
  Play
} from 'lucide-react';
import { toast } from 'sonner';

// Tipos de método de aprendizado
const learningMethods = [
  {
    id: 'flashcards' as TrainingType,
    name: 'Flashcards',
    description: 'Cartões de memorização com perguntas e respostas',
    icon: Layers,
    available: true,
  },
  {
    id: 'simulado' as TrainingType,
    name: 'Simulados',
    description: 'Questões de múltipla escolha com cronômetro',
    icon: FileQuestion,
    available: true,
  },
  {
    id: 'mindmap' as TrainingType,
    name: 'Mapas Mentais',
    description: 'Diagramas visuais para organizar ideias',
    icon: Brain,
    available: true,
  },
  {
    id: 'summary' as TrainingType,
    name: 'Resumos',
    description: 'Salve seus resumos em imagem ou PDF',
    icon: FileText,
    available: true,
  },
  {
    id: 'handwriting' as TrainingType,
    name: 'Escrita Manual',
    description: 'Salve fotos de resumos escritos à mão',
    icon: PenLine,
    available: true,
  },
  {
    id: 'audio-explanation' as TrainingType,
    name: 'Explicação em Áudio',
    description: 'Grave explicações sobre os conteúdos',
    icon: Mic,
    available: true,
  },
];

// Exemplos de Flashcards
const exampleFlashcardGroups: FlashcardGroup[] = [
  {
    id: 'example-1',
    name: 'Direito Constitucional - Princípios Fundamentais',
    cards: [
      {
        id: 'card-1',
        name: 'Fundamentos da República',
        type: 'flip',
        question: 'Quais são os 5 fundamentos da República Federativa do Brasil (Art. 1º)?',
        answer: 'I - Soberania\nII - Cidadania\nIII - Dignidade da pessoa humana\nIV - Valores sociais do trabalho e da livre iniciativa\nV - Pluralismo político',
        frontColor: '#3b82f6',
        backColor: '#1e40af',
        createdAt: new Date('2025-01-05'),
      },
      {
        id: 'card-2',
        name: 'Objetivos Fundamentais',
        type: 'multiple-choice',
        question: 'Qual NÃO é um objetivo fundamental da República (Art. 3º)?',
        answer: 'Garantir a segurança nacional',
        frontColor: '#8b5cf6',
        backColor: '#6d28d9',
        options: [
          { id: 'a', text: 'Construir uma sociedade livre', isCorrect: false },
          { id: 'b', text: 'Garantir o desenvolvimento nacional', isCorrect: false },
          { id: 'c', text: 'Garantir a segurança nacional', isCorrect: true },
          { id: 'd', text: 'Erradicar a pobreza', isCorrect: false },
        ],
        createdAt: new Date('2025-01-05'),
      },
      {
        id: 'card-3',
        name: 'Poderes da União',
        type: 'flip',
        question: 'Quais são os poderes da União, independentes e harmônicos entre si?',
        answer: 'Legislativo, Executivo e Judiciário (Art. 2º da CF/88)',
        frontColor: '#10b981',
        backColor: '#047857',
        createdAt: new Date('2025-01-05'),
      },
    ],
    createdAt: new Date('2025-01-05'),
  },
  {
    id: 'example-2',
    name: 'Português - Regência Verbal',
    cards: [
      {
        id: 'card-4',
        name: 'Verbo Assistir',
        type: 'flip',
        question: 'Qual a regência do verbo ASSISTIR no sentido de "ver"?',
        answer: 'Verbo Transitivo Indireto (VTI)\nExige preposição "a"\nEx: Assisti ao filme.',
        frontColor: '#f59e0b',
        backColor: '#d97706',
        createdAt: new Date('2025-01-04'),
      },
      {
        id: 'card-5',
        name: 'Verbo Visar',
        type: 'multiple-choice',
        question: 'Em qual sentido o verbo VISAR é transitivo direto?',
        answer: 'Mirar, apontar / Pôr visto',
        frontColor: '#ec4899',
        backColor: '#be185d',
        options: [
          { id: 'a', text: 'Ter como objetivo', isCorrect: false },
          { id: 'b', text: 'Mirar, apontar', isCorrect: true },
          { id: 'c', text: 'Desejar, pretender', isCorrect: false },
          { id: 'd', text: 'Todas as alternativas', isCorrect: false },
        ],
        createdAt: new Date('2025-01-04'),
      },
    ],
    createdAt: new Date('2025-01-04'),
    lastStudied: new Date('2025-01-06'),
  },
  {
    id: 'example-3',
    name: 'Raciocínio Lógico - Proposições',
    cards: [
      {
        id: 'card-6',
        name: 'Definição de Proposição',
        type: 'flip',
        question: 'O que é uma proposição lógica?',
        answer: 'É toda sentença declarativa que pode ser classificada como verdadeira (V) ou falsa (F), mas nunca ambas ao mesmo tempo.',
        frontColor: '#06b6d4',
        backColor: '#0891b2',
        createdAt: new Date('2025-01-03'),
      },
      {
        id: 'card-7',
        name: 'Identificação de Proposição',
        type: 'multiple-choice',
        question: 'Qual alternativa NÃO é uma proposição?',
        answer: 'Que horas são?',
        frontColor: '#84cc16',
        backColor: '#65a30d',
        options: [
          { id: 'a', text: 'O céu é azul', isCorrect: false },
          { id: 'b', text: '2 + 2 = 5', isCorrect: false },
          { id: 'c', text: 'Que horas são?', isCorrect: true },
          { id: 'd', text: 'Brasília é a capital do Brasil', isCorrect: false },
        ],
        createdAt: new Date('2025-01-03'),
      },
    ],
    createdAt: new Date('2025-01-03'),
  },
];

// Exemplos de Simulados
const exampleSimulados: Simulado[] = [
  {
    id: 'simulado-1',
    name: 'Simulado INSS 2025 - Direito Previdenciário',
    discipline: 'Direito Previdenciário',
    subject: 'Benefícios por incapacidade',
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        text: 'De acordo com a Lei 8.213/91, o auxílio por incapacidade temporária será devido ao segurado que ficar incapacitado para o seu trabalho por mais de quantos dias consecutivos?',
        options: ['7 dias', '15 dias', '30 dias', '60 dias'],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        text: 'Qual é o período de carência para concessão do auxílio por incapacidade temporária?',
        options: ['6 contribuições mensais', '12 contribuições mensais', '24 contribuições mensais', 'Não há carência'],
        correctAnswer: 1,
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        text: 'O benefício de aposentadoria por incapacidade permanente corresponde a qual percentual do salário de benefício?',
        options: ['60% + 2% por ano acima de 20 anos', '100%', '70%', '91%'],
        correctAnswer: 0,
      },
    ],
    timeMinutes: 30,
    difficulty: 'medium',
    status: 'pending',
    createdAt: new Date('2025-01-05'),
  },
  {
    id: 'simulado-2',
    name: 'Língua Portuguesa - Interpretação de Texto',
    discipline: 'Língua Portuguesa',
    subject: 'Compreensão textual',
    questions: [
      {
        id: 'q4',
        type: 'multiple-choice',
        text: 'A coesão textual é um mecanismo linguístico que garante a conexão entre as partes do texto. Qual elemento abaixo é um exemplo de coesão referencial?',
        options: ['Portanto', 'Ele', 'Mas', 'Porque'],
        correctAnswer: 1,
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        text: 'Assinale a alternativa que apresenta uma figura de linguagem denominada "metonímia":',
        options: ['O amor é fogo que arde sem se ver', 'Li Machado de Assis nas férias', 'A vida é uma peça de teatro', 'O sol sorriu para nós'],
        correctAnswer: 1,
      },
    ],
    timeMinutes: 20,
    difficulty: 'easy',
    status: 'pending',
    createdAt: new Date('2025-01-04'),
  },
  {
    id: 'simulado-3',
    name: 'Informática - Segurança da Informação',
    discipline: 'Informática',
    subject: 'Conceitos de segurança',
    questions: [
      {
        id: 'q6',
        type: 'multiple-choice',
        text: 'Qual tipo de malware se disfarça de software legítimo para enganar o usuário?',
        options: ['Worm', 'Trojan (Cavalo de Troia)', 'Ransomware', 'Spyware'],
        correctAnswer: 1,
      },
      {
        id: 'q7',
        type: 'multiple-choice',
        text: 'O princípio da segurança da informação que garante que a informação seja acessível apenas por pessoas autorizadas é:',
        options: ['Integridade', 'Disponibilidade', 'Confidencialidade', 'Autenticidade'],
        correctAnswer: 2,
      },
      {
        id: 'q8',
        type: 'multiple-choice',
        text: 'O backup incremental armazena:',
        options: ['Todos os arquivos do sistema', 'Apenas os arquivos alterados desde o último backup completo', 'Apenas os arquivos alterados desde o último backup (qualquer tipo)', 'Apenas os arquivos do sistema operacional'],
        correctAnswer: 2,
      },
      {
        id: 'q9',
        type: 'multiple-choice',
        text: 'Qual protocolo é utilizado para garantir segurança na navegação web?',
        options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
        correctAnswer: 2,
      },
    ],
    timeMinutes: 45,
    difficulty: 'medium',
    status: 'completed',
    score: 75,
    createdAt: new Date('2025-01-02'),
  },
];

export default function Treinos() {
  const [mainTab, setMainTab] = useState<'criar' | 'biblioteca'>('biblioteca');
  const [selectedMethod, setSelectedMethod] = useState<TrainingType | null>(null);
  
  // Flashcards state - new simplified system
  const [flashcardGroups, setFlashcardGroups] = useState<FlashcardGroup[]>(exampleFlashcardGroups);
  const [isCreatingFlashcards, setIsCreatingFlashcards] = useState(false);
  const [editingFlashcardGroup, setEditingFlashcardGroup] = useState<FlashcardGroup | undefined>();
  const [studyingFlashcardGroup, setStudyingFlashcardGroup] = useState<FlashcardGroup | null>(null);
  
  // Simulados state
  const [simulados, setSimulados] = useState<Simulado[]>(exampleSimulados);
  const [isCreateSimuladoOpen, setIsCreateSimuladoOpen] = useState(false);
  const [editingSimulado, setEditingSimulado] = useState<Simulado | undefined>();
  const [activeSimulado, setActiveSimulado] = useState<Simulado | null>(null);

  // Saved Mind Maps state (uploaded files)
  const [savedMindMaps, setSavedMindMaps] = useState<SavedMindMap[]>([]);
  const [mindMapTitle, setMindMapTitle] = useState('');
  const [selectedMindMapFile, setSelectedMindMapFile] = useState<File | null>(null);
  const mindMapFileInputRef = useRef<HTMLInputElement>(null);

  // Saved Summaries state (uploaded files)
  const [savedSummaries, setSavedSummaries] = useState<SavedSummary[]>([]);
  const [summaryTitle, setSummaryTitle] = useState('');
  const [selectedSummaryFile, setSelectedSummaryFile] = useState<File | null>(null);
  const summaryFileInputRef = useRef<HTMLInputElement>(null);

  // Saved Handwriting state (uploaded files)
  const [savedHandwritings, setSavedHandwritings] = useState<SavedHandwriting[]>([]);
  const [handwritingTitle, setHandwritingTitle] = useState('');
  const [selectedHandwritingFile, setSelectedHandwritingFile] = useState<File | null>(null);
  const handwritingFileInputRef = useRef<HTMLInputElement>(null);

  // Audio Explanations state
  const [savedAudioExplanations, setSavedAudioExplanations] = useState<SavedAudioExplanation[]>([]);
  const [audioTitle, setAudioTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Metrics
  const [metrics, setMetrics] = useState<TrainingMetrics>({
    totalTrainings: 0,
    totalStudyTimeMinutes: 0,
    byType: {
      'flashcards': 0,
      'simulado': 0,
      'activity': 0,
      'mindmap': 0,
      'summary': 0,
      'handwriting': 0,
      'audio-explanation': 0,
    },
    completedToday: 0,
  });

  const handleMethodClick = (method: typeof learningMethods[0]) => {
    setSelectedMethod(method.id);
  };

  // Flashcard handlers - new simplified system
  const handleSaveFlashcardGroup = (group: FlashcardGroup) => {
    if (editingFlashcardGroup) {
      setFlashcardGroups(flashcardGroups.map(g => g.id === group.id ? group : g));
    } else {
      setFlashcardGroups([group, ...flashcardGroups]);
      setMetrics(m => ({
        ...m,
        totalTrainings: m.totalTrainings + 1,
        byType: { ...m.byType, flashcards: m.byType.flashcards + 1 },
      }));
    }
    setIsCreatingFlashcards(false);
    setEditingFlashcardGroup(undefined);
    setSelectedMethod(null);
    setMainTab('biblioteca');
  };

  const handleDeleteFlashcardGroup = (groupId: string) => {
    setFlashcardGroups(flashcardGroups.filter(g => g.id !== groupId));
    toast.success('Grupo excluído');
  };

  const handleFlashcardStudyComplete = () => {
    if (studyingFlashcardGroup) {
      setFlashcardGroups(flashcardGroups.map(g => 
        g.id === studyingFlashcardGroup.id ? { ...g, lastStudied: new Date() } : g
      ));
    }
    setStudyingFlashcardGroup(null);
    setMetrics(m => ({
      ...m,
      totalStudyTimeMinutes: m.totalStudyTimeMinutes + 15,
      completedToday: m.completedToday + 1,
    }));
  };

  // Simulado handlers
  const handleCreateSimulado = (simulado: Simulado) => {
    if (editingSimulado) {
      // Editing existing simulado
      setSimulados(simulados.map(s => s.id === simulado.id ? simulado : s));
      setEditingSimulado(undefined);
      toast.success('Simulado atualizado!');
    } else {
      // Creating new simulado
      setSimulados([simulado, ...simulados]);
      setMetrics(m => ({
        ...m,
        totalTrainings: m.totalTrainings + 1,
        byType: { ...m.byType, simulado: m.byType.simulado + 1 },
      }));
      toast.success('Simulado criado! Disponível para treino na aba "Minha Biblioteca".');
    }
  };

  const handleDeleteSimulado = (simuladoId: string) => {
    setSimulados(simulados.filter(s => s.id !== simuladoId));
    toast.success('Simulado excluído');
  };

  const handleSimuladoComplete = (results: { score: number }) => {
    setMetrics(m => ({
      ...m,
      totalStudyTimeMinutes: m.totalStudyTimeMinutes + 30,
      completedToday: m.completedToday + 1,
    }));
    if (activeSimulado) {
      setSimulados(simulados.map(s => 
        s.id === activeSimulado.id 
          ? { ...s, status: 'completed' as const, score: results.score }
          : s
      ));
    }
  };

  // Mind Map handlers - new file upload system
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      
      if (!isImage && !isPdf) {
        toast.error('Selecione uma imagem ou PDF');
        return;
      }
      
      setSelectedMindMapFile(file);
    }
  };

  const handleSaveMindMap = () => {
    if (!mindMapTitle.trim()) {
      toast.error('Digite um título para o mapa mental');
      return;
    }
    
    if (!selectedMindMapFile) {
      toast.error('Selecione um arquivo (imagem ou PDF)');
      return;
    }

    const isImage = selectedMindMapFile.type.startsWith('image/');
    const fileUrl = URL.createObjectURL(selectedMindMapFile);

    const newSavedMindMap: SavedMindMap = {
      id: crypto.randomUUID(),
      title: mindMapTitle.trim(),
      fileType: isImage ? 'image' : 'pdf',
      fileUrl,
      fileName: selectedMindMapFile.name,
      createdAt: new Date(),
    };

    setSavedMindMaps([newSavedMindMap, ...savedMindMaps]);
    setMindMapTitle('');
    setSelectedMindMapFile(null);
    if (mindMapFileInputRef.current) mindMapFileInputRef.current.value = '';
    
    setMetrics(m => ({
      ...m,
      totalTrainings: m.totalTrainings + 1,
      byType: { ...m.byType, mindmap: m.byType.mindmap + 1 },
    }));
    
    toast.success('Mapa mental salvo! Disponível na aba "Minha Biblioteca".');
    setMainTab('biblioteca');
    setSelectedMethod(null);
  };

  const handleDeleteSavedMindMap = (id: string) => {
    setSavedMindMaps(savedMindMaps.filter(m => m.id !== id));
    toast.success('Mapa mental excluído');
  };

  // Summary handlers
  const handleSummaryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      if (!isImage && !isPdf) {
        toast.error('Selecione uma imagem ou PDF');
        return;
      }
      setSelectedSummaryFile(file);
    }
  };

  const handleSaveSummary = () => {
    if (!summaryTitle.trim()) {
      toast.error('Digite um título para o resumo');
      return;
    }
    if (!selectedSummaryFile) {
      toast.error('Selecione um arquivo (imagem ou PDF)');
      return;
    }
    const isImage = selectedSummaryFile.type.startsWith('image/');
    const fileUrl = URL.createObjectURL(selectedSummaryFile);
    const newSummary: SavedSummary = {
      id: crypto.randomUUID(),
      title: summaryTitle.trim(),
      fileType: isImage ? 'image' : 'pdf',
      fileUrl,
      fileName: selectedSummaryFile.name,
      createdAt: new Date(),
    };
    setSavedSummaries([newSummary, ...savedSummaries]);
    setSummaryTitle('');
    setSelectedSummaryFile(null);
    if (summaryFileInputRef.current) summaryFileInputRef.current.value = '';
    setMetrics(m => ({
      ...m,
      totalTrainings: m.totalTrainings + 1,
      byType: { ...m.byType, summary: m.byType.summary + 1 },
    }));
    toast.success('Resumo salvo! Disponível na aba "Minha Biblioteca".');
    setMainTab('biblioteca');
    setSelectedMethod(null);
  };

  const handleDeleteSavedSummary = (id: string) => {
    setSavedSummaries(savedSummaries.filter(s => s.id !== id));
    toast.success('Resumo excluído');
  };

  // Handwriting handlers
  const handleHandwritingFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      if (!isImage && !isPdf) {
        toast.error('Selecione uma imagem ou PDF');
        return;
      }
      setSelectedHandwritingFile(file);
    }
  };

  const handleSaveHandwriting = () => {
    if (!handwritingTitle.trim()) {
      toast.error('Digite um título para a escrita');
      return;
    }
    if (!selectedHandwritingFile) {
      toast.error('Selecione um arquivo (imagem ou PDF)');
      return;
    }
    const isImage = selectedHandwritingFile.type.startsWith('image/');
    const fileUrl = URL.createObjectURL(selectedHandwritingFile);
    const newHandwriting: SavedHandwriting = {
      id: crypto.randomUUID(),
      title: handwritingTitle.trim(),
      fileType: isImage ? 'image' : 'pdf',
      fileUrl,
      fileName: selectedHandwritingFile.name,
      createdAt: new Date(),
    };
    setSavedHandwritings([newHandwriting, ...savedHandwritings]);
    setHandwritingTitle('');
    setSelectedHandwritingFile(null);
    if (handwritingFileInputRef.current) handwritingFileInputRef.current.value = '';
    setMetrics(m => ({
      ...m,
      totalTrainings: m.totalTrainings + 1,
      byType: { ...m.byType, handwriting: m.byType.handwriting + 1 },
    }));
    toast.success('Escrita salva! Disponível na aba "Minha Biblioteca".');
    setMainTab('biblioteca');
    setSelectedMethod(null);
  };

  const handleDeleteSavedHandwriting = (id: string) => {
    setSavedHandwritings(savedHandwritings.filter(h => h.id !== id));
    toast.success('Escrita excluída');
  };

  // Audio recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(d => d + 1);
      }, 1000);
    } catch (error) {
      toast.error('Não foi possível acessar o microfone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleSaveAudio = () => {
    if (!audioTitle.trim()) {
      toast.error('Digite um título para a gravação');
      return;
    }
    if (!recordedAudioUrl) {
      toast.error('Grave um áudio primeiro');
      return;
    }
    const newAudio: SavedAudioExplanation = {
      id: crypto.randomUUID(),
      title: audioTitle.trim(),
      audioUrl: recordedAudioUrl,
      durationSeconds: recordingDuration,
      createdAt: new Date(),
    };
    setSavedAudioExplanations([newAudio, ...savedAudioExplanations]);
    setAudioTitle('');
    setRecordedAudioUrl(null);
    setRecordingDuration(0);
    setMetrics(m => ({
      ...m,
      totalTrainings: m.totalTrainings + 1,
      byType: { ...m.byType, 'audio-explanation': m.byType['audio-explanation'] + 1 },
    }));
    toast.success('Áudio salvo! Disponível na aba "Minha Biblioteca".');
    setMainTab('biblioteca');
    setSelectedMethod(null);
  };

  const handleDeleteSavedAudio = (id: string) => {
    setSavedAudioExplanations(savedAudioExplanations.filter(a => a.id !== id));
    toast.success('Áudio excluído');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Available content for practice
  const availableGroups = flashcardGroups.filter(g => g.cards.length > 0);
  const availableSimulados = simulados.filter(s => s.questions.length > 0);
  const totalAvailable = availableGroups.length + availableSimulados.length;

  // Render flashcard practice mode
  if (studyingFlashcardGroup) {
    return (
      <FlashcardPractice
        group={studyingFlashcardGroup}
        onClose={() => setStudyingFlashcardGroup(null)}
        onComplete={handleFlashcardStudyComplete}
      />
    );
  }

  // Render flashcard creation mode
  if (isCreatingFlashcards) {
    return (
      <div className="fade-in">
        <FlashcardCreator
          onSave={handleSaveFlashcardGroup}
          onCancel={() => {
            setIsCreatingFlashcards(false);
            setEditingFlashcardGroup(undefined);
            setSelectedMethod(null);
          }}
          editingGroup={editingFlashcardGroup}
        />
      </div>
    );
  }

  if (activeSimulado) {
    return (
      <SimuladoSession
        simulado={activeSimulado}
        onClose={() => setActiveSimulado(null)}
        onComplete={handleSimuladoComplete}
      />
    );
  }


  // Render method configuration view
  const renderMethodConfig = () => {
    if (selectedMethod === 'flashcards') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMethod(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Flashcards</h3>
              <p className="text-sm text-muted-foreground">Gerencie seus cartões de memorização</p>
            </div>
          </div>

          {flashcardGroups.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum grupo de flashcards criado ainda</p>
              <p className="text-sm mb-4">Crie seu primeiro grupo para começar</p>
              <Button onClick={() => {
                setEditingFlashcardGroup(undefined);
                setIsCreatingFlashcards(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Flashcards
              </Button>
            </div>
          ) : (
            <FlashcardGroupList
              groups={flashcardGroups}
              onStudy={(group) => setStudyingFlashcardGroup(group)}
              onEdit={(group) => {
                setEditingFlashcardGroup(group);
                setIsCreatingFlashcards(true);
              }}
              onDelete={handleDeleteFlashcardGroup}
            />
          )}
        </div>
      );
    }

    if (selectedMethod === 'simulado') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMethod(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Simulados</h3>
              <p className="text-sm text-muted-foreground">Gerencie seus simulados</p>
            </div>
          </div>

          {simulados.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
              <FileQuestion className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum simulado criado ainda</p>
              <p className="text-sm mb-4">Crie seu primeiro simulado para começar</p>
              <Button onClick={() => setIsCreateSimuladoOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Simulado
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {simulados.map((simulado) => (
                <div key={simulado.id} className="bg-card border border-border rounded-xl p-5 flex flex-col h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <FileQuestion className="w-5 h-5 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">{simulado.name}</h4>
                      <p className="text-sm text-muted-foreground">{simulado.discipline}</p>
                    </div>
                    <span className="text-xs bg-secondary px-2 py-1 rounded-full shrink-0">
                      {simulado.questions.length} questões
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {simulado.timeMinutes} min • {simulado.difficulty === 'easy' ? 'Fácil' : simulado.difficulty === 'hard' ? 'Difícil' : 'Médio'}
                  </p>
                  <div className="flex gap-2 mt-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setEditingSimulado(simulado);
                        setIsCreateSimuladoOpen(true);
                      }}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteSimulado(simulado.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (selectedMethod === 'mindmap') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMethod(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Mapas Mentais</h3>
              <p className="text-sm text-muted-foreground">Salve seus mapas mentais exportados</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mindmap-title">Título do Mapa Mental</Label>
                <Input
                  id="mindmap-title"
                  placeholder="Ex: Direito Constitucional - Princípios"
                  value={mindMapTitle}
                  onChange={(e) => setMindMapTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Arquivo (Imagem ou PDF)</Label>
                <div 
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => mindMapFileInputRef.current?.click()}
                >
                  <input
                    ref={mindMapFileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {selectedMindMapFile ? (
                    <div className="flex flex-col items-center gap-2">
                      {selectedMindMapFile.type.startsWith('image/') ? (
                        <Image className="w-12 h-12 text-primary" />
                      ) : (
                        <FileIcon className="w-12 h-12 text-primary" />
                      )}
                      <p className="font-medium text-foreground">{selectedMindMapFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedMindMapFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMindMapFile(null);
                          if (mindMapFileInputRef.current) mindMapFileInputRef.current.value = '';
                        }}
                      >
                        Remover
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-12 h-12 text-muted-foreground" />
                      <p className="text-muted-foreground">Clique para selecionar</p>
                      <p className="text-sm text-muted-foreground">Imagem (PNG, JPG) ou PDF</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveMindMap}
              disabled={!mindMapTitle.trim() || !selectedMindMapFile}
              className="w-full"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Salvar Mapa Mental
            </Button>
          </div>

          {savedMindMaps.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Mapas Salvos ({savedMindMaps.length})</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {savedMindMaps.map((mindmap) => (
                  <div key={mindmap.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      {mindmap.fileType === 'image' ? (
                        <Image className="w-6 h-6 text-foreground" />
                      ) : (
                        <FileIcon className="w-6 h-6 text-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-foreground truncate">{mindmap.title}</h5>
                      <p className="text-sm text-muted-foreground">{mindmap.fileType.toUpperCase()} • {new Date(mindmap.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteSavedMindMap(mindmap.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (selectedMethod === 'summary') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMethod(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Resumos</h3>
              <p className="text-sm text-muted-foreground">Salve seus resumos em imagem ou PDF</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="summary-title">Título do Resumo</Label>
                <Input
                  id="summary-title"
                  placeholder="Ex: Direito Administrativo - Atos"
                  value={summaryTitle}
                  onChange={(e) => setSummaryTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Arquivo (Imagem ou PDF)</Label>
                <div 
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => summaryFileInputRef.current?.click()}
                >
                  <input
                    ref={summaryFileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleSummaryFileSelect}
                    className="hidden"
                  />
                  
                  {selectedSummaryFile ? (
                    <div className="flex flex-col items-center gap-2">
                      {selectedSummaryFile.type.startsWith('image/') ? (
                        <Image className="w-12 h-12 text-primary" />
                      ) : (
                        <FileIcon className="w-12 h-12 text-primary" />
                      )}
                      <p className="font-medium text-foreground">{selectedSummaryFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedSummaryFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSummaryFile(null);
                          if (summaryFileInputRef.current) summaryFileInputRef.current.value = '';
                        }}
                      >
                        Remover
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-12 h-12 text-muted-foreground" />
                      <p className="text-muted-foreground">Clique para selecionar</p>
                      <p className="text-sm text-muted-foreground">Imagem (PNG, JPG) ou PDF</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveSummary}
              disabled={!summaryTitle.trim() || !selectedSummaryFile}
              className="w-full"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Salvar Resumo
            </Button>
          </div>

          {savedSummaries.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Resumos Salvos ({savedSummaries.length})</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {savedSummaries.map((summary) => (
                  <div key={summary.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      {summary.fileType === 'image' ? (
                        <Image className="w-6 h-6 text-foreground" />
                      ) : (
                        <FileIcon className="w-6 h-6 text-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-foreground truncate">{summary.title}</h5>
                      <p className="text-sm text-muted-foreground">{summary.fileType.toUpperCase()} • {new Date(summary.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteSavedSummary(summary.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (selectedMethod === 'handwriting') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMethod(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Escrita Manual</h3>
              <p className="text-sm text-muted-foreground">Salve fotos de resumos escritos à mão</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="handwriting-title">Título da Escrita</Label>
                <Input
                  id="handwriting-title"
                  placeholder="Ex: Anotações de Aula - Direito Penal"
                  value={handwritingTitle}
                  onChange={(e) => setHandwritingTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Arquivo (Imagem ou PDF)</Label>
                <div 
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => handwritingFileInputRef.current?.click()}
                >
                  <input
                    ref={handwritingFileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleHandwritingFileSelect}
                    className="hidden"
                  />
                  
                  {selectedHandwritingFile ? (
                    <div className="flex flex-col items-center gap-2">
                      {selectedHandwritingFile.type.startsWith('image/') ? (
                        <Image className="w-12 h-12 text-primary" />
                      ) : (
                        <FileIcon className="w-12 h-12 text-primary" />
                      )}
                      <p className="font-medium text-foreground">{selectedHandwritingFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedHandwritingFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHandwritingFile(null);
                          if (handwritingFileInputRef.current) handwritingFileInputRef.current.value = '';
                        }}
                      >
                        Remover
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-12 h-12 text-muted-foreground" />
                      <p className="text-muted-foreground">Clique para selecionar</p>
                      <p className="text-sm text-muted-foreground">Imagem (PNG, JPG) ou PDF</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveHandwriting}
              disabled={!handwritingTitle.trim() || !selectedHandwritingFile}
              className="w-full"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Salvar Escrita
            </Button>
          </div>

          {savedHandwritings.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Escritas Salvas ({savedHandwritings.length})</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {savedHandwritings.map((handwriting) => (
                  <div key={handwriting.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      {handwriting.fileType === 'image' ? (
                        <Image className="w-6 h-6 text-foreground" />
                      ) : (
                        <FileIcon className="w-6 h-6 text-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-foreground truncate">{handwriting.title}</h5>
                      <p className="text-sm text-muted-foreground">{handwriting.fileType.toUpperCase()} • {new Date(handwriting.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteSavedHandwriting(handwriting.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (selectedMethod === 'audio-explanation') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedMethod(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Explicação em Áudio</h3>
              <p className="text-sm text-muted-foreground">Grave explicações sobre os conteúdos</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="audio-title">Título da Gravação</Label>
                <Input
                  id="audio-title"
                  placeholder="Ex: Explicação - Teoria do Domínio do Fato"
                  value={audioTitle}
                  onChange={(e) => setAudioTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Gravação de Áudio</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                  {recordedAudioUrl ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mic className="w-8 h-8 text-primary" />
                      </div>
                      <p className="font-medium text-foreground">Gravação concluída</p>
                      <p className="text-sm text-muted-foreground">Duração: {formatDuration(recordingDuration)}</p>
                      <audio src={recordedAudioUrl} controls className="w-full max-w-md" />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setRecordedAudioUrl(null);
                          setRecordingDuration(0);
                        }}
                      >
                        Gravar novamente
                      </Button>
                    </div>
                  ) : isRecording ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
                        <Mic className="w-8 h-8 text-destructive" />
                      </div>
                      <p className="font-medium text-foreground">Gravando...</p>
                      <p className="text-2xl font-mono text-foreground">{formatDuration(recordingDuration)}</p>
                      <Button 
                        variant="destructive"
                        size="lg"
                        onClick={stopRecording}
                      >
                        <Square className="w-4 h-4 mr-2" />
                        Parar Gravação
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                        <Mic className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">Clique para começar a gravar</p>
                      <Button 
                        size="lg"
                        onClick={startRecording}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar Gravação
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveAudio}
              disabled={!audioTitle.trim() || !recordedAudioUrl}
              className="w-full"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Salvar Gravação
            </Button>
          </div>

          {savedAudioExplanations.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Gravações Salvas ({savedAudioExplanations.length})</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {savedAudioExplanations.map((audio) => (
                  <div key={audio.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Mic className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-foreground truncate">{audio.title}</h5>
                      <p className="text-sm text-muted-foreground">{formatDuration(audio.durationSeconds)} • {new Date(audio.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteSavedAudio(audio.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fade-in">
      <PageHeader
        title="Treinos & Simulados"
        description="Ambiente completo de treino cognitivo com múltiplas técnicas de estudo"
      />

      {/* Main Tabs: Criar vs Biblioteca */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as 'criar' | 'biblioteca')} className="mt-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="criar" className="flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Criar Conteúdo
          </TabsTrigger>
          <TabsTrigger value="biblioteca" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Minha Biblioteca
          </TabsTrigger>
        </TabsList>

        {/* TAB: Criar Conteúdo */}
        <TabsContent value="criar" className="mt-6">
          {selectedMethod ? (
            renderMethodConfig()
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Escolha um método de estudo</h3>
                <p className="text-sm text-muted-foreground">Selecione o tipo de conteúdo que deseja criar</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {learningMethods.map((method) => {
                  const Icon = method.icon;
                  const contentCount = method.id === 'flashcards' 
                    ? flashcardGroups.length 
                    : method.id === 'simulado' 
                      ? simulados.length 
                      : method.id === 'mindmap'
                        ? savedMindMaps.length
                        : method.id === 'summary'
                          ? savedSummaries.length
                          : method.id === 'handwriting'
                            ? savedHandwritings.length
                            : method.id === 'audio-explanation'
                              ? savedAudioExplanations.length
                              : 0;
                  
                  return (
                    <button
                      key={method.id}
                      onClick={() => handleMethodClick(method)}
                      className={`relative bg-card border border-border rounded-xl p-6 text-left hover:border-foreground/20 hover:shadow-md transition-all duration-200 ${
                        !method.available ? 'opacity-60' : ''
                      }`}
                    >
                      {!method.available && (
                        <span className="absolute top-3 right-3 text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                          Em breve
                        </span>
                      )}
                      {contentCount > 0 && method.available && (
                        <span className="absolute top-3 right-3 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {contentCount} criado{contentCount > 1 ? 's' : ''}
                        </span>
                      )}
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-foreground" />
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">{method.name}</h4>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB: Minha Biblioteca */}
        <TabsContent value="biblioteca" className="mt-6">
          <ContentLibrary
            flashcardGroups={flashcardGroups}
            simulados={simulados}
            savedMindMaps={savedMindMaps}
            onStudyFlashcard={(group) => setStudyingFlashcardGroup(group)}
            onEditFlashcard={(group) => {
              setEditingFlashcardGroup(group);
              setIsCreatingFlashcards(true);
            }}
            onDeleteFlashcard={handleDeleteFlashcardGroup}
            onStartSimulado={(simulado) => setActiveSimulado(simulado)}
            onDeleteSimulado={handleDeleteSimulado}
            onViewSavedMindMap={(mindMap) => {
              window.open(mindMap.fileUrl, '_blank');
            }}
            onDeleteSavedMindMap={handleDeleteSavedMindMap}
          />
        </TabsContent>
      </Tabs>

      <CreateSimuladoModal
        open={isCreateSimuladoOpen}
        onOpenChange={(open) => {
          setIsCreateSimuladoOpen(open);
          if (!open) setEditingSimulado(undefined);
        }}
        onSubmit={handleCreateSimulado}
        editingSimulado={editingSimulado}
      />
    </div>
  );
}
