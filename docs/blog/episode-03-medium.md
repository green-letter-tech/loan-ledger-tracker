Building LendLedger with AI, Episode 3: The foundation nobody screenshots, and the first six things testers broke

Series: how I built a real lending tracker, from a messy requirement to a shippable Android app (v1.2).

Read time: ~6 minutes
Episode: 3 of 5

New here? Episode 1 sets the ₹100 → ₹3/day example and the offline user. Episode 2 covers the design system and the written spec. This one is about the code underneath both.

This series is brought to you with Green Letter Technologies (GLT) (https://greenletter.tech/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep3) and their no-code automation platform, Neuron Workflows (https://goneuron.io/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep3). More at the end.

—

By the end of Episode 2 we had a locked example, a locked user, a token-based design, and a written spec. None of that is code. This episode is where the app actually gets built — and where "AI can write this fast" first collided with "money math has to be exactly right."

Decision: prove the math before touching a screen

The obvious order is calculator screen, then math, then done. We did it backwards on purpose: the math shipped as its own package, with zero dependency on React Native, tested before a single screen existed.

The first thing written wasn't the calculator. It was its test — a case asserting that ₹100, at 1% per day, for 50 days, produces a daily payment of exactly ₹3, total interest of ₹50, and a total due of ₹150.

That test failed on purpose — there was no calculator function yet. Only once it failed for the right reason did the function get written to make it pass. This is the whole point of writing the test first when AI is doing a lot of the typing: I don't have to eyeball-check every line of generated arithmetic. I have to trust one test that encodes the north-star example from Episode 1. If that test is green, the app's most important number is provably right, not just probably right.

[UPLOAD IMAGE HERE: ep3-01-test-first-flow.png]

The same package holds the less obvious math: calendar-aware durations. "30 days" and "1 month" are not the same thing starting from February 15th — a naive plus-one-month can quietly shortchange or overcharge a loan by a day or two, which is exactly the kind of bug a lender would notice and an app would never explain. The date logic computes real calendar dates for every entry, and it's tested the same way the calculator is: write the case that would expose the bug, then make it pass.

By the time the first screen existed, nine tests already covered the two things that mattered most.

Decision: one seam, tested without ever opening a phone

Episode 1 mentioned the LoanRepository interface — screens talk to it, not to the database directly. The part worth going deeper on here is how that seam got tested: a lightweight in-memory stand-in for the on-device database, running under plain Node, so the repository's 14 integration tests (create a loan, get 50 daily entries, extend it, close it) run in the test suite with no emulator, no device, no wait.

[UPLOAD IMAGE HERE: ep3-02-repository-testing.png]

That seam is also what makes the tests reliable: a helper spins up a fresh in-memory database per test, so 14 tests about loan creation don't share state and don't depend on run order. Cheap, fast, and — because it's the real repository code under test, not a mock — it catches real database bugs, not just wiring mistakes.

Building the rest: twelve screens, one task at a time

With the math proven and the storage seam tested, the remaining work was mostly plumbing: onboarding, dashboard, calculator screen, loanees list and detail, loan detail with a pinned "next due" row, extend loan (keep the daily amount or recalculate), close loan with an outstanding-balance warning, settings, local reminders.

The rule that kept this from turning into an unreviewable pile of AI-generated diffs: one task, one commit, in order. Every task in the plan document got its own commit hash next to it the moment it landed. That log is not just source control hygiene — it's the actual build history this series is written from. If you want to see exactly when the dashboard chart landed versus the extend-loan screen, the commit history tells you, in order, with a message per step.

Getting it into a real hand

A finished app on a laptop is not a tested app. Before any Play Store process, the build shipped as a preview APK — a signed Android package sent over a messaging app to the first two real testers. No store account, no review wait, no ceremony. Just: install this, use it for a few days the way you'd actually lend money, tell me what breaks.

What broke, in the first week of real use

Six things, all fixed in one pass:

1. Typing a start date was fiddly on a phone keyboard — an in-app calendar sheet replaced the text field.
2. Extending a loan needed a custom total, not just "same daily" or "recalculate" — added a third extend mode that spreads a custom total evenly over the new days.
3. The bottom tab bar sat under Android's gesture-nav bar — the tab bar height now follows the device's safe-area inset.
4. The home screen's action buttons had no visual cue what they did — added icons to each one.
5. The "expected" bar in one theme was invisible against the background — the new contrast token fix from Episode 2.
6. Nothing stopped recording a payment for a future date — future rows are now shown dimmed and locked, tagged "Scheduled."

None of these were math bugs. The core package's tests never wavered through any of this — every one of the six was a real-use friction point that only showed up once a real person used the app the way they actually work, not the way a spec imagines they will.

Takeaway

Trust in an AI-assisted build doesn't come from reading every generated line. It comes from writing the one test that would catch the bug that matters, and getting the thing into a real stranger's hands before you've polished anything. By the end of this stretch, LendLedger had 29 core tests and 39 mobile tests green, a full screen set, and six real fixes from real use — a solid baseline for the harder feature work that came next.

—

Series map

1. The brief — Problem, user, local-first bet
2. Spec & design — Scope cuts, Stitch to real UI
3. Foundation (this post) — Monorepo, tested math, SQLite
4. Building the product — Loans, variance, bulk, refinance
5. Ship & polish to v1.2 — APK, crashes, dock, payment mode

—

From a messy brief to something real, with GLT

Foundation-first, tested-first builds are how Green Letter Technologies (https://greenletter.tech/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep3) runs its own 2-week MVP sprints — strategy, prototype, test, ship. First conversation is a free 30-minute consult.

If the real need is a workflow rather than a whole app, Neuron Workflows (https://goneuron.io/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep3) turns plain-English descriptions into automations you can run, test, and publish yourself.

Follow GLT on LinkedIn (https://linkedin.com/company/green-letter-technologies) and X (https://x.com/greenlettertech) for the next episode.

—

Next: Episode 4 — Building the product: what happened when the feature requests stopped being about screens and started being about money that had to be exactly right.

—

Medium publish checklist

1. Paste everything above this checklist into a new Medium story.
2. Upload `ep3-01-test-first-flow.png` and `ep3-02-repository-testing.png` where marked.
3. Title: use the first line as the Medium title.
4. Tags: AI, Software Development, Testing, Mobile App Development, Engineering
