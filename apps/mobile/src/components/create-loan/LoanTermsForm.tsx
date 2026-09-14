import type { DurationUnit, RatePeriod } from '@lendledger/core';
import { StyleSheet, View } from 'react-native';

import { CalculatorField, NumericInput, OptionSelect } from '../calculator/CalculatorInputs';

const RATE_PERIOD_OPTIONS: ReadonlyArray<{ label: string; value: RatePeriod }> = [
  { label: 'Per day', value: 'day' },
  { label: 'Per month', value: 'month' },
  { label: 'Per year', value: 'year' },
];

const DURATION_UNIT_OPTIONS: ReadonlyArray<{ label: string; value: DurationUnit }> = [
  { label: 'Days', value: 'days' },
  { label: 'Months', value: 'months' },
  { label: 'Years', value: 'years' },
];

/** Raw text so a half-typed number never collapses to 0 mid-edit. */
export interface LoanTermsValue {
  principal: string;
  rate: string;
  ratePeriod: RatePeriod;
  duration: string;
  durationUnit: DurationUnit;
}

export interface ParsedLoanTerms {
  principal: number;
  interestRate: number;
  ratePeriod: RatePeriod;
  duration: number;
  durationUnit: DurationUnit;
}

export function parseLoanTerms(value: LoanTermsValue): ParsedLoanTerms {
  return {
    principal: parseFloat(value.principal) || 0,
    interestRate: parseFloat(value.rate) || 0,
    ratePeriod: value.ratePeriod,
    duration: parseFloat(value.duration) || 0,
    durationUnit: value.durationUnit,
  };
}

interface LoanTermsFormProps {
  value: LoanTermsValue;
  onChange: (value: LoanTermsValue) => void;
}

/** Principal, rate and duration inputs, shared by the calculator and refinance. */
export function LoanTermsForm({ value, onChange }: LoanTermsFormProps) {
  const patch = (next: Partial<LoanTermsValue>) => onChange({ ...value, ...next });

  return (
    <View style={styles.form}>
      <CalculatorField label="Principal amount">
        <NumericInput
          value={value.principal}
          onChangeValue={(principal) => patch({ principal })}
          prefix="₹"
          placeholder="100"
          big
        />
      </CalculatorField>

      <View style={styles.row}>
        <View style={styles.rowCell}>
          <CalculatorField label="Interest rate">
            <NumericInput
              value={value.rate}
              onChangeValue={(rate) => patch({ rate })}
              prefix="%"
              placeholder="1"
            />
          </CalculatorField>
        </View>
        <View style={[styles.rowCell, styles.rowCellWide]}>
          <CalculatorField label="Rate period">
            <OptionSelect
              value={value.ratePeriod}
              options={RATE_PERIOD_OPTIONS}
              onChange={(ratePeriod) => patch({ ratePeriod })}
            />
          </CalculatorField>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.rowCell}>
          <CalculatorField label="Duration">
            <NumericInput
              value={value.duration}
              onChangeValue={(duration) => patch({ duration })}
              placeholder="50"
            />
          </CalculatorField>
        </View>
        <View style={[styles.rowCell, styles.rowCellWide]}>
          <CalculatorField label="Unit">
            <OptionSelect
              value={value.durationUnit}
              options={DURATION_UNIT_OPTIONS}
              onChange={(durationUnit) => patch({ durationUnit })}
            />
          </CalculatorField>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowCell: {
    flex: 1,
  },
  rowCellWide: {
    flex: 1.2,
  },
});
