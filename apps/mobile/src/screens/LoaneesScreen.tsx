import { EmptyState } from '../components/EmptyState';
import { TabScreenLayout } from '../components/TabScreenLayout';
import type { TabScreenProps } from '../navigation/types';

export function LoaneesScreen(_props: TabScreenProps<'Loanees'>) {
  return (
    <TabScreenLayout title="Loanees">
      <EmptyState
        title="No loanees yet"
        subtitle="Add people you lend to so you can attach loans and track repayments per person."
      />
    </TabScreenLayout>
  );
}
