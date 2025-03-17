<script setup>
const props = defineProps({
  text: {
    type: String,
    default: "",
  },
});

const posX = ref(0);
const posY = ref(0);

// 新增实时更新方法（如果父组件需要控制位置）
const updatePosition = (x, y) => {
  posX.value = x;
  posY.value = y;
};

// 暴露方法给父组件
defineExpose({ updatePosition });
</script>

<template>
  <movable-area class="area" :style="{ height: '100%', width: '100%' }">
    <movable-view
      class="subtitle-container"
      direction="all"
      :x="posX"
      :y="posY"
      @change="
        (e) => {
          posX = e.detail.x;
          posY = e.detail.y;
        }
      ">
      <!-- 修改为动态内容容器 -->
      <text class="subtitle-content">{{ text }}</text>
    </movable-view>
  </movable-area>
</template>

<style>
/* 修改容器样式适配nvue */
.area {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
}

.subtitle-container {
  z-index: 9999;
  width: 600rpx;
  height: 80rpx;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.subtitle-content {
  padding: 12rpx 24rpx;
  background-color: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  border-radius: 40rpx;
  font-size: 28rpx;
  lines: 1;
}
</style>
