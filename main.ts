import { createSSRApp } from "vue";
import App from "./App.vue";
import * as Pinia from "pinia";
import pinia from "./src/stores";
import { useUserInfoStore } from "./src/stores";
export function createApp() {
  const app = createSSRApp(App);
  app.use(pinia);
  // 初始化 WebSocket 连接
  uni.connectSocket({
    url: "ws://192.168.31.115:5000/socket",
    success() {
      console.log("WebSocket连接已建立");
    },
    fail(err) {
      console.error("WebSocket连接失败:", err);
    },
  });

  // 监听 WebSocket 连接成功
  uni.onSocketOpen((res) => {
    console.log("WebSocket连接已打开！", res);
  });

  // 监听 WebSocket 关闭
  uni.onSocketClose(() => {
    console.log("WebSocket连接已关闭");
  });
  uni.onSocketMessage((res) => {
    console.log(res);
    if (typeof res.data === "string") {
      const data = JSON.parse(res.data);
      const userInfoStore = useUserInfoStore();
      if (
        data.receiverUids &&
        data.receiverUids.includes(userInfoStore.userInfo?.userId)
      ) {
        userInfoStore.setIsUnread(true);
        console.log(userInfoStore.isunread);
        uni.showToast({
          title: "收到一条新消息",
          duration: 2000,
        });
      }
    }
  });
  return {
    app,
    Pinia,
  };
}
