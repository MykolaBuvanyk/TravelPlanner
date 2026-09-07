import type {PropsWithChildren} from 'react';
import type {ViewProps} from 'react-native';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

type ScreenProps = PropsWithChildren<ViewProps>;

type SafeEdge = 'top' | 'bottom';

type ScreenWithSafeEdgesProps = ScreenProps & {
  safeEdges?: SafeEdge[];
};

export function Screen({
  children,
  className,
  safeEdges = ['top', 'bottom'],
  style,
  ...props
}: ScreenWithSafeEdgesProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = safeEdges.includes('top') ? insets.top : 0;
  const paddingBottom = safeEdges.includes('bottom') ? insets.bottom : 0;

  return (
    <View
      className={`flex-1 bg-app-background ${className ?? ''}`}
      style={[{paddingTop, paddingBottom}, style]}
      {...props}>
      {children}
    </View>
  );
}
