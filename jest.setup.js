import { jest } from "@jest/globals";

// AsyncStorage (official Jest mock)
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock react-native-maps (MapView + Marker)
jest.mock("react-native-maps", () => {
  const React = require("react");
  const { View } = require("react-native");

  const MockMapView = (props) =>
    React.createElement(View, props, props.children);
  const Marker = (props) => React.createElement(View, props, props.children);

  return {
    __esModule: true,
    default: MockMapView,
    Marker,
  };
});

// Geolocation
jest.mock("@react-native-community/geolocation", () => ({
  __esModule: true,
  default: {
    getCurrentPosition: jest.fn((success) => {
      success({
        coords: {
          latitude: 59.3293,
          longitude: 18.0686,
          altitude: 0,
          accuracy: 5,
          altitudeAccuracy: 5,
          heading: 0,
          speed: 0,
        },
        timestamp: Date.now(),
      });
    }),
    watchPosition: jest.fn(() => 1),
    clearWatch: jest.fn(),
    stopObserving: jest.fn(),
    setRNConfiguration: jest.fn(),
  },
}));

// Sensors
jest.mock("react-native-sensors", () => ({
  accelerometer: jest.fn(() => ({
    subscribe: jest.fn(() => ({
      unsubscribe: jest.fn(),
    })),
  })),
  setUpdateIntervalForType: jest.fn(),
  SensorTypes: {
    accelerometer: "accelerometer",
  },
}));

// Background Actions
jest.mock("react-native-background-actions", () => ({
  start: jest.fn(),
  stop: jest.fn(),
  isRunning: jest.fn(() => false),
  updateNotification: jest.fn(),
}));

// Push Notifications
jest.mock("react-native-push-notification", () => ({
  configure: jest.fn(),
  createChannel: jest.fn(),
  localNotification: jest.fn(),
  cancelLocalNotification: jest.fn(),
}));
