import { Ionicons } from '@expo/vector-icons';
import {
  computeOutstandingBalance,
  computeRecalculateDaily,
  formatINR,
  previewExtendLoan,
  type ExtendLoanMode,
  type Loan,
} from '@lendledger/core';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomActionBar } from '../components/BottomActionBar';
import { Card, PillButton } from '../components/ui';
import { useRepository } from '../context/AppProvider';
import { useTheme } from '../hooks/useTheme';
import type { RootStackScreenProps } from '../navigation/types';
import { countPartialDays, countUnpaidDays } from '../utils/loanDetail';
import { formatStartDateLabel } from '../utils/formatStartDate';
import { showAlert } from '../utils/confirmAction';

export function ExtendLoanScreen({ navigation, route }: RootStackScreenProps<'ExtendLoan'>) {
  const { loanId } = route.params;
  const { resolvedTheme, tokens } = useTheme();
  const repository = useRepository();

  const [loan, setLoan] = useState<Loan | null>(null);
  const [loaneeName, setLoaneeName] = useState('');
  const [outstanding, setOutstanding] = useState(0);
  const [unpaidDays, setUnpaidDays] = useState(0);
  const [partialDays, setPartialDays] = useState(0);
  const [addDays, setAddDays] = useState(20);
  const [mode, setMode] = useState<ExtendLoanMode>('keep_daily');
  const [customTotal, setCustomTotal] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const customTotalValue = useMemo(() => {
    const parsed = parseFloat(customTotal);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [customTotal]);

  const loadLoan = useCallback(async () => {
    setLoading(true);
    try {
      const loanData = await repository.getLoan(loanId);
      if (!loanData) {
        setLoan(null);
        return;
      }

      const [loanees, entries] = await Promise.all([
        repository.listLoanees(),
        repository.getDailyEntries(loanId),
      ]);

      const loanee = loanees.find((entry) => entry.id === loanData.loaneeId);
      setLoan(loanData);
      setLoaneeName(loanee?.name ?? 'Loan');
      setOutstanding(computeOutstandingBalance(entries));
      setUnpaidDays(countUnpaidDays(entries));
      setPartialDays(countPartialDays(entries));
    } finally {
      setLoading(false);
    }
  }, [loanId, repository]);

  useFocusEffect(
    useCallback(() => {
      void loadLoan();
    }, [loadLoan]),
  );

  const preview = useMemo(() => {
    if (!loan) {
      return null;
    }
    return previewExtendLoan({
      endDate: loan.endDate,
      dailyExpected: loan.dailyExpected,
      extensionDays: addDays,
      mode,
      outstanding,
      customTotal: customTotalValue,
    });
  }, [addDays, loan, mode, outstanding, customTotalValue]);

  const handleConfirm = useCallback(async () => {
    if (!loan || addDays <= 0) {
      return;
    }

    if (mode === 'custom' && customTotalValue <= 0) {
      showAlert('Enter an amount', 'Please enter a total amount for the extension.');
      return;
    }

    setConfirming(true);
    try {
      await repository.extendLoan(loanId, addDays, mode, customTotalValue);
      navigation.replace('LoanDetail', { loanId });
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : 'Could not extend loan';
      showAlert('Cannot extend loan', message);
    } finally {
      setConfirming(false);
    }
  }, [addDays, customTotalValue, loan, loanId, mode, navigation, repository]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]} edges={['top', 'bottom']}>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        <ActivityIndicator color={tokens.blue} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!loan || loan.status === 'closed') {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]} edges={['top', 'bottom']}>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        <View style={styles.missingState}>
          <Text style={[styles.missingTitle, { color: tokens.text }]}>
            {!loan ? 'Loan not found' : 'Loan is closed'}
          </Text>
          <PillButton variant="primary" onPress={() => navigation.goBack()}>
            Go back
          </PillButton>
        </View>
      </SafeAreaView>
    );
  }

  const recalcDaily =
    addDays > 0 ? computeRecalculateDaily(outstanding, addDays) : loan.dailyExpected;
  const customDaily =
    addDays > 0 && customTotalValue > 0
      ? computeRecalculateDaily(customTotalValue, addDays)
      : 0;

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
        <Text style={[styles.headerTitle, { color: tokens.text }]}>Extend loan</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={[styles.loaneeName, { color: tokens.text }]}>{loaneeName}</Text>
          <Text style={[styles.endDateLabel, { color: tokens.textFaint }]}>
            Current end date · {formatStartDateLabel(loan.endDate, '2099-01-01')}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Card pad={13} style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: tokens.textFaint }]}>Unpaid days</Text>
            <Text style={[styles.summaryValue, { color: tokens.text }]}>{unpaidDays}</Text>
          </Card>
          <Card pad={13} style={styles.summaryCard}>
            <Text style={[styles.summaryLabel, { color: tokens.textFaint }]}>Partial days</Text>
            <Text style={[styles.summaryValue, { color: tokens.amber }]}>{partialDays}</Text>
          </Card>
          <Card pad={13} style={[styles.summaryCard, styles.summaryCardWide]}>
            <Text style={[styles.summaryLabel, { color: tokens.textFaint }]}>Balance</Text>
            <Text style={[styles.summaryValueWide, { color: tokens.red }]}>
              {formatINR(outstanding)}
            </Text>
          </Card>
        </View>

        <Card pad={16}>
          <Text style={[styles.sectionTitle, { color: tokens.text }]}>Add days</Text>
          <View style={styles.stepperRow}>
            <Pressable
              onPress={() => setAddDays((current) => Math.max(1, current - 5))}
              style={[
                styles.stepperButton,
                { backgroundColor: tokens.surface2, borderColor: tokens.border },
              ]}
            >
              <Ionicons name="remove" size={20} color={tokens.text} />
            </Pressable>
            <View style={styles.stepperValue}>
              <Text style={[styles.stepperNumber, { color: tokens.text }]}>{addDays}</Text>
              <Text style={[styles.stepperUnit, { color: tokens.textFaint }]}>days</Text>
            </View>
            <Pressable
              onPress={() => setAddDays((current) => current + 5)}
              style={[
                styles.stepperButton,
                { backgroundColor: tokens.surface2, borderColor: tokens.border },
              ]}
            >
              <Ionicons name="add" size={20} color={tokens.text} />
            </Pressable>
          </View>
        </Card>

        <View style={styles.choiceList}>
          <ExtendChoiceCard
            active={mode === 'keep_daily'}
            title="Keep same daily amount"
            value={`${formatINR(loan.dailyExpected)}/day`}
            subtitle="New days continue at the original daily payment"
            onPress={() => setMode('keep_daily')}
            tokens={tokens}
          />
          <ExtendChoiceCard
            active={mode === 'recalculate'}
            title="Recalculate daily amount"
            value={`${formatINR(recalcDaily)}/day`}
            subtitle="Spread the remaining balance evenly over the new days"
            onPress={() => setMode('recalculate')}
            tokens={tokens}
          />
          <ExtendChoiceCard
            active={mode === 'custom'}
            title="Custom amount"
            value={customDaily > 0 ? `${formatINR(customDaily)}/day` : 'Enter total'}
            subtitle="Enter a total amount to spread evenly over the new days"
            onPress={() => setMode('custom')}
            tokens={tokens}
          />
          {mode === 'custom' ? (
            <View
              style={[
                styles.customInputWrap,
                { backgroundColor: tokens.surface, borderColor: tokens.blue },
              ]}
            >
              <Text style={[styles.customCurrency, { color: tokens.textFaint }]}>₹</Text>
              <TextInput
                value={customTotal}
                onChangeText={setCustomTotal}
                placeholder="Total amount"
                placeholderTextColor={tokens.textFaint}
                keyboardType="decimal-pad"
                style={[styles.customInput, { color: tokens.text }]}
              />
            </View>
          ) : null}
        </View>

        {preview ? (
          <Card grad="green" pad={16}>
            <Text style={[styles.previewLabel, { color: tokens.textFaint }]}>After extension</Text>
            <PreviewRow
              label="New end date"
              value={formatStartDateLabel(preview.newEndDate, '2099-01-01')}
              tokens={tokens}
            />
            <PreviewRow
              label="New daily amount"
              value={`${formatINR(preview.newDailyExpected)}/day`}
              valueColor={tokens.green}
              tokens={tokens}
            />
            <PreviewRow
              label="Additional days"
              value={`+${preview.additionalDays} days`}
              tokens={tokens}
              last
            />
          </Card>
        ) : null}
      </ScrollView>

      <BottomActionBar>
        <PillButton
          variant="primary"
          full
          disabled={
            confirming || addDays <= 0 || (mode === 'custom' && customTotalValue <= 0)
          }
          onPress={() => void handleConfirm()}
        >
          {confirming ? 'Extending…' : 'Confirm extension'}
        </PillButton>
        <Pressable onPress={() => navigation.goBack()} style={styles.cancelButton}>
          <Text style={[styles.cancelText, { color: tokens.textSoft }]}>Cancel</Text>
        </Pressable>
      </BottomActionBar>
    </SafeAreaView>
  );
}

interface ExtendChoiceCardProps {
  active: boolean;
  title: string;
  value: string;
  subtitle: string;
  onPress: () => void;
  tokens: ReturnType<typeof useTheme>['tokens'];
}

function ExtendChoiceCard({
  active,
  title,
  value,
  subtitle,
  onPress,
  tokens,
}: ExtendChoiceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.choiceCard,
        {
          backgroundColor: active ? tokens.blueTint : tokens.surface,
          borderColor: active ? tokens.blue : tokens.borderSoft,
        },
      ]}
    >
      <View
        style={[
          styles.choiceRadio,
          {
            borderColor: active ? tokens.blue : tokens.border,
            backgroundColor: active ? tokens.blue : 'transparent',
          },
        ]}
      >
        {active ? <View style={styles.choiceRadioDot} /> : null}
      </View>
      <View style={styles.choiceBody}>
        <Text style={[styles.choiceTitle, { color: tokens.text }]}>{title}</Text>
        <Text style={[styles.choiceSubtitle, { color: tokens.textFaint }]}>{subtitle}</Text>
      </View>
      <Text style={[styles.choiceValue, { color: active ? tokens.blue : tokens.textSoft }]}>
        {value}
      </Text>
    </Pressable>
  );
}

interface PreviewRowProps {
  label: string;
  value: string;
  valueColor?: string;
  last?: boolean;
  tokens: ReturnType<typeof useTheme>['tokens'];
}

function PreviewRow({ label, value, valueColor, last = false, tokens }: PreviewRowProps) {
  return (
    <View style={[styles.previewRow, !last && { marginBottom: 11 }]}>
      <Text style={[styles.previewRowLabel, { color: tokens.textSoft }]}>{label}</Text>
      <Text style={[styles.previewRowValue, { color: valueColor ?? tokens.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },
  loaneeName: {
    fontSize: 15,
    fontWeight: '700',
  },
  endDateLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
  },
  summaryCardWide: {
    flex: 1.5,
  },
  summaryLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: -0.4,
  },
  summaryValueWide: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: -0.3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  stepperButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    alignItems: 'center',
    minWidth: 72,
  },
  stepperNumber: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 40,
  },
  stepperUnit: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  choiceList: {
    gap: 11,
  },
  customInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
  },
  customCurrency: {
    fontSize: 18,
    fontWeight: '700',
  },
  customInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
  choiceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  choiceRadio: {
    width: 24,
    height: 24,
    borderRadius: 99,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceRadioDot: {
    width: 9,
    height: 9,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
  },
  choiceBody: {
    flex: 1,
  },
  choiceTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  choiceSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
    lineHeight: 18,
  },
  choiceValue: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewRowLabel: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  previewRowValue: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: 6,
  },
  cancelText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
