"use server";

import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const EXTRACTION_PROMPT = `Aja como um extrator de dados de inventário de alta precisão. Sua tarefa é analisar a imagem de uma página de catálogo de alimentos e extrair todos os produtos visíveis.

REGRAS DE EXTRAÇÃO:
SKU: Identifique o código numérico (geralmente 5 ou 6 dígitos) que aparece próximo ao nome. Ex: '51227'.
NOME: Capture o nome completo do produto e sua variação (peso/volume). Ex: 'ACHOC LIQ PIRAKIDS 200ML'.
PRODUTOS MÚLTIPLOS: Se um bloco de texto contiver vários sabores para o mesmo SKU, crie um item para cada sabor.
LIMPEZA: Remova termos como 'Foto Ilustrativa' ou descrições de marketing.

FORMATO DE SAÍDA:
Retorne EXATAMENTE um objeto JSON seguindo esta estrutura, sem qualquer texto adicional ou explicações:
{
  "produtos": [
    {
      "sku": "string",
      "name": "string",
      "price": 0
    }
  ]
}
Se nenhum produto for encontrado, retorne: {"produtos": []}`;

// Modelos de visão do Groq em ordem de preferência (fallback)
const VISION_MODELS = [
  "llama-3.2-90b-vision-preview",
  "llama-3.2-11b-vision-preview",
];

// Função auxiliar: parseia a resposta da IA (Agora mais robusta)
function parsearResposta(text: string): any[] {
  try {
    const jsonLimpo = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(jsonLimpo);

    if (Array.isArray(parsed)) return parsed;
    if (parsed.produtos && Array.isArray(parsed.produtos)) return parsed.produtos;
    return [];
  } catch (err: any) {
    console.error("❌ Erro no JSON da IA:", err.message);
    return [];
  }
}

// Função auxiliar: tenta gerar com fallback entre modelos e plataformas
async function gerarComFallback(
  imageBase64: string,
  mimeType: string,
  maxRetries: number = 2,
): Promise<string> {
  // 1. TENTAR GROQ PRIMEIRO
  for (const modelo of VISION_MODELS) {
    for (let tentativa = 0; tentativa <= maxRetries; tentativa++) {
      try {
        console.log(`🤖 [Groq] Tentando ${modelo} (tentativa ${tentativa + 1})...`);

        const chatCompletion = await groq.chat.completions.create({
          model: modelo,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: EXTRACTION_PROMPT },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 8000,
          response_format: { type: "json_object" },
        });

        const text = chatCompletion.choices[0]?.message?.content;
        if (!text) throw new Error("Resposta vazia da IA.");
        return text;
      } catch (error: any) {
        const statusCode = error.status || error.statusCode;
        const isRateLimit = statusCode === 429 || error.message?.includes("429");
        const isModelError = error.message?.includes("not found") || error.message?.includes("not supported");

        if (isModelError) break; // Próximo modelo

        if (isRateLimit && tentativa < maxRetries) {
          const waitTime = 3000 * (tentativa + 1);
          await new Promise((res) => setTimeout(res, waitTime));
          continue;
        }

        if (isRateLimit || tentativa === maxRetries) break; // Desiste deste modelo
      }
    }
  }

  // 2. FALLBACK PARA GEMINI SE GROQ FALHAR
  try {
    console.log(`✨ [Fallback] Usando Gemini 1.5 Flash...`);
    // Se o mimeType for do PDF vindo da v2 (image/png), gemini aceita bem
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1" });
    
    // O prompt do Gemini precisa ser reforçado para JSON
    const result = await model.generateContent([
      { text: EXTRACTION_PROMPT + "\n\nIMPORTANTE: Retorne apenas o JSON puro." },
      { inlineData: { data: imageBase64, mimeType } },
    ]);

    const response = await result.response;
    return response.text();
  } catch (err: any) {
    console.error(`❌ [Gemini] Falha no fallback final:`, err.message);
  }

  throw new Error("Sistemas da Groq e Gemini falharam. Verifique conexão e chaves de API.");
}

export async function extrairProdutosDaImagem(
  base64: string,
  mimeType: string,
) {
  try {
    const text = await gerarComFallback(base64, mimeType);
    return parsearResposta(text);
  } catch (error: any) {
    console.error(`❌ [Extraction Action Error]:`, error.message);
    return {
      error: true,
      message: error.message || "Erro desconhecido na extração.",
    };
  }
}

export async function extrairProdutosDoPDFv2(base64: string) {
  try {
    const text = await gerarComFallback(base64, "image/png");
    return parsearResposta(text);
  } catch (error: any) {
    console.error(`❌ [Extraction Action Error]:`, error.message);
    return {
      error: true,
      message: error.message || "Erro desconhecido na extração.",
    };
  }
}
