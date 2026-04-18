// Vercel serverless function — AI landing page generator.
// Requires env var ANTHROPIC_API_KEY set in Vercel project settings.

const SYSTEM_PROMPT = `You are an expert landing page designer. Given a brand / business description, produce a single self-contained HTML landing page.

Hard requirements:
- Return ONLY the raw HTML. No markdown fences, no commentary, no preamble, no explanation.
- Start with <!DOCTYPE html> and end with </html>.
- Use Tailwind via <script src="https://cdn.tailwindcss.com"></script>.
- Use Google Font "Inter" (300-800).
- Include: sticky header with logo + nav, hero with headline + subheadline + two CTAs, 3-6 feature cards, a pricing or CTA section, and a footer.
- Use a cohesive modern palette matching the prompt (minimal, earthy, bold, playful, etc).
- Mobile responsive. Use semantic HTML. Add subtle hover transitions.
- No external images — use emoji or inline SVG where a visual is needed.
- Add data-edit="true" to every <h1>, <h2>, <h3>, <p>, <a>, <button>, <span> that contains user-visible copy so the client can toggle contenteditable.
- Keep the total output under 12000 characters.

Given a REFINEMENT (existing HTML + edit instructions), return the full updated HTML, preserving structure and only changing what was asked.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on the server. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const { prompt, existingHtml, instructions } = body || {};

  let userMessage;
  if (existingHtml && instructions) {
    userMessage = `REFINEMENT MODE.\n\nExisting HTML:\n\n${existingHtml}\n\nEdit instructions: ${instructions}\n\nReturn the full updated HTML.`;
  } else if (prompt) {
    userMessage = `Brand / business: ${prompt}\n\nGenerate the landing page now.`;
  } else {
    res.status(400).json({ error: 'Provide either {prompt} or {existingHtml, instructions}.' });
    return;
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    if (!r.ok) {
      const errText = await r.text();
      res.status(502).json({ error: `Anthropic API error ${r.status}`, detail: errText.slice(0, 500) });
      return;
    }

    const data = await r.json();
    let html = data?.content?.[0]?.text || '';
    html = html.trim();
    if (html.startsWith('```')) {
      html = html.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/i, '').trim();
    }
    const start = html.indexOf('<!DOCTYPE');
    if (start > 0) html = html.slice(start);

    res.status(200).json({ html });
  } catch (err) {
    res.status(500).json({ error: 'Generation failed', detail: String(err).slice(0, 500) });
  }
}