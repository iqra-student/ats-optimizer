# ResumeIntel — ATS Optimizer

Two-screen React + Vite + Tailwind app: an upload dashboard (resume +
job description) and a results dashboard (match score, skill gaps,
editable tailored resume).

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

```bash
npm run build     # production build to /dist
npm run preview   # serve the production build locally
```

## Performance notes

- **Code splitting** — `Screen1` and `Screen2` are `React.lazy()` chunks
  loaded through `<Suspense>` with fixed-size skeleton fallbacks, so
  neither screen's JS blocks the other's first paint.
- **Deferred heavy deps** — `jsPDF` is dynamically `import()`-ed only
  inside the "Download ATS-Safe PDF" click handlers, so it never ships in
  the initial bundle. `lucide-react` icons that are part of the always-
  visible chrome (nav, primary buttons) are statically imported on
  purpose — deferring those would itself cause a layout shift when they
  pop in, which conflicts with the CLS goal, so the trade-off is made
  deliberately for icons that are on-screen immediately.
- **Re-render control** — `Navbar`, `Dropzone`, `ScoreGauge`,
  `SkillBadges`, and `ResumeEditor` are wrapped in `React.memo`; derived
  values (gauge offset/tone, plain-text export, match counts) are
  computed with `useMemo`; handlers passed to children use `useCallback`.
- **INP** — the job-description character counter reads a
  `useDebouncedValue` of the textarea content instead of re-rendering on
  every keystroke, keeping typing latency low even for large pastes.
- **Zero CLS** — every card, badge row, and the score gauge reserves an
  explicit `min-height`/`min-width` (or fixed SVG `viewBox`) so the
  skeleton → loaded-data swap never shifts surrounding layout.

## Project structure

```
src/
├── components/
│   ├── Dropzone.jsx       PDF/DOCX drag-and-drop + paste-text fallback
│   ├── ScoreGauge.jsx     SVG circular animated match-score gauge
│   ├── SkillBadges.jsx    Critical vs. recommended skill badges
│   ├── ResumeEditor.jsx   Editable preview + Copy/PDF export + requirements
│   └── Navbar.jsx
├── pages/
│   ├── Screen1.jsx        Upload dashboard (lazy-loaded)
│   └── Screen2.jsx        Results dashboard (lazy-loaded)
├── hooks/
│   ├── useATSScanner.js   Analyze API state: idle/loading/success/error
│   └── useDebouncedValue.js
├── App.jsx
└── main.jsx
```

## Wiring a real backend

`src/hooks/useATSScanner.js` currently resolves a deterministic mock
payload after ~900ms. Replace the body of `mockAnalyze` with a real
`fetch('/api/analyze', { method: 'POST', body, signal })` call — the
hook's public shape (`status`, `data`, `error`, `analyze`, `reset`)
is already the contract the UI expects, so no component changes are
needed.
