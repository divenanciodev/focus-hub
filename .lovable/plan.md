## Reformulação do módulo Quests — estilo editor de código + RPG

Reorganizar o conteúdo atual do botão **Quests** da home (GameHub) substituindo o `QuestsHub` simples por um sistema completo: **Mapa → Lição (teoria + editor) → Desafio → Recompensa**, mantendo a integração com o resto do app intacta.

### 1. Nova estrutura de arquivos

```text
src/components/languages/quests/
├── QuestsHub.tsx              (REESCRITO — agora é um wrapper de roteamento interno)
├── QuestMap.tsx               (NOVO — mapa de progressão estilo RPG)
├── QuestLesson.tsx            (NOVO — tela split: teoria + editor de sintaxe)
├── QuestChallenge.tsx         (NOVO — aplicação independente)
├── QuestReward.tsx            (NOVO — XP, moedas, próxima quest)
├── SyntaxEditor.tsx           (NOVO — editor estilo VSCode com line-numbers)
├── syntaxColors.ts            (NOVO — paleta de cores de sintaxe)
└── questData.ts               (NOVO — currículo: mundos, lições, exemplos)

(BasicoILessons.tsx e ImGoodAtLesson.tsx — mantidos, mas não mais ligados ao novo fluxo)
```

### 2. Mapa de Quests (`QuestMap.tsx`)

- Fundo neutro claro com path SVG curvo conectando os nós (estilo Duolingo).
- Nós circulares grandes:
  - **Verde** = desbloqueado, **Cinza** = travado, **Roxo** = atual, **Dourado** = boss.
- Cada nó mostra: ícone, título curto da lição, % de conclusão (anel) e preview de XP/moedas ao hover.
- Header do mundo: "Estruturas em Inglês I — Self Mode" com barra de XP do mundo.
- Lições do Mundo 1: `I'm`, `I'm + feeling`, `I'm + action`, `I'm + from`, `I'm + age`.
- Mundos 2 e 3 (Action Mode, Internet Mode) aparecem como cards "Em breve" embaixo.

### 3. Tela de Lição (`QuestLesson.tsx` + `SyntaxEditor.tsx`)

Layout split inspirado no FreeCodeCamp (imagem 1):
- **Header roxo** com botão voltar + breadcrumb da quest.
- **Painel esquerdo (teoria)**: badge "Lição", título grande, explicação simples, uso real, fórmula em destaque (`I'm + feeling`), vocabulário em chips coloridos por categoria de sintaxe, dica/tom.
- **Painel direito (editor)**:
  - Cabeçalho escuro tipo IDE: "syntax.en" + ícones (run, save, undo).
  - Linhas numeradas (1-8), conteúdo com tokens coloridos pelo `syntaxColors`.
  - Exercício atual: linha com blank (`I'm ____.`) + opções clicáveis (drag/click), input livre, ou múltipla escolha.
  - Botões: **Check Syntax**, **Hint**, **Speak** (TTS), **Skip**.
- **Painel inferior (console)**: feedback estilo terminal:
  - ✅ `> Correct Syntax! "I'm happy."  +10 XP +5 coins`
  - ❌ `> Syntax Error: expected feeling word, got noun. Try: happy, tired, hungry`

### 4. Sistema de cores de sintaxe (`syntaxColors.ts`)

Tokens HSL no `index.css` + helper que classifica palavras:
- Pronouns → roxo, Verbs (am/is/are) → verde, Feelings → azul,
  Actions -ing → amarelo, Location/origin → laranja, Questions → rosa.
- Componente `<SyntaxToken word category />` reutilizável em teoria e editor.

### 5. Desafio (`QuestChallenge.tsx`)

Após terminar todas as linhas da lição:
- Mostra um prompt visual (emoji/imagem placeholder) + tarefa "Build your sentence".
- Sentence builder: chips arrastáveis/clicáveis para montar `I'm tired.`.
- Botão de microfone (placeholder visual) para "voice practice".
- Valida, dá bônus de XP.

### 6. Recompensa (`QuestReward.tsx`)

Tela cheia centralizada:
- "Quest Complete" grande + animação de confete simples (CSS).
- Cards: XP ganho, moedas, nova sintaxe desbloqueada (token colorido).
- Botões: **Próxima Quest** (volta ao mapa avançando) e **Voltar ao Mapa**.

### 7. Estado e gamificação

Estado local no `QuestsHub` (sem backend nesta etapa):
- `currentScreen: 'map' | 'lesson' | 'challenge' | 'reward'`
- `activeQuestId`, `lessonStep`, `xp`, `coins`, `completedQuests: Set<string>`, `unlockedSyntax: string[]`.
- XP/moedas ganhos são propagados para o `GameHub` via callback (opcional — por ora ficam locais e o HUD do GameHub continua mostrando os valores existentes).

### 8. Integração

- `GameHub.tsx`: nenhuma mudança visual no resto. Apenas o conteúdo renderizado quando `section === 'quests'` passa a usar o novo `QuestsHub` (mesma assinatura de props, então a edição é mínima).
- `BasicoILessons.tsx` permanece no projeto (não é deletado) caso queira reaproveitar depois, mas sai do fluxo padrão de Quests.

### 9. Microcopy e estética

- Tipografia: continua usando o design system atual (sem serifa).
- Microcopy: "Booting Lesson...", "Syntax Module Loaded", "Correct Syntax", "Syntax Error", "Quest Complete".
- Cores via tokens HSL do `index.css` — sem hex hardcoded em componentes (para o resto da UI). As 6 cores da paleta de sintaxe vão para `index.css` como `--syntax-pronoun`, `--syntax-verb`, etc.

### Fora do escopo desta entrega

- Persistência em backend (Supabase) — fica como passo futuro.
- TTS real (uso da Web Speech API só como placeholder no botão Speak).
- Conteúdo completo dos Mundos 2 e 3 (apenas cards "Em breve").
