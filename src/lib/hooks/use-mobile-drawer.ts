"use client";

import { useCallback, useState } from "react";
import { useIsMobile } from "./use-mobile";

export function useMobileDrawer() {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isMobile,
    isOpen,
    open,
    close,
    toggle,
  };
}
