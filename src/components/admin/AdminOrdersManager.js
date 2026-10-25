import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { FaShoppingBag, FaPhone, FaEnvelope, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import './AdminOrdersManager.css';

const AdminOrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState({});
  const [filterSaleId, setFilterSaleId] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');

  const fetchOrdersAndSales = async () => {
    // Fetch sales to map IDs to Names
    const salesSnapshot = await getDocs(collection(db, 'sales'));
    const salesMap = {};
    salesSnapshot.docs.forEach(d => {
      salesMap[d.id] = d.data().name;
    });
    setSales(salesMap);

    // Fetch Orders
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const ordersSnapshot = await getDocs(q);
    setOrders(ordersSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchOrdersAndSales();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error(err);
      alert("Error updating order status.");
    }
  };

  const handleRecalculate = async (orderId, correctTotal) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { totalAmount: correctTotal });
      setOrders(orders.map(o => o.id === orderId ? { ...o, totalAmount: correctTotal } : o));
    } catch (err) {
      console.error(err);
      alert("Error updating total.");
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSale = filterSaleId === 'all' || o.saleId === filterSaleId;
    if (!matchesSale) return false;
    if (!orderSearch.trim()) return true;

    const queryLower = orderSearch.toLowerCase();
    const matchesTracking = o.trackingNumber && o.trackingNumber.toLowerCase().includes(queryLower);
    const matchesName = o.customerName && o.customerName.toLowerCase().includes(queryLower);
    const matchesPhone = o.customerPhone && o.customerPhone.includes(queryLower);
    return matchesTracking || matchesName || matchesPhone;
  });

  return (
    <div className="admin-orders-manager">
      <div className="orders-manager-header">
        <h2 className="orders-manager-title">
          <FaShoppingBag /> Gestión de Pedidos ({orders.length})
        </h2>

        <div className="orders-filter-bar">
          <div className="admin-search-wrap" style={{ minWidth: '220px' }}>
            <FaSearch className="admin-search-icon" />
            <input
              type="text"
              placeholder="Buscar por cliente, tracking o tel..."
              value={orderSearch}
              onChange={e => setOrderSearch(e.target.value)}
              className="admin-search-input"
              aria-label="Buscar pedidos"
            />
          </div>

          <select 
            value={filterSaleId} 
            onChange={e => setFilterSaleId(e.target.value)}
            className="orders-filter-select"
            aria-label="Filtrar por Venta"
          >
            <option value="all">Todas las Ventas</option>
            {Object.entries(sales).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="admin-empty-state">
            <FaShoppingBag className="admin-empty-state-icon" />
            <p>No se encontraron pedidos con los filtros actuales.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-tracking-wrap">
                  <h3 className="order-tracking-num">#{order.trackingNumber || order.id}</h3>
                  <span className="order-date-tag">
                    <FaCalendarAlt style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('es-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </span>
                </div>
                <span className={`order-status status-${(order.status || 'pending').replace(/\s+/g, '-')}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="order-details-grid">
                <div className="order-customer-info">
                  <p className="order-info-row">
                    <span className="order-info-label">Cliente:</span>
                    <strong>{order.customerName}</strong>
                  </p>
                  <p className="order-info-row">
                    <span className="order-info-label">Teléfono:</span>
                    <a href={`tel:${order.customerPhone}`} className="order-info-link">
                      <FaPhone style={{ fontSize: '0.8rem', marginRight: '4px' }} />
                      {order.customerPhone}
                    </a>
                  </p>
                  {order.customerEmail && (
                    <p className="order-info-row">
                      <span className="order-info-label">Email:</span>
                      <a href={`mailto:${order.customerEmail}`} className="order-info-link">
                        <FaEnvelope style={{ fontSize: '0.8rem', marginRight: '4px' }} />
                        {order.customerEmail}
                      </a>
                    </p>
                  )}
                  <p className="order-info-row">
                    <span className="order-info-label">Venta:</span>
                    <span>{sales[order.saleId] || 'Venta General'}</span>
                  </p>
                  <p className="order-info-row">
                    <span className="order-info-label">Total:</span>
                    <span className="order-total-price">${Number(order.totalAmount).toFixed(2)}</span>
                    {(() => {
                      if (!order.items || !Array.isArray(order.items)) return null;
                      const recalc = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                      if (Math.abs(recalc - Number(order.totalAmount)) > 0.01) {
                        return (
                          <span style={{ color: 'var(--admin-danger)', marginLeft: '10px', fontSize: '0.85rem' }}>
                            (Debería ser ${recalc.toFixed(2)})
                            <button 
                              onClick={() => handleRecalculate(order.id, recalc)} 
                              className="order-fix-btn"
                            >
                              Corregir
                            </button>
                          </span>
                        );
                      }
                      return <span style={{ color: 'var(--admin-success)', marginLeft: '6px' }}>✓</span>;
                    })()}
                  </p>
                </div>
                
                <div className="order-items-box">
                  <h4 className="order-items-title">Artículos ({order.items?.length || 0})</h4>
                  <ul className="order-items-list">
                    {(order.items || []).map((item, idx) => (
                      <li key={idx}>
                        <span>{item.quantity}x {item.name} {item.size ? `(${item.size})` : ''}</span>
                        <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="order-actions">
                <div className="order-status-changer">
                  <label htmlFor={`status-${order.id}`}>Estado:</label>
                  <select 
                    id={`status-${order.id}`}
                    value={order.status} 
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    className="order-status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="already paid">Already Paid</option>
                    <option value="delivered but need payment">Delivered (Needs Payment)</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrdersManager;
