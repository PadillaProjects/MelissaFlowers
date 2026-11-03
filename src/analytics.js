// analytics.js — Google Analytics only runs AFTER the visitor accepts.
//
// Until the visitor clicks "Accept" in the cookie banner, Google Analytics is
// never loaded: no cookies are set and no clicks are tracked. track() calls
// before that are simply ignored.

import { getAnalytics, isSupported, logEvent, setConsent } from "firebase/analytics";
import { app } from "./firebaseConfig";

const STORAGE_KEY = "melibee_analytics_consent"; // "granted" | "denied"
export const CONSENT_RESET_EVENT = "melibee-consent-reset";

let analytics = null;

export function getStoredConsent() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

function storeConsent(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch (e) {
    // Storage blocked (private mode, etc.): the choice lasts for this visit only.
  }
}

async function startAnalytics() {
  if (analytics) return;
  try {
    if (!(await isSupported())) return;
    // Analytics only. Advertising storage and ad personalization stay off.
    setConsent({
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    analytics = getAnalytics(app);
  } catch (e) {
    analytics = null;
  }
}

// Remove Google Analytics cookies (_ga, _ga_XXXX) left from an earlier "Accept".
function clearAnalyticsCookies() {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`];
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (!name.startsWith("_ga")) return;
    domains.forEach((d) => {
      document.cookie =
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/` + (d ? `; domain=${d}` : "");
    });
  });
}

// Called once when the app loads: resumes analytics only if the visitor
// accepted on an earlier visit.
export function initAnalyticsFromStoredConsent() {
  if (getStoredConsent() === "granted") startAnalytics();
}

export function acceptAnalytics() {
  storeConsent("granted");
  startAnalytics();
}

export function declineAnalytics() {
  const wasRunning = analytics !== null;
  storeConsent("denied");
  clearAnalyticsCookies();
  // Analytics can't be fully unloaded from a running page, so reload once.
  if (wasRunning) window.location.reload();
}

// "Cookie preferences" link: forget the choice and show the banner again.
export function reopenConsentBanner() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  window.dispatchEvent(new Event(CONSENT_RESET_EVENT));
}

// Safe to call anywhere: does nothing unless the visitor accepted.
export function track(eventName, params) {
  if (!analytics) return;
  try {
    logEvent(analytics, eventName, params);
  } catch (e) {}
}
