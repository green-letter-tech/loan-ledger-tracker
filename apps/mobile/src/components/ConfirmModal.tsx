import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../hooks/useTheme';
import { PillButton } from './ui/PillButton';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Extra line rendered in amber above the actions. */
  warning?: string;
  destructive?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Generic confirmation dialog for actions that write money. */
export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  icon = 'help-circle-outline',
  warning,
  destructive = false,
  busy = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const { tokens } = useTheme();
  const accent = destructive ? tokens.red : tokens.blue;
  const accentTint = destructive ? tokens.redTint : tokens.blueTint;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={[styles.scrim, { backgroundColor: tokens.scrim }]} onPress={onCancel}>
        <Pressable
          style={[styles.dialog, { backgroundColor: tokens.bgElev, borderColor: tokens.borderSoft }]}
          onPress={(event) => event.stopPropagation()}
        >
          <View style={[styles.iconWrap, { backgroundColor: accentTint }]}>
            <Ionicons name={icon} size={26} color={accent} />
          </View>

          <Text style={[styles.title, { color: tokens.text }]}>{title}</Text>
          <Text style={[styles.body, { color: tokens.textSoft }]}>{message}</Text>

          {warning ? (
            <Text style={[styles.warning, { color: tokens.amber }]}>{warning}</Text>
          ) : null}

          <View style={styles.actions}>
            <PillButton
              variant={destructive ? 'danger' : 'primary'}
              full
              disabled={busy}
              onPress={onConfirm}
            >
              {busy ? 'Saving…' : confirmLabel}
            </PillButton>
            <PillButton variant="outline" full disabled={busy} onPress={onCancel}>
              {cancelLabel}
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
  warning: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 11,
  },
  actions: {
    gap: 9,
    marginTop: 22,
  },
});
