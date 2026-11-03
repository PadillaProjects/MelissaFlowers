import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { uploadImageToCloudinary } from "../services/cloudinary";
import logoFull from "../assets/melibee-logo-full.png";
import { 
  FaImages, 
  FaSignOutAlt, 
  FaSearch, 
  FaTrash, 
  FaChevronLeft, 
  FaChevronRight, 
  FaPlus, 
  FaCheck, 
  FaUpload, 
  FaTimes, 
  FaExternalLinkAlt, 
  FaUserCircle, 
  FaLock, 
  FaEnvelope, 
  FaEye, 
  FaEyeSlash,
  FaTag,
  FaChevronDown,
  FaChevronUp,
  FaArrowUp,
  FaArrowDown,
  FaExpandAlt,
  FaCompressAlt
} from "react-icons/fa";
import "./AdminPage.css";

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("gallery");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  
  // Data states
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  
  // Form states (Gallery)
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemCategories, setNewItemCategories] = useState([]);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // Search & Filter in Gallery Management
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const [uploading, setUploading] = useState(false);
  const [expandedItemIds, setExpandedItemIds] = useState([]);
  const [savingOrder, setSavingOrder] = useState(false);

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
    try {
      // Fetch Categories
      const catSnapshot = await getDocs(collection(db, "categories"));
      const catList = catSnapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      setCategories(catList);

      // Fetch Items
      const itemsSnapshot = await getDocs(collection(db, "items"));
      const itemsList = itemsSnapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      setItems(itemsList);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      console.error("Error logging in:", error);
      let friendlyMessage = "Error al iniciar sesión. Por favor verifica tus credenciales.";
      if (
        error.code === "auth/invalid-credential" || 
        error.code === "auth/wrong-password" || 
        error.code === "auth/user-not-found"
      ) {
        friendlyMessage = "Correo o contraseña incorrectos. Inténtalo de nuevo.";
      } else if (error.code === "auth/invalid-email") {
        friendlyMessage = "Por favor ingresa un correo electrónico válido.";
      } else if (error.code === "auth/too-many-requests") {
        friendlyMessage = "Demasiados intentos fallidos. Espera unos minutos e inténtalo de nuevo.";
      } else if (error.code === "auth/unauthorized-domain") {
        friendlyMessage = "Dominio no autorizado. Ingresa desde http://localhost:3000/admin";
      } else if (error.message) {
        friendlyMessage = error.message;
      }
      setLoginError(friendlyMessage);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryInput.trim()) return;
    try {
      await addDoc(collection(db, "categories"), { name: newCategoryInput.trim() });
      setNewCategoryInput("");
      await fetchData();
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Error al agregar la categoría.");
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`¿Estás segura de eliminar la categoría "${catName}"?`)) return;
    try {
      await deleteDoc(doc(db, "categories", catId));
      await fetchData();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Error al eliminar la categoría.");
    }
  };

  const handleDeleteItem = async (id, itemName) => {
    if (!window.confirm(`¿Estás segura de eliminar "${itemName || 'este arreglo'}" por completo?`)) return;
    try {
      await deleteDoc(doc(db, "items", id));
      await fetchData();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error al eliminar el artículo.");
    }
  };

  // Image Selection and Previews in Add Form
  const handleSelectNewImages = (files) => {
    const fileArray = Array.from(files);
    setImageFiles(prev => [...prev, ...fileArray]);

    const newPreviews = fileArray.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveNewImagePreview = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      // revoke object URL
      if (prev[index]?.url) URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || imageFiles.length === 0) {
      alert("Por favor ingresa el nombre del arreglo y selecciona al menos una imagen.");
      return;
    }

    setUploading(true);
    try {
      // 1. Upload multiple images to Cloudinary
      const uploadPromises = imageFiles.map(file => uploadImageToCloudinary(file));
      const imageUrls = await Promise.all(uploadPromises);
      
      const primaryCat = categories.find(c => c.id === newItemCategories[0]);

      // 2. Save item to Firestore with categoryIds array
      await addDoc(collection(db, "items"), {
        name: newItemName.trim(),
        description: newItemDesc.trim(),
        categoryIds: newItemCategories,
        categoryId: newItemCategories[0] || "",
        category: primaryCat ? primaryCat.name : "",
        imageUrls: imageUrls,
        createdAt: new Date()
      });

      // Reset form
      setNewItemName("");
      setNewItemDesc("");
      setNewItemCategories([]);
      setImageFiles([]);
      imagePreviews.forEach(p => URL.revokeObjectURL(p.url));
      setImagePreviews([]);
      await fetchData();
      alert("¡Arreglo agregado exitosamente!");
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Error al agregar el arreglo.");
    } finally {
      setUploading(false);
    }
  };

  // Multiple Image Management Handlers
  const handleReorderItemImage = async (item, currentIndex, direction) => {
    const urls = item.imageUrls || (item.imageUrl ? [item.imageUrl] : []);
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= urls.length) return;
    
    const newUrls = [...urls];
    const temp = newUrls[currentIndex];
    newUrls[currentIndex] = newUrls[newIndex];
    newUrls[newIndex] = temp;
    
    try {
      await updateDoc(doc(db, "items", item.id), { 
        imageUrls: newUrls,
        imageUrl: newUrls[0] || ""
      });
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Error al reordenar las imágenes.");
    }
  };

  const handleDeleteItemImage = async (item, index) => {
    if (!window.confirm("¿Segura que deseas eliminar esta imagen?")) return;
    const urls = item.imageUrls || (item.imageUrl ? [item.imageUrl] : []);
    const newUrls = urls.filter((_, i) => i !== index);
    
    try {
      await updateDoc(doc(db, "items", item.id), { imageUrls: newUrls });
      fetchData();
    } catch (e) {
      console.error(e);
      alert("Error al eliminar la imagen.");
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
    } catch (error) {
      console.error(error);
      alert("Error al agregar imágenes al artículo.");
    } finally {
      setUploading(false);
    }
  };

  const getItemCategoryIds = (item) => {
    const ids = [];
    if (Array.isArray(item.categoryIds)) {
      ids.push(...item.categoryIds);
    }
    // Backward compatibility for items with legacy categoryId / category
    if (item.categoryId) {
      const match = categories.find(c => c.id === item.categoryId || c.name === item.categoryId);
      const catId = match ? match.id : item.categoryId;
      if (!ids.includes(catId)) ids.push(catId);
    }
    if (item.category) {
      const match = categories.find(c => c.name === item.category || c.id === item.category);
      if (match && !ids.includes(match.id)) ids.push(match.id);
    }
    return ids;
  };

  const handleToggleItemCategory = async (itemId, categoryId) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const currentIds = getItemCategoryIds(item);
    const newCategoryIds = currentIds.includes(categoryId)
      ? currentIds.filter(id => id !== categoryId)
      : [...currentIds, categoryId];

    const primaryCat = categories.find(c => c.id === newCategoryIds[0]);

    // Optimistically update local state immediately so UI changes without delay
    setItems(prevItems =>
      prevItems.map(i =>
        i.id === itemId
          ? { 
              ...i, 
              categoryIds: newCategoryIds,
              categoryId: newCategoryIds[0] || "",
              category: primaryCat ? primaryCat.name : ""
            }
          : i
      )
    );

    try {
      await updateDoc(doc(db, "items", itemId), {
        categoryIds: newCategoryIds,
        categoryId: newCategoryIds[0] || "",
        category: primaryCat ? primaryCat.name : ""
      });
    } catch (err) {
      console.error("Error updating categories:", err);
      alert("Error al actualizar las categorías: " + err.message);
      await fetchData();
    }
  };

  const handleRefillImages = async () => {
    if (!window.confirm("Esto optimizará y subirá imágenes para los artículos existentes. ¿Deseas continuar?")) return;
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
      const currentItems = itemsSnapshot.docs.map(d => ({ ...d.data(), id: d.id }));

      for (const updateData of itemsToUpdate) {
        const item = currentItems.find(i => i.name === updateData.name);
        if (item) {
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
      
      alert("¡Todas las imágenes han sido sincronizadas y optimizadas!");
      fetchData();
    } catch (error) {
      console.error("Error refilling images:", error);
      alert("Error al procesar las imágenes.");
    } finally {
      setUploading(false);
    }
  };

  // Collapse / Expand handlers
  const toggleItemExpanded = (itemId) => {
    setExpandedItemIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  const handleExpandAll = (allIds) => {
    setExpandedItemIds(allIds);
  };

  const handleCollapseAll = () => {
    setExpandedItemIds([]);
  };

  // Reordering items within the selected category
  const handleMoveItemOrder = async (itemId, direction) => {
    if (filterCategory === "all" || filterCategory === "uncategorized") {
      alert("Por favor selecciona una categoría específica en el filtro superior para ordenar los arreglos.");
      return;
    }

    const selectedCat = categories.find(c => c.id === filterCategory);
    if (!selectedCat) return;

    // All items that currently belong to this category
    const catItems = items.filter(i => getItemCategoryIds(i).includes(filterCategory));
    const existingOrder = Array.isArray(selectedCat.itemOrder) ? selectedCat.itemOrder : [];

    // Assemble current full order: existing valid IDs first, then any unranked category items
    const currentOrder = [
      ...existingOrder.filter(id => catItems.some(i => i.id === id)),
      ...catItems.filter(i => !existingOrder.includes(i.id)).map(i => i.id)
    ];

    const currentIndex = currentOrder.indexOf(itemId);
    if (currentIndex === -1) return;

    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= currentOrder.length) return;

    // Swap elements
    const newOrder = [...currentOrder];
    const temp = newOrder[currentIndex];
    newOrder[currentIndex] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    // Optimistic state update
    setCategories(prev => prev.map(c => 
      c.id === filterCategory ? { ...c, itemOrder: newOrder } : c
    ));

    setSavingOrder(true);
    try {
      await updateDoc(doc(db, "categories", filterCategory), {
        itemOrder: newOrder
      });
    } catch (err) {
      console.error("Error saving category order:", err);
      alert("No se pudo guardar el nuevo orden. Inténtalo de nuevo.");
      // Revert optimistic state
      setCategories(prev => prev.map(c => 
        c.id === filterCategory ? { ...c, itemOrder: existingOrder } : c
      ));
    } finally {
      setSavingOrder(false);
    }
  };

  // Filtered & Sorted Items for Manage Items Section
  const filteredItems = (() => {
    const list = items.filter(item => {
      const matchesSearch = !searchQuery.trim() || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterCategory === "all") return true;
      if (filterCategory === "uncategorized") {
        return getItemCategoryIds(item).length === 0;
      }
      return getItemCategoryIds(item).includes(filterCategory);
    });

    if (filterCategory !== "all" && filterCategory !== "uncategorized") {
      const selectedCat = categories.find(c => c.id === filterCategory);
      const order = Array.isArray(selectedCat?.itemOrder) ? selectedCat.itemOrder : [];
      if (order.length > 0) {
        return [...list].sort((a, b) => {
          const idxA = order.indexOf(a.id);
          const idxB = order.indexOf(b.id);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
          return 0;
        });
      }
    }
    return list;
  })();

  // ==========================================================================
  // RENDER LOGIN SCREEN (if not logged in)
  // ==========================================================================
  if (!user) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <img 
            src={logoFull} 
            alt="Melibee Flowers" 
            className="admin-login-logo" 
          />
          <h1 className="admin-login-title">Flowers by Melibee</h1>
          <p className="admin-login-subtitle">Panel de Control & Administración</p>
          
          <form onSubmit={handleLogin} className="admin-login-form">
            {loginError && (
              <div className="login-error-message" role="alert">
                <span>{loginError}</span>
              </div>
            )}
            
            <div className="admin-input-group">
              <label className="admin-input-label" htmlFor="admin-email">Correo Electrónico</label>
              <div className="admin-input-wrapper">
                <FaEnvelope className="admin-input-icon" />
                <input 
                  id="admin-email"
                  type="email" 
                  placeholder="admin@melibee.art" 
                  value={email} 
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (loginError) setLoginError("");
                  }} 
                  className="admin-input-field"
                  required
                />
              </div>
            </div>

            <div className="admin-input-group">
              <label className="admin-input-label" htmlFor="admin-password">Contraseña</label>
              <div className="admin-input-wrapper">
                <FaLock className="admin-input-icon" />
                <input 
                  id="admin-password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (loginError) setLoginError("");
                  }} 
                  className="admin-input-field"
                  required
                />
                <button 
                  type="button" 
                  className="admin-input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loggingIn} className="admin-login-btn">
              {loggingIn ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </form>

          <a href="/" className="admin-back-link">
            ← Volver a la Galería Pública
          </a>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER ADMIN DASHBOARD (when authenticated)
  // ==========================================================================
  return (
    <div className="admin-dashboard">
      {/* Top Navbar */}
      <nav className="admin-navbar">
        <div className="admin-navbar-inner">
          <div className="admin-brand">
            <img src={logoFull} alt="Logo" className="admin-brand-icon" />
            <div className="admin-brand-text">
              <span className="admin-brand-name">Flowers by Melibee</span>
              <span className="admin-brand-badge">Panel de Control</span>
            </div>
          </div>

          <div className="admin-tabs-nav" role="tablist">
            <button 
              role="tab"
              aria-selected={activeTab === "gallery"}
              className={`admin-tab-btn ${activeTab === "gallery" ? "active" : ""}`}
              onClick={() => setActiveTab("gallery")}
            >
              <FaImages />
              <span>Galería Floral</span>
            </button>
          </div>

          <div className="admin-nav-actions">
            <span className="admin-user-badge" title={user.email}>
              <FaUserCircle />
              <span>{user.email?.split('@')[0]}</span>
            </span>

            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="admin-btn-secondary"
              title="Abrir tienda en nueva pestaña"
            >
              <FaExternalLinkAlt style={{ fontSize: '0.8rem' }} />
              <span>Ver Tienda</span>
            </a>

            <button 
              onClick={handleRefillImages} 
              disabled={uploading} 
              className="admin-btn-secondary"
              title="Resincronizar imágenes WebP"
            >
              {uploading ? "Procesando..." : "Sincronizar"}
            </button>

            <button 
              onClick={handleLogout} 
              className="admin-btn-danger-ghost"
              title="Cerrar sesión de administrador"
            >
              <FaSignOutAlt />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="admin-container">
        {/* Gallery Management Tab */}
        {activeTab === 'gallery' && (
          <>
            {/* Quick Stats Overview */}
            <div className="admin-overview-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon-wrap">
                  <FaImages />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-label">Total Arreglos</span>
                  <span className="admin-stat-number">{items.length}</span>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon-wrap">
                  <FaTag />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-label">Categorías</span>
                  <span className="admin-stat-number">{categories.length}</span>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon-wrap">
                  <FaCheck />
                </div>
                <div className="admin-stat-info">
                  <span className="admin-stat-label">Con Categoría</span>
                  <span className="admin-stat-number">
                    {items.filter(i => getItemCategoryIds(i).length > 0).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Creation Grid: Add Item + Manage Categories */}
            <div className="admin-grid-two-col">
              {/* Form: Add Gallery Item */}
              <section className="admin-card">
                <div className="admin-card-header">
                  <h2 className="admin-card-title">
                    <FaPlus /> Nuevo Arreglo Floral
                  </h2>
                </div>

                <form onSubmit={handleAddItem}>
                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="new-item-name">Nombre del Arreglo *</label>
                    <input 
                      id="new-item-name"
                      type="text" 
                      placeholder="Ej. Ramo Romántico de Rosas" 
                      value={newItemName} 
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="admin-form-control"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="new-item-desc">Descripción (Opcional)</label>
                    <textarea 
                      id="new-item-desc"
                      placeholder="Detalles florales, tamaño, ocasiones especiales..." 
                      value={newItemDesc} 
                      onChange={(e) => setNewItemDesc(e.target.value)}
                      className="admin-form-control"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      Categorías (Selecciona una o más):
                    </label>
                    <div className="admin-category-chips">
                      {categories.map(cat => {
                        const isSelected = newItemCategories.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setNewItemCategories(prev =>
                                prev.includes(cat.id)
                                  ? prev.filter(id => id !== cat.id)
                                  : [...prev, cat.id]
                              );
                            }}
                            className={`admin-cat-chip-btn ${isSelected ? "selected" : ""}`}
                          >
                            {isSelected ? <FaCheck style={{ fontSize: '0.75rem' }} /> : <FaPlus style={{ fontSize: '0.75rem' }} />}
                            {cat.name}
                          </button>
                        );
                      })}
                      {categories.length === 0 && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--admin-text-light)' }}>
                          No hay categorías creadas aún.
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Fotografías del Arreglo *</label>
                    <div className="admin-file-dropzone">
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple
                        onChange={(e) => handleSelectNewImages(e.target.files)}
                      />
                      <div className="admin-file-dropzone-content">
                        <FaUpload className="admin-file-dropzone-icon" />
                        <span className="admin-file-dropzone-text">Selecciona o arrastra imágenes aquí</span>
                        <span className="admin-file-dropzone-subtext">Puedes subir varias fotos del mismo arreglo</span>
                      </div>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="admin-upload-previews">
                        {imagePreviews.map((preview, idx) => (
                          <div key={idx} className="admin-upload-thumb">
                            <img src={preview.url} alt={`Preview ${idx}`} />
                            <button 
                              type="button" 
                              onClick={() => handleRemoveNewImagePreview(idx)}
                              className="admin-upload-thumb-remove"
                              title="Quitar imagen"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={uploading || imageFiles.length === 0} 
                    className="admin-btn-primary"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    {uploading ? "Subiendo fotos y guardando..." : "Publicar Arreglo en Galería"}
                  </button>
                </form>
              </section>

              {/* Card: Manage Categories */}
              <section className="admin-card">
                <div className="admin-card-header">
                  <h2 className="admin-card-title">
                    <FaTag /> Categorías ({categories.length})
                  </h2>
                </div>

                <form onSubmit={handleAddCategory} className="admin-category-form">
                  <input 
                    type="text" 
                    placeholder="Nueva categoría (ej. Ramos)" 
                    value={newCategoryInput} 
                    onChange={(e) => setNewCategoryInput(e.target.value)} 
                    className="admin-form-control"
                    aria-label="Nombre de la nueva categoría"
                  />
                  <button type="submit" className="admin-btn-primary">
                    <FaPlus /> Agregar
                  </button>
                </form>

                <ul className="admin-category-manage-list">
                  {categories.map(cat => {
                    const itemCount = items.filter(i => getItemCategoryIds(i).includes(cat.id)).length;
                    return (
                      <li key={cat.id} className="admin-category-manage-item">
                        <div className="admin-cat-name-wrap">
                          <span>{cat.name}</span>
                          <span className="admin-cat-count-badge">
                            {itemCount} {itemCount === 1 ? 'arreglo' : 'arreglos'}
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="admin-btn-danger-ghost"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title={`Eliminar categoría ${cat.name}`}
                        >
                          <FaTrash />
                        </button>
                      </li>
                    );
                  })}
                  {categories.length === 0 && (
                    <li style={{ textAlign: 'center', color: 'var(--admin-text-light)', padding: '1.5rem 0' }}>
                      No hay categorías registradas.
                    </li>
                  )}
                </ul>
              </section>
            </div>

            {/* Collection Items Section */}
            <section className="admin-collection-section">
              <div className="admin-collection-header">
                <div>
                  <h2 className="admin-card-title" style={{ fontSize: '1.5rem' }}>
                    Colección de Arreglos Florales
                  </h2>
                  <div className="admin-collection-subbar">
                    <span style={{ fontSize: '0.88rem', color: 'var(--admin-text-muted)' }}>
                      Mostrando {filteredItems.length} de {items.length} arreglos
                    </span>
                    <div className="admin-expand-tools">
                      <button 
                        type="button" 
                        onClick={() => handleExpandAll(filteredItems.map(i => i.id))}
                        className="admin-btn-link"
                        title="Expandir todas las tarjetas"
                      >
                        <FaExpandAlt style={{ fontSize: '0.75rem' }} />
                        <span>Expandir todos</span>
                      </button>
                      <span className="admin-tool-sep">|</span>
                      <button 
                        type="button" 
                        onClick={handleCollapseAll}
                        className="admin-btn-link"
                        title="Colapsar todas las tarjetas"
                      >
                        <FaCompressAlt style={{ fontSize: '0.75rem' }} />
                        <span>Colapsar todos</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="admin-collection-tools">
                  <div className="admin-search-wrap">
                    <FaSearch className="admin-search-icon" />
                    <input 
                      type="text"
                      placeholder="Buscar por nombre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="admin-search-input"
                      aria-label="Buscar arreglo por nombre"
                    />
                  </div>

                  <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="admin-filter-select"
                    aria-label="Filtrar por categoría"
                  >
                    <option value="all">Todas las Categorías</option>
                    <option value="uncategorized">Sin Categoría ("Otros")</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Reordering Guide Banner */}
              {filterCategory !== "all" && filterCategory !== "uncategorized" ? (
                <div className="admin-order-banner active">
                  <span className="admin-order-banner-icon">✨</span>
                  <div className="admin-order-banner-text">
                    <strong>Ordenando categoría "{categories.find(c => c.id === filterCategory)?.name}":</strong>
                    <span> Usa las flechas <strong>↑</strong> y <strong>↓</strong> para definir el orden en la tienda. Se guarda automáticamente.</span>
                  </div>
                  {savingOrder && <span className="admin-order-saving-pill">Guardando...</span>}
                </div>
              ) : (
                <div className="admin-order-banner hint">
                  <span className="admin-order-banner-icon">💡</span>
                  <div className="admin-order-banner-text">
                    <span>Selecciona una categoría específica en el filtro superior para ordenar la posición de sus arreglos en la tienda.</span>
                  </div>
                </div>
              )}

              {filteredItems.length === 0 ? (
                <div className="admin-empty-state">
                  <FaImages className="admin-empty-state-icon" />
                  <p>No se encontraron arreglos con los filtros actuales.</p>
                </div>
              ) : (
                <div className="admin-items-list">
                  {filteredItems.map((item, idx) => {
                    const urls = item.imageUrls || (item.imageUrl ? [item.imageUrl] : []);
                    const assignedCatIds = getItemCategoryIds(item);
                    const isExpanded = expandedItemIds.includes(item.id);
                    const isCategorySelected = filterCategory !== "all" && filterCategory !== "uncategorized";

                    return (
                      <article 
                        key={item.id} 
                        className={`admin-item-card ${isExpanded ? "expanded" : "collapsed"}`}
                      >
                        {/* Compact Card Header (Always visible - Click to toggle) */}
                        <div 
                          className="admin-item-card-header"
                          onClick={() => toggleItemExpanded(item.id)}
                          role="button"
                          tabIndex={0}
                          aria-expanded={isExpanded}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleItemExpanded(item.id);
                            }
                          }}
                        >
                          <div className="admin-item-header-left">
                            {/* Reorder controls (when specific category chosen) */}
                            {isCategorySelected && (
                              <div 
                                className="admin-item-order-controls" 
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="admin-item-rank-badge">#{idx + 1}</span>
                                <div className="admin-order-arrows">
                                  <button 
                                    type="button"
                                    className="admin-order-btn"
                                    disabled={idx === 0 || savingOrder}
                                    onClick={() => handleMoveItemOrder(item.id, -1)}
                                    title="Mover hacia arriba"
                                    aria-label={`Mover ${item.name} hacia arriba`}
                                  >
                                    <FaArrowUp />
                                  </button>
                                  <button 
                                    type="button"
                                    className="admin-order-btn"
                                    disabled={idx === filteredItems.length - 1 || savingOrder}
                                    onClick={() => handleMoveItemOrder(item.id, 1)}
                                    title="Mover hacia abajo"
                                    aria-label={`Mover ${item.name} hacia abajo`}
                                  >
                                    <FaArrowDown />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Arrangement Thumbnail Preview */}
                            <div className="admin-item-avatar-wrap">
                              {urls[0] ? (
                                <img src={urls[0]} alt={item.name} className="admin-item-avatar-img" />
                              ) : (
                                <div className="admin-item-avatar-placeholder">
                                  <FaImages />
                                </div>
                              )}
                              <span className="admin-item-photos-badge" title={`${urls.length} fotos`}>
                                {urls.length}
                              </span>
                            </div>

                            {/* Arrangement Name & Category Tags */}
                            <div className="admin-item-title-meta">
                              <h3 className="admin-item-name">{item.name}</h3>
                              <div className="admin-item-mini-categories">
                                {assignedCatIds.length === 0 ? (
                                  <span className="admin-cat-chip uncategorized">Sin categoría</span>
                                ) : (
                                  assignedCatIds.map(catId => {
                                    const catObj = categories.find(c => c.id === catId);
                                    return catObj ? (
                                      <span key={catId} className="admin-cat-chip">
                                        {catObj.name}
                                      </span>
                                    ) : null;
                                  })
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Expand/Collapse Chevron */}
                          <div className="admin-item-header-right">
                            <span className="admin-item-toggle-hint">
                              {isExpanded ? "Colapsar" : "Editar"}
                            </span>
                            <div className="admin-item-expand-btn">
                              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                            </div>
                          </div>
                        </div>

                        {/* Collapsible Card Body */}
                        {isExpanded && (
                          <div className="admin-item-card-body">
                            {/* Image Thumbnails Strip with Reordering & Deletion */}
                            <div className="admin-item-gallery-strip">
                              {urls.map((url, imgIdx) => (
                                <div key={imgIdx} className="admin-item-thumb-box">
                                  <img src={url} alt={`${item.name} foto ${imgIdx + 1}`} loading="lazy" />
                                  <div className="admin-item-thumb-controls">
                                    <button 
                                      onClick={() => handleReorderItemImage(item, imgIdx, -1)} 
                                      disabled={imgIdx === 0} 
                                      className="admin-thumb-action-btn"
                                      title="Mover a la izquierda"
                                      aria-label="Mover imagen hacia la izquierda"
                                    >
                                      <FaChevronLeft />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteItemImage(item, imgIdx)} 
                                      className="admin-thumb-action-btn delete"
                                      title="Eliminar foto"
                                      aria-label="Eliminar esta foto"
                                    >
                                      <FaTimes />
                                    </button>
                                    <button 
                                      onClick={() => handleReorderItemImage(item, imgIdx, 1)} 
                                      disabled={imgIdx === urls.length - 1} 
                                      className="admin-thumb-action-btn"
                                      title="Mover a la derecha"
                                      aria-label="Mover imagen hacia la derecha"
                                    >
                                      <FaChevronRight />
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {/* Add More Photos Dropzone */}
                              <div className="admin-item-thumb-add">
                                <input 
                                  type="file" 
                                  multiple 
                                  accept="image/*" 
                                  onChange={(e) => handleAddImagesToItem(item, e.target.files)}
                                  aria-label={`Agregar más fotos a ${item.name}`}
                                />
                                <FaPlus className="admin-item-thumb-add-icon" />
                                <span className="admin-item-thumb-add-text">+ Foto</span>
                              </div>
                            </div>

                            {/* Details: Description & Multi-Category Selection */}
                            <div className="admin-item-body-details">
                              {item.description && (
                                <div className="admin-item-desc-box">
                                  <span className="admin-item-section-label">Descripción:</span>
                                  <p className="admin-item-desc">{item.description}</p>
                                </div>
                              )}

                              <div className="admin-item-cats-section">
                                <span className="admin-item-section-label">Categorías (asigna una o más):</span>
                                <div className="admin-item-cats-chips">
                                  {categories.map(cat => {
                                    const isAssigned = assignedCatIds.includes(cat.id);
                                    return (
                                      <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleToggleItemCategory(item.id, cat.id)}
                                        className={`admin-item-cat-pill ${isAssigned ? "active" : ""}`}
                                        title={isAssigned ? `Quitar de ${cat.name}` : `Agregar a ${cat.name}`}
                                      >
                                        {isAssigned ? "✓ " : "+ "} {cat.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <div className="admin-item-card-footer">
                                <button 
                                  className="admin-item-delete-btn" 
                                  onClick={() => handleDeleteItem(item.id, item.name)}
                                >
                                  <FaTrash style={{ fontSize: '0.85rem' }} />
                                  <span>Eliminar Arreglo</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleItemExpanded(item.id)}
                                  className="admin-btn-secondary"
                                  style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
                                >
                                  <FaChevronUp /> Colapsar
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
