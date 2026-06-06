# SMB loan tracking app requirements
_Exported on 5/25/2026 at 02:12:48 GMT+2 from Cursor (3.5.17)_

---

**User**

/brainstorming I want to build a app (first release needs to be available on web and on android) with the below requirements:
- The user is a SMB owner who lends money on a short-term basis
- The owner needs to track 
-- whom they lend the money
-- what amount
-- duration
-- Any other helpful metrics
- Their loaning process requires the money to be returned on a daily basis. So, for instance, if they lend 100 INR for 50 days with an interest of 1% interest per day, the loanee needs to return 3 INR every day
- The owner loans money to multiple loanees and need a dashboard to track:
-- Total amount loaned vs received
-- Breakdown of the total loaned amount across all loanees
-- Nice looking Graphs
-- Any other helpful metrics
- Supports multiple currencies
- Supports a calculator where the owner enters amount loaned, interest per day/month/year (selectable but day is the default), duration in days (supports month/year as other drop-down options) and outputs the amount that the loanee would need to return each day. 
-- If the calculation looks as expected and is agreed (verbally) by the loanee, the owner can then submit this as a new loan in the app against the loanee's name
-- App supports login via Google or via OTP through Stytch (passwordless login)
-- App uses free tier for hosting, storage, or any other required service for cloud infrastructure
-- App should be lightweight with intuitive UX
-- The owner just needs the app to just for tracking purpose. The app is not for loanees.
--- Because all the engagement between owner and the loanee would happen offline, the owner should be able to set a reminder (hourly/daily) in the app to remind them to update if they received the payment from the loanees for that particular day. There should be a default reminder in place to nudge the owner to update the amount received info in the app for tracking purpose.
--- Because, we already know the amount that is to be paid by the loanee every day, the owner just needs to tap Paid/Unpaid to record the transaction
--- If the loanee paid but a different amount, the app should be able to handle the custom amount received for that particular day
--- Maybe, in the future, we might add a reminder alert if the loanee forgets to pay the interest for a particular day but we don't need this feature right now or any loanee-centric feature
-- Recommend a name for the app

---

**Cursor**

Exploring the workspace for existing project context, then we'll refine the lending-tracker design step by step.


Greenfield project — no existing codebase. Starting with the core loan math, since it drives calculator, daily tracking, and dashboard metrics.


**Loan calculation model**

> **For your example (100 INR, 50 days, 1% per day → 3 INR/day): is this the model you want?

• Total interest = principal × rate × days (simple/flat interest)
• Daily payment = (principal + total interest) ÷ days

So 100 + (100 × 1% × 50) = 150 total, ÷ 50 days = 3 INR/day. Principal is repaid evenly across days along with interest.**
> - Yes — flat/simple interest, daily payment spreads principal + total interest evenly ✔
> - No — daily payment is interest only; principal is returned separately at end
> - No — interest compounds daily on outstanding balance
> - Other — I'll describe in a follow-up message

**Loan lifecycle at end of term**

> **When a loan reaches its end date (e.g. day 50 of 50), what should happen if some days were marked unpaid or paid with a custom (partial) amount?**
> - Fixed term — loan ends after N days; track paid/unpaid per day; mark complete when term ends
> - Open-ended — loan stays active until total received equals principal + interest
> - Extendable — owner can extend duration or roll unpaid days into a new term ✔
> - Other — I'll describe in a follow-up message

**Multi-currency behavior**

> **How should multiple currencies work for v1?**
> - Per loan — each loan has its own currency (INR, USD, etc.)
> - Per account — owner picks one default currency; all loans use it ✔
> - Per loan, but dashboard can show totals converted to a chosen display currency

**Android delivery model**

> **For Android v1, what delivery do you prefer? (Web is assumed as a responsive web app either way.)**
> - Native Android app (Play Store) — built with a cross-platform framework like Expo/React Native
> - Installable PWA — same web app, add to home screen / TWA on Android
> - Either is fine — recommend what fits free tier + fastest v1 ✔

**Reminder configuration**

> **For payment-update reminders in v1, what level of flexibility do you need?**
> - Daily default — one reminder per day (e.g. evening) to log payments; hourly optional ✔
> - Hourly is important — owner collects at varied times and wants frequent nudges
> - Per-loan reminders — set different reminder times per loanee
> - Keep it simple — one global daily reminder only for v1

Confirming the loan model and scope. Proposing architecture options and a v1 design next.


---

**User**

<system_notification>
The following task has finished. If you were already aware, ignore this notification and do not restate prior responses.

<task>
kind: shell
status: success
task_id: 162009
title: Check workspace root and git status
output_path: C:\Users\skrPlays\.cursor\projects\C-Users-skrPlays-AppData-Local-Temp-4048b434-7b21-4883-a370-2fb39b27d410\terminals\162009.txt
</task>
</system_notification>
<user_query>Briefly inform the user about the task result and perform any follow-up actions (if needed). If there's no follow-ups needed, don't explicitly say that.</user_query>

---

**Cursor**

The workspace check finished: you’re starting from a **greenfield project** at `C:\Users\skrPlays` with no existing git repo or codebase.

From your answers, the design is locked in around:

- **Flat/simple interest** with daily payments spread evenly (100 INR × 1%/day × 50 days → **3 INR/day**)
- **Extendable loans** when days are missed or partially paid
- **One default currency per account**
- **Daily reminders** (hourly optional), owner-only — no loanee features in v1

The full design plan recommends **LendLedger** as the app name and **Expo + Supabase + Stytch** for web + Android on free-tier infrastructure. It covers data model, screens, calculator → create-loan flow, paid/unpaid/partial tracking, dashboard charts, and reminders.

**Next step:** review the plan and tell me if you approve it, or what you’d like changed — especially the name (**LendLedger** vs **DailyDues** vs **HisaabLend**) and stack (**Expo** vs **Next.js + Capacitor**). Once you approve, I’ll write the spec doc and move on to the detailed implementation plan.

---

**User**

Do I need a custom domain name to integrate with Stytch ?

---

**Cursor**

Checking Stytch’s current requirements for domains and OAuth redirect URLs.


**No — you don’t need a custom domain to integrate with Stytch for v1.**

Stytch works on its default domains out of the box:

- **Google OAuth:** Google redirects to Stytch’s callback URL (`https://test.stytch.com/v1/oauth/callback/...` in test). In Google Cloud Console you authorize **`stytch.com`** as a domain — not your own.
- **OTP (SMS/email):** Handled by Stytch; no custom domain required.
- **Your app redirect URLs:** In the Stytch dashboard you allowlist where users land after auth. For development that’s typically `http://localhost:3000`. For production web you can use a free host URL (e.g. `https://your-app.vercel.app/authenticate`) — still no custom domain needed.

**When a custom domain *is* optional (nice-to-have, not required):**

- Branded Google consent screen (“Returning to **yourapp.com**” instead of `stytch.com`)
- Fewer ad-blocker issues on OAuth flows
- Some enterprise/OIDC “Connected Apps” setups

**For LendLedger specifically:**

| Platform | Domain needed? |
|----------|------------------|
| Web (dev) | `localhost` only |
| Web (prod) | Free subdomain (Vercel/Netlify) is enough |
| Android | Deep link / app scheme (e.g. Expo auth session) — no web domain required for OTP |

**Bottom line:** Start without a custom domain. Add one later via [Stytch custom auth domains](https://stytch.com/docs/resources/branding/custom-domains) if you want branded OAuth or a production polish pass — it’s not a blocker for building or launching v1.

---

**User**

Okay, since zero infrastructure cost is the goal, what can I use for domain name since going for a custom domain name will require me to buy it.

---

**Cursor**

Clarifying zero-cost URL options for auth and hosting, then updating the plan to reflect that strategy.


Updating the plan with a zero-cost URL strategy — no purchased domain required.


You **don’t need to buy a domain** for zero infrastructure cost. A custom domain is branding only — not required for Stytch, hosting, or auth.

### What to use instead (all free)

| Purpose | Free URL |
|--------|----------|
| **Web app** | Hosting subdomain, e.g. `https://lendledger.vercel.app` (Vercel/Netlify/Cloudflare Pages) |
| **Stytch redirect after login** | Same URL, e.g. `https://lendledger.vercel.app/auth/callback` — add it in the Stytch dashboard |
| **Local development** | `http://localhost:8081` (or whatever Expo web uses) |
| **Google OAuth** | Stytch’s callback on `test.stytch.com` — you authorize **`stytch.com`** in Google Cloud, not your own domain |
| **Android** | App deep link like `lendledger://auth/callback` via Expo — no web domain on the device |
| **OTP login** | Handled in-app by Stytch — no domain needed |

So the “domain name” for v1 is really just a **free hosting subdomain** plus an **app URL scheme** on Android. Users open the web app via the Vercel/Netlify link or install from the Play Store.

### What actually costs money (worth knowing)

- **Google Play listing:** $25 one-time developer fee (only if you publish to Play Store)
- **Stytch SMS OTP in production:** can cost per text; **Google OAuth + email OTP** are safer for staying near $0
- **Custom domain:** optional later (~$10–15/year) for a branded OAuth screen — not needed to ship v1

### Recommendation for your goal

1. **Default login:** Google (free, no SMS)
2. **Fallback:** Email OTP (cheaper than SMS on Stytch)
3. **Web:** `lendledger.vercel.app` (or similar free subdomain)
4. **Skip** Stytch custom auth domain until you want branded OAuth

The plan has been updated with this zero-cost URL strategy. If you’re good with that, the next step is approving the overall design so we can write the spec and implementation plan.

---

**User**

Yup, let's update the plan with your recommendation.

---

**Cursor**

Reading the plan and updating it with our finalized recommendations.


Updating the plan to lock in finalized decisions: LendLedger, Expo stack, Google + email OTP auth, and zero-cost URLs.


Plan updated with finalized recommendations. Here’s what’s now locked in:

### Confirmed for v1

| Area | Decision |
|------|----------|
| **Name** | **LendLedger** |
| **Stack** | Expo (web + Android) + Supabase + Stytch |
| **Auth** | Google OAuth primary, email OTP fallback — **no SMS in v1** |
| **URLs** | Free `lendledger.vercel.app` + Android deep link `lendledger://auth/callback` — **no purchased domain** |
| **Cost goal** | $0 recurring (optional $25 one-time Play Store fee only) |

The plan doc now has a **Confirmed decisions** section at the top, the architecture options collapsed into a single confirmed stack, and auth/hosting/out-of-scope sections aligned with the zero-cost strategy.

**Next steps** (when you’re ready):
1. Write the design spec to `docs/superpowers/specs/2026-05-25-lendledger-design.md`
2. Create the detailed implementation plan

Say **“go ahead”** or **“execute the plan”** when you want to start those, or flag anything else to adjust first.

