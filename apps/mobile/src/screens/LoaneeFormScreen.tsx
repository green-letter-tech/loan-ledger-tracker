import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { BottomActionBar } from '../components/BottomActionBar';
import { CalculatorField } from '../components/calculator/CalculatorInputs';
import { Avatar, Card, PillButton } from '../components/ui';
import { useRepository } from '../context/AppProvider';
import { useTheme } from '../hooks/useTheme';
import type { RootStackScreenProps } from '../navigation/types';
import { getLoaneeInitials } from '../utils/loanee';

export function LoaneeFormScreen({ navigation, route }: RootStackScreenProps<'LoaneeForm'>) {
  const editId = route.params?.loaneeId;
  const isEditing = Boolean(editId);
  const { resolvedTheme, tokens } = useTheme();
  const repository = useRepository();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [avatarHue, setAvatarHue] = useState(254);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    repository
      .listLoanees()
      .then((loanees) => {
        if (cancelled) {
          return;
        }
        const loanee = loanees.find((entry) => entry.id === editId);
        if (!loanee) {
          setError('Loanee not found');
          return;
        }
        setName(loanee.name);
        setPhone(loanee.phone ?? '');
        setNotes(loanee.notes ?? '');
        setAvatarHue(loanee.avatarHue);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editId, repository]);

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: trimmedName,
        phone: phone.trim() || null,
        notes: notes.trim() || null,
      };

      if (isEditing && editId) {
        await repository.updateLoanee(editId, payload);
      } else {
        await repository.createLoanee(payload);
      }

      navigation.goBack();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Could not save loanee');
    } finally {
      setSaving(false);
    }
  }, [editId, isEditing, name, navigation, notes, phone, repository]);

  const canSave = name.trim().length > 0 && !saving;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[
            styles.backButton,
            { backgroundColor: tokens.surface, borderColor: tokens.borderSoft },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="chevron-back" size={21} color={tokens.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: tokens.text }]}>
          {isEditing ? 'Edit loanee' : 'Add loanee'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={tokens.blue} style={styles.loader} />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.avatarWrap}>
              <View style={styles.avatarInner}>
                <Avatar
                  initials={name.trim() ? getLoaneeInitials(name) : '?'}
                  size={76}
                  hue={avatarHue}
                />
                <View
                  style={[
                    styles.avatarBadge,
                    { backgroundColor: tokens.blue, borderColor: tokens.bg },
                  ]}
                >
                  <Ionicons name="create-outline" size={14} color="#FFFFFF" />
                </View>
              </View>
            </View>

            <Card pad={18}>
              <View style={styles.formFields}>
                <CalculatorField label="Name" hint="Required">
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Ravi Kumar"
                    placeholderTextColor={tokens.textFaint}
                    style={[
                      styles.input,
                      {
                        color: tokens.text,
                        borderColor: tokens.border,
                        backgroundColor: tokens.surface,
                      },
                    ]}
                  />
                </CalculatorField>

                <CalculatorField label="Phone" hint="Optional">
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+91 "
                    placeholderTextColor={tokens.textFaint}
                    keyboardType="phone-pad"
                    style={[
                      styles.input,
                      {
                        color: tokens.text,
                        borderColor: tokens.border,
                        backgroundColor: tokens.surface,
                      },
                    ]}
                  />
                </CalculatorField>

                <CalculatorField label="Notes" hint="Optional">
                  <TextInput
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Shop name, location, anything useful…"
                    placeholderTextColor={tokens.textFaint}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    style={[
                      styles.input,
                      styles.notesInput,
                      {
                        color: tokens.text,
                        borderColor: tokens.border,
                        backgroundColor: tokens.surface,
                      },
                    ]}
                  />
                </CalculatorField>
              </View>
            </Card>

            {error ? <Text style={[styles.error, { color: tokens.red }]}>{error}</Text> : null}
          </ScrollView>

          <BottomActionBar>
            <PillButton variant="primary" full disabled={!canSave} onPress={() => void handleSave()}>
              {saving ? 'Saving…' : 'Save loanee'}
            </PillButton>
            <Pressable onPress={() => navigation.goBack()} style={styles.cancelButton}>
              <Text style={[styles.cancelText, { color: tokens.textSoft }]}>Cancel</Text>
            </Pressable>
          </BottomActionBar>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  loader: {
    marginTop: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 18,
  },
  avatarWrap: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  avatarInner: {
    position: 'relative',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 99,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formFields: {
    gap: 16,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: 15,
    fontWeight: '600',
  },
  notesInput: {
    minHeight: 92,
    lineHeight: 22,
  },
  error: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    alignSelf: 'center',
    paddingVertical: 6,
  },
  cancelText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
