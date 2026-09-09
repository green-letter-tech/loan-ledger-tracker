import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../../hooks/useTheme';
import { formatReminderTime24To12, parseReminderTimeInput } from '../../utils/reminderTime';

interface ReminderTimeListProps {
  times: string[];
  onChangeTime: (index: number, time24: string) => void;
  onAddTime: () => void;
  onRemoveTime: (index: number) => void;
}

function ReminderTimeInput({
  time24,
  onCommit,
}: {
  time24: string;
  onCommit: (time24: string) => void;
}) {
  const { tokens } = useTheme();
  const [draft, setDraft] = useState(formatReminderTime24To12(time24));
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setDraft(formatReminderTime24To12(time24));
    setInvalid(false);
  }, [time24]);

  const commitDraft = () => {
    const parsed = parseReminderTimeInput(draft);
    if (!parsed) {
      setInvalid(true);
      setDraft(formatReminderTime24To12(time24));
      return;
    }

    setInvalid(false);
    setDraft(formatReminderTime24To12(parsed));
    if (parsed !== time24) {
      onCommit(parsed);
    }
  };

  return (
    <TextInput
      value={draft}
      onChangeText={(text) => {
        setDraft(text);
        setInvalid(false);
      }}
      onBlur={commitDraft}
      onSubmitEditing={commitDraft}
      placeholder="7:00 PM"
      placeholderTextColor={tokens.textFaint}
      autoCapitalize="characters"
      autoCorrect={false}
      returnKeyType="done"
      style={[
        styles.timeInput,
        {
          color: tokens.text,
          borderColor: invalid ? tokens.red : 'transparent',
        },
      ]}
    />
  );
}

export function ReminderTimeList({
  times,
  onChangeTime,
  onAddTime,
  onRemoveTime,
}: ReminderTimeListProps) {
  const { tokens } = useTheme();

  return (
    <View style={styles.root}>
      <View style={styles.timeList}>
        {times.map((time, index) => (
          <View
            key={`${time}-${index}`}
            style={[styles.timeRow, { backgroundColor: tokens.surfaceSunken }]}
          >
            <Ionicons name="time-outline" size={18} color={tokens.blue} />
            <ReminderTimeInput time24={time} onCommit={(next) => onChangeTime(index, next)} />
            {times.length > 1 ? (
              <Pressable
                onPress={() => onRemoveTime(index)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Remove reminder time"
              >
                <Ionicons name="close" size={16} color={tokens.textFaint} />
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
      <Pressable onPress={onAddTime} style={styles.addTimeButton}>
        <Ionicons name="add" size={17} color={tokens.blue} />
        <Text style={[styles.addTimeLabel, { color: tokens.blue }]}>Add another time</Text>
      </Pressable>
      <Text style={[styles.hint, { color: tokens.textFaint }]}>
        Use 12-hour (7:00 PM) or 24-hour (19:00) format.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  timeList: {
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  timeInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 2,
  },
  addTimeLabel: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  hint: {
    fontSize: 11.5,
    lineHeight: 16,
  },
});
