import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useCartStore } from '../store';
import { COLORS } from '../lib/config';
import { View, Text, StyleSheet } from 'react-native';

// Auth Screens
import AuthScreen from '../screens/auth/AuthScreen';

// Retailer Screens
import HomeScreen from '../screens/retailer/HomeScreen';
import ShopScreen from '../screens/retailer/ShopScreen';
import CartScreen from '../screens/retailer/CartScreen';
import OrdersScreen from '../screens/retailer/OrdersScreen';
import ProfileScreen from '../screens/retailer/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Retailer Tab Navigator
function RetailerTabs() {
  const cart = useCartStore();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Shop':
              iconName = focused ? 'storefront' : 'storefront-outline';
              break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse';
          }
          
          return (
            <View style={styles.tabIconContainer}>
              <Ionicons name={iconName} size={24} color={color} />
              {route.name === 'Cart' && cart.getItemCount() > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cart.getItemCount()}</Text>
                </View>
              )}
            </View>
          );
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Main Navigation
export function Navigation() {
  const { isAuthenticated, role } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          {role === 'retailer' && (
            <Stack.Screen name="RetailerTabs" component={RetailerTabs} />
          )}
          {role === 'admin' && (
            <Stack.Screen name="AdminTabs" component={RetailerTabs} />
          )}
          {role === 'delivery_agent' && (
            <Stack.Screen name="DeliveryTabs" component={RetailerTabs} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    height: 85,
    paddingTop: 10,
    paddingBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
