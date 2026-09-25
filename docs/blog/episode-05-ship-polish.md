# Building LendLedger with AI, Episode 5: A three-hour crash, a working dock, and what "done" looks like on Android

*Series: how I built a real lending tracker, from a messy requirement to a shippable Android app (v1.2).*

**Read time:** ~6 minutes
**Episode:** 5 of 5

> **New here?** [Episode 1](episode-01-the-brief.md) starts the series with the brief and the ₹100 → ₹3/day example. This is the last stop: shipping, a real bug, and version 1.2.

> This series is brought to you with [Green Letter Technologies (GLT)](https://greenletter.tech/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep5) and [Neuron Workflows](https://goneuron.io/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep5). More at the end.

---

By Episode 4, LendLedger could track a loan correctly through payment, variance, bulk updates, and refinance. That's a working app. This episode is about the distance between "working" and "something you'd actually hand to your friend" — and one very obscure bug that sat right in the middle of that distance.

## Getting a build out of a laptop

Android releases go out through EAS (Expo's build service), with three profiles doing three different jobs: `development` for a debug client, `preview` for a signed APK you can sideload straight to a tester's phone, and `production` for the AAB the Play Store actually wants. The whole first round of testing in Episode 3 happened on `preview` builds shared over WhatsApp — no store account, no review wait.

That pipeline is the boring, reliable part. The interesting part started when I tried to make the app feel like a finished product instead of a functional one.

## The bug: an animated tab bar that wouldn't even launch

The goal was small: an Instagram-style tab bar that collapses to a pill when you scroll down and expands when you scroll up. I added three native packages at once — an animation library, a gesture library, a blur effect — and the app crashed on launch. Black screen, no error, gone in a tenth of a second.

**First mistake, and the fast fix:** I'd installed those packages with plain `npm install` instead of `npx expo install`, which meant versions that didn't match what that Expo SDK release actually expects. `npx expo install --fix` corrected it. The app still crashed.

**[IMAGE NEEDED — visual: crash investigation timeline, version mismatch → linker error → marker-file bug → Release workaround]**

**Second problem, and the real one:** stripped down to just the animation library, with the versions Expo actually wants, the app now failed to even *build* — an Xcode linker error blaming a Swift framework that this project doesn't use anywhere. That error message was a red herring; the real list of missing symbols was buried inside Expo's truncated build log, and only showed up after reading the raw Xcode activity log directly, byte by byte.

What it turned up: a Debug build was linking against a **Release-only** copy of React Native's own compiled core. A build script is supposed to swap in the right one for whichever configuration you're building, and it decides which copy is currently on disk using a small marker file — which a routine `pod install` had just deleted, without touching the framework it was tracking. No marker, and the script's fallback assumption ("probably still Debug") was wrong. Two builds, two different frameworks, one broken app.

This is the part of the series where AI stopped being much help. A model can generate a plausible-looking fix for almost any error message it's seen before in some shape. This one wasn't googleable in this exact shape — it needed someone to actually read a compiled build log and reason about which of two binary artifacts a linker had grabbed. Knowing when a bug needs that kind of manual archaeology, instead of another prompt, was the actual skill being exercised here.

Forcing the marker file back to the wrong value and re-running the swap script fixed the link error. One more runtime crash after that traced to a genuine mismatch between Expo's precompiled Debug artifacts and this exact toolchain version — worked around, for now, by simply building **Release** for on-device testing instead of Debug. Not elegant. Verifiably stable: 79 mobile tests and 64 core tests green, a signed build installed on a physical phone, and a process that stayed alive after launch.

The dock works. It collapses on scroll, expands on scroll-up or a tab switch, and cost about three hours for what looked, from the outside, like it should have taken twenty minutes.

## What "polish" meant for v1.2

With the dock finally stable, the rest of the release was the everyday-use pass an app needs once the math and the money logic are already trustworthy:

- **Pull-to-refresh** on the dashboard and loanee list — the gesture people already expect, not a new idea.
- **Search and sort** on the loanee list, once there were enough loanees that scrolling to find one stopped being reasonable.
- **Payment mode** on every entry — cash, UPI, bank transfer — because "how" someone paid turned out to matter to owners almost as much as "how much."
- **Smarter overdue reminders** — the notification now says *how many* loans are actually behind, instead of a generic "update your collections" nudge every evening whether anything was overdue or not.
- The **animated dock** itself, once it stopped crashing.

**[SCREENSHOT NEEDED (real app): dock collapsing/expanding — a short clip or two stills]**
**[SCREENSHOT NEEDED (real app): payment mode picker on a payment entry]**
**[SCREENSHOT NEEDED (real app): search + sort on the loanee list]**
**[SCREENSHOT NEEDED (real app): an overdue reminder notification]**

That set of changes is what turned into version **1.2.0** — the version tagged, built, and packaged as the APK this whole series has been building toward.

## What's still open

Episode 1's second-biggest bet was local-first: no login, no server, no monthly bill, and one real cost — lose the phone, lose the data. That gap hasn't closed, and it isn't meant to close inside this series. It's Track B: an explicit, later, optional cloud sync sitting behind the same `LoanRepository` interface the app has used since Episode 1, so the screens won't need to change when it lands. For now, the trade the owner accepted on day one still holds, eyes open.

## Takeaway

Shipping isn't a single moment — it's a series of small, sometimes genuinely obscure fires, put out one at a time, until the thing in your hand matches the thing you pictured. The ₹100 → ₹3/day example from Episode 1 still holds, exactly, five episodes and a production build later. That's what "the app never disagrees with the handshake" looks like once it's actually shipped.

---

## Series map — the whole arc

| Ep | Title | What it covered |
|----|-------|------------------|
| 1 | The brief | The problem, the user, the local-first bet |
| 2 | Spec & design | AI-generated screens vs. a design you can trust |
| 3 | Foundation | Tested math, a storage seam, the first six real bugs |
| 4 | Building the product | Payment variance, bulk update, refinance |
| **5** | **Ship & polish to v1.2** *(this post)* | A real crash, an animated dock, version 1.2.0 |

Five posts, one app, the same locked example the whole way through. Thanks for reading the whole thing.

---

## From a messy brief to something real, with GLT

LendLedger started as a real person's real problem and a requirement that was half truth, half wishlist. If you're sitting on one of those right now, [Green Letter Technologies](https://greenletter.tech/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep5) runs an intensive 2-week MVP sprint to turn it into something shippable — strategy, prototyping, testing, a deployment-ready build. First conversation is a free 30-minute consultation, no sales pitch.

If the real problem is a workflow rather than a whole app, [Neuron Workflows](https://goneuron.io/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep5) lets you describe it in plain English or drag-and-drop it, then run, test, and publish — browse the [Agent Store](https://goneuron.io/agents/store?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep5) for ready-made agents if you'd rather not build from scratch.

Follow GLT on [LinkedIn](https://linkedin.com/company/green-letter-technologies) and [X](https://x.com/greenlettertech).
