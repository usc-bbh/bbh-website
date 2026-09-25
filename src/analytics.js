// Lightweight, cookie-free analytics via GoatCounter (https://www.goatcounter.com).
// Dashboard: https://uscbbh.goatcounter.com  — the site code is set in index.html.
//
// What gets recorded:
//   • Tab views as pages: /home, /projects, /team, /contact
//   • Clicks on external links as events. Links with a `data-track` attribute use that
//     label (e.g. "Eclipse: Try it"); any other external link is labeled "outbound: <url>".
// GoatCounter ignores localhost, so `npm run dev` previews are never counted.

export function track(opts) {
  const send = () => window.goatcounter && window.goatcounter.count && window.goatcounter.count(opts);
  if (window.goatcounter && window.goatcounter.count) send();
  else if (document.readyState !== "complete") window.addEventListener("load", send, { once: true });
  // Otherwise the script was blocked (e.g. an ad blocker); skip silently.
}

export const trackTab = (tab) => track({ path: "/" + tab, title: tab });

// One listener for the whole page catches clicks on any external link.
document.addEventListener("click", (e) => {
  const a = e.target.closest && e.target.closest("a[href]");
  if (!a || a.host === window.location.host) return;
  const label = a.dataset.track || "outbound: " + a.host + a.pathname.replace(/\/$/, "");
  track({ path: label, title: label, event: true });
}, true);
