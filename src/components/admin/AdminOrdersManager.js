import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './AdminOrdersManager.css';

const AdminOrdersManager = () => {
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState({});
  const [filterSaleId, setFilterSaleId] = useState('all');

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

  const filteredOrders = filterSaleId === 'all' 
    ? orders 
    : orders.filter(o => o.saleId === filterSaleId);

  return (
    <div className="admin-orders-manager">
      <h2>Manage Orders</h2>

      <div className="orders-filter">
        <label>Filter by Sale: </label>
        <select value={filterSaleId} onChange={e => setFilterSaleId(e.target.value)}>
          <option value="all">All Sales</option>
          {Object.entries(sales).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>{order.trackingNumber}</h3>
                <span className={`order-status status-${order.status.replace(/\s+/g, '-')}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="order-details-grid">
                <div>
                  <p><strong>Customer:</strong> {order.customerName}</p>
                  <p><strong>Phone:</strong> {order.customerPhone}</p>
                  {order.customerEmail && <p><strong>Email:</strong> {order.customerEmail}</p>}
                  <p><strong>Sale:</strong> {sales[order.saleId] || 'Unknown Sale'}</p>
                  <p>
                    <strong>Total:</strong> ${Number(order.totalAmount).toFixed(2)}
                    {(() => {
                      const recalc = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                      if (Math.abs(recalc - Number(order.totalAmount)) > 0.01) {
                        return <span style={{ color: 'red', marginLeft: '10px' }}> (Should be ${recalc.toFixed(2)}) <button onClick={() => handleRecalculate(order.id, recalc)} style={{ padding: '2px 8px', fontSize: '0.8rem', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' }}>Fix</button></span>;
                      }
                      return <span style={{ color: 'green', marginLeft: '5px' }}>✓</span>;
                    })()}
                  </p>
                  <p><strong>Date:</strong> {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'N/A'}</p>
                </div>
                
                <div>
                  <h4>Items:</h4>
                  <ul className="order-items-list">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.quantity}x {item.name} ({item.size}) - ${(item.price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="order-actions">
                <label>Update Status: </label>
                <select 
                  value={order.status} 
                  onChange={e => handleStatusChange(order.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="already paid">Already Paid</option>
                  <option value="delivered but need payment">Delivered (Needs Payment)</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrdersManager;
