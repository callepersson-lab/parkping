# Learning Journey: Automated Testing in ParkPing

## Part 1: Where I Started

I took on Issue #4 in ParkPing - setting up automated tests.

The truth: I've never written an automated test before. Not in JavaScript, not in C#, not at all.

But I want to do this thoroughly. Not because it's "the right way" but because I want to learn new things systematically.

### What is a test? (in my own words)

A test is when you create an environment where you can test the code to see what happens before putting it into production. So that the entire system doesn't crash when you run it.

Why test? To be able to test features before adding them to the project.

### How I test today (without knowing it was "testing")

In SalesFlow, when I have a method like CalculateTotalPrice():
- I add Console.WriteLine() to see what happens
- Then I start the entire program, manually create test data, and check if the number looks reasonable

**The problem with this:**
- I have to start the entire program every time
- I have to manually create test data
- I have to look and judge myself
- If something breaks in 3 months - how do I know what broke?
- When Calle reviews my code - how does he know it works?

### The insight: Automated tests

Instead of running the program 100 times and checking manually, I can write code that automatically tests my code.

**What this means:**
- The tests tell Calle that he can use the code in production
- If the test turns red after a change, we know something broke
- We can run the tests as many times as we want without starting the entire app

### ParkPing: What should be tested?

The app should:
1. Detect when the car is stationary (under 5 km/h or similar)
2. Wait 1 minute
3. Send a notification

**My test scenarios (from scratch):**

**Scenario 1:** Car goes from 50 km/h to 0 km/h
→ System must be "awakened" (triggered) when car is stationary

**Scenario 2:** Car is stationary for 30 seconds, then starts moving again
→ We must abort the timer and signal that the car is moving again

**Scenario 3:** Car is stationary for 61 seconds
→ Notification should be sent about parking

**Scenario 4:** Car "stands still" but GPS jumps (0-2 km/h)
→ We shouldn't do anything, the car is in motion

**My critical question:** 60 seconds feels short - you stand longer at a traffic light. How will the app know the difference between a traffic light and parking?

### Test strategy: Happy Path first

My insight: We must start with the happy path first to get the initial tests running so we understand the basic idea. Then we build on with thought-out worst-case scenarios.

**Structure:**
- Happy Path (Green) - Car stops → Waits 60s → Notification sent
- Edge Cases (Yellow) - Traffic lights, GPS-noise, quick stops
- Error Cases (Red) - No GPS, no internet, crash

### Next step: Learning to write tests

What I need to understand:
- How do you write a test practically? (Syntax, structure)
- How do you run the test?
- How do you see if it turned green or red?
- How do you test asynchronous things (those 60 seconds)?

Status: Will start by understanding the structure behind a test.

---

## Part 2: My First Test - DONE! ✅

### What I accomplished today (2026-02-15)

**Created my first automated test:**
- Wrote `useParkingDetector.test.ts` with happy path scenario
- Mocked all dependencies (SensorService, NotificationService, BackgroundService)
- Test verifies state transition from 'idle' to 'monitoring'

**Test results:**
```
Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
```

**Pull Request created:**
- https://github.com/callepersson-lab/parkping/pull/[YOUR PR NUMBER]
- Waiting for feedback from Calle

### What I learned

**AAA-pattern in practice:**
- ARRANGE: Set up test data and mocks
- ACT: Perform the action to be tested
- ASSERT: Verify that the result was correct

**Mocking is necessary:**
To test code that uses native modules (sensors, GPS, notifications) we must fake these. Otherwise the tests would require a real phone.

**Red-Green-Refactor:**
1. Wrote test → Turned red (failed)
2. Understood the error (missing mocks)
3. Fixed the problem → Turned green (passed)

This is exactly how professional test-driven development works.

### Next session

Waiting for Calle's feedback on the PR before continuing with more tests.

**Possible next steps:**
- Scenario 2: driving state detection
- Scenario 3: parking confirmation
- Edge cases: permissions denied, no GPS signal

---

## Part 3: Practical Steps - Test Environment Configuration

### What I did

**1. Created jest.config.js**

I understood that Jest needed to be configured to work with React Native. I created the file `jest.config.js` with this code:
```javascript
module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-sensors|@react-native-community|react-native-background-actions|react-native-push-notification)/)',
  ],
  setupFiles: ['./jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};
```

**Why each part:**
- `preset: 'react-native'` - Uses React Native's standard configuration
- `transformIgnorePatterns` - Tells Babel to translate specific packages from `import` to `require`
- `setupFiles` - Points to setup file where we configure mocks
- `moduleFileExtensions` - Which file types Jest should be able to read
- `transform` - Uses Babel to translate TypeScript and modern JavaScript

**2. Created jest.setup.js**

This file configures mocks for dependencies that cannot run on the computer:
```javascript
// jest.setup.js
import 'react-native-gesture-handler/jestSetup';

// Mock async storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock geolocation
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
}));

// Mock push notifications
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  localNotification: jest.fn(),
}));
```

### What I learned

**Mocks return fake values, not real ones**

When we mock sensors we do NOT return real values from the computer (because the computer has no accelerometer or GPS). Instead we return **fake values that we decide** to be able to test the logic.

Example: When the test asks "What is the GPS position?", our mock answers: "59.123, 18.456" (a fake value).

**3. Created mock for react-native-sensors**

Since the tests run on my computer (which doesn't have an accelerometer), I created a fake version of the sensor.

File: `__mocks__/react-native-sensors.js`

This mock returns fake functions instead of trying to read real sensors.

---

## Part 4: Bug Hunt and Breakthrough! 🔥

### Date: 2026-02-15

### What I was going to do
Write a second test: from "monitoring" to "driving" when the car starts moving.

### What happened instead
I encountered a real problem in Calle's code and spent hours debugging.

---

### The Problem: Test failed constantly

**First test (idle → monitoring):** ✅ Worked perfectly

**Second test (monitoring → driving):** ❌ Failed constantly
- State became "monitoring" instead of "driving"
- Despite sending correct speed and vibration

---

### The Debugging Process

#### Step 1: Understanding how the test should work

I needed to mock both GPS and accelerometer:
```typescript
let locationCallback: any;
let accelerometerCallback: any;

// Capture callbacks when SensorService starts
(sensorService.startLocationTracking as jest.Mock).mockImplementation((callback) => {
  locationCallback = callback;
});

(sensorService.startAccelerometer as jest.Mock).mockImplementation((callback) => {
  accelerometerCallback = callback;
});
```

Then I could simulate sensor data:
```typescript
accelerometerCallback({ x: 2.0, y: 1.5, z: 10.0, timestamp: Date.now() });
locationCallback({ speed: 4.17, ... }); // 15 km/h
```

#### Step 2: Debug logging revealed the problem

I added console.log to see what was happening:
```
vibrationLevel: undefined
currentSpeed: 15.012
state: monitoring
```

**vibrationLevel was undefined!** Despite having sent accelerometer data.

#### Step 3: Found the bug

In `handleLocationData`:
```typescript
const vibration = vibrationLevel; // Reading from React state
```

**The problem:** React state doesn't update synchronously! When `handleAccelerometerData` sets `setVibrationLevel(2.5)` and immediately after `handleLocationData` reads `vibrationLevel`, it's still 0.

#### Step 4: The solution - use refs instead of state
```typescript
// Add ref
const vibrationLevelRef = useRef<number>(0);

// In handleAccelerometerData
setVibrationLevel(vibration);
vibrationLevelRef.current = vibration; // ← Updates immediately!

// In handleLocationData
const vibration = vibrationLevelRef.current; // ← Read from ref instead
```

**This fixed the race condition bug!**

#### Step 5: Simplified unnecessary complexity

This line was completely unnecessary:
```typescript
const vibration = sensorService.constructor.prototype.constructor.calculateVibrationMagnitude
  ? (sensorService as any).constructor.calculateVibrationMagnitude(data)
  : Math.abs(Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2) - 9.8);
```

Simplified to:
```typescript
const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
const vibration = Math.abs(magnitude - 9.8);
```

#### Step 6: Final error - vibration too low
```
vibrationLevel: 0.507
config.vibrationThreshold: 1.5
```

The test used too low values! Changed from `{x: 2.0, y: 1.5, z: 10.0}` to `{x: 5.0, y: 5.0, z: 15.0}`.

**Then the test turned green!** ✅

---

### Results
```
Test Suites: 2 passed, 2 total
Tests:       3 passed, 3 total
```

---

### What I Learned

**1. Race conditions are real**
React state doesn't update synchronously. If you need immediate access to a value - use refs.

**2. Debug-driven testing**
Console.log in tests is invaluable for understanding what's happening. When a test fails - log everything!

**3. Understand the code you're testing**
I couldn't write the test until I understood how `handleLocationData` and `handleAccelerometerData` actually worked.

**4. Persistence pays off**
Several hours of debugging, but I found and fixed a real bug in the production code.

**5. Testing reveals hidden problems**
Without the test, this race condition would have been almost impossible to find. It only happens under specific timings.

---

### Code Improvements I Made

1. ✅ Added `vibrationLevelRef` to fix race condition
2. ✅ Simplified `handleAccelerometerData` calculation
3. ✅ Wrote working test for monitoring → driving transition

---

### Next Session

**Possible continuations:**
- Test for "possibly_parked" state
- Test for "parked" state with timer
- Edge cases: permissions denied, no GPS
- Cleanup and refactoring

But first - wait for Calle's feedback on the bug fix!

---

### Reflection

This wasn't just testing - it was real problem solving.

I:
- Found a bug
- Fixed it systematically
- Improved code quality
- Proved that I don't give up