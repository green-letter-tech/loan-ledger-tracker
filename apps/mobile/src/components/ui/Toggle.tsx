import { Switch, type SwitchProps } from 'react-native';

import { useTheme } from '../../hooks/useTheme';

interface ToggleProps extends Omit<SwitchProps, 'value' | 'onValueChange' | 'onChange'> {
  on: boolean;
  onChange: (value: boolean) => void;
}

export function Toggle({ on, onChange, ...rest }: ToggleProps) {
  const { tokens } = useTheme();

  return (
    <Switch
      value={on}
      onValueChange={onChange}
      trackColor={{ false: tokens.border, true: tokens.blueTint }}
      thumbColor={on ? tokens.blue : tokens.surface}
      ios_backgroundColor={tokens.border}
      {...rest}
    />
  );
}
