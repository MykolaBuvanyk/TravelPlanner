import type { TextInputProps } from 'react-native';
import type { ComponentRef, Ref } from 'react';
import { Text, TextInput, View } from 'react-native';

type AppInputProps = TextInputProps & {
  label: string;
  error?: string;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

export function AppInput({
  label,
  error,
  className,
  ref,
  ...props
}: AppInputProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-app-text">{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        className={`min-h-12 rounded-xl border bg-app-surface px-4 text-base text-app-text ${
          error ? 'border-app-danger' : 'border-app-border'
        } ${className ?? ''}`}
        placeholderTextColor="#98A2B3"
        {...props}
      />
      {error ? <Text className="text-sm text-app-danger">{error}</Text> : null}
    </View>
  );
}
