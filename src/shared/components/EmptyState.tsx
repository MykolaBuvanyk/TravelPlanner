import type {ReactNode} from 'react';
import {Text, View} from 'react-native';

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({title, description, action}: EmptyStateProps) {
  return (
    <View className="items-center gap-3 rounded-2xl bg-app-surface p-6">
      <Text className="text-center text-lg font-semibold text-app-text">
        {title}
      </Text>
      <Text className="text-center text-base text-app-muted">{description}</Text>
      {action}
    </View>
  );
}
