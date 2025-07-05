import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

const CartPage = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartStats,
    isOfflineMode 
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { totalItems, totalPrice } = getCartStats();

  const handleQuantityChange = async (productId, newQuantity) => {
    const quantity = parseInt(newQuantity);
    if (quantity >= 1) {
      await updateQuantity(productId, quantity);
    }
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', '/cart');
      navigate('/login');
      return;
    }
    
    setIsCheckingOut(true);
    
    setTimeout(async () => {
      alert('Order placed successfully! (This is a demo)');
      await clearCart();
      setIsCheckingOut(false);
      navigate('/');
    }, 2000);
  };

  if (cartItems.length === 0) {
    return (
      <div className={styles.container}>
        <h1>Your Cart</h1>
        <div className={styles.emptyCart}>
          <p>Your cart is empty</p>
          <Link to="/" className={styles.continueShoppingButton}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Your Cart</h1>
      
      {isOfflineMode && (
        <div className={styles.offlineNotice}>
          <p>⚠️ Working in offline mode - cart data is stored locally</p>
        </div>
      )}
      
      <div className={styles.cartContent}>
        <div className={styles.cartItems}>
          {cartItems.map(item => (
            <div key={item.id} className={styles.cartItem}>
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className={styles.itemImage}
              />
              
              <div className={styles.itemDetails}>
                <h3 className={styles.itemName}>{item.name}</h3>
                <p className={styles.itemCategory}>{item.category?.name}</p>
                <p className={styles.itemPrice}>€{item.price.toFixed(2)}</p>
              </div>
              
              <div className={styles.itemControls}>
                <div className={styles.quantityControls}>
                  <button 
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    className={styles.quantityInput}
                    min="1"
                  />
                  <button 
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                
                <p className={styles.itemTotal}>
                  €{(item.price * item.quantity).toFixed(2)}
                </p>
                
                <button 
                  className={styles.removeButton}
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.cartSummary}>
          <h3>Order Summary</h3>
          
          <div className={styles.summaryRow}>
            <span>Items ({totalItems}):</span>
            <span>€{totalPrice.toFixed(2)}</span>
          </div>
          
          <div className={styles.summaryRow}>
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          
          <div className={styles.summaryTotal}>
            <span>Total:</span>
            <span>€{totalPrice.toFixed(2)}</span>
          </div>
          
          {!isAuthenticated && (
            <div className={styles.loginPrompt}>
              <p>You need to log in to complete your order</p>
            </div>
          )}
          
          <button 
            className={styles.checkoutButton}
            onClick={handleCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? 'Processing...' : 
             isAuthenticated ? 'Checkout' : 'Login to Checkout'}
          </button>
          
          <button 
            className={styles.clearCartButton}
            onClick={handleClearCart}
          >
            Clear Cart
          </button>
        </div>
      </div>
      
      <Link to="/" className={styles.continueShoppingLink}>
        ← Continue Shopping
      </Link>
    </div>
  );
};

export default CartPage;
