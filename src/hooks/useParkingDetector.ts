import {useState, useCallback, useRef, useEffect} from 'react';
import {
  ParkingState,
  DetectionConfig,
  DEFAULT_CONFIG,
  AccelerometerData,
  LocationData,
} from '../types';
import {sensorService} from '../services/SensorService';
import {notificationService} from '../services/NotificationService';
import {backgroundService} from '../services/BackgroundService';

interface UseParkingDetectorResult {
  state: ParkingState;
  isMonitoring: boolean;
  currentSpeed: number;
  vibrationLevel: number;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => Promise<void>;
  toggleMonitoring: () => Promise<void>;
  error: string | null;
}

export function useParkingDetector(
  config: DetectionConfig = DEFAULT_CONFIG,
): UseParkingDetectorResult {
  const [state, setState] = useState<ParkingState>('idle');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [vibrationLevel, setVibrationLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Refs for tracking state transitions
  const stateRef = useRef<ParkingState>('idle');
  const possiblyParkedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAccelDataRef = useRef<AccelerometerData | null>(null);
  const lastLocationDataRef = useRef<LocationData | null>(null);
  const vibrationLevelRef = useRef<number>(0);

  // Update ref when state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Handle accelerometer data
  const handleAccelerometerData = useCallback(
    (data: AccelerometerData) => {
      lastAccelDataRef.current = data;
      
      // Calculate vibration directly
      const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
      const vibration = Math.abs(magnitude - 9.8);
      
      setVibrationLevel(vibration);
      vibrationLevelRef.current = vibration;
    },
    [],
  );

  // Handle location data and state transitions
  const handleLocationData = useCallback(
    (data: LocationData) => {
      lastLocationDataRef.current = data;
      const speedKmh = data.speed !== null ? data.speed * 3.6 : 0;
      setCurrentSpeed(speedKmh);

      const currentState = stateRef.current;
      const vibration = vibrationLevelRef.current;

      // State machine logic
      switch (currentState) {
        case 'monitoring':
          // Check if driving has started
          if (
            speedKmh > config.drivingSpeedThreshold &&
            vibration > config.vibrationThreshold
          ) {
            setState('driving');
            backgroundService.updateNotification(
              'Driving detected',
              `Speed: ${speedKmh.toFixed(1)} km/h`,
            );
          }
          break;

        case 'driving':
          // Update notification with current speed
          backgroundService.updateNotification(
            'Driving',
            `Speed: ${speedKmh.toFixed(1)} km/h`,
          );

          // Check if stopped
          if (speedKmh < config.parkedSpeedThreshold) {
            setState('possibly_parked');
            backgroundService.updateNotification(
              'Possibly parked',
              'Waiting for confirmation...',
            );

            // Start confirmation timer
            possiblyParkedTimerRef.current = setTimeout(() => {
              if (stateRef.current === 'possibly_parked') {
                setState('parked');
                notificationService.sendParkingNotification();
                backgroundService.updateNotification(
                  'Parked!',
                  'Notification sent',
                );

                // Reset to monitoring after a short delay
                setTimeout(() => {
                  if (stateRef.current === 'parked') {
                    setState('monitoring');
                    backgroundService.updateNotification(
                      'ParkPing is active',
                      'Monitoring for parking...',
                    );
                  }
                }, 5000);
              }
            }, config.confirmationDelay);
          }
          break;

        case 'possibly_parked':
          // If speed increases again, cancel the parking confirmation
          if (speedKmh > config.parkedSpeedThreshold) {
            if (possiblyParkedTimerRef.current) {
              clearTimeout(possiblyParkedTimerRef.current);
              possiblyParkedTimerRef.current = null;
            }
            setState('driving');
            backgroundService.updateNotification(
              'Driving again',
              `Speed: ${speedKmh.toFixed(1)} km/h`,
            );
          }
          break;

        case 'parked':
          // If movement detected after parking, go back to monitoring
          if (speedKmh > config.drivingSpeedThreshold) {
            setState('monitoring');
            backgroundService.updateNotification(
              'ParkPing is active',
              'Monitoring for parking...',
            );
          }
          break;
      }
    },
    [config, vibrationLevel],
  );

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    try {
      setError(null);

      // Request permissions
      const hasPermission = await sensorService.requestPermissions();
      if (!hasPermission) {
        setError('Location permission denied');
        return;
      }

      // Configure notifications
      notificationService.configure();

      // Start sensors
      sensorService.startAccelerometer(
        handleAccelerometerData,
        config.sensorUpdateInterval,
      );
      sensorService.startLocationTracking(handleLocationData, err => {
        setError(`Location error: ${err.message}`);
      });

      // Start background service
      await backgroundService.start({
        onTick: async () => {
          // The tick is mainly for keeping the service alive
          // Actual processing happens in sensor callbacks
        },
        interval: config.sensorUpdateInterval,
      });

      setState('monitoring');
      setIsMonitoring(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Failed to start monitoring:', err);
    }
  }, [config, handleAccelerometerData, handleLocationData]);

  // Stop monitoring
  const stopMonitoring = useCallback(async () => {
    try {
      // Clear any pending timers
      if (possiblyParkedTimerRef.current) {
        clearTimeout(possiblyParkedTimerRef.current);
        possiblyParkedTimerRef.current = null;
      }

      // Stop sensors
      sensorService.stopAll();

      // Stop background service
      await backgroundService.stop();

      // Cancel notifications
      notificationService.cancelMonitoringNotification();

      setState('idle');
      setIsMonitoring(false);
      setCurrentSpeed(0);
      setVibrationLevel(0);
    } catch (err) {
      console.error('Failed to stop monitoring:', err);
    }
  }, []);

  // Toggle monitoring
  const toggleMonitoring = useCallback(async () => {
    if (isMonitoring) {
      await stopMonitoring();
    } else {
      await startMonitoring();
    }
  }, [isMonitoring, startMonitoring, stopMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (possiblyParkedTimerRef.current) {
        clearTimeout(possiblyParkedTimerRef.current);
      }
      sensorService.stopAll();
    };
  }, []);

  return {
    state,
    isMonitoring,
    currentSpeed,
    vibrationLevel,
    startMonitoring,
    stopMonitoring,
    toggleMonitoring,
    error,
  };
}