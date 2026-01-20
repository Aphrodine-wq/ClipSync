/**
 * ClipSync Mobile App
 * Main application component for iOS and Android
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Platform, View, Text } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';

import { useAuthStore } from './store/useAuthStore';
import { useClipStore } from './store/useClipStore';
import { clipboardService as ClipboardService } from './services/clipboard';
import { SyncService } from './services/sync';

// ...
const Stack = createStackNavigator();
const LoginScreen = () => <View><Text>Login Placeholder</Text></View>;
const MainTabs = () => <View><Text>Main Tabs Placeholder</Text></View>;
const ClipDetailScreen = () => <View><Text>Clip Detail</Text></View>;

export default function App() {
  console.log('App: Rendering start');
  const { isAuthenticated, initialize: initAuth } = useAuthStore();
  const { initialize: initClips } = useClipStore();
  // const isAuthenticated = false; // Hardcoded for debug

  useEffect(() => {
    // Initialize services
    initAuth();
    initClips();

    // Start clipboard monitoring
    ClipboardService.startMonitoring();

    // Start sync service
    if (isAuthenticated) {
      SyncService.connect();
    }

    return () => {
      ClipboardService.stopMonitoring();
      SyncService.disconnect();
    };
  }, [isAuthenticated, initAuth, initClips]);

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#ffffff"
      />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="ClipDetail"
              component={ClipDetailScreen}
              options={{ headerShown: true, title: 'Clip Details' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
