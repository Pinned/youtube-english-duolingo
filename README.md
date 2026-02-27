# YouTube English Duolingo (MVP)

A tiny, demoable learning loop inspired by Duolingo.

## What’s included

Routes:
- `/import` (home): validate URL (frontend only) → create local mock course → redirect to course detail
- `/courses`: course list
- `/courses/[id]`: course detail + segment list + progress + continue button
- `/learn/[courseId]/[segmentIdx]`: learning flow

Learning interactions:
- Card stream: **Listen & Read** → **Single-choice quiz**
- Bottom feedback bar: **Check / Correct / Wrong / Continue**
- Progress bar per segment
- Tap-highlighted words for a **mock vocab popover**

Data layer:
- In-memory store + `localStorage` persistence
- Typed models under `lib/types.ts`

## Run locally

```bash
npm install
npm run dev
```

Open:
- http://localhost:3000/import

## Demo script (2 minutes)

1) Go to `/import`
2) Paste any URL (YouTube recommended), click **Create course**
3) In course detail, click **Continue**
4) In learning page:
   - Tap highlighted words to see mock vocab
   - For quiz card, pick an option → **Check** → **Continue**
5) Finish segment → auto-jump to next segment; finish all → back to course detail

> Notes: This MVP intentionally does **not** call OpenAI, yt-dlp, or any backend. Everything is local and mock.
