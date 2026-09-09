import { Ionicons } from '@expo/vector-icons';
import {
  calculateLoan,
  formatINR,
  formatISODateLocal,
  paymentPeriodLabel,
  type RatePeriod,
} from '@lendledger/core';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState } from 'react';
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
import { SectionLabel } from '../components/create-loan/SectionLabel';
import { StartDateField } from '../components/create-loan/StartDateField';
import { Avatar, Card, PillButton } from '../components/ui';
import { useRepository } from '../context/AppProvider';
import { useTheme } from '../hooks/useTheme';
import type { RootStackScreenProps } from '../navigation/types';
import { formatStartDateLabel, isValidISODate } from '../utils/formatStartDate';
import { getLoaneeInitials } from '../utils/loanee';

const RATE_LABELS: Record<RatePeriod, string> = {
  day: 'per day',
  month: 'per month',
  year: 'per year',
};

export function CreateLoanScreen({ navigation, route }: RootStackScreenProps<'CreateLoan'>) {
  const snapshot = route.params?.calculatorSnapshot;
  const { resolvedTheme, tokens } = useTheme();
  const repository = useRepository();

  const scrollRef = useRef<ScrollView>(null);
  const [loanees, setLoanees] = useState<Awaited<ReturnType<typeof repository.listLoanees>>>([]);
  const [loadingLoanees, setLoadingLoanees] = useState(true);
  const [selectedLoaneeId, setSelectedLoaneeId] = useState<string | null>(
    route.params?.loaneeId ?? null,
  );
  const [query, setQuery] = useState('');
  const [startDate, setStartDate] = useState(snapshot?.startDate ?? formatISODateLocal(new Date()));
  const [showAddLoanee, setShowAddLoanee] = useState(false);
  const [newLoaneeName, setNewLoaneeName] = useState('');
  const [addingLoanee, setAddingLoanee] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLoanees = useCallback(async () => {
    setLoadingLoanees(true);
    try {
      const list = await repository.listLoanees();
      setLoanees(list);
    } finally {
      setLoadingLoanees(false);
    }
  }, [repository]);

  useFocusEffect(
    useCallback(() => {
      void loadLoanees();
      if (route.params?.loaneeId) {
        setSelectedLoaneeId(route.params.loaneeId);
      }
    }, [loadLoanees, route.params?.loaneeId]),
  );

  const terms = useMemo(() => {
    if (!snapshot) {
      return null;
    }

    try {
      return calculateLoan({
        principal: snapshot.principal,
        interestRate: snapshot.interestRate,
        ratePeriod: snapshot.ratePeriod,
        duration: snapshot.duration,
        durationUnit: snapshot.durationUnit,
        startDate,
      });
    } catch {
      return null;
    }
  }, [snapshot, startDate]);

  const filteredLoanees = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return loanees;
    }
    return loanees.filter((loanee) => loanee.name.toLowerCase().includes(needle));
  }, [loanees, query]);

  const handleQuickAddLoanee = useCallback(async () => {
    const name = newLoaneeName.trim();
    if (!name) {
      return;
    }

    setAddingLoanee(true);
    setError(null);

    try {
      const loanee = await repository.createLoanee({ name });
      setLoanees((current) => [...current, loanee].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedLoaneeId(loanee.id);
      setNewLoaneeName('');
      setShowAddLoanee(false);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Could not add loanee');
    } finally {
      setAddingLoanee(false);
    }
  }, [newLoaneeName, repository]);

  const handleCreateLoan = useCallback(async () => {
    if (!snapshot || !selectedLoaneeId || !terms || !isValidISODate(startDate)) {
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const loan = await repository.createLoan({
        loaneeId: selectedLoaneeId,
        principal: snapshot.principal,
        interestRate: snapshot.interestRate,
        ratePeriod: snapshot.ratePeriod,
        duration: snapshot.duration,
        durationUnit: snapshot.durationUnit,
        startDate,
      });

      navigation.replace('LoanDetail', { loanId: loan.id });
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Could not create loan');
    } finally {
      setCreating(false);
    }
  }, [navigation, repository, selectedLoaneeId, snapshot, startDate, terms]);

  if (!snapshot) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]}>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        <View style={styles.missingState}>
          <Text style={[styles.missingTitle, { color: tokens.text }]}>No loan terms yet</Text>
          <Text style={[styles.missingBody, { color: tokens.textSoft }]}>
            Run a calculation first, then tap Save as loan.
          </Text>
          <PillButton
            variant="primary"
            onPress={() => navigation.navigate('Main', { screen: 'Calculator' })}
          >
            Open calculator
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
        <Text style={[styles.headerTitle, { color: tokens.text }]}>Create loan</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 96 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <SectionLabel step={1} text="Select loanee" />
            <View
              style={[
                styles.searchWrap,
                { borderColor: tokens.border, backgroundColor: tokens.surface },
              ]}
            >
              <Ionicons name="search" size={18} color={tokens.textFaint} style={styles.searchIcon} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search loanees…"
                placeholderTextColor={tokens.textFaint}
                style={[styles.searchInput, { color: tokens.text }]}
              />
            </View>

            {loadingLoanees ? (
              <ActivityIndicator color={tokens.blue} style={styles.loader} />
            ) : (
              <View style={styles.loaneeChips}>
                {filteredLoanees.map((loanee) => {
                  const selected = selectedLoaneeId === loanee.id;
                  return (
                    <Pressable
                      key={loanee.id}
                      onPress={() => setSelectedLoaneeId(loanee.id)}
                      style={[
                        styles.loaneeChip,
                        {
                          borderColor: selected ? tokens.blue : tokens.border,
                          backgroundColor: selected ? tokens.blueTint : tokens.surface,
                        },
                      ]}
                    >
                      <Avatar
                        initials={getLoaneeInitials(loanee.name)}
                        size={26}
                        hue={loanee.avatarHue}
                      />
                      <Text
                        style={[
                          styles.loaneeChipLabel,
                          { color: selected ? tokens.blue : tokens.text },
                        ]}
                      >
                        {loanee.name}
                      </Text>
                      {selected ? <Ionicons name="checkmark" size={15} color={tokens.blue} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            )}

            {showAddLoanee ? (
              <View style={[styles.addLoaneeForm, { borderColor: tokens.borderSoft }]}>
                <TextInput
                  value={newLoaneeName}
                  onChangeText={setNewLoaneeName}
                  placeholder="Loanee name"
                  placeholderTextColor={tokens.textFaint}
                  style={[
                    styles.addLoaneeInput,
                    { color: tokens.text, borderColor: tokens.border, backgroundColor: tokens.surface },
                  ]}
                />
                <View style={styles.addLoaneeActions}>
                  <PillButton
                    variant="primary"
                    size="sm"
                    disabled={!newLoaneeName.trim() || addingLoanee}
                    onPress={handleQuickAddLoanee}
                  >
                    {addingLoanee ? 'Saving…' : 'Save & select'}
                  </PillButton>
                  <Pressable onPress={() => setShowAddLoanee(false)}>
                    <Text style={[styles.cancelAdd, { color: tokens.textSoft }]}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable onPress={() => setShowAddLoanee(true)} style={styles.addLoaneeLink}>
                <Ionicons name="add" size={18} color={tokens.blue} />
                <Text style={[styles.addLoaneeLinkText, { color: tokens.blue }]}>Add new loanee</Text>
              </Pressable>
            )}
          </View>

          <View>
            <SectionLabel step={2} text="Loan terms" />
            <Card grad="blue" pad={16} elev>
              {terms ? (
                <>
                  <View style={styles.termsGrid}>
                    <Term label="Principal" value={formatINR(terms.principal)} tokens={tokens} />
                    <Term
                      label="Rate"
                      value={`${snapshot.interestRate}% ${RATE_LABELS[snapshot.ratePeriod]}`}
                      tokens={tokens}
                    />
                    <Term
                      label="Duration"
                      value={`${Math.round(terms.durationDays)} days`}
                      tokens={tokens}
                    />
                    <Term
                      label={paymentPeriodLabel(snapshot.durationUnit)}
                      value={formatINR(terms.dailyExpected, true)}
                      accent={tokens.green}
                      tokens={tokens}
                    />
                  </View>
                  <View style={[styles.divider, { backgroundColor: tokens.borderSoft }]} />
                  <View style={styles.totalRow}>
                    <Text style={[styles.totalLabel, { color: tokens.textSoft }]}>Total repayable</Text>
                    <Text style={[styles.totalValue, { color: tokens.text }]}>
                      {formatINR(terms.totalExpected, true)}
                    </Text>
                  </View>
                  {terms.endDate ? (
                    <Text style={[styles.endHint, { color: tokens.textFaint }]}>
                      Ends {formatStartDateLabel(terms.endDate)}
                    </Text>
                  ) : null}
                </>
              ) : (
                <Text style={[styles.endHint, { color: tokens.red }]}>
                  Invalid start date for this loan term.
                </Text>
              )}
            </Card>
          </View>

          <View>
            <SectionLabel step={3} text="Start date" />
            <StartDateField
              value={startDate}
              onChange={setStartDate}
              onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
              hint={
                snapshot.durationUnit === 'months'
                  ? 'Monthly payments start from this date'
                  : snapshot.durationUnit === 'years'
                    ? 'Yearly payments start from this date'
                    : 'Daily payments start from this date'
              }
            />
          </View>

          {error ? <Text style={[styles.error, { color: tokens.red }]}>{error}</Text> : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomActionBar>
        <PillButton
          variant="primary"
          full
          disabled={!selectedLoaneeId || !terms || creating || !isValidISODate(startDate)}
          onPress={handleCreateLoan}
        >
          {creating ? 'Creating…' : 'Confirm & create loan'}
        </PillButton>
        <Pressable
          onPress={() => navigation.navigate('Main', { screen: 'Calculator' })}
          style={styles.backToCalc}
        >
          <Text style={[styles.backToCalcText, { color: tokens.textSoft }]}>Back to calculator</Text>
        </Pressable>
      </BottomActionBar>
    </SafeAreaView>
  );
}

function Term({
  label,
  value,
  accent,
  tokens,
}: {
  label: string;
  value: string;
  accent?: string;
  tokens: ReturnType<typeof useTheme>['tokens'];
}) {
  return (
    <View style={styles.termCell}>
      <Text style={[styles.termLabel, { color: tokens.textFaint }]}>{label}</Text>
      <Text style={[styles.termValue, { color: accent ?? tokens.text }]}>{value}</Text>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 20,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    height: 48,
    marginBottom: 11,
  },
  searchIcon: {
    marginLeft: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  loader: {
    marginVertical: 12,
  },
  loaneeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  loaneeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    paddingLeft: 7,
    paddingRight: 13,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  loaneeChipLabel: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  addLoaneeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  addLoaneeLinkText: {
    fontSize: 14,
    fontWeight: '700',
  },
  addLoaneeForm: {
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  addLoaneeInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  addLoaneeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cancelAdd: {
    fontSize: 14,
    fontWeight: '600',
  },
  termsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  termCell: {
    width: '47%',
    gap: 3,
  },
  termLabel: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  termValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  endHint: {
    fontSize: 12,
    marginTop: 8,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
  backToCalc: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  backToCalcText: {
    fontSize: 13.5,
    fontWeight: '600',
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
});
