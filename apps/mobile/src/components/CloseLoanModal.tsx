import { formatINR } from '@lendledger/core';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { PillButton } from './ui/PillButton';
import { useTheme } from '../hooks/useTheme';

interface CloseLoanModalProps {
  visible: boolean;
  outstanding: number;
  closing?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function CloseLoanModal({
  visible,
  outstanding,
  closing = false,
  onCancel,
  onConfirm,
}: CloseLoanModalProps) {
  const { tokens } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={[styles.scrim, { backgroundColor: tokens.scrim }]} onPress={onCancel}>
        <Pressable
          style={[
            styles.dialog,
            {
              backgroundColor: tokens.bgElev,
              borderColor: tokens.borderSoft,
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.iconWrap, { backgroundColor: tokens.redTint }]}>
            <Ionicons name="flag-outline" size={26} color={tokens.red} />
          </View>

          <Text style={[styles.title, { color: tokens.text }]}>Close this loan?</Text>
          <Text style={[styles.body, { color: tokens.textSoft }]}>
            <Text style={[styles.outstanding, { color: tokens.amber }]}>
              {formatINR(outstanding)}
            </Text>
            {' is still outstanding. Closing will stop daily tracking and mark the balance as written off.'}
          </Text>

          <View style={styles.actions}>
            <PillButton variant="primary" full disabled={closing} onPress={onCancel}>
              Keep loan open
            </PillButton>
            <PillButton variant="danger" full disabled={closing} onPress={onConfirm}>
              {closing ? 'Closing…' : 'Close anyway'}
            </PillButton>
          </View>
        </Pressable>
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
  },
  outstanding: {
    fontWeight: '800',
  },
  actions: {
    gap: 9,
    marginTop: 22,
  },
});
