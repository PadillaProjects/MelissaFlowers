import React, { useCallback, useEffect, useRef, useState } from "react";

// In-page confirmation dialog. Works the same on every phone and browser,
// unlike window.confirm, which some mobile browsers skip or block.
//
//   const [confirm, confirmDialog] = useConfirm();
//   if (!(await confirm({ title, message, confirmLabel, image }))) return;
//   ...render {confirmDialog} somewhere in the page.

const ConfirmDialog = ({ title, message, confirmLabel, cancelLabel, image, danger, onConfirm, onCancel }) => {
  const cancelRef = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    cancelRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous && previous.focus) previous.focus();
    };
  }, [onCancel]);

  return (
    <div className="admin-dialog-layer">
      <div className="admin-dialog-backdrop" onClick={onCancel} aria-hidden="true" />
      <div
        className="admin-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        aria-describedby="admin-dialog-message"
      >
        {image && <img className="admin-dialog-image" src={image} alt="" />}
        <h2 id="admin-dialog-title" className="admin-dialog-title">{title}</h2>
        {message && <p id="admin-dialog-message" className="admin-dialog-message">{message}</p>}
        <div className="admin-dialog-actions">
          <button type="button" className="admin-btn-secondary admin-dialog-btn" onClick={onCancel} ref={cancelRef}>
            {cancelLabel || "Cancelar"}
          </button>
          <button
            type="button"
            className={`admin-dialog-btn ${danger ? "admin-btn-danger" : "admin-btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel || "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const useConfirm = () => {
  const [request, setRequest] = useState(null);

  const confirm = useCallback(
    (options) => new Promise((resolve) => setRequest({ danger: true, ...options, resolve })),
    []
  );

  const close = useCallback((result) => {
    setRequest((current) => {
      if (current) current.resolve(result);
      return null;
    });
  }, []);

  const onCancel = useCallback(() => close(false), [close]);
  const onConfirm = useCallback(() => close(true), [close]);

  const dialog = request ? (
    <ConfirmDialog {...request} onCancel={onCancel} onConfirm={onConfirm} />
  ) : null;

  return [confirm, dialog];
};

export default useConfirm;
