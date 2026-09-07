import {Text, View} from 'react-native';

import {AppButton} from './AppButton';

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <View className="items-center gap-3 rounded-2xl bg-app-surface p-6">
      <Text className="text-center text-lg font-semibold text-app-text">
        {title}
      </Text>
      <Text className="text-center text-base text-app-muted">{description}</Text>
      {onRetry ? <AppButton label="Try again" onPress={onRetry} /> : null}
    </View>
  );
}
