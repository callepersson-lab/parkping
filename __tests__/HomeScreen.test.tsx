import React from "react";
import ReactTestRenderer from "react-test-renderer";
import { TouchableOpacity } from "react-native";
import { HomeScreen } from "../src/screens/HomeScreen";

// Mock the hook so we control the screen state.
jest.mock("../src/hooks/useParkingDetector", () => ({
  useParkingDetector: jest.fn(),
}));

import { useParkingDetector } from "../src/hooks/useParkingDetector";

describe("HomeScreen - flow", () => {
  it("tapping map icon navigates to LastParkingMap with coords", () => {
    // Arrange: make HomeScreen think we are monitoring with a last parking.
    (useParkingDetector as jest.Mock).mockReturnValue({
      state: "monitoring",
      isMonitoring: true,
      currentSpeed: 0,
      vibrationLevel: 0,
      toggleMonitoring: jest.fn(),
      error: null,
      lastParking: {
        id: "p1",
        latitude: 59.3293,
        longitude: 18.0686,
        timestamp: 123,
      },
    });

    // Arrange: mock navigation so we can assert navigation calls.
    const navigation = { navigate: jest.fn() } as any;

    // Arrange: provide required route prop for the "Main" screen.
    const route = { key: "Main", name: "Main", params: undefined } as any;

    // Act: render the screen inside act to flush mount updates.
    let tree: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <HomeScreen navigation={navigation} route={route} />,
      );
    });

    // Act: press the map icon button (shown when monitoring + lastParking exists).
    const touchables = tree!.root.findAllByType(TouchableOpacity);
    ReactTestRenderer.act(() => {
      touchables[0].props.onPress();
    });

    // Assert: navigation happens with the correct route + params.
    expect(navigation.navigate).toHaveBeenCalledWith("LastParkingMap", {
      latitude: 59.3293,
      longitude: 18.0686,
    });
  });
});
