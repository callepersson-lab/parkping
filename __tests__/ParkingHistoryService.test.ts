import AsyncStorage from "@react-native-async-storage/async-storage";
import { parkingHistoryService } from "../src/services/ParkingHistoryService";
import { ParkingEvent } from "../src/types";

describe("ParkingHistoryService - flow", () => {
  beforeEach(async () => {
    // Reset mocks between tests.
    jest.clearAllMocks();
    // Reset storage state between tests.
    await AsyncStorage.clear();
  });

  it("save → retrieve: newest event becomes last parking", async () => {
    // Arrange: create two parking events.
    const e1: ParkingEvent = {
      id: "1",
      latitude: 1,
      longitude: 2,
      timestamp: 1000,
    };
    const e2: ParkingEvent = {
      id: "2",
      latitude: 3,
      longitude: 4,
      timestamp: 2000,
    };

    // Act: save both events (second should become newest).
    await parkingHistoryService.addParkingEvent(e1);
    await parkingHistoryService.addParkingEvent(e2);

    // Assert: last parking is the newest event.
    const last = await parkingHistoryService.getLastParking();
    expect(last).toEqual(e2);
  });
});
