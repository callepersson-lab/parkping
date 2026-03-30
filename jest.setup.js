import { jest } from '@jest/globals';

// Mocka Geolocation (för GPS/Hastighet)
jest.mock('@react-native-community/geolocation', () => ({
  setRNConfiguration: jest.fn(),
  getCurrentPosition: jest.fn((success) => success({
    coords: { latitude: 59.3, longitude: 18.0, speed: 0 },
    timestamp: Date.now(),
  })),
  watchPosition: jest.fn(() => 1),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
}));

// Mocka Sensors (för vibrationer/rörelse)
jest.mock('react-native-sensors', () => ({
  accelerometer: {
    subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
  },
  setUpdateIntervalForType: jest.fn(),
  SensorTypes: { accelerometer: 'accelerometer' },
}));

// Mocka Bakgrundstjänster och Notiser
jest.mock('react-native-background-actions', () => ({
  start: jest.fn(),
  stop: jest.fn(),
  isRunning: jest.fn(() => false),
}));

jest.mock('react-native-push-notification', () => ({
  localNotification: jest.fn(),
  createChannel: jest.fn(),
}));