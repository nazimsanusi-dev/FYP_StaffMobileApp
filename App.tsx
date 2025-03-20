import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Schedule from './components/Schedule';
import MapPage from './components/MapPage';
import SubmitPage from './components/SubmitPage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => (
  <Tab.Navigator initialRouteName="Schedule">
    <Tab.Screen 
      name="Schedule" 
      component={Schedule} 
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="calendar" color={color} size={size} />
        ),
      }} 
    />
    <Tab.Screen 
      name="Map" 
      component={MapPage} 
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="map" color={color} size={size} />
        ),
      }} 
    />
  </Tab.Navigator>
);

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={TabNavigator} />
        <Stack.Screen name="SubmitPage" component={SubmitPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
