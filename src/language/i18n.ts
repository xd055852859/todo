import { createI18n } from "vue-i18n"; //引入vue-i18n组件
import messages from "./index";
// const language =
// (
//     //@ts-ignore
//   (navigator.language ? navigator.language : navigator.userLanguage) || "en"
// ).toLowerCase();
const i18n = createI18n({
  fallbackLocale: "en",
  globalInjection: true,
  legacy: false, // you must specify 'legacy: false' option
  locale: "en", //language.split("-")[0] ||
  messages,
});

export default i18n;
