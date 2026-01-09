import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `Você é uma IA especializada em ORGANIZAÇÃO COGNITIVA, MAPAS MENTAIS e ESTRUTURAÇÃO DE CONHECIMENTO.

🎯 OBJETIVO
Transformar qualquer conteúdo em um MAPA MENTAL estruturado, intuitivo e visual.

📐 REGRAS DE CONSTRUÇÃO

1️⃣ NÓ CENTRAL
- Sempre crie um nó central com o tema principal
- tipo: "central"

2️⃣ RAMOS PRINCIPAIS (3-7 no máximo)
Identifique categorias como:
- Conceito, Definição
- Classificação, Tipos
- Características
- Princípios, Regras
- Exceções
- Exemplos práticos

3️⃣ SUBRAMOS (HIERARQUIA)
- Máximo 6 subramos por ramo
- Profundidade máxima: 3 níveis
- Use frases CURTAS e palavras-chave
- Nunca parágrafos longos

4️⃣ TIPOS DE NÓ
- central → cor_destaque
- ramo_principal → cor_primaria
- subramo → cor_secundaria
- exemplo → cor_suave
- alerta → cor_alerta
- excecao → cor_alerta
- dica → cor_info

5️⃣ REGRAS
- Nunca escrever textos longos
- Nunca mais de 7 ramos principais
- Nunca profundidade excessiva
- Priorize verbos de ação e substantivos-chave

📋 FORMATO DE SAÍDA (JSON válido):
{
  "mapa_mental": {
    "tema": "Nome do Tema",
    "nos": [
      {
        "id": "central",
        "label": "Tema Central",
        "tipo": "central",
        "pai": null,
        "cor": "cor_destaque",
        "colapsavel": false
      },
      {
        "id": "1",
        "label": "Ramo Principal 1",
        "tipo": "ramo_principal",
        "pai": "central",
        "cor": "cor_primaria",
        "colapsavel": true
      },
      {
        "id": "1.1",
        "label": "Subramo",
        "tipo": "subramo",
        "pai": "1",
        "cor": "cor_secundaria",
        "colapsavel": true
      }
    ]
  }
}

Retorne APENAS o JSON, sem explicações.`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, tema } = await req.json();

    if (!content && !tema) {
      return new Response(
        JSON.stringify({ error: 'Forneça um conteúdo ou tema para gerar o mapa mental' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userPrompt = tema 
      ? `Crie um mapa mental completo sobre o tema: "${tema}"`
      : `Analise o conteúdo a seguir e crie um mapa mental estruturado:\n\n${content}`;

    console.log('Generating mind map for:', tema || content.substring(0, 100));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições atingido. Aguarde alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar mapa mental. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    let generatedContent = data.choices[0].message.content;

    // Clean up markdown code blocks if present
    generatedContent = generatedContent
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('Generated content:', generatedContent.substring(0, 200));

    // Parse and validate JSON
    let parsedResult;
    try {
      parsedResult = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar resposta da IA. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate structure
    if (!parsedResult.mapa_mental || !parsedResult.mapa_mental.nos) {
      return new Response(
        JSON.stringify({ error: 'Estrutura do mapa mental inválida. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(parsedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in generate-mindmap function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
