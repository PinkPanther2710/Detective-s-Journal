export const getAIResponse = async (userMessage, chatHistory) => {
  try {
    // Chamamos a rota que criamos na pasta /api
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          ...chatHistory,
          { role: "user", content: userMessage }
        ]
      }),
    });

    const data = await response.json();
    
    if (data.error) throw new Error(data.error);
    
    return data.text;
  } catch (error) {
    console.error("Erro no Proxy da IA:", error);
    return "A conexão com a central caiu. Tente novamente.";
  }
};