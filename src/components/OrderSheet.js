import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { track } from "../analytics";
import { arrangementUrl, smsLink, whatsappLink } from "../catalog/arrangements";
import "./OrderSheet.css";

const WHEN = [
  { id: "week", label: "Esta semana" },
  { id: "next", label: "Próxima semana" },
  { id: "date", label: "Otra fecha" },
];

const HOW = [
  { id: "delivery", label: "Entrega a domicilio", text: "con entrega a domicilio" },
  { id: "pickup", label: "Recoger", text: "para recoger en Canutillo" },
];

const formatDate = (value) => {
  if (!value) return "una fecha por confirmar";
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return "el " + date.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
};

const todayIso = () => {
  const t = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;
};

// Bottom sheet that writes the WhatsApp/SMS message for the customer.
const OrderSheet = ({ item, open, onClose }) => {
  const [when, setWhen] = useState("week");
  const [date, setDate] = useState("");
  const [how, setHow] = useState("delivery");
  const sheetRef = useRef(null);
  const closeRef = useRef(null);

  const message = useMemo(() => {
    const whenText =
      when === "week" ? "esta semana" : when === "next" ? "la próxima semana" : formatDate(date);
    const howText = HOW.find((h) => h.id === how).text;
    return `Hola, me interesa el arreglo "${item.name}" (${arrangementUrl(item)}). ¿Está disponible para ${whenText}, ${howText}?`;
  }, [item, when, date, how]);

  // Focus, Escape, focus trap, and background scroll lock while open.
  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !sheetRef.current) return;
      const focusables = sheetRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const sent = (method) => {
    try { track("click_order", { method, item_name: item.name }); } catch (e) {}
  };

  return (
    <div className="mb-sheet-layer">
      <div className="mb-sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="mb-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mb-sheet-title"
        ref={sheetRef}
      >
        <div className="mb-sheet-handle" aria-hidden="true" />
        <div className="mb-sheet-head">
          <div>
            <h2 id="mb-sheet-title" className="mb-sheet-title">Pedir {item.name}</h2>
            <p className="mb-sheet-sub">
              Te abrimos WhatsApp con este mensaje. Puedes cambiarlo antes de enviarlo.
            </p>
          </div>
          <button type="button" className="mb-icon-btn" onClick={onClose} aria-label="Cerrar" ref={closeRef}>
            <FiX size={22} aria-hidden="true" />
          </button>
        </div>

        <fieldset className="mb-sheet-field">
          <legend>¿Para cuándo lo necesitas?</legend>
          <div className="mb-chip-row">
            {WHEN.map((o) => (
              <button
                key={o.id}
                type="button"
                className="mb-chip"
                aria-pressed={when === o.id}
                onClick={() => setWhen(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
          {when === "date" && (
            <label className="mb-sheet-date">
              <span>Fecha</span>
              <input type="date" min={todayIso()} value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
          )}
        </fieldset>

        <fieldset className="mb-sheet-field">
          <legend>¿Cómo lo recibes?</legend>
          <div className="mb-chip-row">
            {HOW.map((o) => (
              <button
                key={o.id}
                type="button"
                className="mb-chip"
                aria-pressed={how === o.id}
                onClick={() => setHow(o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mb-sheet-preview">
          <p className="mb-sheet-preview-label">Tu mensaje</p>
          <p className="mb-sheet-preview-text" aria-live="polite">{message}</p>
        </div>

        <div className="mb-sheet-actions">
          <a
            className="mb-btn mb-btn--primary"
            href={whatsappLink(message)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sent("whatsapp")}
          >
            <FaWhatsapp size={20} aria-hidden="true" />
            Abrir WhatsApp
          </a>
          <a className="mb-btn mb-btn--quiet" href={smsLink(message)} onClick={() => sent("sms")}>
            Mejor por mensaje de texto
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderSheet;
