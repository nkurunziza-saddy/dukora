"use client";

import { useEffect } from "react";

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  callback: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach(({ key, ctrlKey, metaKey, callback }) => {
        const isCtrlPressed = ctrlKey ? event.ctrlKey : true;
        const isMetaPressed = metaKey ? event.metaKey : true;
        const isModifierPressed =
          ctrlKey || metaKey ? event.ctrlKey || event.metaKey : true;

        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          isCtrlPressed &&
          isMetaPressed &&
          isModifierPressed
        ) {
          event.preventDefault();
          callback();
        }
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
