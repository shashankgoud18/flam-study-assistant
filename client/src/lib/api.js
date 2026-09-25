// The only place in the app that calls our backend. The frontend never
// talks to Groq directly, and never sees the API key.
const API_BASE_URL = import.meta.env.BACKEND_URL || '';

export async function generateStudySet(input, cardCount) {
  const res = await fetch(`${API_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input, cardCount }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || 'Something went wrong. Please try again.');
  }

  return data.raw; // raw, unparsed text from the model
}
