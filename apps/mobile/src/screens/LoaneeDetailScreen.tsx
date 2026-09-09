import { Ionicons } from '@expo/vector-icons';
import { formatINR, type Loanee } from '@lendledger/core';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomActionBar } from '../components/BottomActionBar';
import { Avatar, Card, PillButton, ProgressBar, StatusPill } from '../components/ui';
import { useRepository } from '../context/AppProvider';
import { useTheme } from '../hooks/useTheme';
import type { RootStackScreenProps } from '../navigation/types';
import { getLoaneeInitials } from '../utils/loanee';
import { confirmDestructiveAction, showAlert } from '../utils/confirmAction';
import { loanStatusToPill } from '../utils/loanStatusLabel';
import { loadLoaneeDetail, type LoanWithSummary } from '../utils/loanSummary';

export function LoaneeDetailScreen({ navigation, route }: RootStackScreenProps<'LoaneeDetail'>) {
  const { loaneeId } = route.params;
  const { resolvedTheme, tokens } = useTheme();
  const repository = useRepository();

  const [loanee, setLoanee] = useState<Loanee | null>(null);
  const [loans, setLoans] = useState<LoanWithSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await loadLoaneeDetail(repository, loaneeId);
      setLoanee(detail.loanee);
      setLoans(detail.loans);
      if (!detail.loanee) {
        setError('Loanee not found');
      }
    } finally {
      setLoading(false);
    }
  }, [loaneeId, repository]);

  useFocusEffect(
    useCallback(() => {
      void loadDetail();
    }, [loadDetail]),
  );

  const totalOutstanding = loans.reduce((sum, item) => sum + item.outstanding, 0);
  const hasActiveLoans = loans.length > 0;

  const openEdit = useCallback(() => {
    navigation.navigate('LoaneeForm', { loaneeId });
  }, [loaneeId, navigation]);

  const handlePhonePress = useCallback(() => {
    if (!loanee?.phone) {
      return;
    }
    const tel = loanee.phone.replace(/\s+/g, '');
    void Linking.openURL(`tel:${tel}`);
  }, [loanee?.phone]);

  const handleDelete = useCallback(() => {
    if (!loanee || hasActiveLoans || deleting) {
      return;
    }

    void (async () => {
      const confirmed = await confirmDestructiveAction(
        'Delete loanee',
        `Remove ${loanee.name}? This cannot be undone.`,
      );
      if (!confirmed) {
        return;
      }

      setDeleting(true);
      try {
        await repository.deleteLoanee(loanee.id);
        navigation.goBack();
      } catch (caught: unknown) {
        const message = caught instanceof Error ? caught.message : 'Could not delete loanee';
        showAlert('Cannot delete', message);
      } finally {
        setDeleting(false);
      }
    })();
  }, [deleting, hasActiveLoans, loanee, navigation, repository]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]} edges={['top', 'bottom']}>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        <ActivityIndicator color={tokens.blue} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!loanee) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]} edges={['top', 'bottom']}>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
        <View style={styles.missingState}>
          <Text style={[styles.missingTitle, { color: tokens.text }]}>Loanee not found</Text>
          {error ? <Text style={[styles.missingBody, { color: tokens.textSoft }]}>{error}</Text> : null}
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
        <Text style={[styles.headerTitle, { color: tokens.text }]}>Loanee</Text>
        <Pressable
          onPress={openEdit}
          style={[
            styles.editButton,
            { backgroundColor: tokens.surface, borderColor: tokens.borderSoft },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Edit loanee"
        >
          <Ionicons name="create-outline" size={18} color={tokens.blue} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileRow}>
          <Avatar initials={getLoaneeInitials(loanee.name)} size={68} hue={loanee.avatarHue} />
          <View style={styles.profileBody}>
            <Text style={[styles.profileName, { color: tokens.text }]}>{loanee.name}</Text>
            {loanee.phone ? (
              <Pressable onPress={handlePhonePress} style={styles.phoneRow}>
                <Ionicons name="call-outline" size={15} color={tokens.blue} />
                <Text style={[styles.phoneText, { color: tokens.blue }]}>{loanee.phone}</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {loanee.notes ? (
          <Card pad={14}>
            <View style={styles.notesRow}>
              <Ionicons name="document-text-outline" size={18} color={tokens.textFaint} />
              <Text style={[styles.notesText, { color: tokens.textSoft }]}>{loanee.notes}</Text>
            </View>
          </Card>
        ) : null}

        <View style={styles.statsCards}>
          <Card pad={14} style={styles.statCard}>
            <Text style={[styles.statLabel, { color: tokens.textFaint }]}>Active loans</Text>
            <Text style={[styles.statValue, { color: tokens.text }]}>{loans.length}</Text>
          </Card>
          <Card pad={14} style={styles.statCard}>
            <Text style={[styles.statLabel, { color: tokens.textFaint }]}>Outstanding</Text>
            <Text style={[styles.statValue, { color: tokens.amber }]}>
              {formatINR(totalOutstanding)}
            </Text>
          </Card>
        </View>

        <Text style={[styles.sectionTitle, { color: tokens.text }]}>Loans</Text>

        {loans.length === 0 ? (
          <Card pad={16}>
            <Text style={[styles.emptyLoans, { color: tokens.textSoft }]}>
              No active loans for this loanee yet.
            </Text>
          </Card>
        ) : (
          <View style={styles.loansList}>
            {loans.map(({ loan, outstanding, logged, total }) => (
              <Card
                key={loan.id}
                pad={14}
                onPress={() => navigation.navigate('LoanDetail', { loanId: loan.id })}
              >
                <View style={styles.loanHeader}>
                  <View style={styles.loanTitleRow}>
                    <Text style={[styles.loanPrincipal, { color: tokens.text }]}>
                      {formatINR(loan.principal)}
                    </Text>
                    <StatusPill status={loanStatusToPill(loan.status)} />
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={tokens.textFaint} />
                </View>
                <ProgressBar value={logged} max={total || 1} height={7} />
                <View style={styles.loanMeta}>
                  <Text style={[styles.loanMetaText, { color: tokens.textFaint }]}>
                    {logged}/{total} days
                  </Text>
                  <Text style={[styles.loanMetaText, { color: tokens.textSoft }]}>
                    {formatINR(loan.dailyExpected)}/day
                  </Text>
                </View>
                {outstanding > 0 ? (
                  <Text style={[styles.loanOutstanding, { color: tokens.amber }]}>
                    {formatINR(outstanding)} outstanding
                  </Text>
                ) : null}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomActionBar>
        <View style={styles.bottomActions}>
          <PillButton
            variant="soft"
            full
            disabled={hasActiveLoans || deleting}
            onPress={handleDelete}
            style={styles.bottomButton}
          >
            Delete
          </PillButton>
          <PillButton variant="primary" full onPress={openEdit} style={styles.bottomButton}>
            Edit
          </PillButton>
        </View>
        {hasActiveLoans ? (
          <View style={styles.deleteHint}>
            <Ionicons name="information-circle-outline" size={13} color={tokens.textFaint} />
            <Text style={[styles.deleteHintText, { color: tokens.textFaint }]}>
              Close active loans before deleting
            </Text>
          </View>
        ) : null}
      </BottomActionBar>
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
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
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
  missingBody: {
    fontSize: 14.5,
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  profileBody: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  phoneText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  notesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  notesText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20,
  },
  statsCards: {
    flexDirection: 'row',
    gap: 11,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: -4,
  },
  emptyLoans: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  loansList: {
    gap: 10,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
  },
  loanTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loanPrincipal: {
    fontSize: 15,
    fontWeight: '700',
  },
  loanMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  loanMetaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loanOutstanding: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 10,
  },
  bottomButton: {
    flex: 1,
  },
  deleteHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  deleteHintText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
});
