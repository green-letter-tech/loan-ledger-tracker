import { EmptyState } from '../components/EmptyState';
import { TabScreenLayout } from '../components/TabScreenLayout';
import type { TabScreenProps } from '../navigation/types';

export function HomeScreen(_props: TabScreenProps<'Home'>) {
  return (
    <TabScreenLayout title="LendLedger" subtitle="Dashboard">
      <EmptyState
        title="No loans yet"
        subtitle="Run a quick calculation to set up your first daily-repayment loan and start tracking collections."
      />
    </TabScreenLayout>
  );
}
