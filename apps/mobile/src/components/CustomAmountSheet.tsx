import { formatINR, type PaymentMode } from '@lendledger/core';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../hooks/useTheme';
import { formatEntryDateShort } from '../utils/loanDetail';
import type { ISODateString } from '@lendledger/core';
import { AnimatedModalPanel } from './motion/AnimatedModalPanel';
import { PaymentModeChips } from './PaymentModeChips';
import { PillButton } from './ui/PillButton';

interface CustomAmountSheetProps {
  visible: boolean;
  entryDate: ISODateString;
  expectedAmount: number;
  initialAmount: number;
  initialPaymentMode?: PaymentMode | null;
  onClose: () => void;
  onSave: (amount: number, paymentMode: PaymentMode | null) => void;
}

export function CustomAmountSheet({
  visible,
  entryDate,
  expectedAmount,
  initialAmount,
  initialPaymentMode = null,
  onClose,
  onSave,
}: CustomAmountSheetProps) {
  const { tokens } = useTheme();
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');

  useEffect(() => {
    if (visible) {
      setAmount(initialAmount > 0 ? String(initialAmount) : '');
      setPaymentMode(initialPaymentMode ?? 'cash');
    }
  }, [initialAmount, initialPaymentMode, visible]);

  const parsed = parseFloat(amount) || 0;
  const statusHint =
    parsed >= expectedAmount
      ? 'Marks day as Paid'
      : parsed > 0
        ? `Partial — ${formatINR(expectedAmount - parsed)} short`
        : 'Marks day as Unpaid';
  const statusColor =
    parsed >= expectedAmount ? tokens.green : parsed > 0 ? tokens.amber : tokens.textFaint;

  const quickAmounts = [
    expectedAmount,
    Math.round((expectedAmount / 2) * 100) / 100,
    Math.round(expectedAmount * 2 * 100) / 100,
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.scrim, { backgroundColor: tokens.scrim }]} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrap}
        >
          <AnimatedModalPanel visible={visible} variant="sheet">
            <Pressable
              style={[
                styles.sheet,
                {
                  backgroundColor: tokens.bgElev,
                  paddingBottom: Math.max(insets.bottom, 22),
                },
              ]}
              onPress={(event) => event.stopPropagation()}
            >
              <View style={[styles.handle, { backgroundColor: tokens.border }]} />
              <Text style={[styles.title, { color: tokens.text }]}>Custom amount</Text>
              <Text style={[styles.subtitle, { color: tokens.textFaint }]}>
                {formatEntryDateShort(entryDate)} · expected {formatINR(expectedAmount)}
              </Text>

              <View style={styles.amountRow}>
                <Text style={[styles.currency, { color: tokens.textFaint }]}>₹</Text>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor={tokens.textFaint}
                  keyboardType="decimal-pad"
                  autoFocus
                  style={[styles.amountInput, { color: tokens.text }]}
                />
              </View>

              <View style={styles.quickRow}>
                {quickAmounts.map((value) => (
                  <Pressable
                    key={value}
                    onPress={() => setAmount(String(value))}
                    style={[
                      styles.quickChip,
                      { backgroundColor: tokens.surface2, borderColor: tokens.borderSoft },
                    ]}
                  >
                    <Text style={[styles.quickChipText, { color: tokens.textSoft }]}>
                      {formatINR(value)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {parsed > 0 ? (
                <View style={styles.modeBlock}>
                  <Text style={[styles.modeLabel, { color: tokens.textFaint }]}>Payment mode</Text>
                  <PaymentModeChips value={paymentMode} onChange={setPaymentMode} />
                </View>
              ) : null}

              <Text style={[styles.statusHint, { color: statusColor }]}>{statusHint}</Text>

              <View style={styles.actions}>
                <PillButton variant="soft" full onPress={onClose} style={styles.actionButton}>
                  Cancel
                </PillButton>
                <PillButton
                  variant="primary"
                  full
                  onPress={() => onSave(parsed, parsed > 0 ? paymentMode : null)}
                  style={styles.actionButton}
                >
                  Save
                </PillButton>
              </View>
            </Pressable>
          </AnimatedModalPanel>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    width: '100%',
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
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
    marginBottom: 18,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  currency: {
    fontSize: 32,
    fontWeight: '800',
    marginRight: 4,
  },
  amountInput: {
    width: 160,
    fontSize: 44,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -1,
    padding: 0,
  },
  quickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  quickChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modeBlock: {
    gap: 8,
    marginBottom: 16,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  statusHint: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
});
