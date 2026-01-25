// Parking detection states
export type ParkingState =
  | 'idle'           // Monitoring is off
  | 'monitoring'     // Waiting for driving to start
  | 'driving'        // Driving detected (high speed + vibrations)
  | 'possibly_parked'// Transition detected, waiting confirmation
  | 'parked';        // Parking confirmed, notification sent

// Sensor data types
export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  speed: number | null; // meters per second
  accuracy: number;
  timestamp: number;
}

// Configuration for detection thresholds
export interface DetectionConfig {
  // Speed thresholds (km/h)
  drivingSpeedThreshold: number;   // Speed above which we consider driving (default: 10)
  parkedSpeedThreshold: number;    // Speed below which we consider stopped (default: 5)

  // Vibration thresholds
  vibrationThreshold: number;      // Accelerometer magnitude for vibration detection

  // Timing (milliseconds)
  confirmationDelay: number;       // Time to wait before confirming parking (default: 60000)
  sensorUpdateInterval: number;    // How often to check sensors (default: 1000)
}

// Default configuration
export const DEFAULT_CONFIG: DetectionConfig = {
  drivingSpeedThreshold: 10,       // 10 km/h
  parkedSpeedThreshold: 5,         // 5 km/h
  vibrationThreshold: 1.5,         // Acceleration magnitude threshold
  confirmationDelay: 60000,        // 1 minute
  sensorUpdateInterval: 1000,      // 1 second
};

// For testing/development - shorter delays
export const DEV_CONFIG: DetectionConfig = {
  drivingSpeedThreshold: 10,
  parkedSpeedThreshold: 5,
  vibrationThreshold: 1.5,
  confirmationDelay: 10000,        // 10 seconds for testing
  sensorUpdateInterval: 1000,
};
