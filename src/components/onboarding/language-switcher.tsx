"use client";

import { SettingsIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import { LANGUAGE_ITEMS } from "@/components/locale-switcher";

export default function LocaleSwitcher() {
  const id = useId();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLocaleChange = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.replace(newPath);
  };

  if (!mounted) return null;

  return (
    <Menu>
      <MenuTrigger render={<Button size="icon" variant="ghost" />}>
        <SettingsIcon size={16} />
      </MenuTrigger>
      <MenuPopup align="end">
        {LANGUAGE_ITEMS.map((item) => (
          <MenuItem
            key={`${id}-${item.value}`}
            onClick={() => handleLocaleChange(item.value)}
          >
            {item.label}
          </MenuItem>
        ))}
      </MenuPopup>
    </Menu>
  );
}
