# Glimpse

A tool that takes text pointers and displays them in beautiful format. Paste any raw notes, bullet points, or freeform text — Glimpse structures them into clean, visual cards you can export.

## Stack
- **Frontend** — Plain HTML/CSS/JS, zero dependencies
- **Backend** — Vercel Serverless Function (`/api/generate.js`)
- **AI** — Google Gemini (gemini-2.5-flash-lite / gemini-2.5-flash)
- **History** — localStorage (last 30 entries)

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "init"
gh repo create glimpse --public --push
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Click **Deploy** (no build settings needed)

### 3. Add your Gemini API key
1. In your Vercel project → **Settings → Environment Variables**
2. Add:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** your key from [aistudio.google.com](https://aistudio.google.com/apikey)
3. Click **Save** → go to **Deployments** → **Redeploy**

### 4. Open your live URL
That's it — Glimpse is live at `https://your-project.vercel.app`

## Local Development
```bash
npm i -g vercel
vercel dev
```
Then open `http://localhost:3000`

Or use the included dev server (no Vercel auth needed):
```bash
GEMINI_API_KEY=your_key node dev-server.js
```

## Usage
1. Paste any text (notes, bullet points, meeting minutes, brainstorm dumps)
2. Hit **Format** (or `Cmd/Ctrl + Enter`)
3. Your text appears as structured, visual cards with status badges
4. Export as **PDF**, **JPG**, or **.md**
5. Access past entries via the **History** panel

## File Structure
```
glimpse/
├── api/
│   └── generate.js      # Serverless function — calls Gemini API
├── public/
│   └── index.html       # Full frontend (single file)
├── dev-server.js        # Local dev server (no Vercel auth needed)
├── vercel.json          # Vercel routing config
├── package.json
└── README.md
```
