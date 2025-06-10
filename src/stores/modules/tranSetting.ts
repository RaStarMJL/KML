import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { srcLang } from "../../utils/translate";

// 定义 Store
export const useTranSettingStore = defineStore(
  "tranSetting",
  () => {
    const srcLangIndex = ref(0); // 声源语言索引
    const desLangIndex = ref(1); // 目标语言索引

    const displayBilingual = ref(false); // 是否显示双语

    const onlySrc = ref(true); // 只显示源语言

    const srcLangCode = computed(() => {
      // 计算属性 源语言code
      return srcLang[srcLangIndex.value].Code;
    });

    const desLangCode = computed(() => {
      // 计算属性 目标语言code
      return srcLang[desLangIndex.value].Code;
    });

    const setOnlySrc = (value) => {
      // 设置只显示源语言
      onlySrc.value = value;
    };

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
      setOnlySrc,
      srcLangCode,
      desLangCode,
      srcLangIndex,
      desLangIndex,
      displayBilingual,
      onlySrc,
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
