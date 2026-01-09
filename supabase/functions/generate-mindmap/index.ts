import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `Você é uma IA especializada em MAPAS MENTAIS. Crie estruturas SIMPLES e CONCISAS.

REGRAS:
- Nó central: 1 único com o tema
- Ramos principais: 3-5 no máximo (conceito, características, tipos, exemplos, regras)
- Subramos: 2-4 por ramo principal
- Labels CURTOS: máximo 5 palavras por nó
- Profundidade máxima: 2 níveis abaixo do central

Tipos de nó: central, ramo_principal, subramo, exemplo, dica
Cores: cor_destaque (central), cor_primaria (ramo), cor_secundaria (sub), cor_suave (exemplo), cor_info (dica)`;

serve(async (req) => {
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
      ? `Crie um mapa mental SIMPLES sobre: "${tema}". Use no máximo 15-20 nós no total.`
      : `Crie um mapa mental SIMPLES deste conteúdo (máximo 15-20 nós):\n\n${content.substring(0, 2000)}`;

    console.log('Generating mind map for:', tema || content.substring(0, 50));

    // Use tool calling for structured output
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
        tools: [
          {
            type: 'function',
            function: {
              name: 'create_mindmap',
              description: 'Cria um mapa mental estruturado com nós e conexões',
              parameters: {
                type: 'object',
                properties: {
                  tema: { 
                    type: 'string', 
                    description: 'Nome do tema principal do mapa' 
                  },
                  nos: {
                    type: 'array',
                    description: 'Lista de nós do mapa mental',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', description: 'ID único do nó (ex: central, 1, 1.1)' },
                        label: { type: 'string', description: 'Texto curto do nó (máx 5 palavras)' },
                        tipo: { 
                          type: 'string', 
                          enum: ['central', 'ramo_principal', 'subramo', 'exemplo', 'dica'],
                          description: 'Tipo do nó' 
                        },
                        pai: { 
                          type: 'string', 
                          description: 'ID do nó pai (null para central)',
                          nullable: true
                        },
                        cor: { 
                          type: 'string', 
                          enum: ['cor_destaque', 'cor_primaria', 'cor_secundaria', 'cor_suave', 'cor_info'],
                          description: 'Cor do nó baseada no tipo' 
                        }
                      },
                      required: ['id', 'label', 'tipo', 'cor'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['tema', 'nos'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'create_mindmap' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições atingido. Aguarde alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos na sua conta.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Erro ao gerar mapa mental. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.function.name !== 'create_mindmap') {
      console.error('No valid tool call in response:', JSON.stringify(data).substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'Resposta inválida da IA. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let mindMapData;
    try {
      mindMapData = JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, toolCall.function.arguments.substring(0, 200));
      return new Response(
        JSON.stringify({ error: 'Erro ao processar resposta. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate structure
    if (!mindMapData.nos || !Array.isArray(mindMapData.nos) || mindMapData.nos.length === 0) {
      console.error('Invalid mind map structure:', mindMapData);
      return new Response(
        JSON.stringify({ error: 'Estrutura do mapa mental inválida. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Mind map generated with', mindMapData.nos.length, 'nodes');

    return new Response(
      JSON.stringify({ mapa_mental: mindMapData }),
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
