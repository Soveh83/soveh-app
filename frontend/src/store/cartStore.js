import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existingIndex = items.findIndex(item => item.product_id === product.id);
        
        if (existingIndex > -1) {
          const newItems = [...items];
          newItems[existingIndex].quantity += quantity;
          newItems[existingIndex].total = newItems[existingIndex].quantity * newItems[existingIndex].price;
          set({ items: newItems });
        } else {
          set({
            items: [...items, {
              product_id: product.id,
              product_name: product.name,
              price: product.retailer_price || product.customer_price,
              mrp: product.mrp,
              quantity,
              total: (product.retailer_price || product.customer_price) * quantity,
              image: product.images?.[0] || null
            }]
          });
        }
      },
      
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.product_id !== productId) });
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const items = get().items.map(item =>
          item.product_id === productId
            ? { ...item, quantity, total: item.price * quantity }
            : item
        );
        set({ items });
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.total, 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
      
      getSavings: () => {
        return get().items.reduce((sum, item) => {
          return sum + ((item.mrp - item.price) * item.quantity);
        }, 0);
      }
    }),
    {
      name: 'sreyanimti-cart'
    }
  )
);
