# 🤖 Robot School

An interactive site where kids (8–12) learn how AI actually works — by being the
**teacher**. You adopt a robot that knows nothing and take it through ten classes:
it learns to see, to talk, to pay attention, to use tools and to plan — and every
ability is one the kid genuinely taught it.

- **Curriculum:** [CURRICULUM.md](CURRICULUM.md) — the full training plan
- **Design contract:** [DESIGN.md](DESIGN.md) — the rules every screen must obey

## Stack

Next.js (static export) · React · TypeScript · hand-written CSS · zero backend.
Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `master`.

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # static site in out/
```
