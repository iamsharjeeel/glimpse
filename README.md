# EOD Report Generator

Paste your raw end-of-day notes → get a structured, card-based visual report in one click. Export as PDF, JPG, or Markdown.

## Stack
- **Frontend** — Plain HTML/CSS/JS, zero dependencies
- **Backend** — Vercel Serverless Function (`/api/generate.js`)
- **AI** — Anthropic Claude (claude-sonnet-4)
- **History** — localStorage (last 30 reports)

## Deploy to Vercel (5 minutes)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "init"
gh repo create eod-report-generator --public --push
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Click **Deploy** (no build settings needed)

### 3. Add your Anthropic API key
1. In your Vercel project → **Settings → Environment Variables**
2. Add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (your key from [console.anthropic.com](https://console.anthropic.com))
3. Click **Save** → go to **Deployments** → **Redeploy**

### 4. Open your live URL
That's it — your EOD tool is live at `https://your-project.vercel.app`

## Local Development
```bash
npm i -g vercel
vercel dev
```
Then open `http://localhost:3000`

## Usage
1. Paste your EOD notes (any format — bullet points, free text, mixed)
2. Hit **Generate report** (or `Cmd/Ctrl + Enter`)
3. Your cards appear instantly with status badges
4. Export as **PDF**, **JPG**, or **.md**
5. Access past reports via the **History** panel

## File Structure
```
eod-tool/
├── api/
│   └── generate.js      # Serverless function — calls Anthropic API
├── public/
│   └── index.html       # Full frontend (single file)
├── vercel.json          # Vercel routing config
├── package.json
└── README.md
```
