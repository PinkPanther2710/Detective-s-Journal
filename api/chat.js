import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Na Vercel, use o nome sem VITE_ para segurança
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { messages } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Você é o Detetive Chefe. Mentor de investigação." },
        ...messages
      ],
    });

    return res.status(200).json({ text: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao processar IA' });
  }
}