import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigationType, useSearchParams } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { FiChevronRight } from "react-icons/fi";
import "./HomePage.css";
import Hero from "../components/Hero";
import SiteHeader from "../components/SiteHeader";
import ArrangementCard, { HOME_SCROLL_KEY } from "../components/ArrangementCard";
import Footer from "../components/Footer";
import { useCatalog } from "../catalog/CatalogContext";
import {
  arrangementPath, categoryNote, whatsappLink, GENERAL_MESSAGE,
} from "../catalog/arrangements";
import { track } from "../analytics";

const HomePage = () => {
  const { groups, loading, error } = useCatalog();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigationType = useNavigationType();
  const heroRef = useRef(null);
  const sectionRef = useRef(null);
  const [pastHero, setPastHero] = useState(false);

  const filter = searchParams.get("tipo") || "todos";
  const activeGroups = filter === "todos" ? groups : groups.filter((g) => g.slug === filter);
  const shownGroups = activeGroups.length ? activeGroups : groups;
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const featured = groups[0]?.items[0];

  // Show the compact header once the welcome logo is out of view.
  useEffect(() => {
    const el = heroRef.current;
    if (!el || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Coming back from an arrangement: return to where the customer was.
  useEffect(() => {
    if (loading) return;
    let saved = null;
    try { saved = sessionStorage.getItem(HOME_SCROLL_KEY); } catch (e) {}
    if (navigationType === "POP" && saved) {
      requestAnimationFrame(() => window.scrollTo({ top: Number(saved), behavior: "instant" }));
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

  return (
    <div className="homepage">
      <div ref={heroRef}>
        <Hero />
      </div>
      <SiteHeader visible={pastHero} onLogoClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />

      <section id="destacado" className="mb-intro" aria-labelledby="mb-intro-title">
        {featured && (
          <Link to={arrangementPath(featured)} className="mb-intro-photo">
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

      <section id="arreglos" ref={sectionRef} className="mb-gallery" aria-labelledby="mb-gallery-title">
        <h2 id="mb-gallery-title" className="mb-visually-hidden">Arreglos</h2>

        {groups.length > 1 && (
          <div className="mb-filter-bar">
            <div className="mb-chip-row mb-chip-row--scroll" role="group" aria-label="Filtrar por tipo">
              <button type="button" className="mb-chip" aria-pressed={filter === "todos"} onClick={() => pickFilter("todos")}>
                Todos <span className="mb-chip-count">{total}</span>
              </button>
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="mb-chip"
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

      <Footer />
    </div>
  );
};

export default HomePage;
