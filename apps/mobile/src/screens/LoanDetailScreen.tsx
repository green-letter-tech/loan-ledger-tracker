import { Ionicons } from '@expo/vector-icons';
import {
  formatINR,
  formatISODateLocal,
  paymentPeriodLabel,
  paymentProgressLabel,
  type DailyEntry,
  type Loan,
} from '@lendledger/core';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomActionBar } from '../components/BottomActionBar';
import { CloseLoanModal } from '../components/CloseLoanModal';
import { CustomAmountSheet } from '../components/CustomAmountSheet';
import { SegmentedControl } from '../components/SegmentedControl';
import { Card, PillButton, StatusPill } from '../components/ui';
import { useRepository } from '../context/AppProvider';
import { useTheme } from '../hooks/useTheme';
import type { RootStackScreenProps } from '../navigation/types';
import {
  buildLoanDetailSummary,
  currentEntrySectionLabel,
  dailyStatusToPill,
  filterHistoryEntries,
  formatEntryDateShort,
  resolveCurrentEntry,
  type EntryFilter,
} from '../utils/loanDetail';
import { formatStartDateLabel } from '../utils/formatStartDate';
import { loanStatusToPill } from '../utils/loanStatusLabel';
import { showAlert } from '../utils/confirmAction';
import type { ThemeTokens } from '../theme/tokens';

const FILTER_OPTIONS: ReadonlyArray<{ label: EntryFilter; value: EntryFilter }> = [
  { label: 'All', value: 'All' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Unpaid', value: 'Unpaid' },
  { label: 'Partial', value: 'Partial' },
];

export function LoanDetailScreen({ navigation, route }: RootStackScreenProps<'LoanDetail'>) {
  const { loanId } = route.params;
  const { resolvedTheme, tokens } = useTheme();
  const repository = useRepository();
  const todayIso = useMemo(() => formatISODateLocal(new Date()), []);

  const [loan, setLoan] = useState<Loan | null>(null);
  const [loaneeName, setLoaneeName] = useState('Loan');
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [filter, setFilter] = useState<EntryFilter>('All');
  const [loading, setLoading] = useState(true);
  const [savingDate, setSavingDate] = useState<string | null>(null);
  const [sheetEntry, setSheetEntry] = useState<DailyEntry | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closing, setClosing] = useState(false);

  const loadLoan = useCallback(async () => {
    setLoading(true);
    try {
      const loanData = await repository.getLoan(loanId);
      if (!loanData) {
        setLoan(null);
        setEntries([]);
        return;
      }

      const [loanees, entryList] = await Promise.all([
        repository.listLoanees(),
        repository.getDailyEntries(loanId),
      ]);

      const loanee = loanees.find((entry) => entry.id === loanData.loaneeId);
      setLoan(loanData);
      setLoaneeName(loanee?.name ?? 'Loan');
      setEntries(entryList);
    } finally {
      setLoading(false);
    }
  }, [loanId, repository]);

  useFocusEffect(
    useCallback(() => {
      void loadLoan();
    }, [loadLoan]),
  );

  const summary = useMemo(() => buildLoanDetailSummary(entries), [entries]);
  const activeEntry = useMemo(
    () => resolveCurrentEntry(entries, todayIso),
    [entries, todayIso],
  );
  const filteredHistory = useMemo(
    () => filterHistoryEntries(entries, filter, todayIso, activeEntry?.id),
    [entries, filter, todayIso, activeEntry?.id],
  );

  const updateEntry = useCallback(
    async (entryDate: string, receivedAmount: number) => {
      setSavingDate(entryDate);
      try {
        const updated = await repository.updateDailyEntry(loanId, entryDate, receivedAmount);
        setEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.entryDate === updated.entryDate ? updated : entry,
          ),
        );
      } finally {
        setSavingDate(null);
      }
    },
    [loanId, repository],
  );

  const handleMarkPaid = useCallback(
    (entry: DailyEntry) => {
      void updateEntry(entry.entryDate, entry.expectedAmount);
    },
    [updateEntry],
  );

  const handleMarkUnpaid = useCallback(
    (entry: DailyEntry) => {
      void updateEntry(entry.entryDate, 0);
    },
    [updateEntry],
  );

  const handleCloseLoan = useCallback(async () => {
    setClosing(true);
    try {
      await repository.closeLoan(loanId);
      setShowCloseModal(false);
      navigation.goBack();
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : 'Could not close loan';
      showAlert('Cannot close loan', message);
    } finally {
      setClosing(false);
    }
  }, [loanId, navigation, repository]);

  const isClosed = loan?.status === 'closed';

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]} edges={['top', 'bottom']}>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        <ActivityIndicator color={tokens.blue} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!loan) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]} edges={['top', 'bottom']}>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        <View style={styles.missingState}>
          <Text style={[styles.missingTitle, { color: tokens.text }]}>Loan not found</Text>
          <PillButton variant="primary" onPress={() => navigation.goBack()}>
            Go back
          </PillButton>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={[styles.headerTitle, { color: tokens.text }]} numberOfLines={1}>
          {loaneeName}
        </Text>
        <View style={styles.headerPill}>
          <StatusPill status={loanStatusToPill(loan.status)} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[...tokens.headerGrad]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Principal</Text>
              <Text style={styles.heroValue}>{formatINR(loan.principal)}</Text>
            </View>
            <View style={styles.heroRight}>
              <Text style={styles.heroLabel}>{paymentPeriodLabel(loan.durationUnit)}</Text>
              <Text style={styles.heroValue}>{formatINR(loan.dailyExpected)}</Text>
            </View>
          </View>

          <View style={styles.heroProgressMeta}>
            <Text style={styles.heroProgressText}>
              {summary.logged} of {summary.total} {paymentProgressLabel(loan.durationUnit)}
            </Text>
            <Text style={styles.heroProgressText}>{summary.progressPct}%</Text>
          </View>
          <View style={styles.heroProgressTrack}>
            <View
              style={[styles.heroProgressFill, { width: `${summary.progressPct}%` }]}
            />
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStatBox}>
              <Text style={styles.heroStatLabel}>Outstanding</Text>
              <Text style={styles.heroStatValue}>{formatINR(summary.outstanding)}</Text>
            </View>
            <View style={styles.heroStatBox}>
              <Text style={styles.heroStatLabel}>Collected</Text>
              <Text style={styles.heroStatValue}>{formatINR(summary.collected)}</Text>
            </View>
          </View>

          {summary.overpaymentCredit > 0 ? (
            <View style={styles.overpayBanner}>
              <Ionicons name="arrow-up" size={14} color="#FFFFFF" />
              <Text style={styles.overpayText}>
                {formatINR(summary.overpaymentCredit)} overpayment credit applied
              </Text>
            </View>
          ) : null}
        </LinearGradient>

        {activeEntry ? (
          <View>
            <Text style={[styles.sectionLabel, { color: tokens.textFaint }]}>
              {currentEntrySectionLabel(activeEntry, todayIso)}
            </Text>
            <Card pad={15} style={[styles.todayCard, { borderColor: tokens.blue }]}>
              <View style={styles.todayHeader}>
                <View>
                  <Text style={[styles.todayTitle, { color: tokens.text }]}>
                    {formatStartDateLabel(activeEntry.entryDate, todayIso)}
                  </Text>
                  <Text style={[styles.todaySub, { color: tokens.textFaint }]}>
                    Expected {formatINR(activeEntry.expectedAmount)}
                    {activeEntry.status === 'partial'
                      ? ` · paid ${formatINR(activeEntry.receivedAmount)}`
                      : ''}
                  </Text>
                </View>
                <View style={[styles.todayIcon, { backgroundColor: tokens.blueTint }]}>
                  <Ionicons name="time-outline" size={17} color={tokens.blue} />
                </View>
              </View>

              <View style={styles.todayActions}>
                <Pressable
                  onPress={() => handleMarkUnpaid(activeEntry)}
                  disabled={savingDate === activeEntry.entryDate}
                  style={[
                    styles.todayToggle,
                    {
                      borderColor:
                        activeEntry.status === 'unpaid' ? tokens.textFaint : tokens.border,
                      backgroundColor:
                        activeEntry.status === 'unpaid' ? tokens.surfaceSunken : tokens.surface,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.unpaidDot,
                      {
                        borderColor:
                          activeEntry.status === 'unpaid' ? tokens.text : tokens.textSoft,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.todayToggleText,
                      {
                        color: activeEntry.status === 'unpaid' ? tokens.text : tokens.textSoft,
                      },
                    ]}
                  >
                    Unpaid
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleMarkPaid(activeEntry)}
                  disabled={savingDate === activeEntry.entryDate}
                  style={[
                    styles.todayToggle,
                    styles.todayTogglePaid,
                    activeEntry.status === 'paid'
                      ? styles.todayTogglePaidActive
                      : { backgroundColor: tokens.greenTint },
                  ]}
                >
                  <Ionicons
                    name="checkmark"
                    size={19}
                    color={activeEntry.status === 'paid' ? '#FFFFFF' : tokens.green}
                  />
                  <Text
                    style={[
                      styles.todayToggleText,
                      { color: activeEntry.status === 'paid' ? '#FFFFFF' : tokens.green },
                    ]}
                  >
                    Paid
                  </Text>
                </Pressable>
              </View>

              <Pressable onPress={() => setSheetEntry(activeEntry)} style={styles.customAmountLink}>
                <Text style={[styles.customAmountText, { color: tokens.blue }]}>
                  Enter custom amount
                </Text>
              </Pressable>
            </Card>
          </View>
        ) : null}

        <View>
          <View style={styles.historyHeader}>
            <Text style={[styles.sectionLabel, { color: tokens.textFaint }]}>History</Text>
            <Text style={[styles.historyMeta, { color: tokens.textFaint }]}>
              {summary.logged} paid · {summary.unpaidDays} unpaid
            </Text>
          </View>

          <SegmentedControl options={FILTER_OPTIONS} value={filter} onChange={setFilter} />

          <Card pad={0} style={styles.historyCard}>
            {filteredHistory.length === 0 ? (
              <Text style={[styles.emptyHistory, { color: tokens.textFaint }]}>
                {filter === 'All'
                  ? 'No payment history yet'
                  : `No ${filter.toLowerCase()} payments`}
              </Text>
            ) : (
              filteredHistory.map((entry, index) => (
                <HistoryDayRow
                  key={entry.id}
                  entry={entry}
                  last={index === filteredHistory.length - 1}
                  onPress={() => setSheetEntry(entry)}
                  tokens={tokens}
                />
              ))
            )}
          </Card>
        </View>
      </ScrollView>

      <BottomActionBar>
        <View style={styles.bottomActions}>
          <PillButton
            variant="outline"
            full
            disabled={isClosed}
            onPress={() => navigation.navigate('ExtendLoan', { loanId: loan.id })}
            style={styles.bottomButton}
          >
            Extend loan
          </PillButton>
          <PillButton
            variant="danger"
            full
            disabled={isClosed}
            onPress={() => setShowCloseModal(true)}
            style={styles.bottomButton}
          >
            Close loan
          </PillButton>
        </View>
      </BottomActionBar>

      <CloseLoanModal
        visible={showCloseModal}
        outstanding={summary.outstanding}
        closing={closing}
        onCancel={() => setShowCloseModal(false)}
        onConfirm={() => void handleCloseLoan()}
      />

      <CustomAmountSheet
        visible={sheetEntry !== null}
        entryDate={sheetEntry?.entryDate ?? todayIso}
        expectedAmount={sheetEntry?.expectedAmount ?? loan.dailyExpected}
        initialAmount={sheetEntry?.receivedAmount ?? 0}
        onClose={() => setSheetEntry(null)}
        onSave={(amount) => {
          if (sheetEntry) {
            void updateEntry(sheetEntry.entryDate, amount).then(() => setSheetEntry(null));
          }
        }}
      />
    </SafeAreaView>
  );
}

interface HistoryDayRowProps {
  entry: DailyEntry;
  last: boolean;
  onPress: () => void;
  tokens: ThemeTokens;
}

function HistoryDayRow({ entry, last, onPress, tokens }: HistoryDayRowProps) {
  const isPartial = entry.status === 'partial';
  const pill = dailyStatusToPill(entry.status);
  const iconBg =
    entry.status === 'paid'
      ? tokens.greenTint
      : entry.status === 'partial'
        ? tokens.amberTint
        : tokens.surfaceSunken;
  const iconColor =
    entry.status === 'paid'
      ? tokens.green
      : entry.status === 'partial'
        ? tokens.amber
        : tokens.textFaint;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.historyRow,
        !last && { borderBottomWidth: 1, borderBottomColor: tokens.borderSoft },
      ]}
    >
      <View style={[styles.historyIcon, { backgroundColor: iconBg }]}>
        {entry.status === 'paid' ? (
          <Ionicons name="checkmark" size={17} color={iconColor} />
        ) : entry.status === 'partial' ? (
          <Ionicons name="cash-outline" size={17} color={iconColor} />
        ) : (
          <View style={[styles.historyUnpaidDot, { borderColor: iconColor }]} />
        )}
      </View>
      <View style={styles.historyBody}>
        <Text style={[styles.historyDate, { color: tokens.text }]}>
          {formatEntryDateShort(entry.entryDate)}
        </Text>
        <Text style={[styles.historyExpected, { color: tokens.textFaint }]}>
          Expected {formatINR(entry.expectedAmount)}
          {isPartial ? ` · paid ${formatINR(entry.receivedAmount)}` : ''}
        </Text>
      </View>
      {isPartial ? (
        <Text style={[styles.historyPartialAmount, { color: tokens.amber }]}>
          {formatINR(entry.receivedAmount)} / {formatINR(entry.expectedAmount)}
        </Text>
      ) : (
        <StatusPill status={pill} />
      )}
    </Pressable>
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
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerPill: {
    marginLeft: 'auto',
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
    gap: 14,
  },
  hero: {
    borderRadius: 22,
    padding: 18,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroRight: {
    alignItems: 'flex-end',
  },
  heroLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  heroValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
  },
  heroProgressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  heroProgressText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
  },
  heroProgressTrack: {
    height: 9,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 99,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  heroStatBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  heroStatLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  heroStatValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  overpayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 11,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  overpayText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 9,
    marginLeft: 2,
  },
  todayCard: {
    borderWidth: 2,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  todaySub: {
    fontSize: 12.5,
    marginTop: 2,
  },
  todayIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayActions: {
    flexDirection: 'row',
    gap: 10,
  },
  todayToggle: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  todayTogglePaid: {
    borderWidth: 0,
  },
  todayTogglePaidActive: {
    backgroundColor: '#22A56A',
  },
  todayToggleText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  unpaidDot: {
    width: 18,
    height: 18,
    borderRadius: 99,
    borderWidth: 2,
  },
  customAmountLink: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 2,
  },
  customAmountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },
  historyMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyCard: {
    marginTop: 12,
    overflow: 'hidden',
  },
  emptyHistory: {
    padding: 28,
    textAlign: 'center',
    fontSize: 13.5,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  historyIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyUnpaidDot: {
    width: 9,
    height: 9,
    borderRadius: 99,
    borderWidth: 2,
  },
  historyBody: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  historyExpected: {
    fontSize: 12,
    marginTop: 1,
  },
  historyPartialAmount: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 10,
  },
  bottomButton: {
    flex: 1,
  },
});
