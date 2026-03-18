import AsyncStorage from "@react-native-async-storage/async-storage";
import { ParkingEvent, PARKING_HISTORY_KEY } from "../types";

class ParkingHistoryService {
  private readonly MAX_ITEMS = 200;

  private async getHistoryInternal(): Promise<ParkingEvent[]> {
    try {
      const raw = await AsyncStorage.getItem(PARKING_HISTORY_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw) as ParkingEvent[];

      if (!Array.isArray(parsed)) return [];

      return parsed;
    } catch (err) {
      console.error("Failed to load parking history:", err);
      return [];
    }
  }

  private async saveHistory(history: ParkingEvent[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PARKING_HISTORY_KEY, JSON.stringify(history));
    } catch (err) {
      console.error("Failed to save parking history:", err);
    }
  }

  async getHistory(): Promise<ParkingEvent[]> {
    return this.getHistoryInternal();
  }

  async addParkingEvent(event: ParkingEvent): Promise<ParkingEvent[]> {
    const history = await this.getHistoryInternal();

    // Put newest at index 0
    history.unshift(event);

    const trimmed = history.slice(0, this.MAX_ITEMS);
    await this.saveHistory(trimmed);

    return trimmed;
  }

  async getLastParking(): Promise<ParkingEvent | null> {
    const history = await this.getHistoryInternal();
    return history.length > 0 ? history[0] : null;
  }
}

export const parkingHistoryService = new ParkingHistoryService();
