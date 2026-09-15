import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { FloatingDock } from '../components/FloatingDock';
import { useTheme } from '../hooks/useTheme';
import { ActiveLoansScreen } from '../screens/ActiveLoansScreen';
import { BulkUpdateScreen } from '../screens/BulkUpdateScreen';
import { CreateLoanScreen } from '../screens/CreateLoanScreen';
import { ExtendLoanScreen } from '../screens/ExtendLoanScreen';
import { LoanDetailScreen } from '../screens/LoanDetailScreen';
import { LoaneeDetailScreen } from '../screens/LoaneeDetailScreen';
import { LoaneeFormScreen } from '../screens/LoaneeFormScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { RefinanceLoanScreen } from '../screens/RefinanceLoanScreen';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

interface RootNavigatorProps {
  onboarded: boolean;
}

export function RootNavigator({ onboarded }: RootNavigatorProps) {
  const { tokens } = useTheme();

  return (
    <View style={styles.root}>
      <Stack.Navigator
        initialRouteName={onboarded ? 'Main' : 'Onboarding'}
        screenOptions={{
          headerStyle: { backgroundColor: tokens.bgElev },
          headerTintColor: tokens.blue,
          headerTitleStyle: { color: tokens.text, fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: tokens.bg },
          animation: 'slide_from_right',
          animationDuration: 280,
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="ActiveLoans"
          component={ActiveLoansScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="LoanDetail"
          component={LoanDetailScreen}
          options={{ headerShown: false }}
        />
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
          name="RefinanceLoan"
          component={RefinanceLoanScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BulkUpdate"
          component={BulkUpdateScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ title: 'Privacy policy' }}
        />
      </Stack.Navigator>
      <FloatingDock />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
