import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

interface CalculatorFieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export function CalculatorField({ label, hint, children }: CalculatorFieldProps) {
  const { tokens } = useTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: tokens.textSoft }]}>{label}</Text>
      {children}
      {hint ? <Text style={[styles.hint, { color: tokens.textFaint }]}>{hint}</Text> : null}
    </View>
  );
}

interface NumericInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeValue: (value: string) => void;
  prefix?: string;
  big?: boolean;
}

export function NumericInput({
  value,
  onChangeValue,
  prefix,
  big = false,
  placeholder,
  ...rest
}: NumericInputProps) {
  const { tokens } = useTheme();

  return (
    <View style={styles.inputWrap}>
      {prefix ? (
        <Text
          style={[
            styles.prefix,
            {
              color: tokens.textFaint,
              fontSize: big ? 22 : 16,
              left: 15,
            },
          ]}
        >
          {prefix}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeValue}
        placeholder={placeholder}
        placeholderTextColor={tokens.textFaint}
        keyboardType="decimal-pad"
        inputMode="decimal"
        style={[
          styles.input,
          {
            borderColor: tokens.border,
            backgroundColor: tokens.surface,
            color: tokens.text,
            height: big ? 62 : 52,
            fontSize: big ? 24 : 16,
            fontWeight: big ? '800' : '600',
            paddingLeft: prefix ? (big ? 38 : 32) : 15,
            letterSpacing: big ? -0.5 : 0,
          },
        ]}
        {...rest}
      />
    </View>
  );
}

interface OptionSelectProps<T extends string> {
  value: T;
  options: ReadonlyArray<{ label: string; value: T }>;
  onChange: (value: T) => void;
}

export function OptionSelect<T extends string>({ value, options, onChange }: OptionSelectProps<T>) {
  const { tokens } = useTheme();

  return (
    <View style={styles.optionList}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.optionItem,
              {
                borderColor: selected ? tokens.blue : tokens.border,
                backgroundColor: selected ? tokens.blueTint : tokens.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.optionLabel,
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
  field: {
    gap: 7,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  hint: {
    fontSize: 11.5,
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  prefix: {
    position: 'absolute',
    fontWeight: '700',
    zIndex: 1,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingRight: 15,
    width: '100%',
  },
  optionList: {
    gap: 6,
  },
  optionItem: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
