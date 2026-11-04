import React, { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

// Edit an arrangement's description in place. Saves only when the text changed.
const DescriptionEditor = ({ item, onSaved, notify }) => {
  const original = item.description || "";
  const [value, setValue] = useState(original);
  const [saving, setSaving] = useState(false);
  const dirty = value.trim() !== original.trim();

  // Pick up changes saved elsewhere, unless the user is mid-edit.
  useEffect(() => {
    if (!dirty) setValue(original);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [original]);

  const save = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "items", item.id), { description: value.trim() });
      notify("Descripción guardada.");
      if (onSaved) await onSaved();
    } catch (e) {
      console.error("Error saving description:", e);
      notify("No se pudo guardar la descripción. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const fieldId = `desc-${item.id}`;

  return (
    <div className="admin-desc-editor">
      <label className="admin-item-section-label" htmlFor={fieldId}>
        Descripción (se muestra en la página del arreglo):
      </label>
      <textarea
        id={fieldId}
        className="admin-form-control admin-desc-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ej. 25 rosas rojas con nube y listón personalizado."
        rows={3}
      />
      {dirty && (
        <div className="admin-desc-actions">
          <button type="button" className="admin-btn-secondary" onClick={() => setValue(original)} disabled={saving}>
            Descartar
          </button>
          <button type="button" className="admin-btn-primary" onClick={save} disabled={saving}>
            {saving ? "Guardando..." : "Guardar descripción"}
          </button>
        </div>
      )}
    </div>
  );
};

export default DescriptionEditor;
