/**
 * ClipSync Mobile App
 * Main application component for iOS and Android
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Platform, View, Text, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuthStore } from './store/useAuthStore';
import { useClipStore } from './store/useClipStore';
import { clipboardService as ClipboardService } from './services/clipboard';
import { SyncService } from './services/sync';

// Import actual screens
import LoginScreen from './screens/LoginScreen';
import HistoryScreen from './screens/HistoryScreen';
import SnippetsScreen from './screens/SnippetsScreen';
import TeamsScreen from './screens/TeamsScreen';
import SettingsScreen from './screens/SettingsScreen';
import ClipDetailScreen from './screens/ClipDetailScreen';

/**
 * Error Boundary Component
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            🚨 App Error
          </Text>
          <Text style={{ fontSize: 14, marginBottom: 20, textAlign: 'center', color: '#666' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
            Check Metro bundler logs for more details
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Loading screen
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={{ marginTop: 12, fontSize: 14, color: '#666' }}>
        Initializing ClipSync...
      </Text>
    </View>
  );
}

// Main tab navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap = 'history';

          if (route.name === 'History') {
            iconName = 'history';
          } else if (route.name === 'Snippets') {
            iconName = 'code';
          } else if (route.name === 'Teams') {
            iconName = 'group';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#111827',
      })}
    >
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Clipboard' }} />
      <Tab.Screen name="Snippets" component={SnippetsScreen} />
      <Tab.Screen name="Teams" component={TeamsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AppContent() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated, initialize: initAuth } = useAuthStore();
  const { initialize: initClips } = useClipStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[App] Starting initialization...');
        await initAuth();
        await initClips();

        // Start clipboard monitoring
        try {
          ClipboardService.startMonitoring();
          console.log('[App] Clipboard monitoring started');
        } catch (error) {
          console.error('[App] Clipboard monitoring failed:', error);
        }

        console.log('[App] Initialization complete, authenticated:', isAuthenticated);
        setIsInitialized(true);
      } catch (error) {
        console.error('[App] Initialization failed:', error);
        setIsInitialized(true);
      }
    };

    initializeApp();

    return () => {
      ClipboardService.stopMonitoring();
      SyncService.disconnect();
    };
  }, [initAuth, initClips]);

  // Connect to sync when authenticated
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      console.log('[App] Authenticated, connecting to sync service...');
      SyncService.connect();
    }
  }, [isAuthenticated, isInitialized]);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

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

export default function App() {
  console.log('[App] Rendering with ErrorBoundary');
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
