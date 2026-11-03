// ClubPage.js — "Conéctate con nosotros" sign-up form with message consent
// (melibee.art/contacto; the older /club address shows the same page)
//
// The consent wording is NOT hard-coded here. It is read from Firestore
// (consentTexts/<CONSENT_VERSION>) so what the visitor sees is exactly the
// approved text, and every sign-up records which version they agreed to.
// To change the wording: create consentTexts/v2 in Firebase, then bump
// CONSENT_VERSION below and redeploy.

import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./ClubPage.css";

const CONSENT_VERSION = "v1";

// Business WhatsApp number (digits only, with country code) used for the
// optional "confirm on WhatsApp" step after sign-up.
const BUSINESS_WHATSAPP = "19152074262";

// Google Apps Script web app that emails flowersbymelibee@gmail.com about each
// new sign-up (see SIGNUP_ALERTS.md). Leave empty to turn alerts off.
const NOTIFY_URL =
  "https://script.google.com/macros/s/AKfycbwr5hbb59ovUMXzb7m5B6DdqHwuUDi7Hck5W7AVF4ZEHQlJQ-A-xAKuN0qKJzVOAJHpTg/exec";

// Sends the alert in the background. Never blocks or breaks the sign-up:
// the sign-up is already saved in Firebase before this runs.
function sendSignupAlert(payload) {
  if (!NOTIFY_URL) return;
  try {
    fetch(NOTIFY_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch (e) {}
}

// ?src=... values allowed by the Firestore rules. Anything else = "website".
const ALLOWED_SOURCES = ["website", "bouquet_card", "checkout", "giveaway", "event"];

const UI = {
  es: {
    title: "Conéctate con nosotros",
    intro: "Déjanos tus datos para recibir avisos de tus pedidos y, si quieres, ofertas y recordatorios de fechas especiales.",
    back: "← Volver al inicio",
    name: "Nombre",
    phone: "Teléfono celular",
    phoneHint: "Número de EE. UU., 10 dígitos. Solo es necesario si quieres recibir mensajes de texto o WhatsApp.",
    email: "Correo electrónico",
    required: "obligatorio",
    optional: "opcional",
    textOptIn: "Mensajes de texto / WhatsApp",
    submit: "Enviar",
    sending: "Enviando…",
    errName: "Escribe tu nombre (mínimo 2 letras).",
    errPhone: "Escribe un número de 10 dígitos de EE. UU.",
    errPhoneNeeded: "Para recibir mensajes de texto o WhatsApp, escribe tu número de teléfono.",
    errEmail: "Escribe un correo válido.",
    errSave: "No pudimos guardar tus datos. Intenta de nuevo en un momento.",
    errTexts: "El formulario no está disponible por ahora. Intenta más tarde.",
    loading: "Cargando…",
    thanksTitle: "¡Gracias!",
    thanks: "Recibimos tus datos.",
    confirmWa: "Para empezar a recibir nuestros mensajes, confírmalo por WhatsApp y guarda nuestro número:",
    confirmBtn: "Confirmar por WhatsApp",
    waMessage: "SÍ, quiero recibir mensajes de Flowers by Melibee.",
    langToggle: "English",
    privacyLink: "Política de privacidad",
    termsLink: "Términos de mensajes",
  },
  en: {
    title: "Connect with us",
    intro: "Leave your info to get updates about your orders and, if you'd like, offers and special-date reminders.",
    back: "← Back to home",
    name: "Name",
    phone: "Mobile phone",
    phoneHint: "US number, 10 digits. Only needed if you want text or WhatsApp messages.",
    email: "Email",
    required: "required",
    optional: "optional",
    textOptIn: "Text / WhatsApp messages",
    submit: "Submit",
    sending: "Sending…",
    errName: "Please enter your name (at least 2 letters).",
    errPhone: "Please enter a 10-digit US phone number.",
    errPhoneNeeded: "To receive text or WhatsApp messages, please enter your phone number.",
    errEmail: "Please enter a valid email.",
    errSave: "We couldn't save your info. Please try again in a moment.",
    errTexts: "This form isn't available right now. Please try again later.",
    loading: "Loading…",
    thanksTitle: "Thank you!",
    thanks: "We received your info.",
    confirmWa: "To start receiving our messages, confirm on WhatsApp and save our number:",
    confirmBtn: "Confirm on WhatsApp",
    waMessage: "YES, I want to receive messages from Flowers by Melibee.",
    langToggle: "Español",
    privacyLink: "Privacy Policy",
    termsLink: "Messaging Terms",
  },
};

// "(915) 555-1234" -> "+19155551234". Returns null if not a valid US number.
function toE164US(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const ClubPage = () => {
  const [searchParams] = useSearchParams();
  const srcParam = searchParams.get("src");
  const source = ALLOWED_SOURCES.includes(srcParam) ? srcParam : "website";

  const [lang, setLang] = useState(searchParams.get("lang") === "en" ? "en" : "es");
  const t = UI[lang];

  const [texts, setTexts] = useState(null);       // consent wording from Firestore
  const [textsError, setTextsError] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", email: "", hp: "" });
  const [optInTransactional, setOptInTransactional] = useState(false);
  const [optInMarketing, setOptInMarketing] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    getDoc(doc(db, "consentTexts", CONSENT_VERSION))
      .then((snap) => {
        if (snap.exists()) setTexts(snap.data());
        else setTextsError(true);
      })
      .catch(() => setTextsError(true));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const limits = { name: 60, phone: 20, email: 100, hp: 100 };
    setForm((f) => ({ ...f, [name]: value.slice(0, limits[name]) }));
  };

  const validate = () => {
    const errs = {};
    if (form.name.trim().length < 2) errs.name = t.errName;
    const phone = form.phone.trim();
    if (phone && !toE164US(phone)) errs.phone = t.errPhone;
    else if (!phone && (optInTransactional || optInMarketing)) errs.phone = t.errPhoneNeeded;
    if (!EMAIL_RE.test(form.email.trim())) errs.email = t.errEmail;
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(false);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Honeypot: real people never see or fill this field.
    if (form.hp) {
      setDone(true);
      return;
    }

    setSaving(true);
    try {
      const phoneE164 = form.phone.trim() ? toE164US(form.phone) : null;
      const saved = await addDoc(collection(db, "signups"), {
        name: form.name.trim(),
        ...(phoneE164 ? { phone: phoneE164 } : {}),
        email: form.email.trim().toLowerCase(),
        language: lang,
        optInTransactional,
        optInMarketing,
        consentTextVersion: CONSENT_VERSION,
        source,
        pageUrl: window.location.href.slice(0, 200),
        createdAt: serverTimestamp(),
      });
      sendSignupAlert({
        id: saved.id,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        ...(phoneE164 ? { phone: phoneE164 } : {}),
        language: lang,
        source,
        optInTransactional,
        optInMarketing,
      });
      setDone(true);
    } catch (err) {
      console.error("Error saving sign-up:", err);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const langButton = (
    <button
      type="button"
      className="club-lang"
      onClick={() => setLang(lang === "es" ? "en" : "es")}
    >
      {t.langToggle}
    </button>
  );

  if (done) {
    const waLink = `https://wa.me/${BUSINESS_WHATSAPP}?text=${encodeURIComponent(t.waMessage)}`;
    return (
      <main className="club-page">
        <div className="club-card club-done">
          <h1 className="club-title">{t.thanksTitle}</h1>
          <p className="club-intro">{t.thanks}</p>
          {(optInTransactional || optInMarketing) && (
            <>
              <p className="club-intro">{t.confirmWa}</p>
              <a className="club-submit club-wa" href={waLink} target="_blank" rel="noopener noreferrer">
                {t.confirmBtn}
              </a>
            </>
          )}
          <Link className="club-back" to="/">{t.back}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="club-page">
      <div className="club-card">
        <div className="club-top">
          <Link className="club-back" to="/">{t.back}</Link>
          {langButton}
        </div>
        <h1 className="club-title">{t.title}</h1>
        <p className="club-intro">{t.intro}</p>

        {textsError && <p className="club-error club-banner">{t.errTexts}</p>}
        {!texts && !textsError && <p className="club-intro">{t.loading}</p>}

        {texts && (
          <form onSubmit={handleSubmit} noValidate>
            <label className="club-field">
              <span>{t.name} <em>({t.required})</em></span>
              <input name="name" type="text" autoComplete="name" value={form.name} onChange={handleChange} />
              {errors.name && <small className="club-error">{errors.name}</small>}
            </label>

            <label className="club-field">
              <span>{t.phone} <em>({t.optional})</em></span>
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="915-555-1234"
                value={form.phone}
                onChange={handleChange}
              />
              <small className="club-hint">{t.phoneHint}</small>
              {errors.phone && <small className="club-error">{errors.phone}</small>}
            </label>

            <label className="club-field">
              <span>{t.email} <em>({t.required})</em></span>
              <input name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} />
              {errors.email && <small className="club-error">{errors.email}</small>}
            </label>

            {/* Honeypot for bots: hidden from people and screen readers */}
            <input
              className="club-hp"
              name="hp"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={form.hp}
              onChange={handleChange}
            />

            <fieldset className="club-consent">
              <legend>{t.textOptIn}</legend>

              <label className="club-check">
                <input
                  type="checkbox"
                  checked={optInTransactional}
                  onChange={(e) => setOptInTransactional(e.target.checked)}
                />
                <span>{texts[`transactional_${lang}`]}</span>
              </label>

              <label className="club-check">
                <input
                  type="checkbox"
                  checked={optInMarketing}
                  onChange={(e) => setOptInMarketing(e.target.checked)}
                />
                <span>{texts[`marketing_${lang}`]}</span>
              </label>
            </fieldset>

            <p className="club-privacy">{texts[`privacy_${lang}`]}</p>
            <p className="club-links">
              <a href="/privacidad.html" target="_blank" rel="noopener noreferrer">{t.privacyLink}</a>
              {" · "}
              <a href="/terminos.html" target="_blank" rel="noopener noreferrer">{t.termsLink}</a>
            </p>

            {saveError && <p className="club-error club-banner">{t.errSave}</p>}

            <button type="submit" className="club-submit" disabled={saving}>
              {saving ? t.sending : t.submit}
            </button>
          </form>
        )}
      </div>
    </main>
  );
};

export default ClubPage;
