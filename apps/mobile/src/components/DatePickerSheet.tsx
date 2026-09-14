import { Ionicons } from '@expo/vector-icons';
import {
  formatISODateLocal,
  parseISODateLocal,
  type ISODateString,
} from '@lendledger/core';
import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../hooks/useTheme';
import { PillButton } from './ui';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface DatePickerSheetProps {
  visible: boolean;
  value: ISODateString;
  onClose: () => void;
  onSelect: (value: ISODateString) => void;
  /** Latest selectable date (inclusive). Dates after this are disabled. */
  maxDate?: ISODateString;
  /** Earliest selectable date (inclusive). Dates before this are disabled. */
  minDate?: ISODateString;
  title?: string;
}

function sameYearMonthDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function DatePickerSheet({
  visible,
  value,
  onClose,
  onSelect,
  maxDate,
  minDate,
  title = 'Select date',
}: DatePickerSheetProps) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();

  const selectedDate = useMemo(() => {
    try {
      return parseISODateLocal(value);
    } catch {
      return new Date();
    }
  }, [value]);

  const [cursor, setCursor] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  const today = startOfDay(new Date());
  const max = maxDate ? startOfDay(parseISODateLocal(maxDate)) : null;
  const min = minDate ? startOfDay(parseISODateLocal(minDate)) : null;

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startPad = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((startPad + daysInMonth) / 7) * 7;

  const cells = useMemo(() => {
    const list: Date[] = [];
    for (let i = 0; i < cellCount; i += 1) {
      list.push(new Date(year, month, 1 - startPad + i));
    }
    return list;
  }, [cellCount, month, startPad, year]);

  const shiftMonth = (delta: number) => {
    setCursor(new Date(year, month + delta, 1));
  };

  const jumpToToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const isDisabled = (date: Date): boolean => {
    const day = startOfDay(date);
    if (max && day.getTime() > max.getTime()) {
      return true;
    }
    if (min && day.getTime() < min.getTime()) {
      return true;
    }
    return false;
  };

  const handleSelect = (date: Date) => {
    if (isDisabled(date)) {
      return;
    }
    onSelect(formatISODateLocal(date));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.scrim, { backgroundColor: tokens.scrim }]} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: tokens.bgElev, paddingBottom: Math.max(insets.bottom, 20) },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: tokens.border }]} />
          <Text style={[styles.title, { color: tokens.text }]}>{title}</Text>

          <View style={styles.navRow}>
            <Pressable
              onPress={() => shiftMonth(-1)}
              style={[styles.navButton, { backgroundColor: tokens.surface2, borderColor: tokens.borderSoft }]}
              accessibilityRole="button"
              accessibilityLabel="Previous month"
            >
              <Ionicons name="chevron-back" size={18} color={tokens.textSoft} />
            </Pressable>
            <View style={styles.navCenter}>
              <Text style={[styles.monthLabel, { color: tokens.text }]}>
                {MONTHS[month]} {year}
              </Text>
              <Pressable onPress={jumpToToday}>
                <Text style={[styles.todayLink, { color: tokens.blue }]}>Today</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => shiftMonth(1)}
              style={[styles.navButton, { backgroundColor: tokens.surface2, borderColor: tokens.borderSoft }]}
              accessibilityRole="button"
              accessibilityLabel="Next month"
            >
              <Ionicons name="chevron-forward" size={18} color={tokens.textSoft} />
            </Pressable>
          </View>

          <View style={styles.weekRow}>
            {WEEKDAYS.map((weekday, index) => (
              <View key={`${weekday}-${index}`} style={styles.weekCell}>
                <Text style={[styles.weekText, { color: tokens.textFaint }]}>{weekday}</Text>
              </View>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((date, index) => {
              const inMonth = date.getMonth() === month;
              const isSelected = sameYearMonthDay(date, selectedDate);
              const isToday = sameYearMonthDay(date, today);
              const disabled = isDisabled(date);

              const textColor = isSelected
                ? tokens.onGrad
                : !inMonth || disabled
                  ? tokens.textFaint
                  : tokens.text;

              return (
                <View key={index} style={styles.cellWrap}>
                  <Pressable
                    onPress={() => handleSelect(date)}
                    disabled={disabled}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: isSelected ? tokens.blue : 'transparent',
                        borderColor: isToday && !isSelected ? tokens.blue : 'transparent',
                        opacity: disabled ? 0.32 : inMonth ? 1 : 0.4,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.cellText,
                        { color: textColor, fontWeight: isToday || isSelected ? '800' : '600' },
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <PillButton variant="soft" full onPress={onClose} style={styles.cancel}>
            Cancel
          </PillButton>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 99,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCenter: {
    alignItems: 'center',
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  todayLink: {
    fontSize: 11.5,
    fontWeight: '700',
    marginTop: 1,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekText: {
    fontSize: 11,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellWrap: {
    width: `${100 / 7}%`,
    padding: 2.5,
  },
  cell: {
    aspectRatio: 1,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 14.5,
  },
  cancel: {
    marginTop: 14,
  },
});
