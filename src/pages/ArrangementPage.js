import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import {
  FiArrowLeft, FiShare, FiCalendar, FiTruck, FiMapPin, FiMessageSquare,
  FiChevronLeft, FiChevronRight,
} from "react-icons/fi";
import { useCatalog } from "../catalog/CatalogContext";
import {
  arrangementUrl, leadTimeFor, smsLink, DELIVERY_AREAS,
} from "../catalog/arrangements";
import ArrangementCard from "../components/ArrangementCard";
import OrderSheet from "../components/OrderSheet";
import Footer from "../components/Footer";
import { track } from "../analytics";
import "./ArrangementPage.css";

const ArrangementPage = () => {
  const { slug } = useParams();
  const { bySlug, items, loading } = useCatalog();
  const navigate = useNavigate();
  const location = useLocation();
  const item = bySlug.get(slug);

  const [index, setIndex] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [shareNote, setShareNote] = useState("");
  const trackRef = useRef(null);

  // New arrangement: start at the top, first photo.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setIndex(0);
    setSheetOpen(false);
    if (trackRef.current) trackRef.current.scrollLeft = 0;
  }, [slug]);

  useEffect(() => {
    if (!item) return undefined;
    const prev = document.title;
    document.title = `${item.name} | Flowers by Melibee`;
    try { track("view_item", { item_name: item.name }); } catch (e) {}
    return () => { document.title = prev; };
  }, [item]);

  const goBack = () => {
    // Came from inside the site: go back so the gallery keeps its place.
    if (location.key !== "default") navigate(-1);
    else navigate("/");
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  const goTo = (i) => {
    const el = trackRef.current;
    if (!el || !item) return;
    const clamped = Math.max(0, Math.min(item.images.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    setIndex(clamped);
  };

  const share = async () => {
    const url = arrangementUrl(item);
    try {
      if (navigator.share) {
        await navigator.share({ title: item.name, text: `${item.name} — Flowers by Melibee`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote("Enlace copiado");
      setTimeout(() => setShareNote(""), 2500);
    } catch (e) {
      /* user cancelled the share sheet */
    }
  };

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  if (!item) {
    return (
      <main className="mb-arr-missing">
        {loading ? (
          <p>Cargando…</p>
        ) : (
          <>
            <h1>No encontramos este arreglo</h1>
            <p>Puede que ya no esté en la galería.</p>
            <Link className="mb-btn mb-btn--primary" to="/">Ver todos los arreglos</Link>
          </>
        )}
      </main>
    );
  }

  const lead = leadTimeFor(item);
  const related = items
    .filter((it) => it.kind === item.kind && it.id !== item.id)
    .slice(0, 8);
  const photos = item.images;
  const textMessage = `Hola, me interesa el arreglo "${item.name}" (${arrangementUrl(item)}).`;

  return (
    <div className="mb-arr-page">
      <main className="mb-arr">
        <section className="mb-arr-gallery" aria-roledescription="carrusel" aria-label={`Fotos de ${item.name}`}>
          <div className="mb-arr-track" ref={trackRef} onScroll={onScroll} tabIndex={-1}>
            {photos.map((img, i) => (
              <img
                key={img.large}
                src={img.large}
                alt={photos.length > 1 ? `${item.name}, foto ${i + 1} de ${photos.length}` : item.name}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            ))}
          </div>

          <div className="mb-arr-topbar">
            <button type="button" className="mb-icon-btn mb-icon-btn--float" onClick={goBack} aria-label="Volver a los arreglos">
              <FiArrowLeft size={22} aria-hidden="true" />
            </button>
            <button type="button" className="mb-icon-btn mb-icon-btn--float" onClick={share} aria-label="Compartir este arreglo">
              <FiShare size={20} aria-hidden="true" />
            </button>
          </div>
          <p className="mb-visually-hidden" aria-live="polite">{shareNote}</p>
          {shareNote && <p className="mb-arr-toast" aria-hidden="true">{shareNote}</p>}

          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="mb-icon-btn mb-icon-btn--float mb-arr-prev"
                onClick={() => goTo(index - 1)}
                disabled={index === 0}
                aria-label="Foto anterior"
              >
                <FiChevronLeft size={22} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="mb-icon-btn mb-icon-btn--float mb-arr-next"
                onClick={() => goTo(index + 1)}
                disabled={index === photos.length - 1}
                aria-label="Foto siguiente"
              >
                <FiChevronRight size={22} aria-hidden="true" />
              </button>
              <div className="mb-arr-dots">
                {photos.map((img, i) => (
                  <button
                    key={img.large}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Foto ${i + 1} de ${photos.length}`}
                    aria-current={i === index ? "true" : undefined}
                  >
                    <span />
                  </button>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="mb-arr-info">
          <span className={`mb-tag${item.kind === "ribbon" ? " mb-tag--ribbon" : ""}`}>
            {item.kind === "ribbon" ? "Flores eternas de listón" : "Flores naturales"}
          </span>
          <h1 className="mb-arr-title">{item.name}</h1>
          {item.description && <p className="mb-arr-desc">{item.description}</p>}
          <p className="mb-arr-price">{item.price ? `Precio: ${item.price}` : "Precio: pregúntanos por WhatsApp"}</p>

          <ul className="mb-arr-facts">
            <li>
              <FiCalendar aria-hidden="true" />
              <span><strong>{lead.title}</strong>{lead.body}</span>
            </li>
            <li>
              <FiTruck aria-hidden="true" />
              <span><strong>Entrega a domicilio</strong>{DELIVERY_AREAS}</span>
            </li>
            <li>
              <FiMapPin aria-hidden="true" />
              <span><strong>O recoge en Canutillo</strong>Te mandamos la dirección al confirmar.</span>
            </li>
          </ul>

          <div className="mb-arr-cta">
            <button type="button" className="mb-btn mb-btn--primary" onClick={() => setSheetOpen(true)}>
              <FaWhatsapp size={20} aria-hidden="true" />
              Pedir por WhatsApp
            </button>
            <a
              className="mb-btn mb-btn--outline mb-btn--square"
              href={smsLink(textMessage)}
              aria-label="Pedir por mensaje de texto"
              onClick={() => { try { track("click_order", { method: "sms", item_name: item.name }); } catch (e) {} }}
            >
              <FiMessageSquare size={20} aria-hidden="true" />
            </a>
          </div>

          {related.length > 0 && (
            <div className="mb-arr-related">
              <h2>También te puede gustar</h2>
              <div className="mb-arr-related-row">
                {related.map((it) => (
                  <ArrangementCard key={it.id} item={it} compact />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
      <OrderSheet item={item} open={sheetOpen} onClose={closeSheet} />
    </div>
  );
};

export default ArrangementPage;
