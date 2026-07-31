"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"
import { getProducts } from "./inventory"

const API_KEY = process.env.GEMINI_API_KEY || "dummy_key_if_not_set";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function askAssistant(history: {role: "user" | "model", text: string}[], prompt: string) {
  try {
    if (API_KEY === "dummy_key_if_not_set") {
      return {
        text: "La IA no está configurada aún (Falta GEMINI_API_KEY). Por favor, contacta al administrador.",
        error: true
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const products = await getProducts();
    
    // Create context string from products
    const contextStr = products.map(p => 
      `- ${p.name}: Bs. ${p.sale_price} (Stock: ${p.stock} ${p.unit}) - Categoría: ${p.category}`
    ).join("\n");

    const systemInstruction = `Eres un amable asistente de ventas para un micromercado llamado SIVM.
Debes ayudar a los clientes a encontrar productos, responder preguntas sobre precios y stock.
Si el usuario pregunta por algo que no está en el catálogo, dile cordialmente que no lo tenemos por el momento.
Tu tono es cálido, servicial y conciso (no des respuestas demasiado largas porque es un quiosco).

CATÁLOGO ACTUAL DE PRODUCTOS:
${contextStr}
`;

    const chatHistory = history.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: "Contexto inicial: " + systemInstruction }] },
        { role: "model", parts: [{ text: "Entendido. Actuaré como el asistente de ventas del micromercado." }] },
        ...chatHistory
      ],
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.7,
      }
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return { text: response.text(), error: false };
    
  } catch (error) {
    console.error("AI Error:", error);
    return {
      text: "Lo siento, tuve un problema al procesar tu solicitud. Intenta de nuevo más tarde.",
      error: true
    }
  }
}
