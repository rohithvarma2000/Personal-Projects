# Rohith Katari — Portfolio

React 19 + TypeScript + Vite + Tailwind + Framer Motion + GSAP. Serverless API on Vercel, Supabase for messages.

## Run locally

```bash
npm install
cp .env.example .env     # fill in what you need; the site renders without any of it
npm run dev              # frontend at http://localhost:5173
npm run build            # production build into dist/
npm run test:api         # 38 logic tests for the /api handlers (services mocked)
```

`npm run dev` serves the frontend only. To try `/api/contact` and `/api/chat` locally, use `npx vercel dev` (needs the Vercel CLI).

## Deploy (Vercel)

1. Push this folder to a GitHub repo and import it in Vercel (framework: Vite, defaults are fine).
2. Add the environment variables from `.env.example` under Settings → Environment Variables.
3. Replace the placeholder domain `https://rohithkatari.vercel.app` in `index.html`, `public/robots.txt` and `public/sitemap.xml` with your real URL.
4. Set `ALLOWED_ORIGINS` to your production origin if the site is served from a custom domain different from the API host.

## Supabase (messages + admin dashboard)

1. Create a project. In the SQL editor, run `supabase/schema.sql`.
2. Insert your admin email: `insert into admin_emails (email) values ('you@example.com');`
3. Authentication → Users → add that user with a strong password. Then Authentication → Providers → Email → **disable "Allow new users to sign up"**.
4. Env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (public), `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server only).
5. Visit `/admin` and sign in. You can mark messages read, set a follow-up status, add notes, and delete.

Security model: visitors cannot read or write the table directly (RLS, no insert policy). Messages are inserted only by `/api/contact` using the service-role key. Admin access is checked by Postgres (`is_admin()` against the JWT email), not by the UI.

## Email notifications (Resend)

Create a Resend account, verify a sending domain, and set `RESEND_API_KEY`, `NOTIFY_FROM_EMAIL` (a verified sender) and `NOTIFY_TO_EMAIL`. If email fails, the message is still saved and shown in `/admin`. If Supabase is not configured, the form returns an honest error instead of pretending it worked.

## Ask Rohith AI

Set `AI_API_KEY` (server only). `AI_PROVIDER=anthropic` or `openai` (any OpenAI-compatible API, with `AI_BASE_URL`). `AI_MODEL` picks the model. The assistant is limited to the verified facts in `src/data/` plus your public GitHub repos, and is rate limited per IP. Without a key, the widget shows a clear "unavailable" message.

## Updating content

| What | Where |
| --- | --- |
| Name, headline, about, education, certification | `src/data/profile.ts` |
| Experience bullets | `src/data/experience.ts` |
| Developer Lab technologies and notes | `src/data/lab.ts` |
| Netflix-style rows | `src/data/rows.ts` |
| Journey levels | `src/data/journey.ts` |
| Project write-ups (keyed by repo name) | `src/data/projects.ts` |
| Contact details | `src/data/contactInfo.ts` |
| GitHub username, featured repos, LinkedIn | `.env` (`VITE_*`) |
| Resume | replace `public/resume/Rohith_Katari_Resume.pdf` |
| Photos | `public/images/` |
| Hero background image | put a file in `public/images/` and set `VITE_HERO_BACKGROUND=/images/yourfile.jpg` |

## Notes

- GitHub data comes from the public REST API (60 requests/hour unauthenticated), cached in the browser for 15 minutes with a stale fallback if rate limited.
- No secrets are in the frontend. `VITE_` variables are public by design.
- `prefers-reduced-motion` is respected (rain becomes a still frame, animations are skipped).
