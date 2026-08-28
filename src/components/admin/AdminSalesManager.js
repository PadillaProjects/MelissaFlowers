import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import './AdminSalesManager.css';

const AdminSalesManager = () => {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [saleItems, setSaleItems] = useState([]);
  
  const [bolisCategories, setBolisCategories] = useState([]);
  const [selectedFlavors, setSelectedFlavors] = useState([]);

  // New Sale Form
  const [newSale, setNewSale] = useState({
    slug: '', name: '', location: '', time: '', cashappLink: '', showCashapp: false
  });

  // New Sale Item Form (Bulk)
  const [newItem, setNewItem] = useState({
    size: '', price: '', inventoryMode: 'unlimited', quantityAvailable: 0, maxPerOrder: 5
  });

  const fetchSales = async () => {
    const salesSnapshot = await getDocs(collection(db, 'sales'));
    setSales(salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchBolisCategories = async () => {
    const bolisCatSnapshot = await getDocs(collection(db, "bolisCategories"));
    setBolisCategories(bolisCatSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchSaleItems = async (saleId) => {
    const itemsSnapshot = await getDocs(collection(db, `sales/${saleId}/saleItems`));
    setSaleItems(itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchSales();
    fetchBolisCategories();
  }, []);

  useEffect(() => {
    if (selectedSale) {
      fetchSaleItems(selectedSale.id);
    }
  }, [selectedSale]);

  const toggleFlavor = (flavor) => {
    if (selectedFlavors.includes(flavor)) {
      setSelectedFlavors(selectedFlavors.filter(f => f !== flavor));
    } else {
      setSelectedFlavors([...selectedFlavors, flavor]);
    }
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();
    if (!newSale.slug || !newSale.name) return alert("Slug and Name are required.");
    
    // Ensure slug doesn't have spaces
    const safeSlug = newSale.slug.replace(/\s+/g, '-').toLowerCase();

    try {
      await addDoc(collection(db, 'sales'), { ...newSale, slug: safeSlug, createdAt: new Date() });
      setNewSale({ slug: '', name: '', location: '', time: '', cashappLink: '', showCashapp: false });
      fetchSales();
      alert("Sale created!");
    } catch (err) {
      console.error(err);
      alert("Error creating sale.");
    }
  };

  const handleDeleteSale = async (id) => {
    if (!window.confirm("Delete this sale entirely?")) return;
    try {
      await deleteDoc(doc(db, 'sales', id));
      if (selectedSale?.id === id) setSelectedSale(null);
      fetchSales();
    } catch (err) {
      console.error(err);
      alert("Error deleting sale.");
    }
  };

  const handleBulkAddSaleItems = async (e) => {
    e.preventDefault();
    if (!selectedSale || selectedFlavors.length === 0 || !newItem.price) return alert("Select at least one flavor and specify a price.");
    
    try {
      for (const flavor of selectedFlavors) {
        await addDoc(collection(db, `sales/${selectedSale.id}/saleItems`), {
          name: flavor,
          size: newItem.size,
          price: Number(newItem.price),
          inventoryMode: newItem.inventoryMode,
          quantityAvailable: Number(newItem.quantityAvailable),
          maxPerOrder: Number(newItem.maxPerOrder)
        });
      }
      
      setNewItem({ size: '', price: '', inventoryMode: 'unlimited', quantityAvailable: 0, maxPerOrder: 5 });
      setSelectedFlavors([]);
      fetchSaleItems(selectedSale.id);
      alert("Items added!");
    } catch (err) {
      console.error(err);
      alert("Error adding items to sale.");
    }
  };

  const handleDeleteSaleItem = async (itemId) => {
    if (!window.confirm("Remove item from sale?")) return;
    try {
      await deleteDoc(doc(db, `sales/${selectedSale.id}/saleItems`, itemId));
      fetchSaleItems(selectedSale.id);
    } catch (err) {
      console.error(err);
      alert("Error deleting item.");
    }
  };

  return (
    <div className="admin-sales-manager">
      <h2>Manage Bolis Sales Events</h2>
      
      <div className="create-sale-section">
        <h3>Create New Sale Link</h3>
        <form onSubmit={handleCreateSale} className="admin-form">
          <input type="text" placeholder="Slug (e.g. saturday-park)" value={newSale.slug} onChange={e => setNewSale({...newSale, slug: e.target.value})} required />
          <input type="text" placeholder="Sale Name" value={newSale.name} onChange={e => setNewSale({...newSale, name: e.target.value})} required />
          <input type="text" placeholder="Location (e.g. Central Park)" value={newSale.location} onChange={e => setNewSale({...newSale, location: e.target.value})} />
          <input type="text" placeholder="Time (e.g. 3:00 PM - 5:00 PM)" value={newSale.time} onChange={e => setNewSale({...newSale, time: e.target.value})} />
          <input type="text" placeholder="CashApp Link (Optional)" value={newSale.cashappLink} onChange={e => setNewSale({...newSale, cashappLink: e.target.value})} />
          <label>
            <input type="checkbox" checked={newSale.showCashapp} onChange={e => setNewSale({...newSale, showCashapp: e.target.checked})} />
            Show CashApp at Checkout
          </label>
          <button type="submit" style={{ backgroundColor: "#c74c4c" }}>Create Sale</button>
        </form>
      </div>

      <div className="sales-list-section">
        <h3>Existing Sales</h3>
        {sales.map(sale => (
          <div key={sale.id} className="sale-list-item">
            <div>
              <strong>{sale.name}</strong> 
              <br/>
              <small>Link: /#/sale/{sale.slug}</small>
            </div>
            <div>
              <button onClick={() => setSelectedSale(sale)}>Manage Items</button>
              <button onClick={() => handleDeleteSale(sale.id)} style={{ backgroundColor: '#ff4d4d', marginLeft: '10px' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {selectedSale && (
        <div className="sale-items-manager">
          <h3>Items for: {selectedSale.name}</h3>
          
          <div className="bolis-selection-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            {bolisCategories.map(cat => (
              <div key={cat.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#c74c4c' }}>{cat.name}</h4>
                {cat.flavors?.map(flavor => (
                  <label key={flavor} style={{ display: 'block', margin: '5px 0', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedFlavors.includes(flavor)}
                      onChange={() => toggleFlavor(flavor)}
                      style={{ marginRight: '10px' }}
                    />
                    {flavor}
                  </label>
                ))}
              </div>
            ))}
          </div>
          
          <form onSubmit={handleBulkAddSaleItems} className="admin-form sale-item-form">
            <input type="text" placeholder="Size (e.g. 6oz)" value={newItem.size} onChange={e => setNewItem({...newItem, size: e.target.value})} required />
            <input type="number" placeholder="Price" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} required step="0.01" />
            
            <select value={newItem.inventoryMode} onChange={e => setNewItem({...newItem, inventoryMode: e.target.value})}>
              <option value="unlimited">Unlimited (No tracking)</option>
              <option value="tracked">Track Inventory</option>
            </select>
            
            {newItem.inventoryMode === 'tracked' ? (
              <input type="number" placeholder="Quantity Available" value={newItem.quantityAvailable} onChange={e => setNewItem({...newItem, quantityAvailable: e.target.value})} required />
            ) : (
              <input type="number" placeholder="Max Allowed Per Order" value={newItem.maxPerOrder} onChange={e => setNewItem({...newItem, maxPerOrder: e.target.value})} required />
            )}
            
            <button type="submit" style={{ backgroundColor: "#28a745" }}>Add Selected Flavors</button>
          </form>

          <table className="sale-items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Size</th>
                <th>Price</th>
                <th>Mode</th>
                <th>Inventory/Limit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {saleItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.size}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.inventoryMode}</td>
                  <td>
                    {item.inventoryMode === 'tracked' ? `${item.quantityAvailable} left` : `Max ${item.maxPerOrder}/order`}
                  </td>
                  <td>
                    <button onClick={() => handleDeleteSaleItem(item.id)} style={{ backgroundColor: '#ff4d4d', padding: '5px' }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSalesManager;
