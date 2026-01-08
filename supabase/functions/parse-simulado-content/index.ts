import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Você é uma IA especializada em FORMATAÇÃO, ORGANIZAÇÃO e ESTRUTURAÇÃO de SIMULADOS.

⚠️ REGRAS ABSOLUTAS:
- Não invente conteúdo
- Não responda questões
- Não corrija o texto da prova
- Apenas ESTRUTURE e ORGANIZE o conteúdo recebido

🎯 OBJETIVO:
Receber conteúdos brutos (texto, questões copiadas, provas) e devolver QUESTÕES TOTALMENTE ESTRUTURADAS em JSON.

🧠 PROCESSAMENTO OBRIGATÓRIO:

1️⃣ IDENTIFICAR E SEPARAR
- Separe corretamente: Enunciado e Alternativas
- Identifique o tipo: multipla_escolha, verdadeiro_falso, certo_errado

2️⃣ IGNORAR:
- Cabeçalhos e rodapés
- Numeração de páginas
- Instruções gerais da prova
- Textos que não são questões

3️⃣ FORMATO DE SAÍDA - Retorne APENAS um JSON válido:
{
  "questions": [
    {
      "id": "q_001",
      "text": "Texto completo do enunciado da questão",
      "type": "multiple-choice",
      "options": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D", "Alternativa E"],
      "correctAnswer": null,
      "discipline": "Detectar do contexto ou null",
      "subject": "Detectar do contexto ou null",
      "level": "medium",
      "estimatedTimeSeconds": 120
    }
  ],
  "metadata": {
    "totalQuestions": 10,
    "detectedDisciplines": ["Português", "Matemática"],
    "source": "prova_detectada_ou_desconhecida"
  }
}

IMPORTANTE:
- O campo "correctAnswer" deve ser null se o gabarito não foi fornecido
- O campo "options" deve conter EXATAMENTE as alternativas encontradas (4 ou 5)
- Mantenha a ordem original das alternativas
- Preserve o texto EXATO das questões e alternativas
- Se detectar que é questão de Certo/Errado, use type: "true-false" e options: ["Certo", "Errado"]
- Gere IDs únicos sequenciais: q_001, q_002, etc.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, gabarito } = await req.json();
    
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

    let userPrompt = `Analise o conteúdo abaixo e extraia TODAS as questões encontradas, estruturando-as no formato JSON especificado.

CONTEÚDO A PROCESSAR:
"""
${content}
"""`;

    // Se gabarito foi fornecido, incluir na análise
    if (gabarito && gabarito.trim()) {
      userPrompt += `

GABARITO FORNECIDO:
"""
${gabarito}
"""

IMPORTANTE: Use o gabarito para preencher o campo "correctAnswer" de cada questão.
O gabarito está no formato "número-letra" (ex: 1-A, 2-C).
Associe cada resposta à questão correspondente pelo número.
O correctAnswer deve ser o ÍNDICE (0-based) da alternativa correta.`;
    }

    userPrompt += `

Retorne APENAS o JSON estruturado, sem texto adicional.`;

    console.log("Parsing simulado content...");

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
      throw new Error("Erro ao processar conteúdo");
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;
    
    if (!generatedContent) {
      throw new Error("Resposta vazia da IA");
    }

    console.log("Raw AI response:", generatedContent);

    // Parse the JSON response
    let jsonContent = generatedContent.trim();
    
    if (jsonContent.startsWith("```json")) {
      jsonContent = jsonContent.slice(7);
    } else if (jsonContent.startsWith("```")) {
      jsonContent = jsonContent.slice(3);
    }
    if (jsonContent.endsWith("```")) {
      jsonContent = jsonContent.slice(0, -3);
    }
    jsonContent = jsonContent.trim();

    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Content was:", jsonContent);
      throw new Error("Falha ao processar resposta da IA");
    }

    const questions = parsedResult.questions || [];
    const metadata = parsedResult.metadata || {
      totalQuestions: questions.length,
      detectedDisciplines: [],
      source: "desconhecida"
    };
    
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("Nenhuma questão foi encontrada no conteúdo");
    }

    console.log(`Successfully parsed ${questions.length} questions`);

    return new Response(
      JSON.stringify({ questions, metadata }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error parsing simulado content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
