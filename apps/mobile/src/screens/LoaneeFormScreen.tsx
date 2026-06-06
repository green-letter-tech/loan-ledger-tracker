import type { RootStackScreenProps } from '../navigation/types';

import { StackPlaceholderScreen } from './StackPlaceholderScreen';

export function LoaneeFormScreen({ route }: RootStackScreenProps<'LoaneeForm'>) {
  const editHint = route.params.loaneeId ? 'Edit loanee' : 'Add loanee';

  return (
    <StackPlaceholderScreen
      title={editHint}
      detail="Loanee form ships in Task 14."
    />
  );
}
