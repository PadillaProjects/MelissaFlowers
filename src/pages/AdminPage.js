import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { uploadImageToCloudinary } from "../services/cloudinary";
import "./AdminPage.css";

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Data states
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [bolisCategories, setBolisCategories] = useState([]);
  
  // Form states (Gallery)
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  
  // Form states (Bolis)
  const [newBolisCategoryInput, setNewBolisCategoryInput] = useState("");
  const [bolisEditData, setBolisEditData] = useState({});

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchData();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async () => {
    // Fetch Categories
    const catSnapshot = await getDocs(collection(db, "categories"));
    const catList = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(catList);

    // Fetch Items
    const itemsSnapshot = await getDocs(collection(db, "items"));
    const itemsList = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setItems(itemsList);

    // Fetch Bolis Categories
    const bolisCatSnapshot = await getDocs(collection(db, "bolisCategories"));
    const bolisCatList = bolisCatSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBolisCategories(bolisCatList);

    // Initialize edit data state for Bolis
    const editData = {};
    bolisCatList.forEach(cat => {
      editData[cat.id] = {
        sizes: cat.sizes ? cat.sizes.join(", ") : "",
        flavors: cat.flavors ? cat.flavors.join(", ") : ""
      };
    });
    setBolisEditData(editData);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Error logging in: " + error.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryInput) return;
    try {
      await addDoc(collection(db, "categories"), { name: newCategoryInput });
      setNewCategoryInput("");
      fetchData();
      alert("Category added successfully!");
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Error adding category");
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, "items", id));
      fetchData();
      alert("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName || !newItemCategory || imageFiles.length === 0) {
      alert("Please fill in all fields and select at least one image.");
      return;
    }

    setUploading(true);
    try {
      // 1. Upload multiple images to Cloudinary
      const uploadPromises = imageFiles.map(file => uploadImageToCloudinary(file));
      const imageUrls = await Promise.all(uploadPromises);
      
      // 2. Save item to Firestore with imageUrls array
      await addDoc(collection(db, "items"), {
        name: newItemName,
        description: newItemDesc,
        categoryId: newItemCategory,
        imageUrls: imageUrls, // Save as array now
        createdAt: new Date()
      });

      // Reset form
      setNewItemName("");
      setNewItemDesc("");
      setNewItemCategory("");
      setImageFiles([]);
      fetchData();
      alert("Item added successfully!");
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Error adding item");
    } finally {
      setUploading(false);
    }
  };

  // --- Multiple Image Management Handlers ---
  const handleReorderItemImage = async (item, currentIndex, direction) => {
    const urls = item.imageUrls || (item.imageUrl ? [item.imageUrl] : []);
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= urls.length) return;
    
    const newUrls = [...urls];
    const temp = newUrls[currentIndex];
    newUrls[currentIndex] = newUrls[newIndex];
    newUrls[newIndex] = temp;
    
    try {
      await updateDoc(doc(db, "items", item.id), { imageUrls: newUrls });
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Error reordering images");
    }
  };

  const handleDeleteItemImage = async (item, index) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    const urls = item.imageUrls || (item.imageUrl ? [item.imageUrl] : []);
    const newUrls = urls.filter((_, i) => i !== index);
    
    try {
      await updateDoc(doc(db, "items", item.id), { imageUrls: newUrls });
      fetchData();
      alert("Image deleted successfully!");
    } catch (e) {
      console.error(e);
      alert("Error deleting image");
    }
  };

  const handleAddImagesToItem = async (item, files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadImageToCloudinary(file));
      const newUrls = await Promise.all(uploadPromises);
      const currentUrls = item.imageUrls || (item.imageUrl ? [item.imageUrl] : []);
      
      await updateDoc(doc(db, "items", item.id), { 
        imageUrls: [...currentUrls, ...newUrls].filter(Boolean) 
      });
      fetchData();
      alert("Images added successfully!");
    } catch (error) {
      console.error(error);
      alert("Error adding images to item");
    } finally {
      setUploading(false);
    }
  };

  // --- Bolis Handlers ---
  const handleAddBolisCategory = async (e) => {
    e.preventDefault();
    if (!newBolisCategoryInput) return;
    try {
      await addDoc(collection(db, "bolisCategories"), { 
        name: newBolisCategoryInput,
        sizes: [],
        flavors: []
      });
      setNewBolisCategoryInput("");
      fetchData();
    } catch (error) {
      console.error("Error adding bolis category:", error);
    }
  };

  const handleDeleteBolisCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Bolis category?")) return;
    try {
      await deleteDoc(doc(db, "bolisCategories", id));
      fetchData();
    } catch (error) {
      console.error("Error deleting bolis category:", error);
    }
  };

  const handleUpdateBolisCategory = async (id) => {
    const data = bolisEditData[id];
    if (!data) return;

    try {
      const sizesArray = data.sizes.split(',').map(s => s.trim()).filter(s => s);
      const flavorsArray = data.flavors.split(',').map(s => s.trim()).filter(s => s);
      
      await updateDoc(doc(db, "bolisCategories", id), {
        sizes: sizesArray,
        flavors: flavorsArray
      });
      alert("Bolis category updated successfully!");
      fetchData();
    } catch (error) {
      console.error("Error updating bolis category:", error);
      alert("Error updating bolis category");
    }
  };

  if (!user) {
    return (
      <div className="admin-login-container">
        <form onSubmit={handleLogin} className="admin-login-form">
          <h2>Admin Login</h2>
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button type="submit">Log In</button>
        </form>
      </div>
    );
  }

  const handlePreloadBolis = async () => {
    if (!window.confirm("Are you sure you want to pre-load the Bolis data from the image?")) return;
    setUploading(true);
    try {
      await addDoc(collection(db, "bolisCategories"), { 
        name: "Bolis De Leche",
        sizes: ["6oz normal", "3oz mini"],
        flavors: ["Fresas Con Crema", "Mazapán", "Duvalín", "Nutella", "Coco", "Nuez", "Oreo"]
      });
      await addDoc(collection(db, "bolisCategories"), { 
        name: "Bolis De Agua",
        sizes: ["6oz normal", "3oz mini", "10oz large"],
        flavors: ["Pepino Con Chamoy", "Mangonada", "Limón"]
      });
      alert("Bolis data pre-loaded successfully!");
      fetchData();
    } catch (error) {
      console.error("Error pre-loading bolis:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRefillImages = async () => {
    if (!window.confirm("This will upload all multiple images for existing items. It might take a few minutes. Proceed?")) return;
    setUploading(true);
    try {
      const itemsToUpdate = [
        { name: "Amor Eterno", images: [require("../assets/webp/AmorEterno.webp"), require("../assets/webp/AmorEterno2.webp")] },
        { name: "Brillo de Sol", images: [require("../assets/webp/BrilloDeSol1.webp"), require("../assets/webp/BrilloDeSol2.webp")] },
        { name: "Canasta Festiva", images: [require("../assets/webp/CanastaFestiva.webp"), require("../assets/webp/CanastaFestiva2.webp")] },
        { name: "Centro de Mesa", images: [require("../assets/webp/CentroDeMesa1.webp"), require("../assets/webp/CentroDeMesa2.webp")] },
        { name: "Encanto Eterno", images: [require("../assets/webp/EncantoEterno1.webp"), require("../assets/webp/EncantoEterno2.webp"), require("../assets/webp/EncantoEterno3.webp")] },
        { name: "Eventos", images: [require("../assets/webp/Eventos1.webp"), require("../assets/webp/Eventos2.webp"), require("../assets/webp/Eventos3.webp")] },
        { name: "Flor Eterna Individual", images: [require("../assets/webp/FlorEternaIndividual1.webp"), require("../assets/webp/FlorEternaIndividual2.webp"), require("../assets/webp/FlorEternaIndividual3.webp")] },
        { name: "Colores de Corazón", images: [require("../assets/webp/Gerveras1.webp"), require("../assets/webp/Gerveras2.webp")] },
        { name: "Gerveras de Corazón", images: [require("../assets/webp/GerverasDeAmor1.webp"), require("../assets/webp/GerverasDeAmor2.webp")] },
        { name: "Media Luna", images: [require("../assets/webp/MediaLuna1.webp"), require("../assets/webp/MediaLuna2.webp")] },
        { name: "Pasión y Elegancia", images: [require("../assets/webp/PasionYElegancia.webp"), require("../assets/webp/PassionYElegancia2.webp")] },
        { name: "Ramo de Amor de 25", images: [require("../assets/webp/RamoDeAmorDe25_1.webp"), require("../assets/webp/RamoDeAmorDe25_2.webp")] },
        { name: "Ramo Lila", images: [require("../assets/webp/RamoLila1.webp"), require("../assets/webp/RamoLila2.webp"), require("../assets/webp/RamoLila3.webp")] },
        { name: "Eterno Romance", images: [require("../assets/webp/Rosas1.webp"), require("../assets/webp/Rosas2.webp")] },
        { name: "Rosas Eternas", images: [require("../assets/webp/RosasEternas1.webp"), require("../assets/webp/RosasEternas2.webp")] },
        { name: "Rosas Eternas Con Caja Redonda", images: [require("../assets/webp/RosasEternasConCajaRedonda1.webp"), require("../assets/webp/RosasEternasConCajaRedonda2.webp")] },
        { name: "Rosas y Tulipanes", images: [require("../assets/webp/RosasYTulipanes1.webp"), require("../assets/webp/RosasYTulipanes2.webp")] },
        { name: "Sol Eterno", images: [require("../assets/webp/SolEterno.webp"), require("../assets/webp/SolEterno2.webp")] },
        { name: "Sueño de Princesa", images: [require("../assets/webp/SuenoDePrincesa1.webp"), require("../assets/webp/SuenoDePrincesa2.webp")] }
      ];

      const itemsSnapshot = await getDocs(collection(db, "items"));
      const currentItems = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      for (const updateData of itemsToUpdate) {
        const item = currentItems.find(i => i.name === updateData.name);
        if (item) {
          console.log(`Updating ${item.name}...`);
          const uploadPromises = updateData.images.map(async (imgSrc, index) => {
            const response = await fetch(imgSrc);
            const blob = await response.blob();
            const file = new File([blob], `${item.name.replace(/\s+/g, '')}${index}.webp`, { type: 'image/webp' });
            return uploadImageToCloudinary(file);
          });
          const newImageUrls = await Promise.all(uploadPromises);
          await updateDoc(doc(db, "items", item.id), {
            imageUrls: newImageUrls,
            imageUrl: newImageUrls[0]
          });
        }
      }
      
      alert("All multiple images have been successfully uploaded and linked!");
      fetchData();
    } catch (error) {
      console.error("Error refilling images:", error);
      alert("Error refilling images");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleRefillImages} disabled={uploading}>
            {uploading ? "Loading..." : "Refill Images"}
          </button>
          <button onClick={handlePreloadBolis} disabled={uploading}>
            {uploading ? "Loading..." : "Pre-fill Bolis"}
          </button>
          <button onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      <div className="admin-content">
        
        {/* BOLIS SECTION */}
        <section className="admin-section full-width" style={{ backgroundColor: "#ffcccc", borderColor: "#ff9999" }}>
          <h2 style={{ color: "#c74c4c" }}>Manage Bolis Menu</h2>
          
          <form onSubmit={handleAddBolisCategory} className="admin-form" style={{ marginBottom: "2rem" }}>
            <input 
              type="text" 
              placeholder="New Bolis Category (e.g. Bolis De Leche)" 
              value={newBolisCategoryInput} 
              onChange={(e) => setNewBolisCategoryInput(e.target.value)} 
            />
            <button type="submit" style={{ backgroundColor: "#c74c4c" }}>Add Bolis Category</button>
          </form>

          <div className="bolis-admin-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
            {bolisCategories.map(cat => (
              <div key={cat.id} style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "10px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, color: "#c74c4c" }}>{cat.name}</h3>
                  <button onClick={() => handleDeleteBolisCategory(cat.id)} style={{ backgroundColor: "#ff4d4d", padding: "5px 10px", fontSize: "0.9rem" }}>Delete Category</button>
                </div>
                
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Sizes (comma separated)</label>
                  <input 
                    type="text" 
                    value={bolisEditData[cat.id]?.sizes || ""} 
                    onChange={(e) => setBolisEditData({...bolisEditData, [cat.id]: { ...bolisEditData[cat.id], sizes: e.target.value }})}
                    placeholder="e.g. 6oz normal, 3oz mini"
                    style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Flavors (comma separated)</label>
                  <textarea 
                    value={bolisEditData[cat.id]?.flavors || ""} 
                    onChange={(e) => setBolisEditData({...bolisEditData, [cat.id]: { ...bolisEditData[cat.id], flavors: e.target.value }})}
                    placeholder="e.g. Fresas Con Crema, Mazapán, Duvalín"
                    style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc", minHeight: "80px" }}
                  />
                </div>

                <button onClick={() => handleUpdateBolisCategory(cat.id)} style={{ backgroundColor: "#ff9999", color: "white" }}>
                  Save Updates
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* GALLERY CATEGORIES SECTION */}
        <section className="admin-section">
          <h2>Add Gallery Category</h2>
          <form onSubmit={handleAddCategory} className="admin-form">
            <input 
              type="text" 
              placeholder="New Category Name" 
              value={newCategoryInput} 
              onChange={(e) => setNewCategoryInput(e.target.value)} 
            />
            <button type="submit">Add Category</button>
          </form>
          
          <ul className="category-list">
            {categories.map(cat => (
              <li key={cat.id}>{cat.name}</li>
            ))}
          </ul>
        </section>

        {/* GALLERY ITEMS SECTION */}
        <section className="admin-section">
          <h2>Add Gallery Item</h2>
          <form onSubmit={handleAddItem} className="admin-form">
            <input 
              type="text" 
              placeholder="Item Name" 
              value={newItemName} 
              onChange={(e) => setNewItemName(e.target.value)} 
            />
            <input 
              type="text" 
              placeholder="Description (Optional)" 
              value={newItemDesc} 
              onChange={(e) => setNewItemDesc(e.target.value)} 
            />
            <select 
              value={newItemCategory} 
              onChange={(e) => setNewItemCategory(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input 
              type="file" 
              accept="image/*" 
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files))} 
            />
            <button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Add Item (Multiple Images OK)"}
            </button>
          </form>
        </section>

        {/* MANAGE GALLERY ITEMS SECTION */}
        <section className="admin-section full-width">
          <h2>Manage Gallery Items</h2>
          <div className="admin-items-grid">
            {items.map(item => {
              const urls = item.imageUrls || (item.imageUrl ? [item.imageUrl] : []);
              return (
                <div key={item.id} className="admin-item-card">
                  {/* Render thumbnails horizontally */}
                  <div style={{ display: "flex", overflowX: "auto", gap: "10px", padding: "10px", borderBottom: "1px solid #eee", backgroundColor: "#fafafa" }}>
                    {urls.map((url, idx) => (
                      <div key={idx} style={{ position: "relative", minWidth: "100px", height: "100px" }}>
                        <img src={url} alt={`${item.name} ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "5px" }} />
                        <div style={{ position: "absolute", bottom: "0", left: "0", width: "100%", display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.5)" }}>
                          <button onClick={() => handleReorderItemImage(item, idx, -1)} disabled={idx === 0} style={{ background: "transparent", color: "white", padding: "2px", margin: 0, minWidth: "auto", flex: 1 }}>{"<"}</button>
                          <button onClick={() => handleDeleteItemImage(item, idx)} style={{ background: "transparent", color: "red", padding: "2px", margin: 0, minWidth: "auto", flex: 1 }}>X</button>
                          <button onClick={() => handleReorderItemImage(item, idx, 1)} disabled={idx === urls.length - 1} style={{ background: "transparent", color: "white", padding: "2px", margin: 0, minWidth: "auto", flex: 1 }}>{">"}</button>
                        </div>
                      </div>
                    ))}
                    {/* Add More Images Button */}
                    <div style={{ minWidth: "100px", height: "100px", border: "2px dashed #ccc", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "5px", position: "relative" }}>
                      <span style={{ fontSize: "2rem", color: "#ccc" }}>+</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
                        onChange={(e) => handleAddImagesToItem(item, e.target.files)}
                      />
                    </div>
                  </div>

                  <div className="admin-item-details">
                    <h3>{item.name}</h3>
                    <select 
                      value={item.categoryId || ""} 
                      onChange={async (e) => {
                        try {
                          const { doc, updateDoc } = await import("firebase/firestore");
                          await updateDoc(doc(db, "items", item.id), {
                            categoryId: e.target.value
                          });
                          fetchData();
                          alert("Category updated successfully!");
                        } catch (err) {
                          console.error("Error updating category:", err);
                          alert("Error updating category");
                        }
                      }}
                      style={{ marginBottom: "10px", padding: "5px", width: "100%" }}
                    >
                      <option value="">No Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <button className="delete-btn" onClick={() => handleDeleteItem(item.id)}>Delete Item Entirely</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPage;
