import LocaleSwitcher from "../locale-switcher";
import { ThemeSwitcher } from "../theme-switcher";

export function UserSettingsForm() {
  return (
    <div className="flex flex-col max-w-4x">
      <LocaleSwitcher />
      <ThemeSwitcher />
    </div>
  );
}
