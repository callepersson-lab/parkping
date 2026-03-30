// __mocks__/react-native-sensors.js
export const accelerometer = jest.fn(() => ({
    subscribe: jest.fn(),
}));

export const setUpdateIntervalForType = jest.fn();

export const SensorTypes = {
    accelerometer: 'accelerometer',
};