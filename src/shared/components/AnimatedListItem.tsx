import type { ReactNode } from 'react';
import Animated, {
  FadeInDown,
  LinearTransition,
  ReduceMotion,
} from 'react-native-reanimated';

type AnimatedListItemProps = {
  children: ReactNode;
  index: number;
};

const listLayout = LinearTransition.duration(180).reduceMotion(
  ReduceMotion.System,
);

export function AnimatedListItem({ children, index }: AnimatedListItemProps) {
  const entryDelay = Math.min(index, 8) * 45;

  return (
    <Animated.View
      entering={FadeInDown.duration(220)
        .delay(entryDelay)
        .reduceMotion(ReduceMotion.System)}
      layout={listLayout}
    >
      {children}
    </Animated.View>
  );
}
