# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
Glimpse — a single-page web app that takes text pointers and displays them in beautiful card-based format using the Google Gemini API. No build step, no npm dependencies.

### Running the dev server
`vercel dev` requires Vercel authentication. A zero-dependency dev server (`dev-server.js`) is provided for environments without Vercel auth:

```bash
GEMINI_API_KEY="$GEMINI_API_KEY" node dev-server.js
```

The server starts on `http://localhost:3000`, serves static files from `public/`, and routes `/api/generate` to the serverless function.

### Required environment variable
- `GEMINI_API_KEY` — Google Gemini API key. Without it, the generate endpoint returns a 500 error. The README mentions `ANTHROPIC_API_KEY` but the actual code uses `GEMINI_API_KEY`.

### Key architecture notes
- **Frontend**: `public/index.html` — single HTML file with inline CSS/JS; no framework, no build.
- **Backend**: `api/generate.js` — Vercel serverless function that calls Gemini API (falls back from `gemini-2.5-flash-lite` to `gemini-2.5-flash` on 429/503).
- **Storage**: Browser localStorage only (no database).
- **No lint/test/build commands**: `package.json` has no `scripts`, no `dependencies`, no `devDependencies`.
