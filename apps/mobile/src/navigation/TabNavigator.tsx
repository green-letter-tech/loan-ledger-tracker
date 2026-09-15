import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { CalculatorScreen } from '../screens/CalculatorScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoaneesScreen } from '../screens/LoaneesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        // FloatingDock is rendered at the root and overlays every screen.
        tabBarStyle: { display: 'none', height: 0 },
      }}
      tabBar={() => null}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calculator" component={CalculatorScreen} />
      <Tab.Screen name="Loanees" component={LoaneesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
