<template>
  <view
    id="drag_view"
    class="drag"
    :style="'left: ' + left + 'px; top:' + top + 'px;'"
    @touchstart="touchstart"
    @touchmove.stop.prevent="touchmove"
    @touchend="touchend"
    @click="openPopup"
    :class="{ transition: isDock && !isMoveing }">
    <image
      src="/src/static/images/agent.gif"
      style="width: 80px; height: 80px" />
    <uni-popup ref="popup" type="bottom">
      <view class="popup-container">
        <!-- 头部 -->
        <view class="header">
          <text class="title">AI小助手 Pro</text>
          <text class="sub-title">每小时{{ limitCount }}次</text>
        </view>

        <!-- 主要内容 -->
        <view class="content">
          <text class="greeting">梦见离 晚上好，\n邀请您体验“AI小助手”</text>

          <!-- 功能按钮 -->
          <view class="func-list">
            <view
              class="func-item"
              v-for="(item, index) in funcItems"
              :key="index">
              {{ item }}
            </view>
          </view>

          <!-- 搜索提示 -->
          <view class="search-tip">
            <uni-icons type="search" size="16" color="#666" />
            <text>提问通用问题</text>
          </view>
        </view>

        <!-- 底部说明 -->
        <view class="footer">
          <text class="tip-text"
            >所有内容由 AI 生成，仅供参考。每小时可体验
            {{ limitCount }} 次（剩余 {{ remainCount }} 次）</text
          >
          <button class="close-btn" @click="closePopup">结束</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: "kml-agent",
  props: {
    isDock: {
      //是否自动回到距离最近的边界（自动吸边）
      type: Boolean,
      default: true,
    },
    existTabBar: {
      //页面是否存在底部tabbar
      type: Boolean,
      default: false,
    },
    x: {
      //初始化坐标x
      type: Number,
      default: 0,
    },
    y: {
      //初始化坐标y
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      pageInX: 0,
      pageInY: 0,
      pageInLeft: 0,
      pageInTop: 0,
      windowWidth: 0,
      windowHeight: 0,
      isMoveing: true, //是否正在被拖动中
      edge: 20, //自动黏贴边界后的距离gap空隙
      limitCount: 10,
      remainCount: 10,
      funcItems: [
        "会上刚刚说了什么？",
        "总结会议内容",
        "AI搜索：深度了解知识点",
        "阅读文件：快速提取摘要",
      ],
    };
  },
  mounted() {
    const sys = uni.getSystemInfoSync();
    this.windowWidth = sys.windowWidth;
    this.windowHeight = sys.windowHeight;
    // #ifdef APP-PLUS
    this.existTabBar && (this.windowHeight -= 50);
    // #endif
    if (sys.windowTop) {
      this.windowHeight += sys.windowTop;
    }
    const query = uni.createSelectorQuery().in(this);
    query
      .select("#drag_view")
      .boundingClientRect((data) => {
        this.width = data.width;
        this.height = data.height;
        this.left = this.x
          ? this.edge + this.x
          : this.windowWidth - this.width - this.edge;
        this.top = this.y
          ? this.edge + this.y
          : this.windowHeight - this.height - this.edge;
      })
      .exec();
  },
  methods: {
    openPopup() {
      this.$refs.popup.open();
    },
    closePopup() {
      this.$refs.popup.close();
    },
    handleClick(e) {
      this.$refs.popup.open("bottom");
    },
    touchstart(e) {
      this.pageInX = e.touches[0].pageX;
      this.pageInY = e.touches[0].pageY;
      this.pageInLeft = this.left;
      this.pageInTop = this.top;
      // this.$emit("touchstart", e);
    },
    touchmove(e) {
      if (e.touches.length !== 1) {
        // 单指触摸
        return false;
      }
      this.isMoveing = true;
      this.left = this.pageInLeft + e.touches[0].pageX - this.pageInX;
      this.top = this.pageInTop + e.touches[0].pageY - this.pageInY;
      // #ifdef H5
      // clientY += this.height;
      // #endif
      // let edgeBottom = this.windowHeight - this.height - this.edge;

      // 上下触及边界
      // if (clientY < this.edge) {
      // 	this.top = this.edge;
      // } else if (clientY > edgeBottom) {
      // 	this.top = edgeBottom;
      // } else {
      // 	this.top = clientY
      // }
      // this.top = clientY

      // this.$emit("touchmove", e);
    },
    touchend(e) {
      if (this.isDock) {
        let edgeRigth = this.windowWidth - this.width - this.edge;
        let edgeBottom = this.windowHeight - this.height - this.edge;
        if (this.left < this.windowWidth / 2 - this.width / 2) {
          this.left = this.edge;
        } else {
          this.left = edgeRigth;
        }
        if (this.top < 0) {
          //拖动到nav顶部并且超出屏幕外
          this.top = this.edge;
        } else if (this.top + this.height + this.edge - this.windowHeight > 0) {
          //拖动到屏幕底部，并且超出屏幕外
          this.top = edgeBottom;
        }
      }
      this.isMoveing = false;
      // this.$emit("touchend", e);
    },
  },
};
</script>

<style lang="scss">
.drag {
  display: flex;
  justify-content: center;
  align-items: center;
  color: $uni-text-color-inverse;
  font-size: $uni-font-size-sm;
  position: fixed;
  z-index: 999999;
  &.transition {
    transition: left 0.3s ease, top 0.3s ease;
  }
}
.popup-container {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx;
  box-sizing: border-box;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #eee;
  .title {
    font-size: 36rpx;
    font-weight: 500;
    color: #333;
  }
  .sub-title {
    font-size: 24rpx;
    color: #666;
    margin-top: 8rpx;
    display: block;
  }
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx 0;
  .greeting {
    font-size: 28rpx;
    color: #333;
    line-height: 1.5;
    white-space: pre-wrap;
    margin-bottom: 32rpx;
  }
}

.func-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  .func-item {
    padding: 24rpx;
    background: #f5f5f5;
    border-radius: 16rpx;
    font-size: 28rpx;
    color: #333;
    line-height: 1.4;
  }
}

.search-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-top: 32rpx;
  color: #666;
  font-size: 24rpx;
}

.footer {
  position: relative;
  padding-top: 32rpx;
  .tip-text {
    font-size: 20rpx;
    color: #999;
    line-height: 1.5;
  }
  .close-btn {
    position: absolute;
    right: 0;
    bottom: -16rpx;
    font-size: 28rpx;
    color: #007aff;
    background: transparent;
    padding: 16rpx 32rpx;
  }
}
</style>
