import {accelerometer, setUpdateIntervalForType, SensorTypes} from 'react-native-sensors';
import Geolocation from '@react-native-community/geolocation';
import {Platform, PermissionsAndroid} from 'react-native';
import {AccelerometerData, LocationData} from '../types';
import {Subscription} from 'rxjs';

// Define types locally since they're not exported by the library
interface GeoPosition {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

interface GeoError {
  code: number;
  message: string;
}

class SensorService {
  private accelerometerSubscription: Subscription | null = null;
  private locationWatchId: number | null = null;

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const fineLocation = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Platsbehörighet',
            message: 'ParkPing behöver tillgång till din plats för att detektera parkering.',
            buttonNeutral: 'Fråga senare',
            buttonNegative: 'Avbryt',
            buttonPositive: 'OK',
          },
        );

        const backgroundLocation = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'Bakgrundsplatsbehörighet',
            message: 'ParkPing behöver tillgång till din plats i bakgrunden för att detektera parkering även när appen är minimerad.',
            buttonNeutral: 'Fråga senare',
            buttonNegative: 'Avbryt',
            buttonPositive: 'OK',
          },
        );

        return (
          fineLocation === PermissionsAndroid.RESULTS.GRANTED &&
          (backgroundLocation === PermissionsAndroid.RESULTS.GRANTED ||
           backgroundLocation === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN)
        );
      } catch (err) {
        console.error('Permission request error:', err);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  }

  startAccelerometer(
    onData: (data: AccelerometerData) => void,
    updateInterval: number = 1000,
  ): void {
    // Set update interval
    setUpdateIntervalForType(SensorTypes.accelerometer, updateInterval);

    // Subscribe to accelerometer data
    this.accelerometerSubscription = accelerometer.subscribe({
      next: ({x, y, z, timestamp}) => {
        onData({x, y, z, timestamp});
      },
      error: err => {
        console.error('Accelerometer error:', err);
      },
    });
  }

  stopAccelerometer(): void {
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.unsubscribe();
      this.accelerometerSubscription = null;
    }
  }

  startLocationTracking(
    onLocation: (data: LocationData) => void,
    onError?: (error: GeoError) => void,
  ): void {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'always',
      enableBackgroundLocationUpdates: true,
    });

    this.locationWatchId = Geolocation.watchPosition(
      (position: GeoPosition) => {
        const {latitude, longitude, speed, accuracy} = position.coords;
        onLocation({
          latitude,
          longitude,
          speed, // meters per second, can be null
          accuracy,
          timestamp: position.timestamp,
        });
      },
      error => {
        console.error('Location error:', error);
        onError?.(error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 5, // meters
        interval: 1000, // Android only
        fastestInterval: 500, // Android only
      },
    );
  }

  stopLocationTracking(): void {
    if (this.locationWatchId !== null) {
      Geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
  }

  // Calculate vibration magnitude from accelerometer data
  // Subtracts gravity (~9.8) to get net acceleration
  static calculateVibrationMagnitude(data: AccelerometerData): number {
    const magnitude = Math.sqrt(
      data.x * data.x + data.y * data.y + data.z * data.z,
    );
    // Subtract gravity to get net vibration
    return Math.abs(magnitude - 9.8);
  }

  // Convert speed from m/s to km/h
  static speedToKmh(speedMs: number | null): number {
    if (speedMs === null || speedMs < 0) {
      return 0;
    }
    return speedMs * 3.6;
  }

  stopAll(): void {
    this.stopAccelerometer();
    this.stopLocationTracking();
  }
}

export const sensorService = new SensorService();
