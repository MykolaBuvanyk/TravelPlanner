import { Pressable, Text } from 'react-native';

type CategoryChipProps = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

export function CategoryChip({
  label,
  isSelected,
  onPress,
}: CategoryChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      className={`min-h-11 flex-row items-center rounded-full border px-4 ${
        isSelected
          ? 'border-app-primary bg-app-primary'
          : 'border-app-border bg-app-surface'
      }`}
      onPress={onPress}
    >
      <Text
        className={`text-sm font-semibold ${
          isSelected ? 'text-app-surface' : 'text-app-text'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
