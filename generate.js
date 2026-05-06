export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { notes } = req.body;
  if (!notes || !notes.trim()) {
    return res.status(400).json({ error: 'No notes provided' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const systemPrompt = `You are an EOD report parser. Parse raw end-of-day notes into structured JSON.
Return ONLY a raw JSON object — no markdown, no code fences, no explanation, nothing else.

Output schema:
{"today":[{"name":"string","status":"done|blocked|in progress|testing|pending|issue|followup","items":[{"type":"done|blocker|issue|note|action|update","text":"string"}]}],"tomorrow":[{"name":"string","status":"pending|followup|in progress","items":[{"type":"action|note","text":"string"}]}]}

Rules:
- "today" = things worked on today. "tomorrow" = planned next-day work.
- status: "blocked" if blocked, "issue" if broken/failing, "done" if complete, "testing" if ongoing testing, "in progress" for active work, "pending"/"followup" for planned.
- item type: done=completed, blocker=blocking issue, issue=problem, action=planned task, note=observation, update=status info.
- Keep item text under 15 words.
- Group sub-bullets under their parent project name.
- If no tomorrow section exists, return empty array for tomorrow.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: notes }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: `Anthropic API error: ${err}` });
    }

    const data = await response.json();
    const raw = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
