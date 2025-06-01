const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Only POST requests allowed');
  }

  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Frage fehlt oder ungültig' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'Du bist LINQSEC AI, ein deutschsprachiger, kompetenter Compliance-Assistent.',
        },
        { role: 'user', content: question },
      ],
      temperature: 0.4,
      max_tokens: 700,
    });

    const answer = completion.choices?.[0]?.message?.content || 'Keine Antwort.';
    res.status(200).json({ answer });
  } catch (error) {
    console.error('OpenAI-Fehler:', error);
    res.status(500).json({ error: 'OpenAI-Antwort fehlgeschlagen' });
  }
}
