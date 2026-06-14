import { Ionicons } from '@expo/vector-icons';
import {
  calculateLoan,
  formatINR,
  formatISODateLocal,
  type DurationUnit,
  type RatePeriod,
} from '@lendledger/core';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomActionBar } from '../components/BottomActionBar';
import {
  CalculatorField,
  NumericInput,
  OptionSelect,
} from '../components/calculator/CalculatorInputs';
import { TabScreenLayout } from '../components/TabScreenLayout';
import { Card, PillButton } from '../components/ui';
import { useTheme } from '../hooks/useTheme';
import type { TabScreenProps } from '../navigation/types';
import type { CalculatorSnapshot } from '../types/calculator';

const RATE_PERIOD_OPTIONS: ReadonlyArray<{ label: string; value: RatePeriod }> = [
  { label: 'Per day', value: 'day' },
  { label: 'Per month', value: 'month' },
  { label: 'Per year', value: 'year' },
];

const DURATION_UNIT_OPTIONS: ReadonlyArray<{ label: string; value: DurationUnit }> = [
  { label: 'Days', value: 'days' },
  { label: 'Months', value: 'months' },
  { label: 'Years', value: 'years' },
];

export function CalculatorScreen({ navigation }: TabScreenProps<'Calculator'>) {
  const { tokens } = useTheme();

  const [principal, setPrincipal] = useState('100');
  const [rate, setRate] = useState('1');
  const [ratePeriod, setRatePeriod] = useState<RatePeriod>('day');
  const [duration, setDuration] = useState('50');
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('days');

  const startDate = useMemo(() => formatISODateLocal(new Date()), []);

  const parsed = useMemo(
    () => ({
      principal: parseFloat(principal) || 0,
      rate: parseFloat(rate) || 0,
      duration: parseFloat(duration) || 0,
    }),
    [principal, rate, duration],
  );

  const result = useMemo(() => {
    if (parsed.principal <= 0 || parsed.duration <= 0) {
      return null;
    }

    try {
      return calculateLoan({
        principal: parsed.principal,
        interestRate: parsed.rate,
        ratePeriod,
        duration: parsed.duration,
        durationUnit,
        startDate,
      });
    } catch {
      return null;
    }
  }, [parsed, ratePeriod, durationUnit, startDate]);

  const snapshot = useMemo((): CalculatorSnapshot | null => {
    if (!result) {
      return null;
    }

    return {
      principal: parsed.principal,
      interestRate: parsed.rate,
      ratePeriod,
      duration: parsed.duration,
      durationUnit,
      startDate: result.startDate ?? startDate,
      durationDays: result.durationDays,
      dailyExpected: result.dailyExpected,
      totalExpected: result.totalExpected,
      totalInterest: result.totalInterest,
      endDate: result.endDate,
    };
  }, [parsed, ratePeriod, durationUnit, result, startDate]);

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
          <View style={styles.inputCard}>
          <CalculatorField label="Principal amount">
            <NumericInput
              value={principal}
              onChangeValue={setPrincipal}
              prefix="₹"
              placeholder="100"
              big
            />
          </CalculatorField>

          <View style={styles.row}>
            <View style={styles.rowCell}>
              <CalculatorField label="Interest rate">
                <NumericInput value={rate} onChangeValue={setRate} prefix="%" placeholder="1" />
              </CalculatorField>
            </View>
            <View style={[styles.rowCell, styles.rowCellWide]}>
              <CalculatorField label="Rate period">
                <OptionSelect
                  value={ratePeriod}
                  options={RATE_PERIOD_OPTIONS}
                  onChange={setRatePeriod}
                />
              </CalculatorField>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.rowCell}>
              <CalculatorField label="Duration">
                <NumericInput value={duration} onChangeValue={setDuration} placeholder="50" />
              </CalculatorField>
            </View>
            <View style={[styles.rowCell, styles.rowCellWide]}>
              <CalculatorField label="Unit">
                <OptionSelect
                  value={durationUnit}
                  options={DURATION_UNIT_OPTIONS}
                  onChange={setDurationUnit}
                />
              </CalculatorField>
            </View>
          </View>
          </View>
        </Card>

        {result ? (
          <Card grad="green" pad={18} elev style={styles.resultCard}>
            <Text style={[styles.resultLabel, { color: tokens.textSoft }]}>Daily payment</Text>
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
  inputCard: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowCell: {
    flex: 1,
  },
  rowCellWide: {
    flex: 1.15,
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
