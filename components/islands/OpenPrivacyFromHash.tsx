"use client";

import { useEffect } from "react";

export function OpenPrivacyFromHash() {
  useEffect(() => {
    const open = () => {
      if (window.location.hash !== "#privacy") return;
      const el = document.getElementById("privacy");
      if (el instanceof HTMLDetailsElement) el.open = true;
    };
    window.addEventListener("hashchange", open);
    open();
    return () => window.removeEventListener("hashchange", open);
  }, []);
  return null;
}
