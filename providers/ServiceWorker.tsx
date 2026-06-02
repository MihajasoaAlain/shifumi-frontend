"use client";

import { useEffect } from "react";

// Registers the PWA service worker once on the client. Only in production:
// in dev the SW would cache Next's HMR chunks and serve stale code.
const ServiceWorker = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.error("SW registration failed:", err);
      });
    };

    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
};

export default ServiceWorker;
