import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CalculatorSnapshot } from '../types/calculator';

export type TabParamList = {
  Home: undefined;
  Calculator: undefined;
  Loanees: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<TabParamList>;
  LoanDetail: { loanId: string };
  CreateLoan: { loaneeId?: string; calculatorSnapshot?: CalculatorSnapshot };
  LoaneeForm: { loaneeId?: string };
  LoaneeDetail: { loaneeId: string };
  ExtendLoan: { loanId: string };
  PrivacyPolicy: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
