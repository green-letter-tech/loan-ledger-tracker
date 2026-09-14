import { Ionicons } from '@expo/vector-icons';
import { formatINR } from '@lendledger/core';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { Avatar, Card, ProgressBar } from '../components/ui';
import { useRepository } from '../context/AppProvider';
import { useTheme } from '../hooks/useTheme';
import type { RootStackScreenProps } from '../navigation/types';
import { getLoaneeInitials } from '../utils/loanee';
import { loadActiveLoanCards, type ActiveLoanCard } from '../utils/dashboardLoans';

export function ActiveLoansScreen({ navigation }: RootStackScreenProps<'ActiveLoans'>) {
  const { resolvedTheme, tokens } = useTheme();
  const repository = useRepository();
  const [activeLoans, setActiveLoans] = useState<ActiveLoanCard[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLoans = useCallback(async () => {
    setLoading(true);
    try {
      const loans = await loadActiveLoanCards(repository);
      setActiveLoans(loans);
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useFocusEffect(
    useCallback(() => {
      void loadLoans();
    }, [loadLoans]),
  );

  const renderLoan = useCallback(
    ({ item }: { item: ActiveLoanCard }) => {
      const { loan, loanee, logged, total, outstanding } = item;
      return (
        <Card
          pad={14}
          onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
        >
          <View style={styles.loanRow}>
            <Avatar
              initials={loanee ? getLoaneeInitials(loanee.name) : '?'}
              size={42}
              hue={loanee?.avatarHue ?? 254}
            />
            <View style={styles.loanBody}>
              <View style={styles.loanTopRow}>
                <Text style={[styles.loanName, { color: tokens.text }]} numberOfLines={1}>
                  {loanee?.name ?? 'Unknown'}
                </Text>
                <Text style={[styles.loanDaily, { color: tokens.green }]}>
                  {formatINR(loan.dailyExpected)}/day
                </Text>
              </View>
              <View style={styles.loanMetaRow}>
                <Text style={[styles.loanMeta, { color: tokens.textFaint }]}>
                  {logged} of {total} days
                </Text>
                <Text style={[styles.loanMeta, { color: tokens.textSoft }]}>
                  {formatINR(outstanding)} left
                </Text>
              </View>
              <ProgressBar value={logged} max={total || 1} height={7} />
            </View>
          </View>
        </Card>
      );
    },
    [navigation, tokens],
  );

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
        <Text style={[styles.headerTitle, { color: tokens.text }]}>Active loans</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={tokens.blue} style={styles.loader} />
      ) : activeLoans.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="layers-outline" size={44} color={tokens.textFaint} />
          <Text style={[styles.emptyTitle, { color: tokens.text }]}>No active loans</Text>
          <Text style={[styles.emptyText, { color: tokens.textSoft }]}>
            All loans have been closed or completed.
          </Text>
        </View>
      ) : (
        <FlatList
          data={activeLoans}
          keyExtractor={(item) => item.loan.id}
          renderItem={renderLoan}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
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
    paddingBottom: 16,
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
  loader: {
    marginTop: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  loanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loanBody: {
    flex: 1,
    minWidth: 0,
  },
  loanTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
  },
  loanName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  loanDaily: {
    fontSize: 14,
    fontWeight: '700',
  },
  loanMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
    marginBottom: 8,
  },
  loanMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
});
