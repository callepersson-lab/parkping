import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {useParkingDetector} from './hooks/useParkingDetector';
import {ParkingState, DEV_CONFIG} from './types';

// Use DEV_CONFIG for testing (10 sec delay), switch to DEFAULT_CONFIG for production
const config = __DEV__ ? DEV_CONFIG : DEV_CONFIG;

function getStateText(state: ParkingState): string {
  switch (state) {
    case 'idle':
      return 'Av';
    case 'monitoring':
      return 'Övervakar...';
    case 'driving':
      return 'Kör';
    case 'possibly_parked':
      return 'Möjlig parkering...';
    case 'parked':
      return 'Parkerad!';
  }
}

function getStateColor(state: ParkingState): string {
  switch (state) {
    case 'idle':
      return '#888888';
    case 'monitoring':
      return '#4A90D9';
    case 'driving':
      return '#5CB85C';
    case 'possibly_parked':
      return '#F0AD4E';
    case 'parked':
      return '#D9534F';
  }
}

function App(): React.JSX.Element {
  const {
    state,
    isMonitoring,
    currentSpeed,
    vibrationLevel,
    toggleMonitoring,
    error,
  } = useParkingDetector(config);

  const stateColor = getStateColor(state);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>ParkPing</Text>
        <Text style={styles.subtitle}>Parkerings-detektor</Text>

        {/* Status indicator */}
        <View style={[styles.statusContainer, {borderColor: stateColor}]}>
          <View style={[styles.statusDot, {backgroundColor: stateColor}]} />
          <Text style={[styles.statusText, {color: stateColor}]}>
            {getStateText(state)}
          </Text>
        </View>

        {/* Sensor data (only show when monitoring) */}
        {isMonitoring && (
          <View style={styles.dataContainer}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Hastighet:</Text>
              <Text style={styles.dataValue}>
                {currentSpeed.toFixed(1)} km/h
              </Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Vibration:</Text>
              <Text style={styles.dataValue}>{vibrationLevel.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Toggle button */}
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isMonitoring ? styles.toggleButtonActive : styles.toggleButtonInactive,
          ]}
          onPress={toggleMonitoring}
          activeOpacity={0.8}>
          <Text style={styles.toggleButtonText}>
            {isMonitoring ? 'STOPP' : 'START'}
          </Text>
        </TouchableOpacity>

        {/* Instructions */}
        <Text style={styles.instructions}>
          {isMonitoring
            ? 'Övervakning är aktiv. Du får en notis när du parkerar.'
            : 'Tryck START för att börja övervaka.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#8888aa',
    marginBottom: 40,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    borderWidth: 2,
    marginBottom: 30,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
  dataContainer: {
    backgroundColor: '#2a2a4e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    minWidth: 200,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  dataLabel: {
    fontSize: 16,
    color: '#8888aa',
  },
  dataValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 20,
  },
  errorContainer: {
    backgroundColor: '#D9534F33',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#D9534F',
    fontSize: 14,
    textAlign: 'center',
  },
  toggleButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toggleButtonInactive: {
    backgroundColor: '#4A90D9',
  },
  toggleButtonActive: {
    backgroundColor: '#D9534F',
  },
  toggleButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  instructions: {
    fontSize: 14,
    color: '#8888aa',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default App;
