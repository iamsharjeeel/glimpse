export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { notes } = req.body;
  if (!notes || !notes.trim()) {
    return res.status(400).json({ error: 'No text provided' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const prompt = `You are a text structuring assistant. Parse raw unstructured text (notes, pointers, updates, ideas, lists, or any freeform content) into a structured JSON format for beautiful card-based display.

Return ONLY a raw JSON object — no markdown, no code fences, no explanation, nothing else before or after.

Output schema:
{"today":[{"name":"string","status":"done|blocked|in progress|active|testing|pending|issue|highlight|important|note","items":[{"type":"done|blocker|issue|note|action|update|highlight|important","text":"string"}]}],"tomorrow":[{"name":"string","status":"pending|active|in progress|highlight","items":[{"type":"action|note|highlight","text":"string"}]}]}

Rules:
- "today" = main content / current items / primary section. "tomorrow" = secondary content / next steps / future items (if any exist).
- Group related items under a meaningful project/topic name.
- status: "done" if completed, "blocked" if stuck, "issue" if problem, "in progress"/"active" for ongoing, "testing" for being tested, "pending" for planned, "highlight"/"important" for key items.
- item type: done=completed, blocker=blocking issue, issue=problem, action=planned task, note=observation/info, update=status change, highlight=important point.
- Keep item text concise (under 15 words).
- Group sub-bullets under their parent project/topic name.
- If no secondary/future section exists in the input, return empty array for tomorrow.
- Be smart about inferring structure from any kind of text — meeting notes, project updates, task lists, brainstorm dumps, etc.

TEXT TO FORMAT:
${notes}`;

  const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (response.status === 503 || response.status === 429) {
        continue;
      }

      if (!response.ok) {
        const err = await response.text();
        return res.status(502).json({ error: `Gemini API error: ${err}` });
      }

      const data = await response.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return res.status(200).json(parsed);
    } catch (e) {
      if (model === models[models.length - 1]) {
        return res.status(500).json({ error: e.message });
      }
    }
  }

  return res.status(503).json({ error: 'All models are currently unavailable. Please try again in a moment.' });
}
