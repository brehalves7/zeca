"use server";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

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
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.2-90b-vision-preview",
  "llama-3.2-11b-vision-preview",
];

// Função auxiliar: tenta gerar com fallback entre modelos
async function gerarComFallback(
  imageBase64: string,
  mimeType: string,
  maxRetries: number = 2,
): Promise<string> {
  for (const modelo of VISION_MODELS) {
    for (let tentativa = 0; tentativa <= maxRetries; tentativa++) {
      try {
        console.log(
          `🤖 [Groq] Tentando ${modelo} (tentativa ${tentativa + 1})...`,
        );

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

        if (!text) {
          throw new Error("Resposta vazia da IA.");
        }

        console.log(`✅ [Groq] Sucesso com ${modelo}!`);
        return text;
      } catch (error: any) {
        const statusCode = error.status || error.statusCode;
        const is429 = statusCode === 429 || error.message?.includes("429");
        const is404 = statusCode === 404 || error.message?.includes("404");
        const isModelError =
          error.message?.includes("not found") ||
          error.message?.includes("not supported") ||
          error.message?.includes("does not exist");

        if (is404 || isModelError) {
          console.warn(
            `⚠️ [Groq] Modelo ${modelo} não disponível. Pulando...`,
          );
          break; // Pula para o próximo modelo
        }

        if (is429 && tentativa < maxRetries) {
          const waitTime = 3000 * (tentativa + 1); // 3s, 6s
          console.warn(
            `⏳ [Groq] Rate limit no ${modelo}. Aguardando ${waitTime / 1000}s...`,
          );
          await new Promise((res) => setTimeout(res, waitTime));
          continue;
        }

        if (is429) {
          console.warn(
            `🔄 [Groq] Cota esgotada no ${modelo}. Tentando próximo...`,
          );
          break;
        }

        // Se é a última tentativa, lança o erro
        if (tentativa === maxRetries) {
          console.error(
            `❌ [Groq] Falha no ${modelo} após ${maxRetries + 1} tentativas:`,
            error.message,
          );
          break;
        }
      }
    }
  }

  throw new Error(
    "Todos os modelos Groq falharam. Verifique sua chave API e cota em https://console.groq.com",
  );
}

// Função auxiliar: parseia a resposta da IA
function parsearResposta(text: string): any[] {
  const jsonLimpo = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(jsonLimpo);

  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed.produtos && Array.isArray(parsed.produtos)) {
    return parsed.produtos;
  }

  return [];
}

/**
 * Extrai produtos de uma imagem de catálogo (JPG, PNG, WEBP)
 */
export async function extrairProdutosDaImagem(
  base64: string,
  mimeType: string,
) {
  try {
    console.log(`🚀 [Imagem] Iniciando extração via Groq...`);
    const text = await gerarComFallback(base64, mimeType);
    return parsearResposta(text);
  } catch (error: any) {
    console.error(`❌ [Imagem] Erro na extração:`, error.message);
    return {
      error: true,
      message: error.message || "Falha na comunicação com a IA.",
    };
  }
}

/**
 * Extrai produtos de uma página de PDF convertida em imagem.
 * NOTA: Groq não suporta PDF diretamente. O cliente deve converter
 * cada página do PDF em imagem (PNG) antes de enviar.
 */
export async function extrairProdutosDoPDFv2(base64: string) {
  try {
    console.log(`🚀 [PDF→Imagem] Iniciando extração via Groq...`);
    // Groq trabalha com imagens, então tratamos o PDF como imagem PNG
    // O cliente (page.tsx) precisa converter PDF→Imagem antes de chamar
    const text = await gerarComFallback(base64, "image/png");
    return parsearResposta(text);
  } catch (error: any) {
    console.error(`❌ [PDF] Erro na extração:`, error.message);
    return {
      error: true,
      message: error.message || "Falha na comunicação com a IA.",
    };
  }
}
