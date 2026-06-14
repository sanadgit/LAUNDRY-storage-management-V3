/**
 * Language Toggle Button - زر تبديل اللغة
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <motion.button
      onClick={toggleLanguage}
      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
      style={{
        background: "oklch(0.3 0.1 255)",
        color: "oklch(0.85 0.01 255)",
        border: "1px solid oklch(0.4 0.1 255)",
        fontFamily: "Cairo, sans-serif",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.35 0.12 255)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.3 0.1 255)";
      }}
      whileTap={{ scale: 0.95 }}
      title={language === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      <Globe size={14} />
      <span className="font-bold text-sm">{language.toUpperCase()}</span>
    </motion.button>
  );
}
