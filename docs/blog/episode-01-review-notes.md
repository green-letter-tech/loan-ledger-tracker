# Episode 1 — odd lines: suggestions

Author feel: some lines read **redundant**, **AI talking to itself**, or **over-narrow** (daily-only). Also: **extend shipped in v1.1**, not MVP1 — fix the done-list.

Legend: **Cut** / **Rewrite** / **Keep but soften**.

---

## 1. Intro — AI partner sentence

**Now:**  
> I was hesitant. This wasn't the stack I lived in. But I also had a bet: with AI as a working partner (not a magic button, but a collaborator I could argue with), we could still ship something useful for this specific use case.

**Why odd:** Three beats say the same thing (hesitant → unfamiliar → AI bet). The parenthetical is classic “AI explaining itself.”

**Rewrite:**  
> I was hesitant — this wasn’t my stack. Still, with AI as a partner I was confident we could ship something useful for this specific use case.

---

## 2. Caption — north star image

**Now:** *Fifty small collections, one handshake. If the app ever disagrees with this, the app is wrong.*

**Why odd:** Slogan-y; repeats the next paragraph (“If that math is wrong…”).

**Options:**  
- **Cut** the caption entirely (alt text + next paragraph already carry it).  
- **Or soft:** *The verbal deal, in one picture.*

---

## 3. “Daily” everywhere (weekly / monthly exist)

**Problem:** Daily is the *example* and a common pattern, not the only schedule. Saying only daily mis-sells the product.

| Spot | Now | Suggestion |
|------|-----|------------|
| Intro | “collecting a little every day” | “collecting on a fixed schedule — often daily, sometimes weekly or monthly” |
| Who this is for | “collects repayments **daily**” | “collects repayments on a schedule (**daily, weekly, or monthly**), often in cash, face to face” |
| Scope image caption | “owner's daily routine” | “owner's collection routine” |
| Choice 1 pain | “daily cash lending doesn't fit a grid” | “cash lending with many due dates doesn't fit a grid” |
| Choice 1 cons | “daily paid/unpaid” | “paid/unpaid across many due dates” |
| Math section | `daily_payment` / “₹3/day” | **Keep** — that’s the north-star *example*, not a claim that all loans are daily. One line above the formula: “Same idea for weekly or monthly: total due ÷ number of periods.” |

**Rule of thumb for the series:** use **daily** only when pointing at the ₹100 / 50d example; elsewhere say **schedule** / **due dates** / **daily, weekly, or monthly**.

---

## 4. “Wrong for the medium”

**Now:** *The workflow was wrong for the medium.*

**Why odd:** Sounds like a blog reviewing itself; “medium” is unclear.

**Rewrite:**  
> Spreadsheets weren’t failing because the user was lazy. They were the wrong tool for face-to-face collections with many due dates.

*(Drop the abstract last sentence — the line before it already lands.)*

---

## 5. Caption — architecture image

**Now:** *One interface between the product and its storage. Swap what's behind it later; the screens never notice.*

**Why odd:** Engineer cleverness; body already says LoanRepository.

**Options:**  
- **Cut** caption.  
- **Or soft:** *Screens talk to one interface. Storage can change later.*

---

## 6–7. Done-list (MVP1) + extend is v1.1

**Now:**  
2. Calculate ₹100 / 1% / 50d and get **₹3/day**  
4. Extend or close a loan  

**Fixes:**  
- Plain English for #2.  
- **Remove extend from MVP1 done** — that landed in **v1.1**. MVP1: create → track → close (and restart-safe data).

**Rewrite list:**

1. Onboard (reminders, no login)  
2. Run the calculator on ₹100 at 1% for 50 days and get **₹3 per period** (the handshake)  
3. Create a loanee, create a loan, mark paid / unpaid / partial  
4. Close a loan  
5. See a trustworthy dashboard  
6. Get a local reminder to update collections  
7. Survive an app restart with data intact  

Optional one-liner after the list (honest timeline):  
> Loan extend came later, in v1.1, once real use showed loans outliving the first term.

---

## 8. “Waited… waited… waited”

**Now:** *If a feature didn't serve that list, it waited. Multi-currency waited. Loanee notifications waited. PDF export waited.*

**Why odd:** AI rhythm / poetry.

**Rewrite:**  
> Anything that didn’t serve that list was out. Multi-currency was never a real need — only rupees. Loanee notifications and PDF export stayed parked.

## 12. Multi-currency (author clarification)

**Product truth:** Multi-currency is **not required**. It showed up as a fancy / “sounds cool” wishlist item. The owner only needs **rupees (₹)**.

**Do not frame it as:** “parked for later” / “waited” / a meaningful Phase 2 feature.

**Do frame it as:** wishlist fluff next to login and cloud — cut without hurting the use case; money in the app is ₹ only.

**Draft status:** Applied in final Episode 1 + Medium paste (`episode-01-the-brief.md`, `episode-01-medium.md`). Image `02-scope-mvp1-vs-later.png` may still say “Parked for later” in the artwork — update graphic if it contradicts “sounds cool / not needed.”

---

## Status (2026-09-18)

All review items applied. **Medium copy-paste file:** [`episode-01-medium.md`](episode-01-medium.md).

---

## 9. Section heading

**Now:** `## The math, in one paragraph (tutorial bit)`

**Rewrite:** `## The math in one place`  
or `## How the daily example is calculated`

---

## 10. Takeaway — “frozen user”

**Now:** *Our frozen user was an offline cash lender who will not create an account on day one.*

**Why odd:** “Frozen” is process jargon.

**Rewrite:**  
> The user we locked in: an owner who collects in cash, often offline, and will not create an account on day one. Schedules can be daily, weekly, or monthly — the north star example just happens to be daily.

*(Or shorter: keep two-sentence takeaway, swap “frozen user” → “user we refused to reinvent.”)*

---

## 11. Resources block

**For Medium:** **Cut** the whole `### Resources` section (local paths + meta note).  
**For repo draft:** keep, or move to this notes file / README only.

---

## Suggested edit order (when ready)

1. Fix **extend ≠ MVP1** (accuracy).  
2. Soften **daily-only** language (product truth).  
3. Cut/shorten **captions + waited chorus + (tutorial bit) + frozen**.  
4. Trim **AI partner** parenthetical.  
5. Strip **Resources** for the Medium paste.
