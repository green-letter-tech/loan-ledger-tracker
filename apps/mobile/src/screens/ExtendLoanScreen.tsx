import type { RootStackScreenProps } from '../navigation/types';

import { StackPlaceholderScreen } from './StackPlaceholderScreen';

export function ExtendLoanScreen({ route }: RootStackScreenProps<'ExtendLoan'>) {
  return (
    <StackPlaceholderScreen
      title="Extend loan"
      detail={`Loan ${route.params.loanId} — keep daily vs recalculate in Task 17.`}
    />
  );
}
