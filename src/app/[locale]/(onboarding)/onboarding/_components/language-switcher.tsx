"use client";

import { Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";

const languageItems = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "sw", label: "Kiswahili" },
  { value: "rw", label: "Kinyarwanda" },
];

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
        <Settings size={16} />
      </MenuTrigger>
      <MenuPopup align="end">
        {languageItems.map((item) => (
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
