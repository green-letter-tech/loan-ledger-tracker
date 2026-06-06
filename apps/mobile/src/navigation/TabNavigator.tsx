import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import { CalculatorScreen } from '../screens/CalculatorScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoaneesScreen } from '../screens/LoaneesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

type TabIconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<keyof TabParamList, { active: TabIconName; inactive: TabIconName }> = {
  Home: { active: 'home', inactive: 'home-outline' },
  Calculator: { active: 'calculator', inactive: 'calculator-outline' },
  Loanees: { active: 'people', inactive: 'people-outline' },
  Settings: { active: 'settings', inactive: 'settings-outline' },
};

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  const { tokens } = useTheme();

  return (
    <Text
      style={[
        styles.tabLabel,
        {
          color: focused ? tokens.blue : tokens.textFaint,
          fontWeight: focused ? '700' : '600',
        },
      ]}
    >
      {label}
    </Text>
  );
}

export function TabNavigator() {
  const { tokens } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const icons = TAB_ICONS[route.name];

        return {
          headerShown: false,
          tabBarActiveTintColor: tokens.blue,
          tabBarInactiveTintColor: tokens.textFaint,
          tabBarStyle: {
            backgroundColor: tokens.bgElev,
            borderTopColor: tokens.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            paddingTop: 4,
            height: 60,
          },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={size}
              color={color}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <TabLabel label={route.name === 'Home' ? 'Home' : route.name} focused={focused} />
          ),
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calculator" component={CalculatorScreen} />
      <Tab.Screen name="Loanees" component={LoaneesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 10.5,
    marginTop: 2,
  },
});
