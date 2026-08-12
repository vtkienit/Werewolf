import { useTheme } from "../contexts/ThemeProvider";
import { Moon, Sun } from "lucide-react";
import { useLanguage } from "../contexts/LanguageProvider"

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const { translate } = useLanguage()
  const label = theme === "light" ? translate("Chuyển sang giao diện tối", "Switch to dark theme") : translate("Chuyển sang giao diện sáng", "Switch to light theme")

  return (
    <button
      className="ww-theme-toggle"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label={label}
      title={label}
    >
      {theme === "light" ? <Moon aria-hidden="true" size={20} /> : <Sun aria-hidden="true" size={20} />}
    </button>
  );
};

export default ThemeToggle;
