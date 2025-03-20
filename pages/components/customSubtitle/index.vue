<template>
  <view
    ref="subtitleRef"
    class="subtitle-display"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${size.width}px`,
      height: `${size.height}px`,
    }"
    @touchstart="handleTouchStart"
    @touchmove.stop.prevent="handleTouchMove"
    @touchend="handleTouchEnd"
    @mousedown="handleMouseDown">
    <view class="subtitle-content">
      {{ text }}
    </view>
    <!-- 修改调整大小的手柄样式 -->
    <view
      class="resize-handle"
      @touchstart.stop.prevent="handleResizeStart"
      @mousedown.stop.prevent="handleResizeMouseStart"></view>
  </view>
</template>

<script>
export default {
  name: "SubtitleDisplay",
  props: {
    text: {
      type: String,
      default: "这是默认字幕文本",
    },
    initialPosition: {
      type: Object,
      default: () => ({ x: 20, y: 100 }),
    },
    initialSize: {
      type: Object,
      default: () => ({ width: 300, height: 80 }),
    },
  },
  data() {
    return {
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
      console.log("001");
      if (e.touches && e.touches.length) {
        console.log("002");
        this.isDragging = true;
        const touch = e.touches[0];
        console.log("touch12345:", touch);
        console.log("pageX:", touch.pageX, "pageY:", touch.pageY);
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
      console.log("003");
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
      console.log(111);
      if (e.touches && e.touches.length) {
        console.log("004");
        const touch = e.touches[0];
        console.log(touch);
        this.handleMove(touch.pageX, touch.pageY);
      }
    },

    // 鼠标事件处理 - 移动
    handleMouseMove(e) {
      console.log(222);
      if (this.isDragging || this.isResizing) {
        console.log("005");
        this.handleMove(e.clientX, e.clientY);
      }
    },

    // 通用移动处理
    handleMove(clientX, clientY) {
      console.log(333);
      if (this.isDragging) {
        console.log("006");
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
        console.log(
          "newPositionX:",
          this.position.x,
          "newPositionY:",
          this.position.y
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
      console.log("007");
      this.isDragging = false;
      this.isResizing = false;
    },

    // 鼠标事件处理 - 结束
    handleMouseUp() {
      this.isDragging = false;
      this.isResizing = false;
    },
  },
  watch: {
    position(o, n) {
      console.log(o, n);
    },
  },
};
</script>

<style scoped>
.subtitle-display {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  overflow: hidden;
  display: flex;
  font-size: 16px;
  line-height: 1.4;
  text-align: center;
}

.subtitle-content {
  position: absolute;
  color: white;
  width: inherit;
  height: inherit;
  display: flex;
  /* align-items: center; */
  /* justify-content: center; */
  overflow: hidden;
}

/* 修改调整大小手柄的样式，解决多个手柄显示问题 */
.resize-handle {
  position: absolute;
  width: 20px;
  height: 20px;
  right: 0;
  bottom: 0;
  background-color: transparent;
  cursor: nwse-resize;
  z-index: 1001;
}

.resize-handle::after {
  content: "";
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
