import { Ionicons } from '@expo/vector-icons';
import {
  formatINR,
  formatISODateLocal,
  type DatedEntry,
  type ISODateString,
} from '@lendledger/core';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomActionBar } from '../components/BottomActionBar';
import { ConfirmModal } from '../components/ConfirmModal';
import { DatePickerSheet } from '../components/DatePickerSheet';
import { Card, PillButton } from '../components/ui';
import { useRepository } from '../context/AppProvider';
import { useTheme } from '../hooks/useTheme';
import type { RootStackScreenProps } from '../navigation/types';
import type { ThemeTokens } from '../theme/tokens';
import {
  describeSummary,
  diffRows,
  hasInvalidRow,
  initialRows,
  isRowValid,
  resolveAmount,
  setRowAmount,
  summarizeRows,
  toggleRow,
  toggleSelectAll,
  type BulkRow,
} from '../utils/bulkUpdate';
import { showAlert } from '../utils/confirmAction';
import { formatStartDateLabel } from '../utils/formatStartDate';

export function BulkUpdateScreen({ navigation, route }: RootStackScreenProps<'BulkUpdate'>) {
  const { resolvedTheme, tokens } = useTheme();
  const repository = useRepository();
  const todayIso = useMemo(() => formatISODateLocal(new Date()), []);

  // Collections can be backfilled but never recorded ahead of time.
  const requestedDate = route.params?.entryDate;
  const [entryDate, setEntryDate] = useState<ISODateString>(
    requestedDate && requestedDate <= todayIso ? requestedDate : todayIso,
  );
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [notDueCount, setNotDueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDate, setPendingDate] = useState<ISODateString | null>(null);

  const load = useCallback(
    async (date: ISODateString) => {
      setLoading(true);
      try {
        const [items, activeLoans] = await Promise.all([
          repository.listEntriesForDate(date),
          repository.listActiveLoans(),
        ]);
        setRows(initialRows(items as DatedEntry[]));
        setNotDueCount(Math.max(0, activeLoans.length - items.length));
      } finally {
        setLoading(false);
      }
    },
    [repository],
  );

  useEffect(() => {
    void load(entryDate);
  }, [load, entryDate]);

  const updates = useMemo(() => diffRows(rows), [rows]);
  const invalid = useMemo(() => hasInvalidRow(rows), [rows]);
  const summary = useMemo(() => summarizeRows(rows), [rows]);
  const allChecked = rows.length > 0 && rows.every((row) => row.checked);

  const applyDate = useCallback((date: ISODateString) => {
    setEntryDate(date);
    setPendingDate(null);
  }, []);

  const handleDateSelect = useCallback(
    (date: ISODateString) => {
      setShowDatePicker(false);
      if (date === entryDate) {
        return;
      }
      // Unsaved edits would be silently dropped by reloading, so ask first.
      if (updates.length > 0) {
        setPendingDate(date);
        return;
      }
      applyDate(date);
    },
    [applyDate, entryDate, updates.length],
  );

  const handleSubmit = useCallback(async () => {
    setSaving(true);
    try {
      const result = await repository.bulkUpdateDailyEntries(entryDate, updates);
      setShowConfirm(false);

      const skippedNote =
        result.skipped.length > 0 ? ` · ${result.skipped.length} skipped` : '';
      showAlert(
        'Collections recorded',
        `Updated ${result.updated} ${result.updated === 1 ? 'loan' : 'loans'}${skippedNote}`,
      );
      navigation.goBack();
    } catch (caught: unknown) {
      const message = caught instanceof Error ? caught.message : 'Could not save collections';
      showAlert('Cannot save collections', message);
    } finally {
      setSaving(false);
    }
  }, [entryDate, navigation, repository, updates]);

  const renderRow = useCallback(
    ({ item }: { item: BulkRow }) => (
      <BulkUpdateRow
        row={item}
        tokens={tokens}
        onToggle={() => setRows((prev) => toggleRow(prev, item.loanId))}
        onChangeAmount={(text) => setRows((prev) => setRowAmount(prev, item.loanId, text))}
      />
    ),
    [tokens],
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
        <Text style={[styles.headerTitle, { color: tokens.text }]}>Bulk update</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={[
            styles.dateField,
            { backgroundColor: tokens.surface, borderColor: tokens.border },
          ]}
          accessibilityRole="button"
        >
          <Ionicons name="calendar-outline" size={18} color={tokens.blue} />
          <Text style={[styles.dateText, { color: tokens.text }]}>
            {formatStartDateLabel(entryDate, todayIso)}
          </Text>
          <Ionicons name="chevron-down" size={16} color={tokens.textFaint} />
        </Pressable>

        <Text style={[styles.meta, { color: tokens.textFaint }]}>
          {rows.length} due
          {notDueCount > 0 ? ` · ${notDueCount} not due` : ''}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={tokens.blue} style={styles.loader} />
      ) : rows.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-clear-outline" size={44} color={tokens.textFaint} />
          <Text style={[styles.emptyTitle, { color: tokens.text }]}>Nothing due</Text>
          <Text style={[styles.emptyText, { color: tokens.textSoft }]}>
            No active loan has a payment scheduled for this date.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(row) => row.loanId}
          renderItem={renderRow}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <Pressable
              onPress={() => setRows((prev) => toggleSelectAll(prev, !allChecked))}
              style={[
                styles.selectAll,
                { backgroundColor: tokens.surface, borderColor: tokens.borderSoft },
              ]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: allChecked }}
            >
              <Checkbox checked={allChecked} tokens={tokens} />
              <Text style={[styles.selectAllText, { color: tokens.text }]}>
                {allChecked ? 'Unselect all' : 'Select all as paid'}
              </Text>
            </Pressable>
          }
        />
      )}

      {rows.length > 0 ? (
        <BottomActionBar>
          {invalid ? (
            <Text style={[styles.errorHint, { color: tokens.red }]}>
              Fix the highlighted amounts to continue
            </Text>
          ) : updates.length > 0 ? (
            <Text style={[styles.summaryHint, { color: tokens.textFaint }]}>
              {describeSummary(summary)}
            </Text>
          ) : null}
          <PillButton
            variant="primary"
            full
            disabled={invalid || updates.length === 0 || saving}
            onPress={() => setShowConfirm(true)}
          >
            {`Submit ${updates.length > 0 ? updates.length : ''}`.trim()}
          </PillButton>
        </BottomActionBar>
      ) : null}

      <DatePickerSheet
        visible={showDatePicker}
        value={entryDate}
        maxDate={todayIso}
        title="Collection date"
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateSelect}
      />

      <ConfirmModal
        visible={showConfirm}
        title="Record collections"
        message={`${updates.length} ${updates.length === 1 ? 'loan' : 'loans'} for ${formatStartDateLabel(entryDate, todayIso)}${describeSummary(summary) ? `\n${describeSummary(summary)}` : ''}`}
        confirmLabel="Submit"
        busy={saving}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => void handleSubmit()}
      />

      <ConfirmModal
        visible={pendingDate !== null}
        title="Discard changes?"
        message={`You have ${updates.length} unsaved ${updates.length === 1 ? 'change' : 'changes'} for this date.`}
        confirmLabel="Discard"
        destructive
        onCancel={() => setPendingDate(null)}
        onConfirm={() => {
          if (pendingDate) {
            applyDate(pendingDate);
          }
        }}
      />
    </SafeAreaView>
  );
}

interface BulkUpdateRowProps {
  row: BulkRow;
  tokens: ThemeTokens;
  onToggle: () => void;
  onChangeAmount: (text: string) => void;
}

function BulkUpdateRow({ row, tokens, onToggle, onChangeAmount }: BulkUpdateRowProps) {
  const valid = isRowValid(row);
  const amount = resolveAmount(row);
  const overpaid = valid && !row.checked && amount > row.expected;

  return (
    <Card pad={0} style={styles.rowCard}>
      <View style={styles.rowInner}>
        <Pressable onPress={onToggle} style={styles.rowMain} accessibilityRole="checkbox" accessibilityState={{ checked: row.checked }}>
          <Checkbox checked={row.checked} tokens={tokens} />
          <View style={styles.rowBody}>
            <Text style={[styles.rowName, { color: tokens.text }]} numberOfLines={1}>
              {row.loaneeName}
            </Text>
            <Text style={[styles.rowMeta, { color: tokens.textFaint }]} numberOfLines={1}>
              Due {formatINR(row.expected)} · {row.loanLabel}
            </Text>
          </View>
        </Pressable>

        {row.checked ? (
          <Text style={[styles.rowPaidAmount, { color: tokens.green }]}>
            {formatINR(row.expected)}
          </Text>
        ) : (
          <View style={styles.rowInputWrap}>
            <TextInput
              value={row.amountText}
              onChangeText={onChangeAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={tokens.textFaint}
              selectTextOnFocus
              style={[
                styles.rowInput,
                {
                  color: tokens.text,
                  backgroundColor: tokens.surfaceSunken,
                  borderColor: valid ? tokens.border : tokens.red,
                },
              ]}
              accessibilityLabel={`Amount received from ${row.loaneeName}`}
            />
            {!valid ? (
              <Text style={[styles.rowError, { color: tokens.red }]}>Invalid</Text>
            ) : overpaid ? (
              <Text style={[styles.rowError, { color: tokens.green }]}>
                +{formatINR(amount - row.expected)}
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </Card>
  );
}

function Checkbox({ checked, tokens }: { checked: boolean; tokens: ThemeTokens }) {
  return (
    <View
      style={[
        styles.checkbox,
        checked
          ? { backgroundColor: tokens.green, borderColor: tokens.green }
          : { borderColor: tokens.border },
      ]}
    >
      {checked ? <Ionicons name="checkmark" size={15} color="#FFFFFF" /> : null}
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
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  controls: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12.5,
    fontWeight: '600',
    marginLeft: 2,
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
    paddingBottom: 16,
    gap: 10,
  },
  selectAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,
  },
  selectAllText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  rowCard: {
    marginBottom: 0,
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  rowPaidAmount: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  rowInputWrap: {
    alignItems: 'flex-end',
  },
  rowInput: {
    width: 92,
    height: 42,
    borderWidth: 1.5,
    borderRadius: 11,
    paddingHorizontal: 11,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
  },
  rowError: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorHint: {
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  summaryHint: {
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
  },
});
