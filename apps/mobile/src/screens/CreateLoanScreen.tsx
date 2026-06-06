import type { RootStackScreenProps } from '../navigation/types';

import { StackPlaceholderScreen } from './StackPlaceholderScreen';

export function CreateLoanScreen({ route }: RootStackScreenProps<'CreateLoan'>) {
  const loaneeHint = route.params.loaneeId
    ? ` for loanee ${route.params.loaneeId}`
    : '';

  return (
    <StackPlaceholderScreen
      title="Create loan"
      detail={`Create-loan flow${loaneeHint} ships in Task 13.`}
    />
  );
}
