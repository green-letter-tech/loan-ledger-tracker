import { Ionicons } from '@expo/vector-icons';
import { formatINR, type DashboardStats, type ThemeSetting } from '@lendledger/core';
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

import { BarChartWeek } from '../components/charts/BarChartWeek';
import { DonutChart } from '../components/charts/DonutChart';
import { LineChartCollections } from '../components/charts/LineChartCollections';
import { Avatar, Card, Logo, PillButton, ProgressBar } from '../components/ui';
import { useRepository } from '../context/AppProvider';
import { useTheme } from '../hooks/useTheme';
import type { TabScreenProps } from '../navigation/types';
import {
  donutSlicesWithColors,
  loadActiveLoanCards,
  type ActiveLoanCard,
} from '../utils/dashboardLoans';
import { getLoaneeInitials } from '../utils/loanee';

const DONUT_COLORS = ['#3681D7', '#22A56A', '#E19B34', '#9B59B6', '#E74C3C', '#16A085'] as const;

export function DashboardScreen({ navigation }: TabScreenProps<'Home'>) {
  const { resolvedTheme, tokens, setThemePreference } = useTheme();
  const repository = useRepository();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeLoans, setActiveLoans] = useState<ActiveLoanCard[]>([]);
  const [loading, setLoading] = useState(true);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    [],
  );

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardStats, loanCards] = await Promise.all([
        repository.getDashboardStats(),
        loadActiveLoanCards(repository),
      ]);
      setStats(dashboardStats);
      setActiveLoans(loanCards);
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

  const donutSlices = useMemo(() => {
    if (!stats) {
      return [];
    }
    return donutSlicesWithColors(stats.donutByLoanee, DONUT_COLORS).map((slice) => ({
      loaneeId: slice.loaneeId,
      loaneeName: slice.loaneeName,
      value: slice.value,
      color: slice.color,
    }));
  }, [stats]);

  const collectionsTotal = useMemo(() => {
    if (!stats?.line30d.length) {
      return 0;
    }
    return stats.line30d[stats.line30d.length - 1]?.cumulative ?? 0;
  }, [stats]);

  const toggleTheme = useCallback(async () => {
    const next: ThemeSetting = resolvedTheme === 'dark' ? 'light' : 'dark';
    setThemePreference(next);
    await repository.updateSettings({ theme: next });
  }, [repository, resolvedTheme, setThemePreference]);

  const isEmpty = !loading && (stats?.activeCount ?? 0) === 0;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]} edges={['top']}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Logo size={40} />
          <View>
            <Text style={[styles.appTitle, { color: tokens.text }]}>LendLedger</Text>
            {!isEmpty ? (
              <Text style={[styles.dateLabel, { color: tokens.textFaint }]}>{todayLabel}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={[styles.iconButton, { backgroundColor: tokens.surface2, borderColor: tokens.borderSoft }]}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Ionicons name="notifications-outline" size={18} color={tokens.textSoft} />
          </Pressable>
          <Pressable
            onPress={toggleTheme}
            style={[styles.iconButton, { backgroundColor: tokens.surface2, borderColor: tokens.borderSoft }]}
            accessibilityRole="button"
            accessibilityLabel="Toggle theme"
          >
            <Ionicons
              name={resolvedTheme === 'dark' ? 'sunny-outline' : 'moon-outline'}
              size={18}
              color={tokens.textSoft}
            />
          </Pressable>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={tokens.blue} style={styles.loader} />
      ) : isEmpty ? (
        <View style={styles.emptyWrap}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: tokens.blueTint, borderColor: tokens.borderSoft },
            ]}
          >
            <Ionicons name="cash-outline" size={50} color={tokens.blue} />
          </View>
          <Text style={[styles.emptyTitle, { color: tokens.text }]}>No loans yet</Text>
          <Text style={[styles.emptySubtitle, { color: tokens.textSoft }]}>
            Run a quick calculation to set up your first daily-repayment loan and start tracking
            collections.
          </Text>
          <PillButton variant="primary" onPress={() => navigation.navigate('Calculator')}>
            Open calculator
          </PillButton>
          <Pressable onPress={() => navigation.navigate('LoaneeForm', {})}>
            <Text style={[styles.emptyLink, { color: tokens.blue }]}>+ Add a loanee first</Text>
          </Pressable>
        </View>
      ) : stats ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statGrid}>
            <StatCard
              label="Total loaned"
              value={formatINR(stats.totalLoaned)}
              icon="arrow-up"
              iconColor={tokens.blue}
              iconBg={tokens.surface2}
              tokens={tokens}
              grad="blue"
            />
            <StatCard
              label="Total received"
              value={formatINR(stats.totalReceived)}
              icon="arrow-down"
              iconColor={tokens.green}
              iconBg={tokens.surface2}
              tokens={tokens}
              grad="green"
            />
            <StatCard
              label="Outstanding"
              value={formatINR(stats.outstanding)}
              icon="wallet-outline"
              iconColor={tokens.amber}
              iconBg={tokens.amberTint}
              tokens={tokens}
              valueColor={tokens.amber}
            />
            <StatCard
              label="Active loans"
              value={String(stats.activeCount)}
              icon="layers-outline"
              iconColor={tokens.text}
              iconBg={tokens.surface2}
              tokens={tokens}
              large
            />
          </View>

          <View style={styles.quickActions}>
            <PillButton
              variant="primary"
              size="md"
              full
              onPress={() => navigation.navigate('Calculator')}
              style={styles.quickActionPrimary}
            >
              New calculation
            </PillButton>
            <PillButton
              variant="outline"
              size="md"
              onPress={() => navigation.navigate('LoaneeForm', {})}
            >
              Loanee
            </PillButton>
          </View>

          <Card pad={16}>
            <Text style={[styles.chartTitle, { color: tokens.text }]}>Outstanding by loanee</Text>
            <Text style={[styles.chartSubtitle, { color: tokens.textFaint }]}>
              {formatINR(stats.outstanding)} across {stats.activeCount} loans
            </Text>
            <View style={styles.donutRow}>
              <DonutChart
                slices={donutSlices}
                totalLabel={formatINR(stats.outstanding)}
              />
              <View style={styles.donutLegend}>
                {donutSlices.map((slice) => (
                  <View key={slice.loaneeId} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
                    <Text
                      style={[styles.legendName, { color: tokens.textSoft }]}
                      numberOfLines={1}
                    >
                      {slice.loaneeName}
                    </Text>
                    <Text style={[styles.legendValue, { color: tokens.text }]}>
                      {formatINR(slice.value)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>

          <Card pad={16}>
            <View style={styles.barHeader}>
              <View>
                <Text style={[styles.chartTitle, { color: tokens.text }]}>This week</Text>
                <Text style={[styles.chartSubtitle, { color: tokens.textFaint }]}>
                  Expected vs received
                </Text>
              </View>
              <View style={styles.barLegend}>
                <LegendSwatch label="Expected" color={tokens.surfaceSunken} border={tokens.border} />
                <LegendSwatch label="Received" color={tokens.green} />
              </View>
            </View>
            <BarChartWeek data={stats.weeklyBar} />
          </Card>

          <Card pad={16}>
            <View style={styles.lineHeader}>
              <View>
                <Text style={[styles.chartTitle, { color: tokens.text }]}>Collections</Text>
                <Text style={[styles.chartSubtitle, { color: tokens.textFaint }]}>
                  Last 30 days
                </Text>
              </View>
              <View style={styles.lineTotal}>
                <Text style={[styles.lineTotalValue, { color: tokens.green }]}>
                  +{formatINR(collectionsTotal)}
                </Text>
                <Text style={[styles.lineTotalCaption, { color: tokens.textFaint }]}>collected</Text>
              </View>
            </View>
            <LineChartCollections points={stats.line30d} />
          </Card>

          <View style={styles.activeHeader}>
            <Text style={[styles.activeTitle, { color: tokens.text }]}>Active loans</Text>
            <Pressable onPress={() => navigation.navigate('Loanees')}>
              <Text style={[styles.seeAll, { color: tokens.blue }]}>See all</Text>
            </Pressable>
          </View>

          <View style={styles.activeList}>
            {activeLoans.slice(0, 3).map(({ loan, loanee, logged, total, outstanding }) => (
              <Card
                key={loan.id}
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
            ))}
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  tokens: ReturnType<typeof useTheme>['tokens'];
  grad?: 'blue' | 'green';
  valueColor?: string;
  large?: boolean;
}

function StatCard({
  label,
  value,
  icon,
  iconColor,
  iconBg,
  tokens,
  grad,
  valueColor,
  large,
}: StatCardProps) {
  return (
    <Card grad={grad ?? 'none'} pad={14} style={styles.statCard}>
      <View style={styles.statTop}>
        <Text style={[styles.statLabel, { color: tokens.textSoft }]}>{label}</Text>
        <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={15} color={iconColor} />
        </View>
      </View>
      <Text
        style={[
          large ? styles.statValueLarge : styles.statValue,
          { color: valueColor ?? tokens.text },
        ]}
      >
        {value}
      </Text>
    </Card>
  );
}

function LegendSwatch({
  label,
  color,
  border,
}: {
  label: string;
  color: string;
  border?: string;
}) {
  const { tokens } = useTheme();

  return (
    <View style={styles.legendSwatchRow}>
      <View
        style={[
          styles.legendSwatch,
          { backgroundColor: color, borderColor: border ?? 'transparent', borderWidth: border ? 1 : 0 },
        ]}
      />
      <Text style={[styles.legendSwatchLabel, { color: tokens.textSoft }]}>{label}</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 20,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 9,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginTop: 40,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
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
  },
  emptySubtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 260,
    marginBottom: 18,
  },
  emptyLink: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 11,
  },
  statCard: {
    width: '47.5%',
  },
  statTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  statIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 10,
  },
  statValueLarge: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginTop: 10,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionPrimary: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  chartSubtitle: {
    fontSize: 12.5,
    marginTop: 4,
    marginBottom: 14,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  donutLegend: {
    flex: 1,
    gap: 9,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 99,
  },
  legendName: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
  },
  legendValue: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  barLegend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendSwatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendSwatch: {
    width: 9,
    height: 9,
    borderRadius: 3,
  },
  legendSwatchLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  lineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  lineTotal: {
    alignItems: 'flex-end',
  },
  lineTotalValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  lineTotalCaption: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  activeTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeList: {
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
