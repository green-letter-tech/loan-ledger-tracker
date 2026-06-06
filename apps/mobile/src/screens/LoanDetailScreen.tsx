import type { RootStackScreenProps } from '../navigation/types';

import { StackPlaceholderScreen } from './StackPlaceholderScreen';

export function LoanDetailScreen({ route }: RootStackScreenProps<'LoanDetail'>) {
  return (
    <StackPlaceholderScreen
      title="Loan detail"
      detail={`Loan ${route.params.loanId} — paid / unpaid / partial UI in Task 15.`}
    />
  );
}
