<template>
  <div>这是mine</div>
  <button @click="ceshi">跳转</button>
</template>
<script setup lang="ts">
import { onMounted } from "vue";
onMounted(async () => {
  //在起始页面跳转到test.vue页面并传递参数
  uni.navigateTo({
    url: "../../src/roomkit/pages/home",
  });
});
const ceshi = async () => {
  uni.navigateTo({
    url: "../../src/roomkit/pages/home",
  });
};
</script>
<style scoped></style>
