import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Você é uma IA especialista em pedagogia, análise textual e elaboração de avaliações educacionais.

Sua função é gerar questões de estudo de ALTA QUALIDADE a partir de um texto fornecido pelo usuário.

Você NÃO pode usar conhecimento externo.
Você NÃO pode inventar informações.
Tudo deve estar EXPLICITAMENTE ou IMPLICITAMENTE CONTIDO no texto.

REGRAS PARA GERAÇÃO:

1. LEITURA ATIVA: Identifique o que o texto EXPLICA, DEFINE, RELACIONA e ORGANIZA.

2. ELEMENTOS-CHAVE a identificar:
   - Conceitos principais (ideias centrais)
   - Definições importantes (quando o texto explica o que algo É)
   - Relações de causa e efeito
   - Processos e etapas
   - Classificações e tipos
   - Termos técnicos relevantes

3. NÍVEIS DE DIFICULDADE:
   - BÁSICO: reconhecimento, definições, identificação direta
   - MÉDIO: relações entre ideias, comparações, aplicação
   - AVANÇADO: análise, consequências, interpretação profunda

4. TIPOS DE QUESTÕES (NUNCA use "segundo o texto" ou "de acordo com o texto" nos enunciados):
   - O que caracteriza X?
   - Qual a relação entre X e Y?
   - Por que X acontece?
   - Qual a ordem correta das etapas?
   - Que conclusão pode ser tirada sobre X?
   - Como X funciona?
   - Qual é a definição de X?

5. VALIDAÇÃO: Todas as respostas DEVEM estar no texto. Nenhuma pergunta genérica.

6. REGRA IMPORTANTE: As questões devem ser autocontidas. NÃO faça referência ao texto de origem nos enunciados. O aluno deve poder responder sem precisar ver o texto original.

FORMATO DE SAÍDA - Retorne APENAS um JSON válido com array de questões:
{
  "questions": [
    {
      "text": "Enunciado da questão (sem mencionar 'o texto' ou 'segundo o texto')",
      "type": "multiple-choice",
      "options": ["Alternativa A (correta)", "Alternativa B", "Alternativa C", "Alternativa D"],
      "correctAnswer": 0,
      "level": "basic|medium|advanced",
      "explanation": "Explicação baseada no conteúdo estudado"
    }
  ]
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, questionCount, difficulty } = await req.json();
    
    if (!content || !content.trim()) {
      return new Response(
        JSON.stringify({ error: "Conteúdo é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const difficultyInstruction = difficulty === 'easy' 
      ? 'Priorize questões de nível BÁSICO (70% básico, 30% médio).'
      : difficulty === 'hard'
      ? 'Priorize questões de nível AVANÇADO (30% médio, 70% avançado).'
      : 'Equilibre os níveis (30% básico, 40% médio, 30% avançado).';

    const userPrompt = `Com base no texto a seguir, gere exatamente ${questionCount} questões de múltipla escolha com 4 alternativas cada.

${difficultyInstruction}

IMPORTANTE: 
- Gere EXATAMENTE ${questionCount} questões, nem mais nem menos.
- Cada questão DEVE ter exatamente 4 alternativas.
- A resposta correta deve estar baseada EXCLUSIVAMENTE no conteúdo fornecido.
- Varie os tipos de perguntas (definição, causa/efeito, relação, processo, etc).
- NUNCA use expressões como "segundo o texto", "de acordo com o texto", "o texto afirma" nos enunciados.
- As questões devem ser autocontidas e não fazer referência ao texto de origem.

TEXTO DE ESTUDO:
"""
${content}
"""

Retorne APENAS o JSON, sem texto adicional.`;

    console.log(`Generating ${questionCount} questions from content...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione créditos na sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao gerar questões");
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;
    
    if (!generatedContent) {
      throw new Error("Resposta vazia da IA");
    }

    console.log("Raw AI response:", generatedContent);

    // Parse the JSON response - handle markdown code blocks
    let jsonContent = generatedContent.trim();
    
    // Remove markdown code blocks if present
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.slice(7);
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith("```")) {
      jsonContent = jsonContent.slice(0, -3);
    }
    jsonContent = jsonContent.trim();

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Content was:", jsonContent);
      throw new Error("Falha ao processar resposta da IA");
    }

    const questions = parsedQuestions.questions || parsedQuestions;
    
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Nenhuma questão foi gerada");
    }

    console.log(`Successfully generated ${questions.length} questions`);

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error generating questions:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
