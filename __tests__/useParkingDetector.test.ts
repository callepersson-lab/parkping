import { renderHook, act } from '@testing-library/react-native';
import { useParkingDetector } from '../src/hooks/useParkingDetector';
import { DEV_CONFIG } from '../src/types';

// Mock all services
import { sensorService } from '../src/services/SensorService';
jest.mock('../src/services/SensorService');
jest.mock('../src/services/NotificationService');
jest.mock('../src/services/BackgroundService');

describe('useParkingDetector - Happy Path', () => {
  
  it('should transition from "idle" to "monitoring" when starting monitoring', async () => {
    // 1. ARRANGE
    (sensorService.requestPermissions as jest.Mock).mockResolvedValue(true);
    const { result } = renderHook(() => useParkingDetector(DEV_CONFIG));

    // 2. ACT
    await act(async () => {
      await result.current.startMonitoring();
    });

    // 3. ASSERT
    expect(result.current.state).toBe('monitoring');
  });
  
  it('should transition from "monitoring" to "driving" when speed increases', async () => {
    let locationCallback: any;
    let accelerometerCallback: any;
    
    (sensorService.requestPermissions as jest.Mock).mockResolvedValue(true);
    
    (sensorService.startLocationTracking as jest.Mock).mockImplementation((callback) => {
      locationCallback = callback;
    });
    
    (sensorService.startAccelerometer as jest.Mock).mockImplementation((callback) => {
      accelerometerCallback = callback;
    });
    
    const { result } = renderHook(() => useParkingDetector(DEV_CONFIG));
    
    await act(async () => {
      await result.current.startMonitoring();
    });
    
    expect(result.current.state).toBe('monitoring');
    
    // ACT - Send accelerometer data
    await act(async () => {
      accelerometerCallback({
        x: 5.0,
        y: 5.0,
        z: 15.0,
        timestamp: Date.now(),
      });
    });
    
    // ACT - Send location data
    await act(async () => {
      locationCallback({
        latitude: 59.3293,
        longitude: 18.0686,
        speed: 4.17,
        accuracy: 10,
        timestamp: Date.now(),
      });
    });
    
    // ASSERT
    expect(result.current.state).toBe('driving');
  });

});