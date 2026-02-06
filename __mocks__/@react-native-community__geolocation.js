// __mocks__/@react-native-community__geolocation.js
export default {
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
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
};