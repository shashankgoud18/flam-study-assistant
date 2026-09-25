# Study Assistant

A small React app that turns free-form notes or a topic into an interactive study set — flashcards you can flip through, and a multiple-choice quiz you can retake, focused on just the questions you got wrong.

Built for the Flam Frontend Internship assignment.

## What it does

1. You paste notes or type a topic into a free-form text box.
2. The app sends it to a small Express backend, which calls the Groq API and asks for a strict JSON shape (flashcards + quiz) — never free text.
3. The backend returns the model's raw text; the frontend parses and validates it before rendering anything.
4. You get real interactive components: flip cards, and a quiz with scoring and a "retest wrong answers" loop — not a chat window.

## Project structure

```
flam-study-assistant/
├── client/              # React app (Vite)
│   └── src/
│       ├── components/  # PromptInput, ResultView, FlashcardDeck, Quiz, Loading/ErrorState
│       ├── lib/
│       │   ├── api.js             # only place the frontend talks to the backend
│       │   └── validateResult.js  # parses + structurally validates the model's output
│       └── App.jsx       # owns state + the stale-response guard
├── server/               # Express backend (holds the Groq API key)
│   └── index.js
└── package.json          # optional workspace convenience commands
```

## Setup

Requires Node 18+ (for native `fetch`).

Install each app independently:

```bash
cd server
npm install
copy .env.example .env

cd ..\client
npm install
```

Get a free Groq API key at https://console.groq.com/keys and paste it into `server/.env`:

```
GROQ_API_KEY=your_key_here
```

Run the server and client in separate terminals:

```bash
npm run dev
```

Run that command from `server` in one terminal, then run `npm run dev` from `client` in another terminal.

Open `http://localhost:5173`. During local development, Vite proxies `/api` requests to `http://localhost:3001`. For separate deployment, copy `client/.env.example` to `client/.env` and set `VITE_API_URL` to the deployed server URL. Set `CLIENT_ORIGIN` in `server/.env` to the deployed client URL.

## Usage

1. Open `http://localhost:5173`.
2. Type a topic (e.g. "Photosynthesis"), paste notes, or upload a PDF, DOCX, PPTX, or TXT file.
3. Review or edit the extracted text, then hit **Build study set**.
4. Switch between **Flashcards** (click a card to flip it) and **Quiz** (answer all questions, submit, then optionally retest just the ones you got wrong).

## How failure is handled

- **Malformed JSON / wrong shape** — `validateResult.js` checks every field; anything that doesn't match routes to the error state, never a partial or broken render.
- **Empty response** — treated as a failure, not an empty-but-valid result.
- **Slow response** — the backend aborts and returns an error after 20 seconds rather than hanging forever.
- **Failed request** — shown as an error with a **Try again** button, no crash.
- **Stale responses** — `App.jsx` tracks a `requestId`; if you submit a second request before the first resolves, the first response is silently discarded when it arrives.

## AI-usage note

I used Claude to help scaffold the project structure, write the Express proxy and Groq prompt, and draft the validation/state logic, then reviewed and adjusted it (styling, quiz retry flow, README) myself. I understand and can walk through every part of this code.

## Known limitations

- No streaming — results appear all at once after generation completes.
- No session persistence — refreshing the page loses your current study set.
- Uploaded documents are parsed in the browser and must contain selectable text; scanned PDFs and legacy `.doc`/`.ppt` files are not supported.
- Groq's JSON mode reduces malformed output but doesn't guarantee it, which is why `validateResult.js` still exists as a hard gate.
- Only tested against the configured Groq model; other providers would need a different request format in `server/index.js`.

## Time spent

_[Fill in with your actual time spent working through this.]_
