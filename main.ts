import { createSSRApp } from "vue";
import App from "./App.vue";
import * as Pinia from "pinia";
import pinia from "./src/stores";

export function createApp() {
  const app = createSSRApp(App);
  app.use(pinia);

  return {
    app,
    Pinia,
  };
}
