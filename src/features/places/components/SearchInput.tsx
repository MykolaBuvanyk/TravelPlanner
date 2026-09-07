import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

type SearchInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  onSubmit?: () => void;
};

export function SearchInput({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search saved places',
  onSubmit,
}: SearchInputProps) {
  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-app-border bg-app-surface px-4">
      <Search color="#667085" size={20} />
      <TextInput
        className="min-h-12 flex-1 text-base text-app-text"
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor="#98A2B3"
        returnKeyType="search"
        value={value}
      />
      {value ? (
        <Pressable
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onClear ?? (() => onChangeText(''))}
        >
          <X color="#667085" size={20} />
        </Pressable>
      ) : null}
    </View>
  );
}
