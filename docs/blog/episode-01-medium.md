Building LendLedger with AI, Episode 1: The brief that started it

Series: how I built a real lending tracker, from a messy requirement to a shippable Android app (v1.2).

Read time: ~8 minutes
Episode: 1 of 5

A quick shout-out before we begin. This series is brought to you with Green Letter Technologies (GLT) (https://greenletter.tech/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep1), a team that builds intelligent software and helps businesses go from idea to launch, whether that's a 2-week MVP sprint, an AI integration, or a full modernisation. GLT also just launched Neuron Workflows (https://goneuron.io/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep1): a no-code, AI-native platform where you build automations on a drag-and-drop canvas. Keep it in mind as you read. Not every messy requirement needs a whole app.

—

I come from data engineering: a few years of pipelines, warehouses, and making numbers trustworthy at scale. Mobile apps and product UI were not my day job.

Then a friend asked for help.

They needed a small business lending tracker. Not a bank product, not a payment gateway — just something an owner could use while lending cash short-term, collecting on a fixed schedule (often daily, sometimes weekly or monthly), and escaping notebooks and spreadsheets. I was hesitant — this wasn't my stack. Still, with AI as a partner I was confident we could ship something useful for this specific use case.

So we didn't jump into code. We had a few meetings, wrote things down, and locked what MVP1 had to mean before anything fancy got on the wishlist.

The example that sealed the product in my head was simple:

Lend ₹100 for 50 days at 1% per day.
The loanee should return ₹3 every day.

That's not "interest-only." That's flat interest: principal plus total interest, spread evenly across the term. So ₹100 + ₹50 interest = ₹150 total, which works out to ₹3/day.

[UPLOAD IMAGE HERE: 01-north-star-math.png]

If that math is wrong, everything else in the app is wrong. So this number became our north star. (Weekly and monthly loans use the same idea: total due ÷ number of periods.)

—

Who this is for (and who it isn't)

The primary user is an SMB owner who:

• lends to several people at once
• collects repayments on a schedule (daily, weekly, or monthly), often in cash, face to face
• needs a dashboard: total loaned vs received, who's behind, what's outstanding
• does not need the loanee to log into anything

Important constraint: engagement with borrowers happens offline. The app is for the owner's tracking, not for chasing people through an app.

That one sentence killed a lot of "default SaaS" features before they started.

—

What I was handed vs what I had to decide

The first brief mixed product truth with a tech wishlist. Repayment tracking sat right next to Google login. A calculator sat next to multi-currency. Before writing a single line of code, we sorted every item into one of two piles: must ship or sounds cool.

[UPLOAD IMAGE HERE: 02-scope-mvp1-vs-later.png]

Notice the pattern on the right: login, cloud hosting, loanee alerts. They're all things a "real product" usually has, and none of them were needed by someone collecting cash face to face. Multi-currency was the same kind of fancy — the owner works in rupees only, so ₹ was enough. PDF export joined that pile later, for the same reason.

AI is great at expanding options and bad at saying no. My job was to separate must ship from sounds cool.

—

Choice 1: Spreadsheet vs real app

Option A: Keep improving Excel / Google Sheets
Pros: free, familiar, no install.
Cons: paid/unpaid across many loanees and due dates gets messy; no good "nudge me tonight" reminder; graphs and loan changes fight the tool; one wrong formula and trust dies.

Option B: Build a purpose-built app
Pros: one tap Paid/Unpaid, a calculator that matches the verbal agreement, reminders, a dashboard that matches how they think.
Cons: design, engineering, store listing, support.

Decision: Build the app. The pain wasn't "I need software." The pain was "cash lending with many due dates doesn't fit a grid." Spreadsheets weren't failing because the user was lazy. They were the wrong tool for face-to-face collections.

—

Choice 2: Cloud-first vs local-first (MVP1)

The brief asked for login (Stytch / Google) and free-tier cloud hosting.

Option A: Cloud from day one
Pros: backup, multi-device, "real product" feel.
Cons: accounts (friction for this user), privacy/compliance earlier than needed, hosting cost and complexity, shipping blocked until auth works.

Option B: Local-first on the phone, no login
Pros: works offline (cash collections often happen where signal is weak); zero recurring infra for v1; faster to a working APK; data stays on device.
Cons: lose the phone, lose the data (for now); no sync across devices yet.

Decision: Local-first for MVP1. SQLite on device. No account screen. Cloud sync as an explicit later track ("Track B"), not a fake half-login.

This was the biggest scope cut in the project, and the reason we could put something useful in my friend's hands without standing up a backend.

Another goal sat under that choice: ship without a monthly bill. No hosted database, no auth vendor, no analytics SaaS for MVP1. Development stays cheap; maintenance is whatever I choose to do next, not a recurring invoice. The owner also pays $0 to use the tracker: install, track, done.

And because the ledger lives on the phone, personal and financial data never leave the device — loanee names, phone numbers, balances, payment history, all of it. There is no cloud account and no server storing PII for MVP1, so cloud privacy and data-security concerns for day-to-day use are effectively zero: nothing sensitive is leaving the phone. Use also does not depend on a network: the calculator, loans, paid/unpaid, dashboard, and reminders all run against SQLite, with reminders delivered as local notifications.

I still designed a seam: screens talk to a LoanRepository interface. Today it's SQLite. Later it can be Supabase without rewriting the product screens. That was the compromise between "ship now" and "don't paint ourselves into a corner."

[UPLOAD IMAGE HERE: 03-local-first-architecture.png]

—

Choice 3: What "done" means

I wrote success criteria before writing features. MVP1 is done when a fresh Android install can:

1. Onboard (reminders, no login)
2. Run the calculator on ₹100 at 1% for 50 days and get ₹3 per day (the handshake)
3. Create a loanee, create a loan, mark paid / unpaid / partial
4. Close a loan
5. See a trustworthy dashboard
6. Get a local reminder to update collections
7. Survive an app restart with data intact

Anything that didn't serve that list was out. Multi-currency was never a real need — only rupees. Loanee notifications and PDF export stayed parked.

Loan extend came later, in v1.1, once real use showed loans outliving the first term.

Naming also mattered more than it should: we landed on LendLedger. Owner-only ledger energy, not "fintech unicorn."

—

The math in one place

Flat (simple) interest, paid evenly over the term. Same formula whether the schedule is daily, weekly, or monthly:

total_interest = principal × rate_per_period × number_of_periods
total_due      = principal + total_interest
payment        = total_due ÷ number_of_periods

Canonical example (1% per day, 50 days):

total_interest = 100 × 0.01 × 50 = 50
total_due      = 100 + 50 = 150
payment        = 150 ÷ 50 = 3   → ₹3/day

That's the contract the owner agrees with the loanee verbally. The app's job is to never disagree with that handshake.

—

About this series

This episode is the "why." The next four are the "how."

Over five posts, I'll walk through the whole journey from a friend's notebook to a shippable APK: how we cut scope and turned AI-generated screens into a buildable design, how we laid a foundation we could trust (tested math first), how the trickier product features came together, and what it actually took to ship and polish the app to v1.2. Each episode stands on its own, but read in order they show what building with AI really looks like: decide, cut, build, test, ship, repeat.

[UPLOAD IMAGE HERE: 05-series-map.png]

I'll link each title below as the episodes go live.

Series map

1. The brief (this post) — Problem, user, local-first bet
2. Spec & design — Scope cuts, Stitch to real UI
3. Foundation — Monorepo, tested math, SQLite
4. Building the product — Loans, variance, bulk, refinance
5. Ship & polish to v1.2 — APK, crashes, dock, payment mode

—

Takeaway

If you build with AI: lock the example and lock the user before you lock the stack.

Our locked example was ₹100 → ₹3/day.
Our locked user was an owner who collects in cash, often offline, on daily / weekly / monthly schedules — and will not create an account on day one.

Everything else in LendLedger grew from those two sentences.

—

From a messy brief to something real, with GLT

LendLedger started the way most good products do: a real person, a real problem, and a requirement that was half truth, half wishlist. The hard part was never the code. It was deciding what to build, what to cut, and what "done" means.

That's the work Green Letter Technologies (https://greenletter.tech/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep1) does every day.

Have an idea that needs to become a product? GLT runs an intensive 2-week MVP sprint: strategy workshop, rapid prototyping, basic user testing, and a deployment-ready MVP. The first conversation is a free 30-minute consultation, with no sales pitch.

Is your problem a workflow, not an app? Plenty of "we need software" moments are really "we need these steps to run on their own." That's what Neuron Workflows (https://goneuron.io/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep1) is for. Describe what you want in plain English and Neuron lays out the workflow, or drag and drop the blocks yourself, then run, test, and publish. Not a builder? Browse the Agent Store (https://goneuron.io/agents/store?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep1), install a ready-made agent in one click, and fill in a simple form. Sign in with Google and you're in.

Follow GLT on LinkedIn (https://linkedin.com/company/green-letter-technologies) and X (https://x.com/greenlettertech) to catch the next episode.

—

Next: Episode 2 — Spec & design: what we cut, what Stitch got wrong, and how we turned screenshots into a buildable handoff.
