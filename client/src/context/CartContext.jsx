import React, { createContext, useContext, useReducer, useEffect } from 'react'

const CartContext = createContext(null)

const initialState = {
  items: [],
  isCartOpen: false,
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i._id === action.payload.product._id)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i._id === action.payload.product._id
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload.product, quantity: action.payload.quantity }],
      }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i._id !== action.payload) }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter(i => i._id !== action.payload.productId) }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i._id === action.payload.productId ? { ...i, quantity: action.payload.quantity } : i
        ),
      }
    }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    case 'SET_CART_OPEN':
      return { ...state, isCartOpen: action.payload }
    default:
      return state
  }
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('ve_cart')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, {
    ...initialState,
    items: loadFromStorage(),
  })

  useEffect(() => {
    localStorage.setItem('ve_cart', JSON.stringify(state.items))
  }, [state.items])

  const cartTotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const cartCount = state.items.reduce((sum, i) => sum + i.quantity, 0)

  const addToCart = (product, quantity = 1) =>
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } })

  const removeFromCart = (productId) =>
    dispatch({ type: 'REMOVE_ITEM', payload: productId })

  const updateQuantity = (productId, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } })

  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  const setCartOpen = (open) => dispatch({ type: 'SET_CART_OPEN', payload: open })

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isCartOpen: state.isCartOpen,
        cartTotal,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
