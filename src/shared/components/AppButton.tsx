import { Pressable, Text } from 'react-native';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
};

const containerClasses = {
  primary: 'bg-app-primary active:bg-app-primaryPressed',
  secondary: 'bg-app-secondary active:bg-app-border',
  ghost: 'bg-transparent active:bg-app-secondary',
} as const;

const labelClasses = {
  primary: 'text-app-surface',
  secondary: 'text-app-primary',
  ghost: 'text-app-primary',
} as const;

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`min-h-12 items-center justify-center rounded-xl px-5 ${containerClasses[variant]} ${
        disabled ? 'opacity-50' : ''
      }`}
      disabled={disabled}
      onPress={onPress}
    >
      <Text className={`text-base font-semibold ${labelClasses[variant]}`}>
        {label}
      </Text>
    </Pressable>
  );
}
