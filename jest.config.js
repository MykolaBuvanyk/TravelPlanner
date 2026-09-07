module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css)$': '<rootDir>/__mocks__/styleMock.js',
    '^react-native-draggable-flatlist$': '<rootDir>/__mocks__/draggableFlatListMock.js',
    '^react-native-gesture-handler$': '<rootDir>/__mocks__/gestureHandlerMock.js',
    '^react-native-maps$': '<rootDir>/__mocks__/mapsMock.js',
    '^react-native-reanimated$': '<rootDir>/__mocks__/reanimatedMock.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native[^/]*|@react-navigation|@react-native-async-storage|lucide-react-native|nativewind|react-native-css-interop)/)',
  ],
};
