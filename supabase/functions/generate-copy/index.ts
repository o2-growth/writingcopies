import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function validateBody(body: any) {
  const channels = ["twitter", "instagram", "linkedin", "email", "whatsapp"];
  const objectives = ["awareness", "engajamento", "leads", "conversao", "vendas"];
  const copyTypes = ["titulo", "subtitulo", "corpo", "cta", "completa"];
  const sizes = ["S", "M", "L", "XL"];
  const errors: string[] = [];

  if (body.product_id && typeof body.product_id !== "string") errors.push("product_id inválido");
  if (!Array.isArray(body.copywriter_ids) || body.copywriter_ids.length > 2) errors.push("copywriter_ids: array max 2");
  if (!channels.includes(body.channel)) errors.push("channel inválido");
  if (!objectives.includes(body.objective)) errors.push("objective inválido");
  if (!copyTypes.includes(body.copy_type)) errors.push("copy_type inválido");
  if (!sizes.includes(body.size)) errors.push("size inválido");
  if (!Number.isInteger(body.quantity) || body.quantity < 1 || body.quantity > 5) errors.push("quantity: 1-5");
  if (body.editorial_line_id && typeof body.editorial_line_id !== "string") errors.push("editorial_line_id inválido");
  if (body.extra_context && typeof body.extra_context !== "string") errors.push("extra_context inválido");

  return errors;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey || !anonKey) {
      console.error("Missing env vars:", { url: !!supabaseUrl, serviceKey: !!supabaseKey, anonKey: !!anonKey });
      return new Response(JSON.stringify({ error: "Configuração do servidor incompleta." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const anonClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json();
    const validationErrors = validateBody(body);
    if (validationErrors.length > 0) {
      return new Response(JSON.stringify({ error: "Validação falhou", details: validationErrors }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Load company settings
    const { data: company, error: companyErr } = await supabase
      .from("company_settings")
      .select("*")
      .eq("owner_id", user.id)
      .single();
    if (companyErr || !company) {
      return new Response(JSON.stringify({ error: "Configure sua empresa antes de gerar copies." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Load product if specified
    let product = null;
    if (body.product_id) {
      const { data: p } = await supabase
        .from("products")
        .select("*")
        .eq("id", body.product_id)
        .eq("owner_id", user.id)
        .single();
      product = p;
    }

    // Load editorial line if specified
    let editorialLine = null;
    if (body.editorial_line_id) {
      const { data: el } = await supabase
        .from("editorial_lines")
        .select("*")
        .eq("id", body.editorial_line_id)
        .eq("owner_id", user.id)
        .single();
      editorialLine = el;
    }

    // Load copywriters
    const copywriterIds: string[] = body.copywriter_ids ?? [];
    let copywriterA: any = null;
    let copywriterB: any = null;
    let samplesA: any[] = [];
    let samplesB: any[] = [];

    if (copywriterIds.length >= 1) {
      const { data } = await supabase.from("copywriters").select("*").eq("id", copywriterIds[0]).single();
      copywriterA = data;
      const { data: sa } = await supabase.from("copywriter_samples").select("body").eq("copywriter_id", copywriterIds[0]).order("created_at", { ascending: false }).limit(6);
      samplesA = sa ?? [];
    }
    if (copywriterIds.length >= 2) {
      const { data } = await supabase.from("copywriters").select("*").eq("id", copywriterIds[1]).single();
      copywriterB = data;
      const { data: sb } = await supabase.from("copywriter_samples").select("body").eq("copywriter_id", copywriterIds[1]).order("created_at", { ascending: false }).limit(6);
      samplesB = sb ?? [];
    }

    // Build style packs
    const buildStylePack = (cw: any, samples: any[]) => {
      if (!cw) return "";
      let pack = `## Estilo: ${cw.name}\n${cw.style_guide_text}\n\n### Faça:\n${cw.dos}\n\n### Não faça:\n${cw.donts}`;
      if (samples.length > 0) {
        pack += `\n\n### Exemplos de referência:\n${samples.map((s, i) => `${i + 1}. ${s.body.substring(0, 300)}`).join("\n")}`;
      }
      return pack;
    };

    const stylePackA = buildStylePack(copywriterA, samplesA);
    const stylePackB = buildStylePack(copywriterB, samplesB);

    // Blend rules
    let blendInstructions = "";
    if (copywriterA && copywriterB) {
      blendInstructions = `
## REGRAS DE BLEND (50/50):
- Use a ESTRUTURA e ARQUITETURA do estilo de ${copywriterA.name}
- Use o VOCABULÁRIO e RITMO do estilo de ${copywriterB.name}
- Em conflitos de formalidade: prefira o mais formal
- Limite emojis a no máximo 1 se qualquer estilo for formal
- Bullets são permitidos apenas se copy_type for "corpo" ou "completa"
`;
    }

    // Copy type instructions
    const copyTypeInstructions: Record<string, string> = {
      titulo: 'Preencha APENAS o campo "title". Deixe subtitle, body e cta como strings vazias.',
      subtitulo: 'Preencha APENAS o campo "subtitle". Deixe title, body e cta como strings vazias.',
      corpo: 'Preencha APENAS o campo "body". Deixe title, subtitle e cta como strings vazias.',
      cta: 'Preencha APENAS o campo "cta". Deixe title, subtitle e body como strings vazias.',
      completa: 'Preencha TODOS os campos: title, subtitle, body e cta.',
    };

    const sizeGuide: Record<string, string> = {
      S: (body.channel === "instagram" && body.copy_type === "completa" && body.format === "static")
        ? "Muito curto e conciso. Máximo absoluto de 150 caracteres no total da copy (somando todos os campos preenchidos). Seja direto e impactante."
        : "Muito curto e conciso. Máximo 1-2 frases por campo.",
      M: "Tamanho médio. 2-4 frases por campo.",
      L: "Longo e detalhado. 4-6 frases por campo.",
      XL: "Extra longo. 6+ frases, desenvolvimento completo.",
    };

    const language = company.language || "pt-BR";
    const isEngagement = body.objective === "engajamento";

    const engagementRules = isEngagement ? `
## REGRAS DE ENGAJAMENTO PURO (OBRIGATÓRIO)

O conteúdo tem objetivo de engajamento puro: gerar valor, construir autoridade, educar e entreter.

### ⛔ PROIBIÇÃO ABSOLUTA
1. NÃO mencione a empresa, seus produtos ou serviços no corpo do conteúdo.
2. NÃO inclua nenhum tipo de CTA comercial. Nenhum. Zero. Nem disfarçado:
   - "Descubra como [empresa] pode..."
   - "Fale com um especialista"
   - "Agende seu diagnóstico"
   - "Conheça nosso [produto]"
   - "Saiba mais em..."
   - "Transforme [conceito] em [benefício do produto]"
3. NÃO faça ponte entre o conteúdo e os serviços/produtos da empresa no final.
4. NÃO use terminologia exclusiva da empresa dentro da narrativa.
5. NÃO transforme a moral da história em pitch.
6. O campo "cta" DEVE ser sempre uma string vazia (""), independentemente do copy_type.

### O que este conteúdo DEVE ser
- Uma história, análise ou reflexão que se sustenta sozinha
- Conteúdo que o leitor compartilharia mesmo sem saber quem publicou
- Educativo, inspirador ou provocativo — sem agenda de venda
` : "";

    const systemPrompt = `Você é um copywriter profissional que gera copies de alta performance.
Você DEVE responder EXCLUSIVAMENTE em JSON válido, sem markdown, sem texto antes ou depois.
Idioma de saída: ${language}

${stylePackA ? `${stylePackA}\n` : ""}
${stylePackB ? `${stylePackB}\n` : ""}
${blendInstructions}
${engagementRules}

## Formato de saída OBRIGATÓRIO:
{
  "copies": [
    {"title": "...", "subtitle": "...", "body": "...", "cta": "..."}
  ],
  "meta": {
    "channel": "${body.channel}",
    "objective": "${body.objective}",
    "copy_type": "${body.copy_type}",
    "size": "${body.size}",
    "copywriters": [${copywriterA ? `"${copywriterA.name}"` : ""}${copywriterB ? `, "${copywriterB.name}"` : ""}],
    "language": "${language}"
  }
}`;

    const userPrompt = `Gere ${body.quantity} copy(ies) para:

**Marca:** ${company.brand_name}
**Voz da marca:** ${company.brand_voice}
${company.audience ? `**Público:** ${company.audience}` : ""}
${company.usp ? `**USP:** ${company.usp}` : ""}
${company.claims_allowed ? `**Claims permitidos:** ${company.claims_allowed}` : ""}
${company.disclaimers ? `**Disclaimers:** ${company.disclaimers}` : ""}

${product ? `**Produto:** ${product.name}
${product.description ? `Descrição: ${product.description}` : ""}
${product.benefits ? `Benefícios: ${product.benefits}` : ""}
${product.features ? `Features: ${product.features}` : ""}
${product.objections ? `Objeções: ${product.objections}` : ""}
${product.pain_points ? `Dores que resolve: ${product.pain_points}` : ""}` : ""}

${editorialLine ? `**Linha Editorial:** ${editorialLine.name}
${editorialLine.objective ? `Objetivo da linha: ${editorialLine.objective}` : ""}
${editorialLine.content_style ? `Estilo do conteúdo: ${editorialLine.content_style}` : ""}
${editorialLine.champion_examples ? `Exemplos de copies campeãs:\n${editorialLine.champion_examples}` : ""}` : ""}

**Canal:** ${body.channel}
**Objetivo:** ${body.objective}
**Tipo:** ${body.copy_type}
**Tamanho:** ${body.size} — ${sizeGuide[body.size]}
**Quantidade:** ${body.quantity}

${copyTypeInstructions[body.copy_type]}

${body.extra_context ? `**Contexto adicional:** ${body.extra_context}` : ""}

Retorne APENAS o JSON no formato especificado.`;

    const promptCompiled = `SYSTEM:\n${systemPrompt}\n\nUSER:\n${userPrompt}`;

    // Call AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI não configurada" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em instantes." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      console.error("AI error:", status, await aiResponse.text());
      return new Response(JSON.stringify({ error: "Erro ao gerar copy. Tente novamente." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content ?? "";

    // Parse JSON from response (handle markdown code blocks)
    let resultJson;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      resultJson = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      return new Response(JSON.stringify({ error: "Resposta da IA inválida. Tente novamente." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Save generation
    const { error: saveErr } = await supabase.from("generations").insert({
      owner_id: user.id,
      product_id: body.product_id || null,
      copywriter_a_id: copywriterIds[0] || null,
      copywriter_b_id: copywriterIds[1] || null,
      channel: body.channel,
      objective: body.objective,
      copy_type: body.copy_type,
      size: body.size,
      quantity: body.quantity,
      prompt_compiled: promptCompiled,
      result_json: resultJson,
    });

    if (saveErr) console.error("Save generation error:", saveErr);

    return new Response(JSON.stringify(resultJson), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Edge function error:", e);
    return new Response(JSON.stringify({ error: "Erro interno. Tente novamente." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
