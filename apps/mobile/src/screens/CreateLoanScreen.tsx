import { formatINR } from '@lendledger/core';

import type { RootStackScreenProps } from '../navigation/types';

import { StackPlaceholderScreen } from './StackPlaceholderScreen';

export function CreateLoanScreen({ route }: RootStackScreenProps<'CreateLoan'>) {
  const snapshot = route.params?.calculatorSnapshot;
  const loaneeHint = route.params?.loaneeId
    ? ` for loanee ${route.params.loaneeId}`
    : '';

  if (snapshot) {
    return (
      <StackPlaceholderScreen
        title="Create loan"
        detail={`${formatINR(snapshot.principal)} at ${snapshot.interestRate}%/${snapshot.ratePeriod} · ${formatINR(snapshot.dailyExpected, true)}/day${loaneeHint}. Full create flow ships in Task 13.`}
      />
    );
  }

  return (
    <StackPlaceholderScreen
      title="Create loan"
      detail={`Create-loan flow${loaneeHint} ships in Task 13.`}
    />
  );
}
