import { Text, View } from 'react-native';

import { Screen } from './Screen';

type FeaturePlaceholderProps = {
  title: string;
  description: string;
  insideTabs?: boolean;
};

export function FeaturePlaceholder({
  title,
  description,
  insideTabs = false,
}: FeaturePlaceholderProps) {
  return (
    <Screen
      safeEdges={insideTabs ? [] : ['bottom']}
      className="items-center justify-center px-6"
    >
      <View className="items-center gap-3">
        <Text className="text-center text-2xl font-bold text-app-text">
          {title}
        </Text>
        <Text className="text-center text-base text-app-muted">
          {description}
        </Text>
      </View>
    </Screen>
  );
}
