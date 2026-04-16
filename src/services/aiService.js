import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY, 

  dangerouslyAllowBrowser: true 
});

export const getAIResponse = async (userMessage, chatHistory) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // O modelo mais atual da OpenAI
      messages: [
        { 
          role: "system", 
          content: `Você é o Detetive Chefe. Um mentor misterioso e profissional. 
          Use um tom de relatório policial. Nunca dê respostas diretas, instigue o investigador.` 
        },
        ...chatHistory, // Passa as mensagens anteriores para ter memória
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Erro na OpenAI:", error);
    return "O sinal da central está instável... tente novamente, recruta.";
  }
};
