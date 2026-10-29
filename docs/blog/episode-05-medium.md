Episode 5: The three-hour crash behind a twenty-minute animation

Series: how I built a real lending tracker, from a messy requirement to a shippable Android app (v1.2).

Read time: ~6 minutes
Episode: 5 of 5

New here? Episode 1 began with a friend, a messy requirement, and one locked example: ₹100 should come back as ₹3 per day. By Episode 4, the app could handle real collections, recovery, bulk updates, and refinance. This is the final chapter: turning working features into a build I could confidently hand back to the person who started it.

This series is brought to you with Green Letter Technologies (GLT) (https://greenletter.tech/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep5) and Neuron Workflows (https://goneuron.io/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep5). More at the end.

—

By the end of Episode 4, the difficult money logic was tested and working. But “the features work” is not the same as “the product is ready.”

A ready app has to survive a clean install. It has to feel natural after the hundredth use, not only the first. It has to behave on a real phone, with gesture navigation, notification permissions, safe areas, and native build tools that do not care how elegant the TypeScript looks.

That final stretch became version 1.2.

Choice 1: Wait for the store, or put an APK in a real hand?

The Play Store was the eventual destination, but it was the wrong place to begin testing. Store setup, listing assets, review, and staged releases would have delayed the feedback we needed most.

So the first external build was a signed preview APK created through Expo's build service and shared directly with testers. They could install it on Android without a store listing. On iPhone, I used a physical-device Release build.

Development, preview, and production builds still had separate profiles, but the immediate goal was simple: get the real app onto a real phone as early as possible.

That decision produced the fixes from Episode 3. It also made the next problem impossible to ignore.

Choice 2: Keep the safe tab bar, or try the interaction I actually wanted?

The existing bottom navigation worked. It was also visually heavy, especially on smaller screens.

I wanted a floating dock that stayed wide while navigating, collapsed into an icon-only pill when the user scrolled down, and expanded again when they scrolled up or changed tabs.

It sounded like a twenty-minute animation.

The first attempt added an animation library, a gesture library, and a blur effect at the same time. The app flashed black and exited before React Native could show an error.

[UPLOAD IMAGE HERE: ep5-01-crash-investigation.png]

The first mistake was mine: I had installed native packages with the regular package manager instead of Expo's installer. That pulled versions newer than the SDK supported. Correcting the versions fixed the dependency mismatch.

The app still failed.

For the second attempt, I removed the unnecessary gesture and blur packages and kept only the Expo-compatible animation library. This time Xcode failed while linking and pointed at SwiftUICore, a framework the project never used.

That message was a red herring.

Expo's formatted output had hidden the actual missing symbols. Reading the raw Xcode activity log showed that every missing symbol came from React Native's rendering core.

The cause was unusually specific: a Debug build was linking against a Release copy of React Native's prebuilt core. A build script normally swaps the framework to match the selected configuration. It remembered the current version through a small marker file. A routine dependency install deleted that marker but left the Release framework behind.

With no marker, the script assumed the framework was already Debug. The assumption was wrong, and the linker joined two binary worlds that did not match.

This was the moment where AI stopped being the fastest tool. It could offer plausible fixes for the visible error, but the visible error was not the real error. The useful work was reading the raw evidence, tracing which binary had been selected, and comparing it with the one the build expected.

Knowing when to stop prompting and start investigating was part of using AI well.

Restoring the marker and forcing the correct swap fixed the linker failure. One final runtime crash exposed a separate incompatibility in the Debug prebuilt artifacts for that exact Expo and React Native toolchain. The dependable workaround was to use Release builds for physical-device testing.

It was not elegant, but it was verified: 64 core tests and 79 mobile tests were green, the signed build installed on a physical iPhone, and the process remained alive after launch.

The dock finally worked. It collapsed on downward scroll, expanded on upward scroll or a tab change, and used a simple opaque surface instead of another native blur dependency.

The twenty-minute animation took roughly three hours. Most of that time was not spent animating anything.

Choice 3: What was actually worth polishing?

With the dock stable, the remaining changes came from repeated use rather than visual ambition:

• Pull-to-refresh on the dashboard and loanee list — a familiar gesture instead of a new button.

• Search and sort for loanees — necessary once scrolling stopped being a reasonable way to find someone.

• Payment mode on every collection — Cash, UPI, or Bank Transfer, because how money arrived mattered alongside how much arrived.

• Smarter overdue reminders — the notification reports how many loans are behind instead of sending the same generic nudge every evening.

• The animated dock — useful screen space, not animation for its own sake.

[SCREENSHOTS NEEDED: ep5-02-dock-expanded.png + ep5-03-dock-collapsed.png]
[SCREENSHOT NEEDED: ep5-04-payment-mode-picker.png]
[SCREENSHOT NEEDED: ep5-05-loanee-search-sort.png]
[SCREENSHOT NEEDED: ep5-06-overdue-notification.png]

Together, those changes became version 1.2.0: tagged, built, and packaged as the APK this series had been moving toward since the first requirement meeting.

The choice we did not reverse

Episode 1 made one trade-off explicit: local-first meant no login, no server, no recurring infrastructure bill, and no data leaving the phone. It also meant that losing the phone could mean losing the ledger.

Version 1.2 did not quietly reverse that decision. Optional backup and sync remain Track B, behind the same repository interface designed at the beginning. When that work happens, the product screens should not need to know whether their data comes from SQLite alone or from a sync layer behind it.

For now, the original trade still holds—with its benefit and its cost visible.

Takeaway

Shipping was not one dramatic moment. It was a chain of smaller decisions: cut the cloud, lock the example, test the math, listen to the first users, settle the difficult money rules, read the raw crash log, and keep polishing only what made the owner's routine easier.

The ₹100 → ₹3/day example from Episode 1 still holds exactly, five chapters and a signed build later.

That is what “the app never disagrees with the handshake” looks like once the app leaves the laptop.

—

Series map — the whole arc

1. The brief — The problem, the user, the local-first bet
2. Spec & design — AI-generated screens vs. a design you can trust
3. Foundation — Tested math, a storage seam, the first six real bugs
4. Building the product — Payment variance, bulk update, refinance
5. Ship & polish to v1.2 (this post) — A real crash, an animated dock, version 1.2.0

Five posts, one app, and the same locked example the whole way through.

I started this project outside my usual stack, unsure whether AI could help me deliver something genuinely useful. It did—but only when paired with a clear user, written decisions, tests, real feedback, and the willingness to stop trusting the first answer.

Thanks for reading the whole journey.

—

From a messy brief to something real, with GLT

LendLedger started as a real person's real problem and a requirement that was half truth, half wishlist. If you're sitting on one of those right now, Green Letter Technologies (https://greenletter.tech/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep5) runs an intensive 2-week MVP sprint to turn it into something shippable — strategy, prototyping, testing, a deployment-ready build. First conversation is a free 30-minute consultation, no sales pitch.

If the real problem is a workflow rather than a whole app, Neuron Workflows (https://goneuron.io/?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep5) lets you describe it in plain English or drag-and-drop it, then run, test, and publish — browse the Agent Store (https://goneuron.io/agents/store?utm_source=medium&utm_medium=blog&utm_campaign=lendledger_ep5) for ready-made agents if you'd rather not build from scratch.

Follow GLT on LinkedIn (https://linkedin.com/company/green-letter-technologies) and X (https://x.com/greenlettertech).

—

Medium publish checklist

1. Paste everything above this checklist into a new Medium story.
2. Upload `ep5-01-crash-investigation.png`, then add the four real-app captures described in `assets-needed.md`.
3. Title: use the first line as the Medium title.
4. Tags: AI, Software Development, Mobile App Development, Debugging, Product Launch
