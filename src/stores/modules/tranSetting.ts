import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { srcLang } from "../../utils/translate";

// 定义 Store
export const useTranSettingStore = defineStore(
  "tranSetting",
  () => {
    const srcLangIndex = ref(0);
    const desLangIndex = ref(1);

    const displayBilingual = ref(false);

    const srcLangCode = computed(() => {
      return srcLang[srcLangIndex.value].Code;
    });

    const desLangCode = computed(() => {
      return srcLang[desLangIndex.value].Code;
    });

    const setSrcLangIndex = (value) => {
      srcLangIndex.value = value;
    };

    const setDesLangIndex = (value) => {
      desLangIndex.value = value;
    };

    const setTransSetting = (obj) => {
      srcLangIndex.value = obj.srcLangIndex;
      desLangIndex.value = obj.desLangIndex;
      displayBilingual.value = obj.displayBilingual;
    };

    const getTransSetting = () => {
      return {
        srcLangIndex,
        desLangIndex,
        displayBilingual,
      };
    };

    // 记得 return
    return {
      getTransSetting,
      setTransSetting,
      setSrcLangIndex,
      setDesLangIndex,
      srcLangCode,
      desLangCode,
      srcLangIndex,
      desLangIndex,
      displayBilingual,
    };
  },
  {
    // 多端API适配
    persist: {
      storage: {
        getItem(key) {
          return uni.getStorageSync(key);
        },
        setItem(key, value) {
          uni.setStorageSync(key, value);
        },
      },
    },
  }
);
