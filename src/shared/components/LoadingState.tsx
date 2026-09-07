import {ActivityIndicator, Text, View} from 'react-native';

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({label = 'Loading...'}: LoadingStateProps) {
  return (
    <View className="items-center justify-center gap-3 p-6">
      <ActivityIndicator color="#246BFD" />
      <Text className="text-base text-app-muted">{label}</Text>
    </View>
  );
}
