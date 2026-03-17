import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { HomeScreen } from "./screens/HomeScreen";
import { LastParkingMapScreen } from "./screens/LastParkingMapScreen";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={HomeScreen} />
        <Stack.Screen name="LastParkingMap" component={LastParkingMapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default App;
