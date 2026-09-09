import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomActionBar } from '../../components/BottomActionBar';
import { Card, Logo, PillButton } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';

interface FeatureBullet {
  icon: keyof typeof Ionicons.glyphMap;
  tint: 'blue' | 'green' | 'amber';
  title: string;
  subtitle: string;
}

const FEATURES: FeatureBullet[] = [
  {
    icon: 'people',
    tint: 'blue',
    title: 'Track your loanees',
    subtitle: 'Keep every borrower in one place',
  },
  {
    icon: 'checkmark-circle',
    tint: 'green',
    title: 'Mark daily payments',
    subtitle: 'Paid, unpaid or partial in one tap',
  },
  {
    icon: 'grid',
    tint: 'amber',
    title: 'See dashboard insights',
    subtitle: 'Totals and charts at a glance',
  },
];

interface OnboardingWelcomeStepProps {
  onContinue: () => void;
}

export function OnboardingWelcomeStep({ onContinue }: OnboardingWelcomeStepProps) {
  const { tokens } = useTheme();

  const tintFor = (tint: FeatureBullet['tint']) => {
    switch (tint) {
      case 'blue':
        return { bg: tokens.blueTint, color: tokens.blue };
      case 'green':
        return { bg: tokens.greenTint, color: tokens.green };
      case 'amber':
        return { bg: tokens.amberTint, color: tokens.amber };
      default: {
        const _exhaustive: never = tint;
        throw new Error(`Unhandled tint: ${_exhaustive}`);
      }
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Logo size={84} radius={24} />
        <Text style={[styles.brand, { color: tokens.text }]}>LendLedger</Text>
        <Text style={[styles.tagline, { color: tokens.textSoft }]}>
          Track daily lending, simply.
        </Text>

        <View style={styles.features}>
          {FEATURES.map((feature) => {
            const tint = tintFor(feature.tint);
            return (
              <Card key={feature.title} pad={14} style={styles.featureCard}>
                <View style={styles.featureRow}>
                  <View style={[styles.featureIcon, { backgroundColor: tint.bg }]}>
                    <Ionicons name={feature.icon} size={22} color={tint.color} />
                  </View>
                  <View style={styles.featureText}>
                    <Text style={[styles.featureTitle, { color: tokens.text }]}>
                      {feature.title}
                    </Text>
                    <Text style={[styles.featureSubtitle, { color: tokens.textFaint }]}>
                      {feature.subtitle}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      <BottomActionBar>
        <PillButton variant="primary" full onPress={onContinue}>
          Get started
        </PillButton>
      </BottomActionBar>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    maxWidth: 390,
    width: '100%',
    alignSelf: 'center',
  },
  brand: {
    marginTop: 28,
    marginBottom: 8,
    fontSize: 33,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
  },
  features: {
    marginTop: 40,
    width: '100%',
    gap: 12,
  },
  featureCard: {
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  featureSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
});
