import React, { useEffect, useMemo, useState } from "react";
import { doc, writeBatch } from "firebase/firestore";
import { FaArrowUp, FaArrowDown, FaAngleDoubleUp, FaImages } from "react-icons/fa";
import { db } from "../../firebaseConfig";

// "Orden en la tienda": choose the order of categories and of the
// arrangements inside each one, then save. Nothing changes on the site
// until "Guardar orden" is pressed.

const move = (list, from, to) => {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};

// Current site order for a category: saved itemOrder first, then the rest.
const itemOrderFor = (category, items, getItemCategoryIds) => {
  const inCat = items.filter((i) => getItemCategoryIds(i).includes(category.id));
  const saved = Array.isArray(category.itemOrder) ? category.itemOrder : [];
  return [
    ...saved.filter((id) => inCat.some((i) => i.id === id)),
    ...inCat.filter((i) => !saved.includes(i.id)).map((i) => i.id),
  ];
};

const sameList = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

const OrderManager = ({ categories, items, getItemCategoryIds, onSaved, notify }) => {
  const savedCatOrder = useMemo(() => categories.map((c) => c.id), [categories]);
  const savedItemOrders = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c.id] = itemOrderFor(c, items, getItemCategoryIds); });
    return map;
  }, [categories, items, getItemCategoryIds]);

  const [catOrder, setCatOrder] = useState(savedCatOrder);
  const [itemOrders, setItemOrders] = useState(savedItemOrders);
  const [selectedCat, setSelectedCat] = useState(categories[0]?.id || "");
  const [saving, setSaving] = useState(false);

  // Reset drafts whenever fresh data arrives from Firestore.
  useEffect(() => { setCatOrder(savedCatOrder); }, [savedCatOrder]);
  useEffect(() => { setItemOrders(savedItemOrders); }, [savedItemOrders]);
  useEffect(() => {
    if (!categories.some((c) => c.id === selectedCat)) setSelectedCat(categories[0]?.id || "");
  }, [categories, selectedCat]);

  const catDirty = !sameList(catOrder, savedCatOrder);
  const dirtyItemCats = Object.keys(itemOrders).filter(
    (id) => !sameList(itemOrders[id] || [], savedItemOrders[id] || [])
  );
  const dirty = catDirty || dirtyItemCats.length > 0;

  const byId = (id) => items.find((i) => i.id === id);
  const catById = (id) => categories.find((c) => c.id === id);
  const currentList = itemOrders[selectedCat] || [];

  const moveItem = (from, to) =>
    setItemOrders((prev) => ({ ...prev, [selectedCat]: move(prev[selectedCat] || [], from, to) }));

  const discard = () => {
    setCatOrder(savedCatOrder);
    setItemOrders(savedItemOrders);
  };

  const save = async () => {
    setSaving(true);
    try {
      const batch = writeBatch(db);
      if (catDirty) {
        catOrder.forEach((id, index) => batch.update(doc(db, "categories", id), { order: index }));
      }
      dirtyItemCats.forEach((id) => batch.update(doc(db, "categories", id), { itemOrder: itemOrders[id] }));
      await batch.commit();
      notify("Orden guardado. Ya se ve así en el sitio.");
      if (onSaved) await onSaved();
    } catch (e) {
      console.error("Error saving order:", e);
      notify("No se pudo guardar el orden. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const firstCat = catById(catOrder[0]);
  const coverItem = firstCat ? byId((itemOrders[firstCat.id] || [])[0]) : null;

  if (categories.length === 0) {
    return (
      <div className="admin-empty-state">
        <FaImages className="admin-empty-state-icon" />
        <p>Primero crea una categoría en la pestaña Galería.</p>
      </div>
    );
  }

  return (
    <div className="admin-order-manager">
      <section className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Orden de las categorías</h2>
        </div>
        <p className="admin-order-help">Así aparecen las secciones en la galería y en los filtros del sitio.</p>
        <ol className="admin-order-list">
          {catOrder.map((id, index) => {
            const cat = catById(id);
            if (!cat) return null;
            return (
              <li key={id} className="admin-order-row">
                <span className="admin-order-rank">{index + 1}</span>
                <span className="admin-order-name">
                  {cat.name}
                  <small>{(itemOrders[id] || []).length} arreglos</small>
                </span>
                <div className="admin-order-actions">
                  <button type="button" className="admin-order-icon-btn" disabled={index === 0}
                    onClick={() => setCatOrder((p) => move(p, index, index - 1))}
                    aria-label={`Subir ${cat.name}`}>
                    <FaArrowUp aria-hidden="true" />
                  </button>
                  <button type="button" className="admin-order-icon-btn" disabled={index === catOrder.length - 1}
                    onClick={() => setCatOrder((p) => move(p, index, index + 1))}
                    aria-label={`Bajar ${cat.name}`}>
                    <FaArrowDown aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Orden de los arreglos</h2>
        </div>
        <p className="admin-order-help">
          Elige una categoría y acomoda sus arreglos. El primero de la primera categoría
          {coverItem ? <> (ahora: <strong>{coverItem.name}</strong>)</> : null} es la foto grande del inicio.
        </p>

        <div className="admin-order-tabs" role="group" aria-label="Categoría a ordenar">
          {catOrder.map((id) => {
            const cat = catById(id);
            if (!cat) return null;
            return (
              <button key={id} type="button" className="admin-order-tab"
                aria-pressed={selectedCat === id} onClick={() => setSelectedCat(id)}>
                {cat.name}
              </button>
            );
          })}
        </div>

        {currentList.length === 0 ? (
          <p className="admin-order-help">Esta categoría todavía no tiene arreglos.</p>
        ) : (
          <ol className="admin-order-list">
            {currentList.map((id, index) => {
              const item = byId(id);
              if (!item) return null;
              const thumb = (item.imageUrls || [item.imageUrl])[0];
              return (
                <li key={id} className="admin-order-row">
                  <span className="admin-order-rank">{index + 1}</span>
                  {thumb ? (
                    <img className="admin-order-thumb" src={thumb.replace("/upload/", "/upload/f_auto,q_auto,w_120/")} alt="" />
                  ) : (
                    <span className="admin-order-thumb admin-order-thumb--empty"><FaImages aria-hidden="true" /></span>
                  )}
                  <span className="admin-order-name">{item.name}</span>
                  <div className="admin-order-actions">
                    <button type="button" className="admin-order-icon-btn" disabled={index === 0}
                      onClick={() => moveItem(index, 0)} aria-label={`Mover ${item.name} al inicio`}>
                      <FaAngleDoubleUp aria-hidden="true" />
                    </button>
                    <button type="button" className="admin-order-icon-btn" disabled={index === 0}
                      onClick={() => moveItem(index, index - 1)} aria-label={`Subir ${item.name}`}>
                      <FaArrowUp aria-hidden="true" />
                    </button>
                    <button type="button" className="admin-order-icon-btn" disabled={index === currentList.length - 1}
                      onClick={() => moveItem(index, index + 1)} aria-label={`Bajar ${item.name}`}>
                      <FaArrowDown aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {dirty && (
        <div className="admin-order-savebar" role="region" aria-label="Cambios sin guardar">
          <span>Tienes cambios sin guardar</span>
          <div>
            <button type="button" className="admin-btn-secondary" onClick={discard} disabled={saving}>Descartar</button>
            <button type="button" className="admin-btn-primary" onClick={save} disabled={saving}>
              {saving ? "Guardando..." : "Guardar orden"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;
