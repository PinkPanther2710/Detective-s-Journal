import { GoogleGenerativeAI } from "@google/generative-ai";

import OpenAI from "openai";

// 1. O PRIMEIRO LOG: Verifica se o Vite está lendo o arquivo .env
console.log("🕵️ DETETIVE: Todas as variáveis de ambiente carregadas:", import.meta.env);

// 2. O SEGUNDO LOG: Verifica especificamente a sua chave (mostrando só o comecinho por segurança)
const chave = import.meta.env.VITE_OPENAI_API_KEY;
console.log("🕵️ DETETIVE: A chave VITE_OPENAI_API_KEY existe?", !!chave);
if (chave) {
  console.log("🕵️ DETETIVE: Primeiros caracteres da chave:", chave.substring(0, 5));
} else {
  console.error("🚨 ALERTA: A chave está UNDEFINED. O Vite não encontrou a variável!");
}

// 3. A INICIALIZAÇÃO
const openai = new OpenAI({
  apiKey: chave || "chave_falsa_para_nao_dar_tela_preta", 
  dangerouslyAllowBrowser: true // Lembre-se, sem isso, o erro persistirá na OpenAI
});


export const getAIResponse = async (userMessage, chatHistory = []) => {
  try {
    // 1. Puxamos a chave de forma segura
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // 2. Trava de segurança: Se a chave não existir, não quebra o app, apenas avisa no chat
    if (!apiKey) {
      console.error("🚨 ALERTA: Chave do Gemini não encontrada no arquivo .env ou na Vercel.");
      return "Central, aqui é o sistema. Falha de autenticação. Verifique os cabos (API Key).";
    }

    // 3. Inicializa APENAS na hora de enviar a mensagem
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Você é o Detetive Chefe. Um mentor misterioso e profissional. Use um tom de relatório policial."
    });

    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content || "..." }] // Evita erros se o texto vier nulo
    }));

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(userMessage);
    
    return result.response.text();
    
  } catch (error) {
    console.error("🚨 Erro fatal no Gemini:", error);
    return "A transmissão via satélite falhou... O suspeito pode estar interferindo no sinal.";
  }
};