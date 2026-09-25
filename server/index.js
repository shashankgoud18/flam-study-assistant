import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'openai/gpt-oss-120b';

// The strict prompt is what makes parsing reliable instead of hopeful:
// exact shape, exact rules, explicit "no prose".
function buildPrompt(topic, cardCount) {
  return `You are a study assistant. Given the topic or notes below, generate flashcards and a multiple-choice quiz.

Return ONLY valid JSON, with no prose and no markdown code fences, matching EXACTLY this shape:
{
  "topic": string,
  "cards": [ { "id": number, "question": string, "answer": string } ],
  "quiz": [ { "id": number, "question": string, "options": [string, string, string, string], "correctIndex": number } ]
}

Rules:
- Generate exactly ${cardCount} flashcards.
- Generate 4 to 6 quiz questions.
- Each quiz question must have exactly 4 options.
- "correctIndex" is the 0-based index into "options" of the correct answer.
- ids should be sequential numbers starting at 1, separately for cards and quiz.
- Do not include any text outside the JSON object.

Topic or notes:
"""
${topic}
"""`;
}

app.get('/',(req,res)=>{
  res.send("Backend is Working")
})

app.post('/api/generate', async (req, res) => {
  const { input } = req.body ?? {};
  const requestedCardCount = Number(req.body?.cardCount);
  const cardCount = Number.isInteger(requestedCardCount)
    ? Math.min(Math.max(requestedCardCount, 3), 12)
    : 6;

  if (!input || typeof input !== 'string' || !input.trim()) {
    return res.status(400).json({ error: 'Input text is required.' });
  }

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Server is missing GROQ_API_KEY. Check your .env file.' });
  }

  // A request that never resolves is as bad as one that errors — cap it.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: buildPrompt(input, cardCount) }],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      }),
      signal: controller.signal,
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', groqRes.status, errText);
      return res.status(502).json({ error: 'The AI provider returned an error.' });
    }

    const data = await groqRes.json();
    const raw = data?.choices?.[0]?.message?.content;

    if (!raw) {
      return res.status(502).json({ error: 'The AI provider returned an empty response.' });
    }

    // Deliberately NOT parsed/validated here — that happens in the client
    // (src/lib/validateResult.js), so shape-checking lives in one clear place.
    res.json({ raw });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'The AI request timed out.' });
    }
    console.error('Unexpected server error:', err);
    res.status(500).json({ error: 'Something went wrong generating your study set.' });
  } finally {
    clearTimeout(timeout);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
