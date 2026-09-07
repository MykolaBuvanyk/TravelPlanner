const { View } = require('react-native');

const animation = {
  delay: () => animation,
  duration: () => animation,
  reduceMotion: () => animation,
};

const Animated = {
  View,
  createAnimatedComponent: Component => Component,
};

module.exports = {
  __esModule: true,
  default: Animated,
  FadeInDown: animation,
  FadeInUp: animation,
  FadeOutDown: animation,
  LinearTransition: animation,
  ReduceMotion: { System: 'system' },
  runOnJS: callback => callback,
  useAnimatedStyle: callback => callback(),
  useSharedValue: value => ({ value }),
  withSpring: value => value,
  withTiming: value => value,
};
