import { Ionicons } from '@expo/vector-icons';
import type { ISODateString } from '@lendledger/core';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { formatStartDateLabel } from '../../utils/formatStartDate';
import { DatePickerSheet } from '../DatePickerSheet';

interface StartDateFieldProps {
  value: ISODateString;
  onChange: (value: ISODateString) => void;
  onFocus?: () => void;
  hint?: string;
}

export function StartDateField({ value, onChange, onFocus, hint }: StartDateFieldProps) {
  const { tokens } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => {
          onFocus?.();
          setOpen(true);
        }}
        style={[
          styles.shell,
          { backgroundColor: tokens.surface, borderColor: tokens.border },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: tokens.blueTint }]}>
          <Ionicons name="calendar-outline" size={20} color={tokens.blue} />
        </View>

        <View style={styles.textBlock}>
          <Text style={[styles.label, { color: tokens.text }]}>{formatStartDateLabel(value)}</Text>
          <Text style={[styles.hint, { color: tokens.textFaint }]}>
            {hint ?? 'Payments are scheduled from this date'}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={19} color={tokens.textFaint} />
      </Pressable>

      <DatePickerSheet
        visible={open}
        value={value}
        title="Start date"
        onClose={() => setOpen(false)}
        onSelect={onChange}
      />
    </>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    marginTop: 1,
  },
});
