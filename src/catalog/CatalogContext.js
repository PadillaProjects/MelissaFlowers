import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getOptimizedUrl } from "../services/cloudinary";
import { slugify, isRibbonCategory } from "./arrangements";

// Loads categories and items once for the whole app, so moving between the
// gallery and an arrangement page is instant and keeps its place.
const CatalogContext = createContext(null);

const itemCategoryKeys = (item) =>
  Array.isArray(item.categoryIds)
    ? item.categoryIds
    : [item.categoryId, item.category].filter(Boolean);

const belongsTo = (item, category) => {
  const ids = itemCategoryKeys(item);
  return (
    ids.includes(category.id) ||
    ids.includes(category.name) ||
    item.categoryId === category.id ||
    item.categoryId === category.name ||
    item.category === category.name ||
    item.category === category.id
  );
};

export const CatalogProvider = ({ children }) => {
  const [rawItems, setRawItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubCategories = onSnapshot(
      collection(db, "categories"),
      (snap) => setCategories(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
      (err) => console.error("Error listening to categories:", err)
    );
    const unsubItems = onSnapshot(
      collection(db, "items"),
      (snap) => {
        setRawItems(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
        setItemsLoaded(true);
      },
      (err) => {
        console.error("Error listening to items:", err);
        setError(err);
        setItemsLoaded(true);
      }
    );
    return () => {
      unsubCategories();
      unsubItems();
    };
  }, []);

  const value = useMemo(() => {
    // Normalize items: images, slug, kind.
    const usedSlugs = new Set();
    const items = rawItems.map((data) => {
      const urls = data.imageUrls || (data.imageUrl ? [data.imageUrl] : []);
      const category = categories.find((c) => belongsTo(data, c));
      let slug = slugify(data.slug || data.name || data.id) || data.id;
      if (usedSlugs.has(slug)) slug = `${slug}-${data.id.slice(0, 4).toLowerCase()}`;
      usedSlugs.add(slug);
      return {
        ...data,
        slug,
        categoryName: category?.name || "",
        kind: category && isRibbonCategory(category) ? "ribbon" : "natural",
        images: urls.map((url) => {
          const card = getOptimizedUrl(url, 800);
          return { webp: card, fallback: card, large: getOptimizedUrl(url, 1400) };
        }),
        blurhashes: data.blurhashes || (data.blurhash ? [data.blurhash] : []),
      };
    }).filter((it) => it.images.length > 0);

    // Group by category, keeping the order chosen in the admin page.
    const groups = categories
      .map((category) => {
        const list = items.filter((it) => belongsTo(it, category));
        const order = category.itemOrder || [];
        if (order.length) {
          list.sort((a, b) => {
            const ia = order.indexOf(a.id);
            const ib = order.indexOf(b.id);
            if (ia !== -1 && ib !== -1) return ia - ib;
            if (ia !== -1) return -1;
            if (ib !== -1) return 1;
            return 0;
          });
        }
        return {
          id: category.id,
          name: category.name,
          slug: slugify(category.name) || category.id,
          isRibbon: isRibbonCategory(category),
          items: list,
        };
      })
      .filter((g) => g.items.length > 0);

    const orphans = items.filter((it) => !categories.some((c) => belongsTo(it, c)));
    if (orphans.length) {
      groups.push({ id: "__otros", name: "Otros", slug: "otros", isRibbon: false, items: orphans });
    }

    const bySlug = new Map(items.map((it) => [it.slug, it]));
    // Photo under the welcome logo: an item marked `featured: true`,
    // otherwise the first arrangement of the first category.
    const featured = items.find((it) => it.featured === true) || groups[0]?.items[0] || null;
    return { items, groups, bySlug, featured, loading: !itemsLoaded, error };
  }, [rawItems, categories, itemsLoaded, error]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export const useCatalog = () => {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside <CatalogProvider>");
  return ctx;
};
