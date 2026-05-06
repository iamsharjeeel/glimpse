export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { notes } = req.body;
  if (!notes || !notes.trim()) {
    return res.status(400).json({ error: 'No notes provided' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const prompt = `You are an EOD report parser. Parse raw end-of-day notes into structured JSON.
Return ONLY a raw JSON object — no markdown, no code fences, no explanation, nothing else before or after.

Output schema:
{"today":[{"name":"string","status":"done|blocked|in progress|testing|pending|issue|followup","items":[{"type":"done|blocker|issue|note|action|update","text":"string"}]}],"tomorrow":[{"name":"string","status":"pending|followup|in progress","items":[{"type":"action|note","text":"string"}]}]}

Rules:
- "today" = things worked on today. "tomorrow" = planned next-day work.
- status: "blocked" if blocked, "issue" if broken/failing, "done" if complete, "testing" if ongoing testing, "in progress" for active work, "pending"/"followup" for planned.
- item type: done=completed, blocker=blocking issue, issue=problem, action=planned task, note=observation, update=status info.
- Keep item text under 15 words.
- Group sub-bullets under their parent project name.
- If no tomorrow section exists, return empty array for tomorrow.

EOD NOTES:
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

      // If 503 or 429, try next model
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
      // If last model also failed, return error
      if (model === models[models.length - 1]) {
        return res.status(500).json({ error: e.message });
      }
    }
  }

  return res.status(503).json({ error: 'All Gemini models are currently unavailable. Please try again in a moment.' });
}
