import { normalizeLocale, getTranslations } from "./src/lib/i18n-utils";
import { translations } from "./src/lib/translations";

const testCases = [undefined, null, "", "pt", "pt-BR", "en", "en-US", "es", "es-ES", "invalid"];

console.log("Testing i18n system...");

testCases.forEach(tc => {
  try {
    const locale = normalizeLocale(tc);
    const t = getTranslations(tc);
    const ok = t && t.home && t.nav && t.footer && t.navigation;
    console.log(`Input: [${tc}] -> Resolved: [${locale}] -> Valid Object: ${!!ok}`);
    if (!ok) {
       console.log("  MISSING KEYS:", Object.keys(t || {}));
    }
  } catch (e) {
    console.error(`Input: [${tc}] -> CRASHED:`, e.message);
  }
});
