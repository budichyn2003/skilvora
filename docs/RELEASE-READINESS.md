# Release readiness and limited beta

This is an operational checklist, not evidence that production has been deployed. Do not mark a gate complete until its owner records the environment, date, and test evidence. Production deployment requires an explicit product-owner go/no-go decision.

## Gate 1: payment and admin

- [ ] Configure the approved transfer method, account name, account number, and bank in Vercel environment variables. These values are public-facing; never put credentials or banking login details in `NEXT_PUBLIC_*`.
- [ ] Confirm payment-proof upload storage and retention. Current MVP accepts an HTTPS proof URL; it does not upload files to managed storage. Do not launch paid enrollment until the selected storage is access-controlled and retained according to the privacy policy.
- [ ] Run a staging purchase: enroll in a paid published class, submit proof, verify that an admin can open it, approve it, and confirm enrollment access activates exactly once.
- [ ] Reject a staging proof with a reason, verify that access stays blocked, and confirm the student can resubmit a corrected proof.
- [ ] Confirm payment audit records show submission, reviewer, decision, timestamp, and rejection reason.

## Gate 2: catalog, roadmap, and SEO

- [ ] Publish only reviewed course and roadmap content; verify draft content is not returned by public APIs or sitemap.
- [ ] Check course search, category and level filters, course detail metadata, canonical URL, Open Graph, and Course JSON-LD.
- [ ] Check roadmap ordering, linked published classes, learner progress states, page metadata, and sitemap entries.
- [ ] Validate `robots.txt` and `sitemap.xml` on the deployed domain; run Lighthouse on representative home, catalog, course, and roadmap pages and record scores/issues.
- [ ] Check mobile layout, keyboard access, alt text, and Indonesian copy/date/currency presentation.

## Gate 3: security, data, and operations

- [ ] Run API unit tests, API/web builds, Prisma validation, and migration review from a clean checkout.
- [ ] Verify throttling at the deployed API edge, CORS allowlist, cookie security, role boundaries, ownership checks, and admin audit records.
- [ ] Review privacy notice, terms, consent, data-retention periods, deletion/export process, processor agreements, and incident contact with the responsible legal/privacy owner. Engineering implementation alone is not a legal compliance determination.
- [ ] Configure provider-managed PostgreSQL backups and retention. Perform and record a restore drill into an isolated database.
- [ ] Configure uptime/error monitoring, actionable alerts, log retention/access, and a support contact. Ensure logs do not include passwords, raw tokens, or payment evidence.
- [ ] Document provider ownership, escalation contacts, migration procedure, rollback/recovery limitations, and support workflow.

## Gate 4: closed beta

- [ ] Select invited students and instructors, test accounts, and reviewed course content; obtain the required notices/consent before collecting beta data.
- [ ] Complete production smoke checks for register/email verification, login/logout/refresh, catalog, free enrollment, paid proof/review, premium access, lesson progress, quizzes, certificate PDF/public verification, and admin controls.
- [ ] Confirm backup completion, migration state, domain/SSL, OAuth and SMTP callbacks, payment instructions, monitoring alerts, support response owner, and rollback plan before inviting users.
- [ ] Review beta issues daily. Stop enrollment or disable paid checkout if access/payment state is inconsistent, private data is exposed, or recovery is uncertain.
- [ ] Record a written go/no-go decision and unresolved risks before public launch.

## Launch stabilization

- [ ] Ramp traffic gradually; monitor uptime, errors, payment review backlog, enrollment conversion, learning completion, certificate issuance, and support requests.
- [ ] Review these indicators weekly for the first 30 days and assign an owner and due date to each corrective action.
- [ ] Revisit product KPIs and the 30/60/90-day plan with the product owner.

## Current known blockers

- Deployment smoke check on 2026-10-28 confirmed the public web app at `https://skilvora-omega.vercel.app` and API at `https://skilvora-jvx9.onrender.com` are reachable. API `/health` and `/health/ready` return healthy responses. After the owner confirmed this is isolated staging and approved demo data, the seed added one published course and roadmap; API E2E checks passed for seeded login, role denial, free enrollment, progress, final quiz, certificate verification, and PDF download.
- The Vercel home/auth pages respond, but `/courses`, `/roadmap`, and `/sitemap.xml` still return HTTP 500 even after seed content is available. Verify `NEXT_PUBLIC_API_URL=https://skilvora-jvx9.onrender.com` in the active Vercel deployment environment and redeploy.
- An API CORS preflight from `https://skilvora-omega.vercel.app` still does not return `Access-Control-Allow-Origin`. Verify `WEB_APP_URL` and `ALLOWED_ORIGINS` are set to the exact Vercel origin (without a trailing slash) in the active Render service environment, then redeploy and re-test browser requests.
- Seeded demo account passwords were generated only for the smoke test and were not retained. Before using these accounts interactively, run the staging seed with owner-managed `SEED_ADMIN_PASSWORD`, `SEED_INSTRUCTOR_PASSWORD`, and `SEED_STUDENT_PASSWORD` values; never run it against production.
- Email verification/reset and Google OAuth callbacks have not been exercised end-to-end. Confirm provider settings before relying on those flows.
- The provider deployment has been described as isolated staging by the owner; retain that separation and do not promote the seeded test data to production.
- The payment proof flow currently stores a learner-supplied HTTPS URL rather than uploading to managed storage. Choose and implement controlled storage before accepting real payments.
- Transfer bank details, SMTP/OAuth credentials, privacy/terms approval, monitoring, and backup/restore evidence must be supplied/configured by their owners.
- CI validates code and tests but cannot validate provider credentials, production data migration, legal approval, or a production go/no-go decision.
