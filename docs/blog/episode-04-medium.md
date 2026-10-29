Episode 4: The money logic that could not afford to be “almost right”

Series: how I built a real lending tracker, from a messy requirement to a shippable Android app (v1.2).

Read time: ~7 minutes
Episode: 4 of 5

New here? Episode 1 introduced the friend, the ₹100 → ₹3/day example, and the local-first bet. Episode 3 ended with a tested foundation and the first lessons from real users. This chapter begins when those users started asking harder questions.

This series is brought to you with Green Letter Technologies (GLT) (https://greenletter.tech/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep4) and Neuron Workflows (https://goneuron.io/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep4). More at the end.

—

By the end of Episode 3, LendLedger could calculate a loan, create its payment schedule, record collections, and survive a restart without losing anything. The first six usability problems were fixed. It was no longer a prototype.

Then real use continued, and the questions changed.

"What if someone pays more than they owe?"
"I don't want to open thirty loans one at a time every evening — can I just do them all at once?"
"This loanee wants a new loan. Can we just roll the old balance into it?"

Three questions, but one shared risk: each answer changes somebody's money. A screen can be slightly awkward and still be useful. A financial rule cannot be slightly correct.

These requests became the centre of v1.1: payment variance, bulk collection updates, recovery tracking, and refinance.

The first decision: settle the rules before writing code

AI could create the functions and screens quickly. That speed introduced a different risk: the same business rule could be interpreted one way in the calculation, another way in the database, and a third way in the UI.

So the implementation plan opened with a deliberately blunt heading: “Decisions already made — do not re-open.”

Someone pays more than expected? Informational only. Doesn't shorten the loan or reduce future dues — shown as a note, not applied.

A payment splits across principal and interest — how? Proportionally, in the loan's original principal-to-interest ratio, every time.

Recording many loans' payments at once — what date? Defaults to today. Backfilling a past day is allowed. Future dates are blocked.

Rolling an old loan into a new one — what gets deducted? Remaining principal plus unpaid arrears, shown as a breakdown, editable by the lender before confirming.

[UPLOAD IMAGE HERE: ep4-01-money-rules.png]

None of these rules is difficult to code after it has been decided. The difficult part is making the decision once and preventing every screen from inventing its own answer.

Writing them down turned four ambiguous requests into one shared contract for me, the AI, the tests, and the interface.

Choice 1: What does “recovered” actually mean?

Episode 1 treated every collection as one payment. Real use introduced a more useful question: how much principal has come back, and how much interest has been earned?

We chose a proportional split. If principal makes up two-thirds of the total amount due, two-thirds of every rupee collected counts as principal recovery. The remaining third counts as interest.

That same ratio became important during refinance. The app needed to separate the principal still owed from future interest the lender would no longer collect.

The test that had to pass before anything else did: a ₹100 loan over 120 days, 80 days already elapsed, nothing extended. Two-thirds of every payment is principal (₹100 of ₹150 total). Remaining expected payments across the last 40 days: ₹50. Two-thirds of that:

remaining principal = (100 / 150) × 50 = 33.33

[UPLOAD IMAGE HERE: ep4-02-remaining-principal-math.png]

That ₹33.33 went into the test suite before the refinance screen existed, following the same discipline as the ₹3/day example from Episode 1.

If that number is wrong, the new loan begins with the wrong deduction. So the calculation is checked by a machine every time the tests run, not trusted to visual inspection.

Choice 2: One loan at a time, or one collection session?

The original flow was technically complete: open a loanee, open a loan, find the payment row, update it, go back, and repeat.

For one loan, that is fine. For thirty collections, it is the wrong workflow.

The owner does not think, “I will manage loan number seven now.” They sit down with the day's cash and work through a list. The product needed to follow that routine.

So we added Update today's collections: one screen showing every loan due on the selected date. A checked row means paid in full. An unchecked row can remain at ₹0 or accept a custom amount for an underpayment or overpayment.

The screen also had to behave reliably with hundreds of rows. Each edit is stored against the loan's ID, not its position in the list. That sounds like an implementation detail, but it prevents a dangerous failure: typing an amount for one person and having it move to another row after the list refreshes.

Before saving, the app summarises how many payments are paid, overpaid, underpaid, or unpaid. The database update is one transaction: every selected change is saved, or none is.

Choice 3: Extend the old loan, or start a new one?

Extend already changed the end date of the same loan. The new request was different: a loanee wanted another loan, but part of its value first had to settle what remained on the old one.

That needed a name before it needed code.

Top-up — wrong; a top-up adds money to a loan that's still running. This loan ends.
Restructure — wrong; that's changing terms on the same loan, which is what Extend already does.
Renewal — close, and kept as an acceptable button label if "Refinance" reads unfamiliar, but the underlying concept — a new loan whose proceeds settle an old one — is refinance.

The screen itself is a settlement breakdown, computed live, editable before confirming:

Remaining principal (40 of 120 days): ₹33.33
Unpaid arrears (5 days): ₹5.00
Deduct from new loan: ₹38.33 — editable
Cash to hand to loanee: ₹61.67
Interest waived on old loan: ₹6.67

[UPLOAD IMAGE HERE: ep4-03-refinance-settlement.png]
[SCREENSHOT NEEDED: ep4-04-loan-detail-recovery.png]
[SCREENSHOT NEEDED: ep4-05-bulk-update.png]

If the new loan is smaller than the deduction, the app does not hide the result. It says “Loanee owes ₹x — collect before starting” and asks for confirmation. The app explains the consequence; the lender makes the decision.

The old loan doesn't disappear; it's marked refinanced, keeps its full history, and links forward to the new one. The new loan links back. Nothing is deleted, nothing is faked as "paid" — the old loan's remaining interest is explicitly recorded as waived, not silently erased.

What AI accelerated — and what it could not decide

AI was excellent at turning fixed rules into pure functions, edge-case tests, database migrations, and repetitive UI states. It was much less useful when the product decision itself was unclear.

Should overpayment reduce tomorrow's due? Is a new loan a top-up, an extension, or a refinance? Should the app block a negative cash-to-hand result?

Those are not coding questions. They depend on how the owner runs the business.

By the end of the work, 64 core tests and 75 mobile tests were green. But the implementation record still ended with a section called “Not done.” Two planned visual-review checkpoints had been skipped, so the new screens still needed human eyes on a real device.

That note mattered. A plan that records what was not verified is more useful than one that only looks complete on paper. It became the first item in the polish and release work that followed.

Takeaway

Complex money features do not become safer because a human writes them slowly, or because AI writes them quickly.

They become safer when the business rule is fixed before the code, the critical number has a test, the database change is atomic, and the team is honest about what still needs to be checked.

The ₹3/day example kept the original calculator honest. In this chapter, ₹33.33 did the same job for refinance.

—

Series map

1. The brief — Problem, user, local-first bet
2. Spec & design — Scope cuts, Stitch to real UI
3. Foundation — Monorepo, tested math, SQLite
4. Building the product (this post) — Loans, variance, bulk, refinance
5. Ship & polish to v1.2 — APK, crashes, dock, payment mode

—

From a messy brief to something real, with GLT

Pinning ambiguous rules before writing code — instead of after something breaks — is core to how Green Letter Technologies (https://greenletter.tech/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep4) runs product builds: strategy workshop first, then rapid prototyping, then testing, then a deployment-ready MVP. Free 30-minute first conversation, no sales pitch.

If your "app" idea is really a workflow with clear rules, Neuron Workflows (https://goneuron.io/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep4) lets you describe it in plain English or drag-and-drop it, then run, test, and publish — no app required.

Follow GLT on LinkedIn (https://linkedin.com/company/green-letter-technologies) and X (https://x.com/greenlettertech) for the last episode.

—

Next: Episode 5 — the last stretch from “the features work” to a build I could confidently put back in my friend's hands.

—

Medium publish checklist

1. Paste everything above this checklist into a new Medium story.
2. Upload the three `ep4-0X` diagrams where marked, then add the two real-app screenshots described in `assets-needed.md`.
3. Title: use the first line as the Medium title.
4. Tags: AI, Software Development, Fintech, Mobile App Development, Product Management
