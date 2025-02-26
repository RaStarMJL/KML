import { createSSRApp } from "vue";
import App from "@/App.vue";
import * as Pinia from "pinia";

export function createApp() {
  const app = createSSRApp(App);
  app.use(Pinia.createPinia());

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

  // 监听 WebSocket 消息
  uni.onSocketMessage((message) => {
    console.log("收到WebSocket消息：", message);
  });

  // 监听 WebSocket 关闭
  uni.onSocketClose(() => {
    console.log("WebSocket连接已关闭");
  });

  return {
    app,
    Pinia,
  };
}
