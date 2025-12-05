import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { cartService } from '../services/supabase';
import { COLORS } from '../constants';

// Import screen components
import { HomeScreen } from '../screens/home/HomeScreen';
import CatalogScreen from '../screens/catalog/CatalogScreen';
import CartScreen from '../screens/cart/CartScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import HelpCenterScreen from '../screens/support/HelpCenterScreen';
import { ProductDetailScreen } from '../screens/catalog/ProductDetailScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const CatalogStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function HomeStackScreens() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Detalle del Producto' }} />
    </HomeStack.Navigator>
  );
}

function CatalogStackScreens() {
  return (
    <CatalogStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <CatalogStack.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Catálogo' }} />
      <CatalogStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Detalle del Producto' }} />
    </CatalogStack.Navigator>
  );
}

export default function TabNavigator() {
  const { user } = useAuth();
  const { data: cart } = useQuery({
    queryKey: ['cartSummary', user?.id],
    queryFn: () => cartService.getCart(),
    enabled: !!user,
  });
  const cartCount = cart?.itemCount || 0;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackScreens}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="CatalogTab"
        component={CatalogStackScreens}
        options={{
          title: 'Catálogo',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-grid" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="CartTab"
        component={CartScreen}
        options={{
          title: 'Carrito',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart" size={size} color={color} />
          ),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.primary,
          },
        }}
      />
      
      <Tab.Screen
        name="OrdersTab"
        component={OrdersScreen}
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="package" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreens}
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function ProfileStackScreens() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <ProfileStack.Screen name="HelpCenter" component={HelpCenterScreen} options={{ title: 'Centro de Ayuda' }} />
    </ProfileStack.Navigator>
  );
}
