import type { PaymentMode } from '@lendledger/core';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import { PAYMENT_MODE_OPTIONS } from '../utils/paymentMode';

interface PaymentModeChipsProps {
  value: PaymentMode;
  onChange: (value: PaymentMode) => void;
  disabled?: boolean;
}

export function PaymentModeChips({ value, onChange, disabled = false }: PaymentModeChipsProps) {
  const { tokens } = useTheme();

  return (
    <View style={styles.row}>
      {PAYMENT_MODE_OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              {
                backgroundColor: selected ? tokens.blueTint : tokens.surface2,
                borderColor: selected ? tokens.blue : tokens.borderSoft,
                opacity: disabled ? 0.45 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Payment mode ${option.label}`}
          >
            <Text
              style={[
                styles.chipText,
                { color: selected ? tokens.blue : tokens.textSoft },
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
