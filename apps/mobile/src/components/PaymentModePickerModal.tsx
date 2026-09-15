import { formatINR, type PaymentMode } from '@lendledger/core';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import { AnimatedModalPanel } from './motion/AnimatedModalPanel';
import { PaymentModeChips } from './PaymentModeChips';
import { PillButton } from './ui/PillButton';

interface PaymentModePickerModalProps {
  visible: boolean;
  amount: number;
  initialMode?: PaymentMode | null;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: (mode: PaymentMode) => void;
}

/** Ask how a full expected payment was received before recording it. */
export function PaymentModePickerModal({
  visible,
  amount,
  initialMode = null,
  busy = false,
  onCancel,
  onConfirm,
}: PaymentModePickerModalProps) {
  const { tokens } = useTheme();
  const [mode, setMode] = useState<PaymentMode>('cash');

  useEffect(() => {
    if (visible) {
      setMode(initialMode ?? 'cash');
    }
  }, [initialMode, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={[styles.scrim, { backgroundColor: tokens.scrim }]} onPress={onCancel}>
        <AnimatedModalPanel visible={visible}>
          <Pressable
            style={[styles.dialog, { backgroundColor: tokens.bgElev, borderColor: tokens.borderSoft }]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={[styles.iconWrap, { backgroundColor: tokens.greenTint }]}>
              <Ionicons name="checkmark-circle-outline" size={26} color={tokens.green} />
            </View>

            <Text style={[styles.title, { color: tokens.text }]}>Mark as paid</Text>
            <Text style={[styles.body, { color: tokens.textSoft }]}>
              Record {formatINR(amount)} and choose how you received it.
            </Text>

            <Text style={[styles.modeLabel, { color: tokens.textFaint }]}>Payment mode</Text>
            <PaymentModeChips value={mode} onChange={setMode} disabled={busy} />

            <View style={styles.actions}>
              <PillButton
                variant="primary"
                full
                disabled={busy}
                onPress={() => onConfirm(mode)}
              >
                {busy ? 'Saving…' : 'Confirm paid'}
              </PillButton>
              <PillButton variant="outline" full disabled={busy} onPress={onCancel}>
                Cancel
              </PillButton>
            </View>
          </Pressable>
        </AnimatedModalPanel>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 22,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 7,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 18,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  actions: {
    gap: 9,
    marginTop: 22,
  },
});
