import React from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

type LastParkingMapScreenProps = {
  navigation: { goBack: () => void };
  route?: { params?: { latitude?: number; longitude?: number } };
};

export function LastParkingMapScreen({
  navigation,
  route,
}: LastParkingMapScreenProps): React.JSX.Element {
  const latitude = route?.params?.latitude;
  const longitude = route?.params?.longitude;

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.content, { justifyContent: "center" }]}>
          <Text style={styles.errorText}>
            Ingen parkeringsposition tillgänglig.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Tillbaka</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerBack}>‹ Tillbaka</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Din bil</Text>
          <View style={styles.headerSpacer} />
        </View>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <Marker
            coordinate={{ latitude, longitude }}
            title="Senaste parkering"
            description="Din bil är här."
          />
        </MapView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    color: "#D9534F",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonSecondary: {
    backgroundColor: "#4A90D9",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  wrapper: {
    flex: 1,
  },
  header: {
    height: 56,
    backgroundColor: "#1a1a2e",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerBack: {
    color: "#4A90D9",
    fontSize: 16,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 80,
  },
  map: {
    flex: 1,
  },
});
