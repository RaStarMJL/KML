<template>
  <view class="subtitle" :style="subtitleStyle">
    <view
      ref="subtitleRef"
      class="subtitle-display"
      :style="{
        width: `${size.width}px`,
        height: `${size.height}px`,
      }"
      v-for="(item, index) in totalSubtitleInfo"
      :key="index"
      @touchstart="handleTouchStart"
      @touchmove.stop.prevent="handleTouchMove"
      @touchend="handleTouchEnd"
      @mousedown="handleMouseDown">
      <!-- 头像容器 -->
      <view class="avatar-box">
        <image class="avatar" :src="item.avatarUrl" resize-mode="contain" />
      </view>
      <!-- 字幕内容容器 -->
      <text class="subtitle-content">
        {{ item.zimu }}
      </text>
      <!-- 修改调整大小的手柄样式 -->
      <view
        class="resize-handle"
        @touchstart.stop.prevent="handleResizeStart"
        @mousedown.stop.prevent="handleResizeMouseStart"></view>
    </view>
  </view>
</template>

<script>
export default {
  name: "SubtitleDisplay",
  props: {
    totalSubtitleInfo: {
      type: Object,
      default: () => ({}),
    },
    text: {
      type: String,
      default: "",
    },
    initialPosition: {
      type: Object,
      default: () => ({ x: 50, y: 750 }),
    },
    initialSize: {
      type: Object,
      default: () => ({ width: 400, height: 50 }),
    },
    avatarUrl: {
      type: String,
      default: "/src/static/images/defaultAvatar.png",
    },
  },
  data() {
    return {
      // 字幕样式
      subtitleStyle: {},
      // 是否可拖动
      isDraggable: false,
      // 是否可调整大小
      isResizable: false,
      // 位置和大小状态
      position: { ...this.initialPosition },
      size: { ...this.initialSize },

      // 拖动状态
      isDragging: false,
      dragStart: { x: 0, y: 0 },

      // 调整大小状态
      isResizing: false,
      resizeStart: { x: 0, y: 0, width: 0, height: 0 },

      // 大小限制 - 为移动设备调整
      MIN_WIDTH: 150,
      MAX_WIDTH: 350,
      MIN_HEIGHT: 40,
      MAX_HEIGHT: 200,

      // 屏幕尺寸
      screenWidth: 375,
      screenHeight: 667,
    };
  },
  mounted() {
    // 获取屏幕信息
    try {
      // #ifdef APP-PLUS || MP
      const sysInfo = uni.getSystemInfoSync();
      this.screenWidth = sysInfo.windowWidth;
      this.screenHeight = sysInfo.windowHeight;
      this.size.width = this.screenWidth * 0.9;
      this.subtitleStyle = {
        // 字幕距离屏幕左边距离：（屏幕宽度 - 字幕宽度）/ 2
        left: (this.screenWidth - this.size.width) / 2 + "px",
        // 字幕距离屏幕底部距离：（底部导航栏高度 + 字幕高度） + 10
        bottom: this.size.height + 40 + 10 + "px",
      };
      // #endif

      // #ifdef H5
      this.screenWidth = window.innerWidth;
      this.screenHeight = window.innerHeight;
      window.addEventListener("mousemove", this.handleMouseMove);
      window.addEventListener("mouseup", this.handleMouseUp);
      // #endif
    } catch (e) {
      console.error("获取屏幕信息失败", e);
    }
  },
  beforeDestroy() {
    // #ifdef H5
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);
    // #endif
  },
  methods: {
    // 触摸事件处理 - 开始拖动
    handleTouchStart(e) {
      if (!this.isDraggable) return;
      if (e.touches && e.touches.length) {
        this.isDragging = true;
        const touch = e.touches[0];
        this.dragStart = {
          x: touch.pageX - this.position.x,
          y: touch.pageY - this.position.y,
        };
      }
      console.log(
        "dragStart.x:",
        this.dragStart.x,
        "dragStart.y:",
        this.dragStart.y
      );
    },

    // 鼠标事件处理 - 开始拖动
    handleMouseDown(e) {
      if (!this.isDraggable) return;
      this.isDragging = true;
      this.dragStart = {
        x: e.clientX - this.position.x,
        y: e.clientY - this.position.y,
      };
      console.log(
        "dragStart.x:",
        this.dragStart.x,
        "dragStart.y:",
        this.dragStart.y
      );
    },

    // 触摸事件处理 - 开始调整大小
    handleResizeStart(e) {
      if (!this.isResizable) return;
      if (e.touches && e.touches.length) {
        e.stopPropagation();
        this.isResizing = true;
        const touch = e.touches[0];
        this.resizeStart = {
          x: touch.pageX,
          y: touch.pageY,
          width: this.size.width,
          height: this.size.height,
        };
      }
    },

    // 鼠标事件处理 - 开始调整大小
    handleResizeMouseStart(e) {
      if (!this.isResizable) return;
      e.stopPropagation();
      this.isResizing = true;
      this.resizeStart = {
        x: e.clientX,
        y: e.clientY,
        width: this.size.width,
        height: this.size.height,
      };
    },

    // 触摸事件处理 - 移动
    handleTouchMove(e) {
      if (!this.isDraggable) return;
      if (e.touches && e.touches.length) {
        const touch = e.touches[0];
        this.handleMove(touch.pageX, touch.pageY);
      }
    },

    // 鼠标事件处理 - 移动
    handleMouseMove(e) {
      if (!this.isDraggable) return;
      if (this.isDragging || this.isResizing) {
        this.handleMove(e.clientX, e.clientY);
      }
    },

    // 通用移动处理
    handleMove(clientX, clientY) {
      if (!this.isDraggable) return;
      if (this.isDragging) {
        // 计算新位置
        const newX = clientX - this.dragStart.x;
        const newY = clientY - this.dragStart.y;
        console.log("newX:", newX, "newY:", newY);
        // 确保不会拖出视口
        this.position.x = Math.max(
          0,
          Math.min(newX, this.screenWidth - this.size.width)
        );
        this.position.y = Math.max(
          0,
          Math.min(newY, this.screenHeight - this.size.height)
        );
      } else if (this.isResizing) {
        // 计算新尺寸
        const deltaX = clientX - this.resizeStart.x;
        const deltaY = clientY - this.resizeStart.y;

        this.size.width = Math.max(
          this.MIN_WIDTH,
          Math.min(this.MAX_WIDTH, this.resizeStart.width + deltaX)
        );
        this.size.height = Math.max(
          this.MIN_HEIGHT,
          Math.min(this.MAX_HEIGHT, this.resizeStart.height + deltaY)
        );
      }
    },

    // 触摸事件处理 - 结束
    handleTouchEnd() {
      if (!this.isDraggable) return;
      this.isDragging = false;
      this.isResizing = false;
    },

    // 鼠标事件处理 - 结束
    handleMouseUp() {
      if (!this.isDraggable) return;
      this.isDragging = false;
      this.isResizing = false;
    },
  },
};
</script>

<style scoped>
@keyframes movedown {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(50px);
  }
}
.subtitle {
  /* animation: moveDown 6s ease-in-out forwards; */
  display: flex;
  position: absolute;
  background-color: rgba(0, 0, 0, 0.7);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  flex-direction: column;
  border-radius: 8px;
}
.subtitle-display {
  position: relative;
  padding: 10px;
  flex-direction: row;
}

/* 头像盒子 */
.avatar-box {
  flex-direction: column;
  width: 30px;
  height: 30px;
  margin-right: 5px; /* 与内容间隔 */
  border-radius: 15px;
  overflow: hidden; /* 确保圆形裁剪生效 */
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 15px;
  overflow: hidden; /* 确保圆形裁剪生效 */
}

.subtitle-content {
  flex-direction: column;
  color: white;
  font-size: 12px;
  text-align: center;
  /* nvue 专用文本限制属性 */
  lines: 2;
  text-overflow: ellipsis;
  /* 自动换行配置 */
  word-wrap: break-word;
  /* 关键：使文本容器自动撑开 */
  flex: 1;
}

.resize-handle {
  width: 20px;
  height: 20px;
  position: absolute;
  right: 0;
  bottom: 0;
  /* nvue 需要显式声明无背景 */
  background-color: transparent;
}

.resize-handle::after {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 20px 20px;
  border-color: transparent transparent rgba(255, 255, 255, 0.5) transparent;
}
</style>
