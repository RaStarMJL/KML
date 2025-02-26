<script setup lang="ts">
import router from "../../src/router";
import { onMounted } from "vue";
import MeettingRoom from "/src/roomkit/pages/home.vue";
import tabbar from "../components/tabbar/tabbar.vue";
// onMounted(() => {
//   router.replace({ path: "/src/roomkit/pages/home" });
//   uni.showToast({
//     icon: "loading",
//   });
// });
</script>
<template>
  <MeettingRoom></MeettingRoom>
  <tabbar></tabbar>
</template>
<style scoped></style>
