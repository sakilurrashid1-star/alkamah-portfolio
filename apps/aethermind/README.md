# ✦ AetherMind — Intelligence Studio

AetherMind is an experimental decision-intelligence product experience designed to make uncertainty visible before a decision becomes irreversible.

## What makes it different

- **Parallel futures** — compare safe, volatile and breakthrough worlds.
- **Multi-agent debate** — Strategist, Risk Officer and Explorer argue from different objectives.
- **Explainability trace** — the local model exposes the variables behind its confidence score.
- **Challenge loop** — users can disagree with the recommendation and force recalibration.
- **Voice interface** — browser speech recognition can drive the copilot for live demos.
- **Secure AI gateway** — optional Node/Express endpoint calls OpenAI server-side; the browser never receives the API key.
- **Graceful fallback** — the GitHub Pages version remains functional without an API.

## Run the AI gateway locally

```bash
npm install
OPENAI_API_KEY=your_key_here npm start
```

PowerShell:

```powershell
$env:OPENAI_API_KEY="your_key_here"
npm start
```

The gateway listens on `http://localhost:8787` by default. Set the AetherMind endpoint to `http://localhost:8787/api/ask`.

**Security:** never put `OPENAI_API_KEY` inside `index.html`, client-side JavaScript, GitHub Pages, or a committed file. Use an environment variable or hosting-provider secret manager.

## Architecture

```text
Browser UI
   │
   ├── Local explainable simulation
   ├── Voice input
   └── Optional POST /api/ask
              │
              ▼
       Node/Express gateway
              │
              ▼
        OpenAI Responses API
```

## GitHub Pages

`index.html` is fully static and works without the gateway. The AI layer is optional because GitHub Pages cannot safely hold a private API secret.

## Scope

AetherMind is an educational/product-design experiment. Its scores are illustrative, not forecasts, financial advice, medical advice, or professional decision authority.

Built by **Alkamah Sakilur Rashid**.
