import type { RootStackScreenProps } from '../navigation/types';

import { StackPlaceholderScreen } from './StackPlaceholderScreen';

export function LoaneeDetailScreen({ route }: RootStackScreenProps<'LoaneeDetail'>) {
  return (
    <StackPlaceholderScreen
      title="Loanee detail"
      detail={`Loanee ${route.params.loaneeId} — detail view ships in Task 14.`}
    />
  );
}
