import { jest } from '@jest/globals';

// Mock Geolocation (för GPS-hastighet)
jest.mock('@react-native-community/geolocation', () => ({
  setRNConfiguration: jest.fn(),
  watchPosition: jest.fn((success) => {
    // Vi simulerar att vi startar prenumerationen
    return 1;
  }),
  clearWatch: jest.fn(),
  stopObservation: jest.fn(),
}));

// Mock React Native Sensors (för vibrationer)
jest.mock('react-native-sensors', () => ({
  accelerometer: {
    subscribe: jest.fn(() => ({
      unsubscribe: jest.fn(),
    })),
  },
  setUpdateIntervalForType: jest.fn(),
  SensorTypes: {
    accelerometer: 'accelerometer',
  },
}));

// Mock Background Actions
jest.mock('react-native-background-actions', () => ({
  start: jest.fn(),
  stop: jest.fn(),
  isRunning: jest.fn(() => false),
  updateNotification: jest.fn(),
}));

// Mock Push Notifications
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  createChannel: jest.fn(),
  localNotification: jest.fn(),
  cancelLocalNotification: jest.fn(),
}));