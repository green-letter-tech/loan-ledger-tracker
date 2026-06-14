import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';

interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { tokens } = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: tokens.surfaceSunken, borderColor: tokens.borderSoft }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              selected && {
                backgroundColor: tokens.surface,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 3,
                elevation: 2,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? tokens.text : tokens.textSoft },
                selected && styles.labelSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 9,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  labelSelected: {
    fontWeight: '700',
  },
});
