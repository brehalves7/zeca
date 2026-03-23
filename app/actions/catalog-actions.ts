"use server";

import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const EXTRACTION_PROMPT = `Aja como um extrator de dados de inventário. Analise a imagem e extraia os produtos.
Retorne APENAS um JSON no formato:
{
  "produtos": [
    { "sku": "string", "name": "string", "price": 0 }
  ]
}`;

// MODELOS ATUALIZADOS PARA 2026 (Baseado no seu log de sucesso)
const VISION_MODELS = [
  "meta-llama/llama-4-scout-17b-16e-instruct", // Modelo que deu Status 200 no seu log
  "llama-3.2-11b-vision-instruct", // Possível nome estável pós-preview
  "meta-llama/llama-3.2-90b-vision-instruct",
];

function sanitizeResult(items: any[]): any[] {
  if (!Array.isArray(items)) return [];
  return items.map((p) => ({
    sku: String(p.sku || p.codigo || ""),
    name: String(p.name || p.nome || "Produto"),
    price: Number(p.price || 0),
  }));
}

async function gerarComFallback(
  imageBase64: string,
  mimeType: string,
): Promise<string> {
  const apiKeyGroq = process.env.GROQ_API_KEY;
  const apiKeyGemini = process.env.GEMINI_API_KEY;

  // 1. TENTAR GROQ
  if (apiKeyGroq) {
    const groq = new Groq({ apiKey: apiKeyGroq });
    for (const modelo of VISION_MODELS) {
      try {
        console.log(`[ACTION] 🚀 Tentando Groq: ${modelo}`);
        const chatCompletion = await groq.chat.completions.create({
          model: modelo,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: EXTRACTION_PROMPT },
                {
                  type: "image_url",
                  image_url: { url: `data:${mimeType};base64,${imageBase64}` },
                },
              ],
            },
          ],
          temperature: 0.1,
        });
        const res = chatCompletion.choices[0]?.message?.content;
        if (res) return res;
      } catch (e: any) {
        console.warn(
          `[ACTION] Groq ${modelo} falhou: ${e.message.substring(0, 50)}`,
        );
      }
    }
  }

  // 2. TENTAR GEMINI (Forçando versão v1 para evitar o erro 404 do v1beta)
  if (apiKeyGemini) {
    try {
      console.log(`[ACTION] ✨ Usando Gemini 1.5 Flash (v1 Stable)...`);
      const genAI = new GoogleGenerativeAI(apiKeyGemini);
      // Usamos apenas o nome base para máxima compatibilidade
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent([
        EXTRACTION_PROMPT,
        { inlineData: { data: imageBase64, mimeType } },
      ]);

      return result.response.text();
    } catch (err: any) {
      console.error(`[ACTION] Gemini falhou: ${err.message}`);
    }
  }

  throw new Error("Nenhuma IA disponível aceitou o processamento de imagem.");
}

// EXPORTAÇÕES EXPLÍCITAS PARA O TURBOPACK
export async function extrairProdutosDaImagem(
  base64: string,
  mimeType: string,
) {
  try {
    console.log(`[ACTION] 🟢 Iniciando extração...`);
    const text = await gerarComFallback(base64, mimeType);

    // Limpeza de JSON robusta
    const match = text.match(/\{[\s\S]*\}/);
    const jsonStr = match ? match[0] : text;
    const parsed = JSON.parse(jsonStr);

    return sanitizeResult(
      parsed.produtos || (Array.isArray(parsed) ? parsed : []),
    );
  } catch (error: any) {
    console.error(`[FATAL] Erro final: ${error.message}`);
    return {
      error: true,
      message: "Falha na análise. Verifique se a imagem está clara.",
    };
  }
}

export async function extrairProdutosDoPDFv2(base64: string) {
  return await extrairProdutosDaImagem(base64, "image/png");
}
