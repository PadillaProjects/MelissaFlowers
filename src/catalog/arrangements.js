// Helpers shared by the gallery, the arrangement page and the order sheet.

export const SITE_URL = "https://melibee.art";
export const BUSINESS_PHONE = "19152074262"; // WhatsApp / SMS, digits only

export const slugify = (text = "") =>
  text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const arrangementPath = (item) => `/arreglos/${item.slug}`;
export const arrangementUrl = (item) => `${SITE_URL}${arrangementPath(item)}`;

export const whatsappLink = (text) =>
  `https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent(text)}`;

// "?&body=" works on both iOS and Android messaging apps.
export const smsLink = (text) =>
  `sms:+${BUSINESS_PHONE}?&body=${encodeURIComponent(text)}`;

export const GENERAL_MESSAGE = "Hola, quiero información sobre sus arreglos.";

// A category whose name mentions "etern" or "listón" holds ribbon flowers.
export const isRibbonCategory = (category) => {
  const n = slugify(category?.name || "");
  return n.includes("etern") || n.includes("liston");
};

// Lead-time rules from Melissa:
// - ribbon (eternal) flowers: 1 week
// - red-rose ramos buchones ("Ramo de Amor de 25/50"): 3 business days
// - other natural flowers: by inquiry, depends on the season
// An item can override with a `leadTime` text field in Firestore.
export const leadTimeFor = (item) => {
  if (item.kind === "ribbon") {
    return {
      short: "De listón · 1 semana",
      title: "Hecho a mano en 1 semana",
      body: "Las flores de listón se preparan con una semana de anticipación.",
    };
  }
  if (/ramo de amor/i.test(item.name || "")) {
    return {
      short: "Rosas rojas · 3 días hábiles",
      title: "Listo en 3 días hábiles",
      body: "Pídelo con al menos 3 días hábiles de anticipación.",
    };
  }
  return {
    short: "Natural · por pedido",
    title: "Según la flor de temporada",
    body: "Escríbenos con tu fecha y te confirmamos disponibilidad.",
  };
};

export const shortMeta = (item) => item.leadTime || leadTimeFor(item).short;

export const categoryNote = (group) => {
  if (group.isRibbon) {
    return "Flores eternas hechas a mano con listón. Pídelas con una semana de anticipación.";
  }
  if (group.id === "__otros") return "";
  return "Dependen de la flor de temporada. Los ramos de rosa roja están listos en 3 días hábiles.";
};

export const DELIVERY_AREAS =
  "Canutillo, Westside, Upper Valley, Anthony, Santa Teresa, Downtown, East Side, Chaparral y cerca de Eastlake.";
