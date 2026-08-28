import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useCart } from '../context/CartContext';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { saleSlug } = useParams();
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  
  const [sale, setSale] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    const fetchSaleData = async () => {
      try {
        const q = query(collection(db, 'sales'), where('slug', '==', saleSlug));
        const saleSnapshot = await getDocs(q);
        if (saleSnapshot.empty) {
          setError('Sale not found.');
          return;
        }
        setSale({ id: saleSnapshot.docs[0].id, ...saleSnapshot.docs[0].data() });
      } catch (err) {
        console.error("Error loading sale:", err);
        setError("Error loading sale.");
      }
    };
    fetchSaleData();
  }, [saleSlug]);

  const handleChange = (e) => {
    let value = e.target.value;
    // Limit name to 50 chars
    if (e.target.name === 'name') value = value.slice(0, 50);
    // Limit phone to 15 chars, digits/dashes/parens/spaces/plus only
    if (e.target.name === 'phone') value = value.replace(/[^\d\s\-()+]/g, '').slice(0, 15);
    // Limit email to 100 chars
    if (e.target.name === 'email') value = value.slice(0, 100);
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.replace(/\D/g, '');
    
    if (!trimmedName || trimmedName.length < 2) {
      alert("Please enter a valid name (at least 2 characters).");
      return;
    }

    if (trimmedPhone.length < 10) {
      alert("Please enter a valid phone number (at least 10 digits).");
      return;
    }
    
    if (cart.length === 0) {
      alert("Your order is empty!");
      return;
    }

    setLoading(true);
    try {
      const trackingNumber = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const orderData = {
        saleId: sale.id,
        trackingNumber,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        items: cart,
        totalAmount: cartTotal,
        status: 'pending',
        createdAt: new Date()
      };

      await addDoc(collection(db, "orders"), orderData);

      // Decrement inventory for tracked items
      for (const item of cart) {
        if (item.inventoryMode === 'tracked') {
          const itemRef = doc(db, `sales/${sale.id}/saleItems`, item.id);
          await updateDoc(itemRef, {
            quantityAvailable: increment(-item.quantity)
          });
        }
      }

      setOrderInfo({ trackingNumber, totalAmount: cartTotal });
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error("Error submitting order:", err);
      alert("Error submitting order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (error) return <div className="checkout-page error">{error}</div>;

  if (success) {
    return (
      <div className="checkout-page success">
        <div className="success-card">
          <h2>Order Submitted Successfully!</h2>
          <p>Thank you for your order, {formData.name}.</p>
          <div className="order-details">
            <p><strong>Tracking Number:</strong> {orderInfo.trackingNumber}</p>
            <p><strong>Total Amount:</strong> ${orderInfo.totalAmount.toFixed(2)}</p>
            <p style={{ marginTop: '1rem', color: '#c74c4c', fontWeight: 'bold' }}>📸 Please take a screenshot of this page for your records.</p>
          </div>
          
          <div className="contact-info-section" style={{ marginTop: '1.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#555' }}>
            <p>If you need to cancel or make modifications to your order, please text us at: <strong>(915) 216-6078</strong></p>
          </div>
          
          {sale?.showCashapp && sale?.cashappLink && (
            <div className="cashapp-section">
              <h3>Payment</h3>
              <p>You can complete your payment via CashApp:</p>
              <a href={sale.cashappLink} target="_blank" rel="noopener noreferrer" className="cashapp-btn">
                Pay with CashApp
              </a>
            </div>
          )}
          
          <button onClick={() => navigate(`/sale/${saleSlug}`)} className="back-btn">
            Back to Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Order</h1>
      {sale && (
        <div className="sale-info-summary">
          <p><strong>Sale:</strong> {sale.name}</p>
          {sale.location && <p><strong>Pickup:</strong> {sale.location}</p>}
          {sale.time && <p><strong>Time:</strong> {sale.time}</p>}
        </div>
      )}

      <div className="checkout-grid">
        <div className="cart-summary-section">
          <h2>Your Order</h2>
          {cart.length === 0 ? (
            <p>Your order is empty.</p>
          ) : (
            <div className="cart-items-list">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-details">
                    <p className="item-name">{item.name}</p>
                    <p className="item-size">{item.size}</p>
                  </div>
                  <div className="cart-item-price">
                    <p>{item.quantity} x ${Number(item.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="cart-total">
                <p>Total: <span>${cartTotal.toFixed(2)}</span></p>
              </div>
            </div>
          )}
        </div>

        <div className="checkout-form-section">
          <h2>Contact Info</h2>
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-group">
              <label>Name (Required)</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone Number (Required)</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email (Optional)</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
            <button type="submit" className="submit-btn" disabled={loading || cart.length === 0}>
              {loading ? "Submitting..." : "Submit Order Request"}
            </button>
          </form>
          <button onClick={() => navigate(`/sale/${saleSlug}`)} className="back-link">
            Cancel and go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
