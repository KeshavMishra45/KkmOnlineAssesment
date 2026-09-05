import { useEffect, useRef } from "react";

/**
 * Locks the exam page down while `active` is true:
 *  - flags tab switches / minimizing (visibilitychange) and app switches (blur)
 *  - blocks Tab, F11, Ctrl/Cmd+C, Ctrl/Cmd+V, Ctrl/Cmd+X, Ctrl/Cmd+P, Ctrl/Cmd+Tab, Alt+Tab
 *  - blocks the right-click menu, copy/cut/paste events and text selection
 *  - reports every incident through onViolation(message)
 *
 * Important honesty note (also surfaced to the user in chat): Alt+Tab is an
 * OS-level shortcut and Ctrl+Tab / F11 are reserved by most browsers, so no
 * website can guarantee those keys never fire. We call preventDefault() on
 * all of them as a best effort, but the real enforcement is detection +
 * logging + (optionally) auto-submitting the exam once too many incidents
 * happen — the same approach real proctoring software uses.
 */
export function useExamLockdown({ active, onViolation }) {
  const onViolationRef = useRef(onViolation);
  onViolationRef.current = onViolation;

  useEffect(() => {
    if (!active) return undefined;

    const report = (message) => onViolationRef.current?.(message);

    function handleVisibilityChange() {
      if (document.hidden) {
        report("Left the exam tab (tab switched or window minimized)");
      }
    }

    function handleBlur() {
      report("Exam window lost focus (possible app/window switch)");
    }

    function handleKeyDown(e) {
      const key = e.key;
      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      // Tab key (also blocks Ctrl+Tab / Ctrl+Shift+Tab as best effort)
      if (key === "Tab") {
        e.preventDefault();
        report(ctrlOrCmd ? "Ctrl/Cmd+Tab pressed" : "Tab key pressed");
        return;
      }
      // Alt+Tab — OS-level, preventDefault is best effort only
      if (e.altKey && key === "Tab") {
        e.preventDefault();
        report("Alt+Tab pressed");
        return;
      }
      // F11 fullscreen toggle
      if (key === "F11") {
        e.preventDefault();
        report("F11 pressed");
        return;
      }
      if (ctrlOrCmd && (key === "c" || key === "C")) {
        e.preventDefault();
        report("Copy shortcut blocked (Ctrl/Cmd+C)");
        return;
      }
      if (ctrlOrCmd && (key === "v" || key === "V")) {
        e.preventDefault();
        report("Paste shortcut blocked (Ctrl/Cmd+V)");
        return;
      }
      if (ctrlOrCmd && (key === "x" || key === "X")) {
        e.preventDefault();
        report("Cut shortcut blocked (Ctrl/Cmd+X)");
        return;
      }
      if (ctrlOrCmd && (key === "p" || key === "P")) {
        e.preventDefault();
        report("Print shortcut blocked (Ctrl/Cmd+P)");
        return;
      }
      if (ctrlOrCmd && (key === "u" || key === "U")) {
        e.preventDefault();
        report("View-source shortcut blocked (Ctrl/Cmd+U)");
        return;
      }
      if (key === "F12") {
        e.preventDefault();
        report("DevTools shortcut blocked (F12)");
        return;
      }
      if (ctrlOrCmd && e.shiftKey && (key === "I" || key === "i" || key === "J" || key === "j")) {
        e.preventDefault();
        report("DevTools shortcut blocked");
        return;
      }
      if (key === "PrintScreen") {
        report("Print Screen key pressed");
      }
    }

    function handleContextMenu(e) {
      e.preventDefault();
    }
    function handleCopy(e) {
      e.preventDefault();
      report("Copy blocked");
    }
    function handlePaste(e) {
      e.preventDefault();
      report("Paste blocked");
    }
    function handleCut(e) {
      e.preventDefault();
      report("Cut blocked");
    }
    function handleSelectStart(e) {
      e.preventDefault();
    }
    function handleDragStart(e) {
      e.preventDefault();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);
    document.addEventListener("selectstart", handleSelectStart);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("selectstart", handleSelectStart);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, [active]);
}

/** Requests fullscreen on the given element (defaults to <html>), cross-browser. */
export async function requestFullscreen(el = document.documentElement) {
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (req) {
    try {
      await req.call(el);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export async function exitFullscreen() {
  const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
  if (exit && isFullscreenActive()) {
    try {
      await exit.call(document);
    } catch {
      // Ignore.
    }
  }
}

export function isFullscreenActive() {
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
}
