// Parses the model's raw text and checks it matches the shape our UI needs.
// Returns the parsed data on success, or null on ANY problem — malformed
// JSON, missing fields, wrong types, empty arrays. null always routes the
// caller to an error state; it never reaches the UI half-formed.
export function validateResult(raw) {
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return null; // malformed JSON
  }

  if (!data || typeof data !== 'object') return null;
  if (typeof data.topic !== 'string' || !data.topic.trim()) return null;

  if (!Array.isArray(data.cards) || data.cards.length === 0) return null;
  for (const card of data.cards) {
    if (
      !Number.isInteger(card.id) ||
      typeof card.question !== 'string' ||
      !card.question.trim() ||
      typeof card.answer !== 'string' ||
      !card.answer.trim()
    ) {
      return null;
    }
  }

  if (!Array.isArray(data.quiz) || data.quiz.length === 0) return null;
  for (const q of data.quiz) {
    if (!Number.isInteger(q.id) || typeof q.question !== 'string' || !q.question.trim()) return null;
    if (!Array.isArray(q.options) || q.options.length < 2) return null;
    if (q.options.some((option) => typeof option !== 'string' || !option.trim())) return null;
    if (
      !Number.isInteger(q.correctIndex) ||
      q.correctIndex < 0 ||
      q.correctIndex >= q.options.length
    ) {
      return null;
    }
  }

  return data;
}
