import { Ionicons } from '@expo/vector-icons';
import {
  calculateLoan,
  formatINR,
  formatISODateLocal,
  paymentPeriodLabel,
  type DurationUnit,
  type RatePeriod,
} from '@lendledger/core';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomActionBar } from '../components/BottomActionBar';
import {
  LoanTermsForm,
  parseLoanTerms,
  type LoanTermsValue,
} from '../components/create-loan/LoanTermsForm';
import { TabScreenLayout } from '../components/TabScreenLayout';
import { Card, PillButton } from '../components/ui';
import { useTheme } from '../hooks/useTheme';
import type { TabScreenProps } from '../navigation/types';
import type { CalculatorSnapshot } from '../types/calculator';

const DEFAULT_TERMS: LoanTermsValue = {
  principal: '100',
  rate: '1',
  ratePeriod: 'day',
  duration: '50',
  durationUnit: 'days',
};

export function CalculatorScreen({ navigation }: TabScreenProps<'Calculator'>) {
  const { tokens } = useTheme();

  const [terms, setTerms] = useState<LoanTermsValue>(DEFAULT_TERMS);
  const durationUnit = terms.durationUnit;

  const startDate = useMemo(() => formatISODateLocal(new Date()), []);

  const parsed = useMemo(() => parseLoanTerms(terms), [terms]);

  const result = useMemo(() => {
    if (parsed.principal <= 0 || parsed.duration <= 0) {
      return null;
    }

    try {
      return calculateLoan({ ...parsed, startDate });
    } catch {
      return null;
    }
  }, [parsed, startDate]);

  const snapshot = useMemo((): CalculatorSnapshot | null => {
    if (!result) {
      return null;
    }

    return {
      principal: parsed.principal,
      interestRate: parsed.interestRate,
      ratePeriod: parsed.ratePeriod,
      duration: parsed.duration,
      durationUnit,
      startDate: result.startDate ?? startDate,
      durationDays: result.durationDays,
      dailyExpected: result.dailyExpected,
      totalExpected: result.totalExpected,
      totalInterest: result.totalInterest,
      endDate: result.endDate,
    };
  }, [parsed, durationUnit, result, startDate]);

  const handleSaveAsLoan = useCallback(() => {
    if (!snapshot) {
      return;
    }

    navigation.navigate('CreateLoan', { calculatorSnapshot: snapshot });
  }, [navigation, snapshot]);

  return (
    <TabScreenLayout title="Loan calculator" subtitle="Flat daily interest">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Card pad={18}>
          <LoanTermsForm value={terms} onChange={setTerms} />
        </Card>

        {result ? (
          <Card grad="green" pad={18} elev style={styles.resultCard}>
            <Text style={[styles.resultLabel, { color: tokens.textSoft }]}>
              {paymentPeriodLabel(durationUnit)}
            </Text>
            <Text style={[styles.dailyAmount, { color: tokens.green }]}>
              {formatINR(result.dailyExpected, true)}
            </Text>
            <Text style={[styles.durationHint, { color: tokens.textSoft }]}>
              over {Math.round(result.durationDays)} days
            </Text>

            <View style={styles.summaryRow}>
              <View
                style={[
                  styles.summaryBox,
                  { backgroundColor: tokens.surface, borderColor: tokens.borderSoft },
                ]}
              >
                <Text style={[styles.summaryLabel, { color: tokens.textFaint }]}>
                  Total repayable
                </Text>
                <Text style={[styles.summaryValue, { color: tokens.text }]}>
                  {formatINR(result.totalExpected, true)}
                </Text>
              </View>
              <View
                style={[
                  styles.summaryBox,
                  { backgroundColor: tokens.surface, borderColor: tokens.borderSoft },
                ]}
              >
                <Text style={[styles.summaryLabel, { color: tokens.textFaint }]}>
                  Total interest
                </Text>
                <Text style={[styles.summaryValue, { color: tokens.blue }]}>
                  {formatINR(result.totalInterest, true)}
                </Text>
              </View>
            </View>
          </Card>
        ) : null}

        <View style={styles.infoRow}>
          <Ionicons name="information-circle-outline" size={16} color={tokens.textFaint} />
          <Text style={[styles.infoText, { color: tokens.textFaint }]}>
            Flat interest spread evenly. Eg. ₹100 at 1%/day for 50 days → ₹50 interest, ₹150 total,
            ₹3.00 per day.
          </Text>
        </View>
      </ScrollView>

      <BottomActionBar>
        <PillButton variant="primary" full disabled={!snapshot} onPress={handleSaveAsLoan}>
          Save as loan
        </PillButton>
      </BottomActionBar>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 14,
  },
  resultCard: {
    gap: 2,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  dailyAmount: {
    fontSize: 46,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  durationHint: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  summaryBox: {
    flex: 1,
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'flex-start',
    paddingHorizontal: 4,
    paddingTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 19,
  },
});
