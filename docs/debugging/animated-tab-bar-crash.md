# Animated Tab Bar Crash Investigation

**Date:** September 14, 2026  
**Status:** ⏸️ Attempt #1 rolled back (runtime crash) · Attempt #2 blocked by a **linker error — root-caused and fixed locally**, see [Attempt #2](#-attempt-2--xcode-linker-failure-solved) below  
**Time Invested:** ~2.5 hours

## 🎯 Goal

Implement an Instagram-style animated tab bar that:
- Collapses to a centered pill shape when scrolling down
- Expands back to full width when scrolling up
- Has blur background effect (iOS)
- Smooth spring animations

## 📦 Dependencies Added

```json
{
  "react-native-reanimated": "4.6.0",     // Latest version
  "react-native-gesture-handler": "3.3.0", // Latest version  
  "@react-native-community/blur": "4.4.1"
}
```

## 🐛 Problem

**Symptom:** App crashed immediately on launch (black screen, 0.1 second flash)
- No JavaScript errors in Metro
- No visible error logs
- Native-level crash before React Native could initialize

## 🔍 Root Cause Analysis

### Primary Suspect: Version Mismatch

**Expo SDK 56.0.9** expects:
- `react-native-reanimated@4.3.1` (we used 4.6.0)
- `react-native-gesture-handler@~2.31.1` (we used 3.3.0)

The version mismatch caused:
1. **Worklets dependency conflict** - `react-native-worklets@0.8.3` was incompatible with `reanimated@4.6.0` which expected `0.12.x`
2. **Native module crash** - CocoaPods linked incompatible binary frameworks

### Secondary Issues

1. **`@react-native-community/blur`**
   - May have needed additional native configuration
   - Could conflict with Release build optimizations

2. **Multiple native modules at once**
   - Added 3 new native dependencies simultaneously
   - Made it impossible to isolate which one caused the crash

## 📝 Implementation Details

### Files Created

- `apps/mobile/src/contexts/ScrollContext.tsx` - Global scroll position tracking
- `apps/mobile/src/components/AnimatedTabBar.tsx` - Custom animated tab bar component
- `apps/mobile/babel.config.js` - Added Reanimated plugin

### Code Changes

- Modified `TabNavigator.tsx` to use custom tab bar + ScrollProvider
- Updated 4 screens to report scroll position (Dashboard, Loanees, Calculator, Settings)
- Added `react-native-gesture-handler` import to entry point

## ✅ Rollback Process

1. Removed all animation packages via npm uninstall
2. Reverted all code changes to original tab bar
3. Deleted `babel.config.js`
4. Ran `npx pod-install` to clean native modules
5. Rebuilt app from scratch (Release configuration)

**Result:** App works perfectly again

## 💡 Lessons Learned

### What Went Wrong

1. **Used wrong versions** - Should have run `npx expo install` instead of `npm install` to get SDK-compatible versions
2. **No incremental testing** - Added all dependencies at once, couldn't isolate issue
3. **Ignored Expo warnings** - Expo explicitly warned about version incompatibility but we proceeded

### How to Fix Next Time

1. **Use Expo-managed versions:**
   ```bash
   npx expo install react-native-reanimated react-native-gesture-handler
   ```

2. **Test incrementally:**
   - Install Reanimated alone, test
   - Add gesture handler, test
   - Add blur, test
   - Implement animation last

3. **Check compatibility first:**
   ```bash
   npx expo install --check
   ```

4. **Test on device early:**
   - Don't wait until full implementation
   - Test each native module addition immediately

## 🔄 Next Steps (If Revisiting)

### Option A: Wait for SDK Update
- Expo SDK 57 will likely have newer Reanimated
- Less risk of version conflicts

### Option B: Use Expo-Compatible Versions
```bash
cd apps/mobile
npx expo install react-native-reanimated  # Will install 4.3.1
npx expo install react-native-gesture-handler  # Will install ~2.31.1
```

Then rebuild incrementally with testing at each step.

### Option C: Simpler Animation
- Use React Native's built-in `Animated` API instead of Reanimated
- No native dependencies needed
- Less powerful but safer
- Example: Simple fade/scale animations for tab bar

## 📚 References

- [Expo Reanimated docs](https://docs.expo.dev/versions/latest/sdk/reanimated/)
- [React Native Reanimated v4.3.1](https://github.com/software-mansion/react-native-reanimated/releases/tag/4.3.1)
- [Expo SDK 56 compatible packages](https://docs.expo.dev/versions/v56.0.0/)

---

## 🔗 Attempt #2 — Xcode linker failure (SOLVED)

**Branch:** `feature/animated-tab-bar-v2`  
**Setup:** `npx expo install react-native-reanimated` → **4.3.1** (correct SDK 56 version), `babel.config.js` with `react-native-reanimated/plugin`, `import 'react-native-reanimated'` at top of `index.ts`, `npx pod-install`.  
**Command that failed:** `npx expo run:ios --device <udid>` (Debug configuration)

### Symptom (as printed by Expo CLI)

```
› Linking   LendLedger » LendLedger.debug.dylib
Undefined symbols for architecture arm64:
   ^ Could not parse or use implicit file '.../SwiftUICore.framework/SwiftUICore.tbd':
     cannot link directly with 'SwiftUICore' because product being built is not an allowed client of it
❌ ld: symbol(s) not found for architecture arm64
CommandError: Failed to build iOS project. "xcodebuild" exited with error code 65.
```

**The `SwiftUICore` line is a red herring.** Expo CLI's log formatter truncated the real
undefined-symbol list; Xcode prints that implicit-tbd note on *any* arm64 link failure
involving Swift. Nothing in this project touches SwiftUI.

### How the real error was found

Expo's output was useless, so the raw Xcode activity log was read directly:

```bash
LOG=$(ls -t ~/Library/Developer/Xcode/DerivedData/LendLedger-*/Logs/Build/*.xcactivitylog | head -1)
gunzip -c "$LOG" | tr -cd '\11\12\15\40-\176' | grep -oE "referenced from:.{0,200}" | sort -u
```

Every missing symbol was **React Native core (Fabric) C++**, all referenced from `libRNSVG.a`:

```
facebook::react::Props::~Props()
facebook::react::BaseViewProps::~BaseViewProps()
VTT for facebook::react::YogaStylableProps
vtable for facebook::react::DebugStringConvertible
facebook::react::RNSVGImageShadowNode::setImageManager(shared_ptr<ImageManager>)
```

Yet `-framework React` **was** on the link line. So the framework was present but the wrong one.

### Root cause: Debug pods linked against the *Release* prebuilt React core

RN 0.85 ships React core as a **prebuilt xcframework** (`Pods/React-Core-prebuilt/React.xcframework`)
with separate Debug and Release tarballs cached in `Pods/ReactNativeCore-artifacts/`. A build-phase
script (`[RNCore] Replace React Native Core for the right configuration, if needed` →
`node_modules/react-native/scripts/replace-rncore-version.js`) swaps the xcframework to match the
build configuration and records which one is on disk in a hidden marker file:

```
Pods/React-Core-prebuilt/.last_build_configuration   # contains "Debug" or "Release"
```

Its decision logic has a hole:

```js
// scripts/replace-rncore-version.js
if (fileExists && oldConfiguration === configuration) return false;   // same config, skip
// Assumption: if there is no stored last build, we assume that it was build for debug.
if (!fileExists && configuration === 'Debug') return false;           // ← THE BUG
```

**Timeline that triggered it today:**

| Time | Action | State of `Pods/React-Core-prebuilt/` afterwards |
|------|--------|--------------------------------------------------|
| 18:12 | `expo run:ios --configuration Release` (rollback rebuild) | Release xcframework, marker = `Release` ✅ |
| 18:30 | `npx pod-install` (to add Reanimated 4.3.1) | Release xcframework still there, **marker file deleted** ⚠️ |
| 18:31 | `expo run:ios` (Debug) | Script: "no marker + Debug ⇒ assume already Debug" → **skips swap** → links Debug `libRNSVG.a` against Release `React.framework` → undefined symbols ❌ |

Why `pod install` removes the marker: the podspec declares `s.preserve_paths = '**/*.*'`. CocoaPods'
cleaner keeps `React.xcframework` (matches) but deletes the dot-file `.last_build_configuration`
(hidden files don't match that glob). The framework survives, the memory of *which* framework does not.

Why the Release framework can't satisfy a Debug link: in the Release artifact those Fabric
destructors/vtables are inlined or hidden. Evidence from the device slice (`ios-arm64/React.framework/React`):

| | On disk at failure time | Debug tarball |
|---|---|---|
| Binary size | **11 MB** | **63 MB** |
| `nm -gU` exported symbols | **4,100** | **6,172** |
| `vtable for DebugStringConvertible` | ❌ absent | ✅ present |

`libRNSVG.a` (and every other pod) was compiled with `DEBUG=1`, so it expects the 63 MB one.

### Fix (applied locally, 8 seconds — Pods/ is gitignored, nothing to commit)

Force the swap by telling the script the wrong config is on disk, then run it for Debug:

```bash
cd apps/mobile/ios/Pods
printf Release > React-Core-prebuilt/.last_build_configuration
node ../../../../node_modules/react-native/scripts/replace-rncore-version.js -c Debug -r 0.85.3 -p "$PWD"
```

Verify:

```bash
du -sh React-Core-prebuilt/React.xcframework/ios-arm64/React.framework/React   # → 63M
nm -gU React-Core-prebuilt/React.xcframework/ios-arm64/React.framework/React | wc -l   # → 6172
cat React-Core-prebuilt/.last_build_configuration   # → Debug
```

Both checks passed. Then rebuild normally: `npx expo run:ios --device <udid>`.

**Alternatives** (any one works):
- `npx expo run:ios --device <udid> --configuration Release` — build in the config that's already on disk.
- `rm -rf apps/mobile/ios/Pods && npx pod-install` — full re-extract (defaults to Debug). Slow (~1 min) but guaranteed.

### How to never hit this again

Whenever you run `pod install` **after** having built Release at least once, the marker is gone and
the next Debug build will fail exactly like this. Rule of thumb:

> **After every `pod install` / `npx expo prebuild`, if the previous build was Release, run the two-line fix above before building Debug** — or just keep building the same configuration.

Two other things worth knowing from this session:
1. **Don't trust Expo CLI's linker output.** Read the `.xcactivitylog` (command above) — it took 2 minutes to get the real symbol list vs. an hour of guessing at "SwiftUICore".
2. This blocker was **unrelated to Reanimated**. Reanimated 4.3.1 + worklets 0.8.3 pod-installed cleanly; the same failure would have hit *any* `pod install` followed by a Debug build. Attempt #2 can now proceed to the actual on-device test.

---

## 🎬 Conclusion

The animated tab bar is **technically feasible** but requires:
- Using exact Expo-compatible package versions
- Incremental testing with native builds
- More time investment (~4-6 hours with proper debugging)

**Recommendation:** Defer to v1.3 or later when Expo SDK is more stable with Reanimated v4+.

**Update (Attempt #2):** the linker blocker is understood and fixed (see above); it was an RN prebuilt-core
tooling quirk, not an animation-library problem. The environment is now ready to test Reanimated 4.3.1 on device.
