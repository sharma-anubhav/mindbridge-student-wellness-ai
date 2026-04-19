"use client";
import { useEffect } from "react";

/** Reads persisted theme preference from localStorage and applies it to <html> */
export default function ThemeInit() {
  useEffect(() => {
    const stored = localStorage.getItem("mb-theme") ?? "dark";
    document.documentElement.setAttribute("data-theme", stored);
  }, []);
  return null;
}
