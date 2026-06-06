import { EmptyState } from '../components/EmptyState';
import { TabScreenLayout } from '../components/TabScreenLayout';
import type { TabScreenProps } from '../navigation/types';

export function SettingsScreen(_props: TabScreenProps<'Settings'>) {
  return (
    <TabScreenLayout title="Settings">
      <EmptyState
        title="Settings coming soon"
        subtitle="Theme, reminders, and profile options land in Task 11."
      />
    </TabScreenLayout>
  );
}
