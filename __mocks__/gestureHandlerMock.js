const { FlatList, View } = require('react-native');

const gesture = {
  onUpdate: () => gesture,
  onEnd: () => gesture,
};

module.exports = {
  FlatList,
  Gesture: { Pan: () => gesture },
  GestureDetector: ({ children }) => children,
  GestureHandlerRootView: View,
};
