import React, { useEffect, useRef } from "react";
import { Link, useNavigationType, useSearchParams } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { FiChevronRight, FiCamera, FiMessageSquare, FiCheck } from "react-icons/fi";
import "./HomePage.css";
import Hero from "../components/Hero";
import SiteHeader from "../components/SiteHeader";
import ArrangementCard, { HOME_SCROLL_KEY } from "../components/ArrangementCard";
import Footer from "../components/Footer";
import { useCatalog } from "../catalog/CatalogContext";
import {
  arrangementPath, categoryNote, whatsappLink, smsLink, GENERAL_MESSAGE, CUSTOM_ARRANGEMENT_MESSAGE,
} from "../catalog/arrangements";
import { track } from "../analytics";

const HomePage = () => {
  const { groups, featured, loading, error } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigationType = useNavigationType();
  const sectionRef = useRef(null);
  const customRef = useRef(null);

  const filter = searchParams.get("tipo") || "todos";
  const activeGroups = filter === "todos" ? groups : groups.filter((g) => g.slug === filter);
  const shownGroups = activeGroups.length ? activeGroups : groups;
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  // Coming back from an arrangement: return to where the customer was.
  useEffect(() => {
    if (loading) return;
    let saved = null;
    try { saved = sessionStorage.getItem(HOME_SCROLL_KEY); } catch (e) {}
    if (navigationType === "POP" && saved) {
      requestAnimationFrame(() => {
        const top = Number(saved);
        window.scrollTo(0, top);
        document.documentElement.scrollTop = top;
        document.body.scrollTop = top;
      });
    }
    try { sessionStorage.removeItem(HOME_SCROLL_KEY); } catch (e) {}
  }, [loading, navigationType]);

  const pickFilter = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug === "todos") next.delete("tipo");
    else next.set("tipo", slug);
    setSearchParams(next, { replace: true });
    try { track("filter_gallery", { category: slug }); } catch (e) {}
    // Keep the chips in view and start the list from the top.
    const section = sectionRef.current;
    if (section && section.getBoundingClientRect().top < 0) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToArrangements = () => {
    sectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToCustom = () => {
    customRef.current?.scrollIntoView({ behavior: "smooth" });
    try { track("click_navigation", { destination: "custom_section" }); } catch (e) {}
  };

  return (
    <div className="homepage">
      <SiteHeader onLogoClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
      <Hero />

      <section id="destacado" className="mb-intro" aria-labelledby="mb-intro-title">
        {featured && (
          <Link
            to={arrangementPath(featured)}
            className="mb-intro-photo"
            onClick={() => {
              try { sessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY)); } catch (e) {}
              window.scrollTo(0, 0);
              document.documentElement.scrollTop = 0;
              document.body.scrollTop = 0;
            }}
          >
            <img src={featured.images[0].large} alt={featured.name} />
            <span className="mb-intro-pill">
              {featured.name}
              <FiChevronRight size={16} aria-hidden="true" />
            </span>
          </Link>
        )}
        <div className="mb-intro-text">
          <h2 id="mb-intro-title" className="mb-intro-title">
            Flores naturales y de listón, hechas a mano en Canutillo.
          </h2>
          <p className="mb-intro-sub">Entregamos en El Paso y alrededores, o recoges en Canutillo.</p>
          <div className="mb-intro-actions">
            <button type="button" className="mb-btn mb-btn--primary" onClick={scrollToArrangements}>
              Ver arreglos
            </button>
            <a
              className="mb-btn mb-btn--outline"
              href={whatsappLink(GENERAL_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { try { track("click_contact", { method: "whatsapp", location: "intro" }); } catch (e) {} }}
            >
              <FaWhatsapp size={18} aria-hidden="true" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <div className="mb-custom-cta">
        <button type="button" className="mb-custom-cta-btn" onClick={scrollToCustom}>
          <FiCamera size={18} aria-hidden="true" />
          <span>
            <strong>Pedidos personalizados</strong>
            <small>Mándanos tu foto de referencia</small>
          </span>
          <FiChevronRight size={18} aria-hidden="true" className="mb-custom-cta-chev" />
        </button>
      </div>

      <section id="arreglos" ref={sectionRef} className="mb-gallery" aria-labelledby="mb-gallery-title">
        <h2 id="mb-gallery-title" className="mb-visually-hidden">Arreglos</h2>

        {groups.length > 1 && (
          <div className="mb-filter-bar">
            <div
              className={groups.length <= 3 ? "mb-seg" : "mb-chip-row mb-chip-row--scroll"}
              role="group"
              aria-label="Filtrar por tipo"
            >
              <button type="button" className={groups.length <= 3 ? "mb-seg-btn" : "mb-chip"} aria-pressed={filter === "todos"} onClick={() => pickFilter("todos")}>
                Todos <span className="mb-chip-count">{total}</span>
              </button>
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={groups.length <= 3 ? "mb-seg-btn" : "mb-chip"}
                  aria-pressed={filter === g.slug}
                  onClick={() => pickFilter(g.slug)}
                >
                  {g.name} <span className="mb-chip-count">{g.items.length}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && <p className="mb-gallery-status">Cargando arreglos…</p>}
        {!loading && error && (
          <p className="mb-gallery-status">No pudimos cargar la galería. Revisa tu conexión y vuelve a intentar.</p>
        )}
        {!loading && !error && groups.length === 0 && (
          <p className="mb-gallery-status">Pronto agregaremos arreglos. Mientras tanto, escríbenos por WhatsApp.</p>
        )}

        {shownGroups.map((g) => (
          <div key={g.id} className="mb-group">
            <div className="mb-group-head">
              <h3 className="mb-group-title">{g.name}</h3>
              {categoryNote(g) && <p className="mb-group-note">{categoryNote(g)}</p>}
            </div>
            <div className="mb-grid">
              {g.items.map((item) => (
                <ArrangementCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section id="personalizados" ref={customRef} className="mb-custom" aria-labelledby="mb-custom-title">
        <div className="mb-custom-card">
          <div className="mb-custom-header">
            <span className="mb-tag mb-tag--ribbon mb-custom-tag">
              Diseño personalizado · Custom Orders
            </span>
            <h2 id="mb-custom-title" className="mb-custom-title">
              ¿Buscas un arreglo personalizado?
            </h2>
            <p className="mb-custom-desc">
              ¿Tienes en mente un diseño especial o viste un arreglo que te gustó? Mándanos una foto por WhatsApp o mensaje de texto (SMS) y con gusto te decimos si podemos prepararlo, qué flores hay disponibles y cuánto costaría.
            </p>
            <p className="mb-custom-sub-en">
              Looking for something custom? Send us a photo by WhatsApp or text and we'll confirm availability and give you a quote.
            </p>
          </div>

          <div className="mb-custom-steps">
            <div className="mb-custom-step">
              <span className="mb-custom-step-icon" aria-hidden="true">
                <FiCamera size={20} />
              </span>
              <div className="mb-custom-step-text">
                <strong>1. Elige tu foto</strong>
                <span>Cualquier diseño o idea que te inspire</span>
              </div>
            </div>
            <div className="mb-custom-step">
              <span className="mb-custom-step-icon" aria-hidden="true">
                <FiMessageSquare size={20} />
              </span>
              <div className="mb-custom-step-text">
                <strong>2. Mándanos un mensaje</strong>
                <span>Por WhatsApp o SMS al <span className="mb-nowrap">915-207-4262</span></span>
              </div>
            </div>
            <div className="mb-custom-step">
              <span className="mb-custom-step-icon" aria-hidden="true">
                <FiCheck size={20} />
              </span>
              <div className="mb-custom-step-text">
                <strong>3. Te confirmamos</strong>
                <span>Te respondemos con disponibilidad y cotización</span>
              </div>
            </div>
          </div>

          <p className="mb-custom-note">
            Escríbenos con anticipación: los arreglos de listón necesitan al menos 1 semana y las flores naturales dependen de disponibilidad.
          </p>

          <div className="mb-custom-actions">
            <a
              className="mb-btn mb-btn--primary"
              href={whatsappLink(CUSTOM_ARRANGEMENT_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                try { track("click_contact", { method: "whatsapp", location: "custom_section" }); } catch (e) {}
              }}
            >
              <FaWhatsapp size={20} aria-hidden="true" />
              <span>WhatsApp (915-207-4262)</span>
            </a>
            <a
              className="mb-btn mb-btn--ink"
              href={smsLink(CUSTOM_ARRANGEMENT_MESSAGE)}
              onClick={() => {
                try { track("click_contact", { method: "sms", location: "custom_section" }); } catch (e) {}
              }}
            >
              <FiMessageSquare size={19} aria-hidden="true" />
              <span>Mensaje de texto / SMS</span>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
