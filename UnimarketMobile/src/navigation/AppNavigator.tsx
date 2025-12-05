import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants';
import { RootStackParamList } from '../types';

// Import navigators
import * as AuthNavModule from './AuthNavigator';
import TabNavigator from './TabNavigator';
// import { ProductDetailScreen } from '../screens/catalog/ProductDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  const AuthNav: any = (AuthNavModule as any).default || (AuthNavModule as any).AuthNavigator;

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: COLORS.primary,
      background: COLORS.background,
      card: COLORS.surface,
      text: COLORS.textPrimary,
      border: COLORS.border,
      notification: COLORS.secondary,
    },
  };

  const paperTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: COLORS.primary,
      secondary: COLORS.secondary,
      background: COLORS.background,
      surface: COLORS.surface,
      onSurface: COLORS.textPrimary,
    },
  } as typeof MD3LightTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="Main" options={{ headerShown: false }}>
              {() => <TabNavigator />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Auth" options={{ headerShown: false }}>
              {() => <AuthNav />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
