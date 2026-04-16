import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializa o SDK do Gemini com a chave do ambiente
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const getAIResponse = async (userMessage, chatHistory) => {
  try {
    // Definimos o modelo (usando a versão mais estável e rápida)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Você é o Detetive Chefe. Um mentor misterioso e profissional. Use um tom de relatório policial confidencial. Nunca dê a resposta de bandeja, instigue o investigador a pensar."
    });

    // O Gemini exige que o histórico tenha o formato { role, parts: [{ text }] }
    // E os papéis permitidos são apenas "user" ou "model"
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Iniciamos a sessão de chat passando o histórico
    const chat = model.startChat({
      history: formattedHistory,
    });

    // Enviamos a nova mensagem do usuário
    const result = await chat.sendMessage(userMessage);
    
    return result.response.text();
    
  } catch (error) {
    console.error("Erro no Gemini:", error);
    return "A transmissão via satélite com a agência falhou... Repita a mensagem, investigador.";
  }
};