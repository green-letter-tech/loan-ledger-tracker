import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NavigationState, PartialState } from '@react-navigation/native';

import {
  FLOATING_DOCK_BOTTOM_GAP,
  FLOATING_DOCK_COLLAPSED_HEIGHT,
  FLOATING_DOCK_EXPANDED_HEIGHT,
} from '../constants/floatingDock';
import { useTabBarMotion } from '../context/TabBarMotionProvider';
import { useTheme } from '../hooks/useTheme';
import { navigationRef } from '../navigation/navigationRef';
import type { TabParamList } from '../navigation/types';

const EXPANDED_WIDTH = 94;
const COLLAPSED_WIDTH = 72;
const TRANSITION_MS = 280;

type TabIconName = keyof typeof Ionicons.glyphMap;

const TABS: ReadonlyArray<{
  name: keyof TabParamList;
  label: string;
  active: TabIconName;
  inactive: TabIconName;
}> = [
  { name: 'Home', label: 'Home', active: 'home', inactive: 'home-outline' },
  {
    name: 'Calculator',
    label: 'Calculator',
    active: 'calculator',
    inactive: 'calculator-outline',
  },
  { name: 'Loanees', label: 'Loanees', active: 'people', inactive: 'people-outline' },
  {
    name: 'Settings',
    label: 'Settings',
    active: 'settings',
    inactive: 'settings-outline',
  },
];

const HIDDEN_ROUTES = new Set(['Onboarding']);

type NavState = NavigationState | PartialState<NavigationState> | undefined;

function getActiveTab(state: NavState): keyof TabParamList {
  if (!state || !('index' in state) || state.index == null || !state.routes) {
    return 'Home';
  }

  const route = state.routes[state.index];
  if (!route) {
    return 'Home';
  }

  if (route.name === 'Main' && route.state) {
    return getActiveTab(route.state as NavState);
  }

  if (TABS.some((tab) => tab.name === route.name)) {
    return route.name as keyof TabParamList;
  }

  const mainRoute = state.routes.find((entry) => entry.name === 'Main');
  if (mainRoute?.state) {
    return getActiveTab(mainRoute.state as NavState);
  }

  return 'Home';
}

function getFocusedRouteName(state: NavState): string | null {
  if (!state || !('index' in state) || state.index == null || !state.routes) {
    return null;
  }
  const route = state.routes[state.index];
  if (!route) {
    return null;
  }
  if (route.state) {
    return getFocusedRouteName(route.state as NavState) ?? route.name;
  }
  return route.name;
}

export function FloatingDock() {
  const { resolvedTheme, tokens } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const { collapsed, expand } = useTabBarMotion();
  const progress = useSharedValue(0);
  const [activeTab, setActiveTab] = useState<keyof TabParamList>('Home');
  const [visible, setVisible] = useState(false);
  const [focusedRoute, setFocusedRoute] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      if (!navigationRef.isReady()) {
        setVisible(false);
        return;
      }
      const rootState = navigationRef.getRootState();
      const focused = getFocusedRouteName(rootState);
      setVisible(Boolean(focused) && !HIDDEN_ROUTES.has(focused ?? ''));
      setActiveTab(getActiveTab(rootState));
      setFocusedRoute(focused);
    };

    sync();
    const unsubscribe = navigationRef.addListener('state', sync);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (focusedRoute) {
      expand();
    }
  }, [expand, focusedRoute]);

  useEffect(() => {
    progress.value = withTiming(collapsed ? 1 : 0, {
      duration: TRANSITION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [collapsed, progress]);

  const pillStyle = useAnimatedStyle(() => ({
    height: interpolate(
      progress.value,
      [0, 1],
      [FLOATING_DOCK_EXPANDED_HEIGHT, FLOATING_DOCK_COLLAPSED_HEIGHT],
    ),
    width: `${interpolate(progress.value, [0, 1], [EXPANDED_WIDTH, COLLAPSED_WIDTH])}%`,
  }));

  const labelStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [17, 0]),
    marginTop: interpolate(progress.value, [0, 1], [2, 0]),
    opacity: interpolate(progress.value, [0, 0.55, 1], [1, 0, 0]),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [0, 5]) }],
  }));

  if (!visible) {
    return null;
  }

  const backgroundColor =
    resolvedTheme === 'dark' ? 'rgba(18,20,23,0.92)' : 'rgba(250,252,254,0.92)';

  return (
    <View
      pointerEvents="box-none"
      style={[styles.dockArea, { height: FLOATING_DOCK_EXPANDED_HEIGHT + bottom + 16 }]}
    >
      <Animated.View
        style={[
          styles.pill,
          {
            bottom: bottom + FLOATING_DOCK_BOTTOM_GAP,
            backgroundColor,
            borderColor: tokens.border,
          },
          pillStyle,
        ]}
      >
        {TABS.map((tab) => {
          const focused = activeTab === tab.name;
          const color = focused ? tokens.blue : tokens.textFaint;

          return (
            <Pressable
              key={tab.name}
              accessibilityLabel={tab.label}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              onPress={() => {
                expand();
                if (!navigationRef.isReady()) {
                  return;
                }
                navigationRef.navigate('Main', { screen: tab.name });
              }}
              style={styles.tab}
            >
              <View
                style={[styles.iconWrap, focused && { backgroundColor: tokens.blueTint }]}
              >
                <Ionicons
                  color={color}
                  name={focused ? tab.active : tab.inactive}
                  size={22}
                />
              </View>
              <Animated.View style={[styles.labelWrap, labelStyle]}>
                <Text
                  numberOfLines={1}
                  style={[styles.label, { color, fontWeight: focused ? '700' : '600' }]}
                >
                  {tab.label}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockArea: {
    backgroundColor: 'transparent',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 20,
  },
  pill: {
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    overflow: 'hidden',
    paddingHorizontal: 6,
    position: 'absolute',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: 16,
    height: 30,
    justifyContent: 'center',
    width: 38,
  },
  labelWrap: {
    overflow: 'hidden',
  },
  label: {
    fontSize: 10.5,
    lineHeight: 15,
  },
});
