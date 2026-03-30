import { renderHook, act } from '@testing-library/react-native';
import { useParkingDetector } from '../src/hooks/useParkingDetector';
import { DEV_CONFIG } from '../src/types';

// Vi mockar SensorService så vi slipper använda en riktig telefon i testet
import { sensorService } from '../src/services/SensorService';
jest.mock('../src/services/SensorService');

describe('useParkingDetector - Happy Path', () => {
  
  it('skall gå från "idle" till "monitoring" när man startar bevakning', async () => {
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

});