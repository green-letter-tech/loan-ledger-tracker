import { Ionicons } from '@expo/vector-icons';
import { formatINR } from '@lendledger/core';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SegmentedControl } from '../components/SegmentedControl';
import { TabScreenLayout } from '../components/TabScreenLayout';
import { Avatar, Card, PillButton } from '../components/ui';
import { FLOATING_DOCK_CLEARANCE } from '../constants/floatingDock';
import { useRepository } from '../context/AppProvider';
import { useTabBarMotion } from '../context/TabBarMotionProvider';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useTheme } from '../hooks/useTheme';
import type { TabScreenProps } from '../navigation/types';
import { getLoaneeInitials } from '../utils/loanee';
import {
  filterAndSortLoaneeItems,
  type LoaneeSortKey,
} from '../utils/loaneeList';
import { loadLoaneesWithStats, type LoaneeListItem } from '../utils/loanSummary';

const SORT_OPTIONS: ReadonlyArray<{ label: string; value: LoaneeSortKey }> = [
  { label: 'Name', value: 'name' },
  { label: 'Outstanding', value: 'outstanding' },
  { label: 'Active', value: 'activeLoans' },
];

export function LoaneesScreen({ navigation }: TabScreenProps<'Loanees'>) {
  const { tokens } = useTheme();
  const repository = useRepository();
  const { reportScroll } = useTabBarMotion();

  const [items, setItems] = useState<LoaneeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<LoaneeSortKey>('name');

  const loadLoanees = useCallback(async (options?: { quiet?: boolean }) => {
    if (!options?.quiet) {
      setLoading(true);
    }
    try {
      const next = await loadLoaneesWithStats(repository);
      setItems(next);
    } finally {
      if (!options?.quiet) {
        setLoading(false);
      }
    }
  }, [repository]);

  const reloadQuiet = useCallback(() => loadLoanees({ quiet: true }), [loadLoanees]);
  const { refreshing, onRefresh } = usePullToRefresh(reloadQuiet);

  useFocusEffect(
    useCallback(() => {
      void loadLoanees();
    }, [loadLoanees]),
  );

  const visibleItems = useMemo(
    () => filterAndSortLoaneeItems(items, query, sort),
    [items, query, sort],
  );

  const openAddLoanee = useCallback(() => {
    navigation.navigate('LoaneeForm', {});
  }, [navigation]);

  const headerRight = (
    <Pressable
      onPress={openAddLoanee}
      style={[styles.addButton, { backgroundColor: tokens.blueTint, borderColor: tokens.borderSoft }]}
      accessibilityRole="button"
      accessibilityLabel="Add loanee"
    >
      <Ionicons name="add" size={22} color={tokens.blue} />
    </Pressable>
  );

  const subtitle =
    items.length > 0
      ? `${items.length} ${items.length === 1 ? 'person' : 'people'}`
      : undefined;

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => {
        void onRefresh();
      }}
      tintColor={tokens.blue}
      colors={[tokens.blue]}
    />
  );

  const searchAndSort = (
    <View style={styles.controls}>
      <View
        style={[
          styles.searchField,
          { backgroundColor: tokens.surface, borderColor: tokens.borderSoft },
        ]}
      >
        <Ionicons name="search" size={18} color={tokens.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name or phone"
          placeholderTextColor={tokens.textFaint}
          style={[styles.searchInput, { color: tokens.text }]}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>
      <SegmentedControl options={SORT_OPTIONS} value={sort} onChange={setSort} />
    </View>
  );

  return (
    <TabScreenLayout title="Loanees" subtitle={subtitle} headerRight={headerRight}>
      {loading ? (
        <ActivityIndicator color={tokens.blue} style={styles.loader} />
      ) : items.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          onScroll={(event) => reportScroll(event.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emptyWrap}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: tokens.greenTint, borderColor: tokens.borderSoft },
              ]}
            >
              <Ionicons name="people" size={48} color={tokens.green} />
            </View>
            <Text style={[styles.emptyTitle, { color: tokens.text }]}>No loanees yet</Text>
            <Text style={[styles.emptySubtitle, { color: tokens.textSoft }]}>
              Add the people you lend to so you can track their daily repayments.
            </Text>
            <PillButton variant="green" onPress={openAddLoanee}>
              Add loanee
            </PillButton>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          onScroll={(event) => reportScroll(event.nativeEvent.contentOffset.y)}
          scrollEventThrottle={16}
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {searchAndSort}
          {visibleItems.length === 0 ? (
            <View style={styles.noMatches}>
              <Text style={[styles.emptyTitle, { color: tokens.text }]}>No matches</Text>
              <Text style={[styles.emptySubtitle, { color: tokens.textSoft }]}>
                Try a different name or phone number.
              </Text>
            </View>
          ) : (
            visibleItems.map(({ loanee, activeLoans, outstanding }) => (
              <Card
                key={loanee.id}
                pad={14}
                onPress={() => navigation.navigate('LoaneeDetail', { loaneeId: loanee.id })}
              >
                <View style={styles.row}>
                  <Avatar
                    initials={getLoaneeInitials(loanee.name)}
                    size={48}
                    hue={loanee.avatarHue}
                  />
                  <View style={styles.rowBody}>
                    <Text style={[styles.loaneeName, { color: tokens.text }]}>{loanee.name}</Text>
                    {loanee.phone ? (
                      <Text style={[styles.loaneePhone, { color: tokens.textFaint }]}>
                        {loanee.phone}
                      </Text>
                    ) : null}
                    <View style={styles.statsRow}>
                      <Text style={[styles.statsText, { color: tokens.textSoft }]}>
                        {activeLoans} active loan{activeLoans === 1 ? '' : 's'}
                      </Text>
                      {activeLoans > 0 ? (
                        <>
                          <View style={[styles.statsDot, { backgroundColor: tokens.textFaint }]} />
                          <Text style={[styles.outstanding, { color: tokens.amber }]}>
                            {formatINR(outstanding)} out
                          </Text>
                        </>
                      ) : null}
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={tokens.textFaint} />
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      )}
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginTop: 40,
  },
  controls: {
    gap: 10,
    marginBottom: 4,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    padding: 0,
  },
  emptyScroll: {
    flexGrow: 1,
    paddingBottom: FLOATING_DOCK_CLEARANCE,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
    gap: 8,
  },
  noMatches: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyIcon: {
    width: 110,
    height: 110,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 250,
    marginBottom: 18,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: FLOATING_DOCK_CLEARANCE,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  loaneeName: {
    fontSize: 15.5,
    fontWeight: '700',
  },
  loaneePhone: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },
  statsText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  statsDot: {
    width: 3,
    height: 3,
    borderRadius: 99,
  },
  outstanding: {
    fontSize: 12.5,
    fontWeight: '700',
  },
});
