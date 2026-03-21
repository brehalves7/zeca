"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

// AJUSTE AQUI: Forçamos a versão 'v1' para evitar o erro 404 da v1beta
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function extrairProdutosDoPDF(base64: string) {
  // Vamos usar apenas o flash que é o mais rápido e barato
  const NOME_MODELO = "gemini-1.5-flash";

  try {
    console.log(`🚀 Iniciando extração com ${NOME_MODELO}...`);

    // Configuração do modelo
    const model = genAI.getGenerativeModel(
      {
        model: NOME_MODELO,
      },
      { apiVersion: "v1" },
    ); // <--- ISSO AQUI É A CHAVE DO PROBLEMA

    const prompt = `
      Analise esta página de catálogo e extraia os produtos:
      - SKU: código de 5 ou 6 dígitos.
      - Nome: texto descritivo do produto.
      Retorne APENAS um array JSON: [{"name": "string", "sku": "string", "price": 0}]
    `;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { data: base64, mimeType: "application/pdf" } },
    ]);

    const response = await result.response;
    const text = response.text();

    // Limpeza de Markdown
    const jsonLimpo = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonLimpo);
  } catch (error: any) {
    console.error(`❌ Erro fatal no modelo:`, error.message);

    // Diagnóstico rápido para você ver no terminal:
    if (error.message.includes("404")) {
      console.log(
        "DICA: Verifique se sua chave API tem acesso ao Gemini 1.5 Flash no Google AI Studio.",
      );
    }

    return {
      error: true,
      message:
        "Falha na comunicação com a IA. Verifique o console do servidor.",
    };
  }
}
