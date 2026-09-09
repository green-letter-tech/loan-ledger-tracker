import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '../hooks/useTheme';
import { CreateLoanScreen } from '../screens/CreateLoanScreen';
import { ExtendLoanScreen } from '../screens/ExtendLoanScreen';
import { LoanDetailScreen } from '../screens/LoanDetailScreen';
import { LoaneeDetailScreen } from '../screens/LoaneeDetailScreen';
import { LoaneeFormScreen } from '../screens/LoaneeFormScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  onboarded: boolean;
}

export function RootNavigator({ onboarded }: RootNavigatorProps) {
  const { tokens } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName={onboarded ? 'Main' : 'Onboarding'}
      screenOptions={{
        headerStyle: { backgroundColor: tokens.bgElev },
        headerTintColor: tokens.blue,
        headerTitleStyle: { color: tokens.text, fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: tokens.bg },
      }}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="LoanDetail" component={LoanDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="CreateLoan"
        component={CreateLoanScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoaneeForm"
        component={LoaneeFormScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoaneeDetail"
        component={LoaneeDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExtendLoan"
        component={ExtendLoanScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ title: 'Privacy policy' }}
      />
    </Stack.Navigator>
  );
}
