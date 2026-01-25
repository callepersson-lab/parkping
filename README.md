# ParkPing

En React Native-app som automatiskt detekterar nar du har parkerat bilen och skickar en lokal push-notis som paminnelse.

## Funktioner

- Automatisk parkeringsdetektering med GPS och accelerometer
- Lokal push-notis nar parkering detekteras
- Bakgrundskorning - fungerar aven nar appen ar minimerad
- Enkel on/off-knapp for overvakning

## Forsta steget (Windows + Android)

### Forutsattningar

1. **Node.js** (LTS-version) - https://nodejs.org
2. **Android Studio** med:
   - Android SDK
   - Android SDK Platform (Android 13 eller 14)
   - Android Virtual Device (AVD)
3. **Miljovariabler**:
   ```powershell
   ANDROID_HOME = C:\Users\<ditt-namn>\AppData\Local\Android\Sdk
   Path += %ANDROID_HOME%\platform-tools
   Path += %ANDROID_HOME%\emulator
   ```

### Installation

```bash
# Installera beroenden
npm install

# Starta Metro bundler
npm start

# Kor pa Android (i ny terminal)
npm run android
```

## Projektstruktur

```
ParkPing/
├── src/
│   ├── App.tsx                    # Huvud-UI med toggle-knapp
│   ├── hooks/
│   │   └── useParkingDetector.ts  # Logik for parkeringsdetektering
│   ├── services/
│   │   ├── SensorService.ts       # Accelerometer + GPS hantering
│   │   ├── NotificationService.ts # Push-notis konfiguration
│   │   └── BackgroundService.ts   # Bakgrundskorning
│   └── types/
│       └── index.ts               # TypeScript-typer
├── android/                        # Android-specifik config
└── ios/                            # iOS-specifik config
```

## Detekteringslogik

```
KORNING -> STILLASTÅENDE -> NOTIS
   ↓              ↓            ↓
Hog hastighet   Lag hastighet  Efter 1 min
(>10 km/h)      (<5 km/h)      stillastående
+ vibrationer
```

**States:**
1. `idle` - Overvakning av
2. `monitoring` - Vantar pa korning
3. `driving` - Detekterat bilkorning
4. `possibly_parked` - Overgang detekterad, vantar bekraftelse
5. `parked` - Notis skickad

## Testning

For snabbare testning i emulatorn ar fordrojningen satt till 10 sekunder istallet for 1 minut i utvecklingslage.

Tips for testning i emulator:
- Anvand "Extended Controls" -> "Location" for att simulera GPS-rorelse
- Emulator har begransad sensordata

## Bibliotek

| Bibliotek | Syfte |
|-----------|-------|
| `react-native-sensors` | Accelerometerdata |
| `@react-native-community/geolocation` | GPS-hastighet |
| `react-native-push-notification` | Lokala push-notiser |
| `react-native-background-actions` | Bakgrundskorning |
