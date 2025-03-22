<template>
  <!-- 模板部分保持不变 -->
  <view class="container">
    <movable-area class="movable-area">
      <movable-view
        class="movable-view"
        :x="position.x"
        :y="position.y"
        direction="all"
        @change="onDrag"
        :animation="false">
        <view class="subtitle" :style="styleObj" @click="toggleControls">
          {{ subtitleText }}
        </view>
      </movable-view>
    </movable-area>

    <view v-if="showControls" class="controls">
      <button @click="changeFontSize(-2)">A-</button>
      <button @click="changeFontSize(2)">A+</button>
      <button @click="cycleColor">颜色</button>
      <button @click="toggleVisibility">
        {{ showSubtitle ? "隐藏" : "显示" }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from "vue";

// Props定义
const props = defineProps({
  text: {
    type: String,
    default: "等待中……",
  },
});

// 响应式状态
const position = reactive({ x: 0, y: 0 });
const showControls = ref(false);
const fontSize = ref(24);
const textColor = ref("#ffffff");
const showSubtitle = ref(true);
const colors = ["#ffffff", "#ff0000", "#00ff00", "#0000ff"];

// 计算属性
const subtitleText = computed(() => props.text);
const styleObj = computed(() => ({
  fontSize: fontSize.value + "px",
  color: textColor.value,
  opacity: showSubtitle.value ? 1 : 0,
}));

// 方法
const onDrag = (e) => {
  position.x = e.detail.x;
  position.y = e.detail.y;
};

const toggleControls = () => {
  showControls.value = !showControls.value;
};

const changeFontSize = (delta) => {
  fontSize.value = Math.max(12, fontSize.value + delta);
};

const cycleColor = () => {
  const currentIndex = colors.indexOf(textColor.value);
  textColor.value = colors[(currentIndex + 1) % colors.length];
};

const toggleVisibility = () => {
  showSubtitle.value = !showSubtitle.value;
};
</script>

<style scoped>
/* 样式部分保持不变 */
.container {
  position: relative;
  width: 100%;
  height: 90vh;
}

.movable-area {
  width: 100%;
  height: 100%;
}

.movable-view {
  width: auto;
  height: auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.subtitle {
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 20px;
  white-space: nowrap;
  transition: all 0.3s;
}

.controls {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 10px;
}

button {
  padding: 5px 10px;
  font-size: 14px;
}
</style>
