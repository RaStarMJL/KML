import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useRoomBackStore = defineStore(
  "roomBack",
  () => {
    const roomBack = ref<Boolean>(false);

    const setRoomBack = (val: Boolean) => {
      roomBack.value = val;
    };

    return { roomBack, setRoomBack };
  },
  {
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
