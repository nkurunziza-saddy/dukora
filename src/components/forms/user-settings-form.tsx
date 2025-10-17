import LocaleSwitcher from "../locale-switcher";
import { ThemeSwitcher } from "../theme-switcher";

export function UserSettingsForm() {
  return (
    <div className="space-y-6 max-w-md">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Appearance</h3>
          <ThemeSwitcher />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Language</h3>
          <LocaleSwitcher />
        </div>
      </div>
    </div>
  );
}
