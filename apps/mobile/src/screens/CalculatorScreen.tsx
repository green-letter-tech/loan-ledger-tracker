import { EmptyState } from '../components/EmptyState';
import { TabScreenLayout } from '../components/TabScreenLayout';
import type { TabScreenProps } from '../navigation/types';

export function CalculatorScreen(_props: TabScreenProps<'Calculator'>) {
  return (
    <TabScreenLayout title="Calculator" subtitle="Loan math">
      <EmptyState
        title="Calculator coming soon"
        subtitle="Live INR loan math lands in Task 12. Use this tab to preview principal, rate, and duration."
      />
    </TabScreenLayout>
  );
}
