import { Ionicons } from '@expo/vector-icons';
import type { ISODateString } from '@lendledger/core';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { formatStartDateLabel, isValidISODate } from '../../utils/formatStartDate';

interface StartDateFieldProps {
  value: ISODateString;
  onChange: (value: ISODateString) => void;
}

export function StartDateField({ value, onChange }: StartDateFieldProps) {
  const { tokens } = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const invalid = editing && !isValidISODate(draft);

  const commitDraft = () => {
    if (isValidISODate(draft)) {
      onChange(draft);
      setEditing(false);
    }
  };

  return (
    <Pressable
      onPress={() => {
        setDraft(value);
        setEditing(true);
      }}
      style={[
        styles.shell,
        {
          backgroundColor: tokens.surface,
          borderColor: invalid ? tokens.red : tokens.border,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: tokens.blueTint }]}>
        <Ionicons name="calendar-outline" size={20} color={tokens.blue} />
      </View>

      <View style={styles.textBlock}>
        {editing ? (
          <>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              onBlur={commitDraft}
              onSubmitEditing={commitDraft}
              autoFocus
              placeholder="YYYY-MM-DD"
              placeholderTextColor={tokens.textFaint}
              style={[styles.input, { color: tokens.text }]}
            />
            <Text style={[styles.hint, { color: tokens.textFaint }]}>YYYY-MM-DD</Text>
          </>
        ) : (
          <>
            <Text style={[styles.label, { color: tokens.text }]}>{formatStartDateLabel(value)}</Text>
            <Text style={[styles.hint, { color: tokens.textFaint }]}>
              Daily entries start from this date
            </Text>
          </>
        )}
      </View>

      <Ionicons name="chevron-forward" size={19} color={tokens.textFaint} />
    </Pressable>
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
  input: {
    fontSize: 15,
    fontWeight: '700',
    paddingVertical: 0,
  },
});
