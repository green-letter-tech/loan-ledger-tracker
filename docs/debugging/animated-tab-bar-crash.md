# Animated Tab Bar Crash Investigation

**Date:** September 14, 2026  
**Status:** ❌ Failed - Native crash on iOS  
**Time Invested:** ~2 hours

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

## 🎬 Conclusion

The animated tab bar is **technically feasible** but requires:
- Using exact Expo-compatible package versions
- Incremental testing with native builds
- More time investment (~4-6 hours with proper debugging)

**Recommendation:** Defer to v1.3 or later when Expo SDK is more stable with Reanimated v4+.
