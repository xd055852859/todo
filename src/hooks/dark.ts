import { color } from "./color";
import { useCssVar } from "@vueuse/core";
// 切换暗黑模式
const setDark = (value: boolean) => {
  let { darkList, lightList } = color();
  // store.commit("setConfig", { themeType: value });
  if (value) {
    localStorage.setItem("DARK", value + "");
  } else {
    localStorage.removeItem("DARK");
  }
  const el = ref(null);
  if (value) {
    darkList.value.forEach((item, index) => {
      const color_item = useCssVar(item.name, el);
      color_item.value = item.value;
    });
  } else {
    lightList.value.forEach((item, index) => {
      const color_item = useCssVar(item.name, el);
      color_item.value = item.value;
    });
  }
};

export default setDark;
