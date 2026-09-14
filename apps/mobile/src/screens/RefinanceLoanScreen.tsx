import { Ionicons } from '@expo/vector-icons';
import {
  calculateLoan,
  formatINR,
  formatISODateLocal,
  previewRefinance,
  roundMoney,
  type DailyEntry,
  type Loan,
  type RefinancePreview,
} from '@lendledger/core';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomActionBar } from '../components/BottomActionBar';
import { ConfirmModal } from '../components/ConfirmModal';
import {
  LoanTermsForm,
  parseLoanTerms,
  type LoanTermsValue,
} from '../components/create-loan/LoanTermsForm';
import { SectionLabel } from '../components/create-loan/SectionLabel';
import { StartDateField } from '../components/create-loan/StartDateField';
import { Card, PillButton } from '../components/ui';
import { useRepository } from '../context/AppProvider';
import { useTheme } from '../hooks/useTheme';
import type { RootStackScreenProps } from '../navigation/types';
import type { ThemeTokens } from '../theme/tokens';
import { isValidISODate } from '../utils/formatStartDate';
import { formatTermsSummary } from '../utils/loanTerms';

export function RefinanceLoanScreen({
  navigation,
  route,
}: RootStackScreenProps<'RefinanceLoan'>) {
  const { oldLoanId } = route.params;
  const { resolvedTheme, tokens } = useTheme();
  const repository = useRepository();
  const todayIso = useMemo(() => formatISODateLocal(new Date()), []);

  const [oldLoan, setOldLoan] = useState<Loan | null>(null);
  const [loaneeName, setLoaneeName] = useState('');
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [terms, setTerms] = useState<LoanTermsValue | null>(null);
  const [startDate, setStartDate] = useState(todayIso);
  /** Empty means "use the suggested deduction". */
  const [deductionText, setDeductionText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const loan = await repository.getLoan(oldLoanId);
        if (cancelled) {
          return;
        }
        if (!loan) {
          setError('Loan not found');
          return;
        }
        if (loan.status !== 'active' && loan.status !== 'extended') {
          setError(`This loan is already ${loan.status} and cannot be refinanced.`);
          setOldLoan(loan);
          return;
        }

        const [loanees, entryList] = await Promise.all([
          repository.listLoanees(),
          repository.getDailyEntries(oldLoanId),
        ]);
        if (cancelled) {
          return;
        }

        setOldLoan(loan);
        setLoaneeName(loanees.find((item) => item.id === loan.loaneeId)?.name ?? 'Loanee');
        setEntries(entryList);
        // Same terms as the loan being replaced, which is the common case.
        setTerms({
          principal: String(loan.principal),
          rate: String(loan.interestRate),
          ratePeriod: loan.ratePeriod,
          duration: String(loan.durationCount),
          durationUnit: loan.durationUnit,
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [oldLoanId, repository]);

  const parsedTerms = useMemo(() => (terms ? parseLoanTerms(terms) : null), [terms]);

  const newLoanCalc = useMemo(() => {
    if (!parsedTerms || parsedTerms.principal <= 0 || parsedTerms.duration <= 0) {
      return null;
    }
    try {
      return calculateLoan({ ...parsedTerms, startDate });
    } catch {
      return null;
    }
  }, [parsedTerms, startDate]);

  const deductionOverride = useMemo(() => {
    const trimmed = deductionText.trim();
    if (trimmed === '') {
      return undefined;
    }
    const value = Number(trimmed);
    return Number.isFinite(value) && value >= 0 ? roundMoney(value) : Number.NaN;
  }, [deductionText]);

  const deductionInvalid = Number.isNaN(deductionOverride);

  const preview = useMemo<RefinancePreview | null>(() => {
    if (!oldLoan || !parsedTerms) {
      return null;
    }
    try {
      return previewRefinance({
        oldLoan,
        entries,
        today: todayIso,
        newPrincipal: parsedTerms.principal,
        deductionOverride: deductionInvalid ? undefined : deductionOverride,
      });
    } catch {
      return null;
    }
  }, [oldLoan, entries, todayIso, parsedTerms, deductionOverride, deductionInvalid]);

  const paidCount = useMemo(
    () => entries.filter((entry) => entry.receivedAmount > 0).length,
    [entries],
  );

  const canSubmit =
    !!oldLoan &&
    (oldLoan.status === 'active' || oldLoan.status === 'extended') &&
    !!newLoanCalc &&
    !!preview &&
    !deductionInvalid &&
    isValidISODate(startDate) &&
    !saving;

  const handleRefinance = useCallback(async () => {
    if (!oldLoan || !parsedTerms || !preview) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await repository.refinanceLoan({
        oldLoanId: oldLoan.id,
        newLoan: {
          loaneeId: oldLoan.loaneeId,
          principal: parsedTerms.principal,
          interestRate: parsedTerms.interestRate,
          ratePeriod: parsedTerms.ratePeriod,
          duration: parsedTerms.duration,
          durationUnit: parsedTerms.durationUnit,
          startDate,
        },
        settlement: {
          deduction: preview.deduction,
          settlementPrincipal: preview.settlementPrincipal,
          settlementInterest: preview.settlementInterest,
          interestWaived: preview.interestWaived,
        },
      });

      setShowConfirm(false);
      // Replace so Back does not return to a form for a loan that is now settled.
      navigation.replace('LoanDetail', { loanId: result.newLoan.id });
    } catch (caught: unknown) {
      setShowConfirm(false);
      setError(caught instanceof Error ? caught.message : 'Could not refinance loan');
    } finally {
      setSaving(false);
    }
  }, [navigation, oldLoan, parsedTerms, preview, repository, startDate]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]} edges={['top', 'bottom']}>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        <ActivityIndicator color={tokens.blue} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!oldLoan || !terms || !preview) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]} edges={['top', 'bottom']}>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        <View style={styles.missingState}>
          <Text style={[styles.missingTitle, { color: tokens.text }]}>Cannot refinance</Text>
          <Text style={[styles.missingBody, { color: tokens.textSoft }]}>
            {error ?? 'This loan is no longer available for refinancing.'}
          </Text>
          <PillButton variant="primary" onPress={() => navigation.goBack()}>
            Go back
          </PillButton>
        </View>
      </SafeAreaView>
    );
  }

  const cashLabel =
    preview.cashToHand > 0
      ? 'Cash to hand to loanee'
      : preview.cashToHand < 0
        ? 'Loanee owes before starting'
        : 'No cash changes hands';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[
            styles.backButton,
            { backgroundColor: tokens.surface, borderColor: tokens.borderSoft },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={21} color={tokens.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: tokens.text }]}>Refinance loan</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <SectionLabel step={1} text="Current loan" />
            <Card pad={16}>
              <Text style={[styles.currentName, { color: tokens.text }]}>{loaneeName}</Text>
              <Text style={[styles.currentMeta, { color: tokens.textFaint }]}>
                {formatINR(oldLoan.principal)} · {formatTermsSummary(oldLoan)}
              </Text>
              <View style={[styles.currentDivider, { backgroundColor: tokens.borderSoft }]} />
              <BreakdownRow
                label="Payments collected"
                value={`${paidCount} of ${preview.totalEntries}`}
                tokens={tokens}
              />
              {preview.arrears > 0 ? (
                <BreakdownRow
                  label={`Unpaid arrears (${preview.arrearsDays} ${preview.arrearsDays === 1 ? 'day' : 'days'})`}
                  value={formatINR(preview.arrears)}
                  valueColor={tokens.amber}
                  tokens={tokens}
                />
              ) : null}
            </Card>
          </View>

          <View>
            <SectionLabel step={2} text="New loan terms" />
            <Card pad={16}>
              <LoanTermsForm value={terms} onChange={setTerms} />
              {newLoanCalc ? (
                <Text style={[styles.termsHint, { color: tokens.textFaint }]}>
                  Total repayable {formatINR(newLoanCalc.totalExpected, true)} ·{' '}
                  {formatINR(newLoanCalc.dailyExpected, true)} per payment
                </Text>
              ) : (
                <Text style={[styles.termsHint, { color: tokens.red }]}>
                  Enter a principal and duration above zero.
                </Text>
              )}
            </Card>
          </View>

          <View>
            <SectionLabel step={3} text="Start date" />
            <StartDateField
              value={startDate}
              onChange={setStartDate}
              hint="The new loan's first payment falls on this date"
            />
          </View>

          <View>
            <SectionLabel step={4} text="Settlement" />
            <Card pad={16}>
              <BreakdownRow
                label={`Remaining principal (${preview.remainingEntries} of ${preview.totalEntries})`}
                value={formatINR(preview.remainingPrincipal)}
                tokens={tokens}
              />
              {preview.arrears > 0 ? (
                <BreakdownRow
                  label={`Unpaid arrears (${preview.arrearsDays} ${preview.arrearsDays === 1 ? 'day' : 'days'})`}
                  value={formatINR(preview.arrears)}
                  tokens={tokens}
                />
              ) : null}

              <View style={[styles.settlementDivider, { backgroundColor: tokens.borderSoft }]} />

              <View style={styles.deductionRow}>
                <Text style={[styles.deductionLabel, { color: tokens.text }]}>
                  Deduct from new loan
                </Text>
                <TextInput
                  value={deductionText}
                  onChangeText={setDeductionText}
                  placeholder={String(preview.suggestedDeduction)}
                  placeholderTextColor={tokens.textFaint}
                  keyboardType="decimal-pad"
                  style={[
                    styles.deductionInput,
                    {
                      color: tokens.text,
                      backgroundColor: tokens.surfaceSunken,
                      borderColor: deductionInvalid ? tokens.red : tokens.border,
                    },
                  ]}
                  accessibilityLabel="Amount to deduct from the new loan"
                />
              </View>
              {deductionText.trim() !== '' ? (
                <Pressable onPress={() => setDeductionText('')} style={styles.resetLink}>
                  <Text style={[styles.resetText, { color: tokens.blue }]}>
                    Reset to {formatINR(preview.suggestedDeduction)}
                  </Text>
                </Pressable>
              ) : null}

              <View style={[styles.settlementDivider, { backgroundColor: tokens.borderSoft }]} />

              <View style={styles.cashRow}>
                <Text style={[styles.cashLabel, { color: tokens.textSoft }]}>{cashLabel}</Text>
                <Text
                  style={[
                    styles.cashValue,
                    { color: preview.cashToHand < 0 ? tokens.amber : tokens.green },
                  ]}
                >
                  {formatINR(Math.abs(preview.cashToHand), true)}
                </Text>
              </View>

              {preview.cashToHand < 0 ? (
                <Text style={[styles.cashWarning, { color: tokens.amber }]}>
                  Collect {formatINR(Math.abs(preview.cashToHand))} from the loanee before starting
                  the new loan.
                </Text>
              ) : null}

              <Text style={[styles.waivedNote, { color: tokens.textFaint }]}>
                Interest waived on the old loan {formatINR(preview.interestWaived)}
              </Text>
            </Card>
          </View>

          {error ? <Text style={[styles.error, { color: tokens.red }]}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomActionBar>
        <PillButton
          variant="primary"
          full
          disabled={!canSubmit}
          onPress={() => setShowConfirm(true)}
        >
          Start new loan
        </PillButton>
      </BottomActionBar>

      <ConfirmModal
        visible={showConfirm}
        icon="swap-horizontal-outline"
        title="Refinance this loan?"
        message={`The current loan closes as refinanced and a new ${formatINR(parsedTerms?.principal ?? 0)} loan starts for ${parsedTerms?.duration ?? 0} ${parsedTerms?.durationUnit ?? 'days'}. ${formatINR(preview.deduction)} is withheld to settle it.`}
        warning={
          preview.cashToHand < 0
            ? `Collect ${formatINR(Math.abs(preview.cashToHand))} from the loanee — the deduction is larger than the new loan.`
            : `Cash to hand over: ${formatINR(preview.cashToHand)}`
        }
        confirmLabel="Refinance"
        busy={saving}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => void handleRefinance()}
      />
    </SafeAreaView>
  );
}

interface BreakdownRowProps {
  label: string;
  value: string;
  valueColor?: string;
  tokens: ThemeTokens;
}

function BreakdownRow({ label, value, valueColor, tokens }: BreakdownRowProps) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={[styles.breakdownLabel, { color: tokens.textSoft }]}>{label}</Text>
      <Text style={[styles.breakdownValue, { color: valueColor ?? tokens.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  loader: {
    marginTop: 40,
  },
  missingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  missingTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  missingBody: {
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 20,
  },
  currentName: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  currentMeta: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 3,
  },
  currentDivider: {
    height: 1,
    marginVertical: 13,
  },
  termsHint: {
    fontSize: 12,
    marginTop: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  settlementDivider: {
    height: 1,
    marginVertical: 13,
  },
  deductionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  deductionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  deductionInput: {
    width: 108,
    height: 46,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
  },
  resetLink: {
    alignSelf: 'flex-end',
    paddingTop: 7,
  },
  resetText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  cashRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  cashLabel: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
  },
  cashValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cashWarning: {
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
    marginTop: 9,
  },
  waivedNote: {
    fontSize: 12,
    marginTop: 12,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
});
