import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ISODateString } from '@lendledger/core';

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
  ActiveLoans: undefined;
  LoanDetail: { loanId: string };
  CreateLoan: { loaneeId?: string; calculatorSnapshot?: CalculatorSnapshot };
  LoaneeForm: { loaneeId?: string };
  LoaneeDetail: { loaneeId: string };
  ExtendLoan: { loanId: string };
  RefinanceLoan: { oldLoanId: string };
  BulkUpdate: { entryDate?: ISODateString } | undefined;
  PrivacyPolicy: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
