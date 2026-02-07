import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth Store
export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  biometricEnabled: false,
  
  setUser: (user, token, role) => {
    set({ user, token, role, isAuthenticated: true });
    AsyncStorage.setItem('auth_token', token);
    AsyncStorage.setItem('user', JSON.stringify(user));
    AsyncStorage.setItem('user_role', role);
  },
  
  setBiometric: (enabled) => {
    set({ biometricEnabled: enabled });
    AsyncStorage.setItem('biometric_enabled', enabled ? 'true' : 'false');
  },
  
  loadUser: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userStr = await AsyncStorage.getItem('user');
      const role = await AsyncStorage.getItem('user_role');
      const biometric = await AsyncStorage.getItem('biometric_enabled');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ 
          user, 
          token, 
          role, 
          isAuthenticated: true,
          biometricEnabled: biometric === 'true'
        });
        return true;
      }
    } catch (e) {
      console.error('Error loading user:', e);
    }
    return false;
  },
  
  logout: async () => {
    await AsyncStorage.multiRemove(['auth_token', 'user', 'user_role']);
    set({ user: null, token: null, role: null, isAuthenticated: false });
  },
}));

// Cart Store
export const useCartStore = create((set, get) => ({
  items: [],
  
  addItem: (product, quantity = 1) => {
    const items = get().items;
    const existingIndex = items.findIndex(i => i.product.id === product.id);
    
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += quantity;
      set({ items: newItems });
    } else {
      set({ items: [...items, { product, quantity }] });
    }
  },
  
  removeItem: (productId) => {
    set({ items: get().items.filter(i => i.product.id !== productId) });
  },
  
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const items = get().items.map(i => 
      i.product.id === productId ? { ...i, quantity } : i
    );
    set({ items });
  },
  
  getTotal: () => {
    return get().items.reduce((sum, item) => 
      sum + (item.product.retailer_price * item.quantity), 0
    );
  },
  
  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
  
  clearCart: () => set({ items: [] }),
}));

// Location Store
export const useLocationStore = create((set) => ({
  currentLocation: null,
  address: null,
  
  setLocation: (location, address) => {
    set({ currentLocation: location, address });
  },
}));
