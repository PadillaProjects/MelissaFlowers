import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Blurhash } from "react-blurhash";
import { track } from "../analytics";
import { arrangementPath, shortMeta } from "../catalog/arrangements";
import "./ArrangementCard.css";

export const HOME_SCROLL_KEY = "mb_home_scroll";

const ArrangementCard = ({ item, compact = false, onOpen }) => {
  const [loaded, setLoaded] = useState(false);
  const hash = item.blurhashes?.[0];

  return (
    <Link
      to={arrangementPath(item)}
      className={`mb-card${compact ? " mb-card--compact" : ""}`}
      onClick={() => {
        if (window.location.pathname === "/") {
          try { sessionStorage.setItem(HOME_SCROLL_KEY, String(window.scrollY)); } catch (e) {}
        }
        try { track("select_item", { item_name: item.name }); } catch (e) {}
        if (onOpen) onOpen(item);
      }}
    >
      <span className="mb-card-photo">
        {hash && hash.length >= 6 && !loaded && (
          <Blurhash hash={hash} width="100%" height="100%" resolutionX={32} resolutionY={32} punch={1} className="mb-card-blur" />
        )}
        <img
          src={item.images[0].webp}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={loaded ? "is-loaded" : ""}
        />
      </span>
      <span className="mb-card-text">
        <span className="mb-card-name">{item.name}</span>
        {!compact && <span className="mb-card-meta">{shortMeta(item)}</span>}
      </span>
    </Link>
  );
};

export default ArrangementCard;
