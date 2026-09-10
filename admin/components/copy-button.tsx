"use client";

import { useState } from "react";

/**
 * Copies a block of text to the clipboard. Client-side because the Clipboard
 * API is browser-only; the report itself is rendered on the server.
 */
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      // Clipboard access is refused on insecure origins and by some browser
      // settings. Say so rather than looking like nothing happened.
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2500);
  }

  return (
    <button type="button" onClick={copy} className="btn" aria-live="polite">
      {state === "copied"
        ? "Copied"
        : state === "failed"
          ? "Copy failed, select the text instead"
          : label}
    </button>
  );
}
