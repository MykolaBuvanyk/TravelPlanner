const React = require('react');
const { View } = require('react-native');

const MapView = React.forwardRef(({ children, ...props }, ref) => {
  React.useImperativeHandle(ref, () => ({
    animateToRegion: jest.fn(),
    fitToCoordinates: jest.fn(),
  }));

  return React.createElement(View, props, children);
});

module.exports = {
  __esModule: true,
  default: MapView,
  Marker: View,
  Polyline: View,
};
