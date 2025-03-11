import { defineStore } from "pinia";
import { computed, ref } from "vue";

// 定义用户信息接口
interface UserInfoState {
  userName: string;
  userId: string;
  avatarUrl: string;
  signature: string;
}

// 定义 Store
export const useUserInfoStore = defineStore(
  "userInfo",
  () => {
    // 用户信息
    const userInfo = ref<UserInfoState | null>(null);

    // 保存用户信息，登录时使用
    const setProfile = (val: UserInfoState) => {
      userInfo.value = val;
    };

    // 清理用户信息，退出时使用
    const clearProfile = () => {
      userInfo.value = null;
    };

    // 添加计算属性判断是否已登录
    const isLoggedIn = computed(() => {
      return !!userInfo.value?.userId;
    });

    // 记得 return
    return {
      userInfo,
      setProfile,
      clearProfile,
      isLoggedIn, // 导出计算属性
    };
  },
  // TODO: 持久化
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
