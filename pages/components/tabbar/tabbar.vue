<template>
  <view style="height: 8vh">
    <view class="content" :style="{ zIndex }">
      <view class="tabber_box">
        <view
          v-for="(item, index) in tabBars"
          :key="index"
          :style="{
            width: `${ratio}%`,
            display: 'flex',
            justifyContent: 'space-around',
            margin: '24rpx 0',
          }">
          <view class="tabber_item" @tap="onNav(item.pagePath)">
            <image
              v-if="currentPath === item.pagePath"
              :src="item.selectedIconPath"></image>
            <image v-else :src="item.iconPath"></image>
            <text
              :style="{
                color:
                  currentPath === item.pagePath
                    ? item.selectedColor
                    : item.color,
              }"
              >{{ item.name }}</text
            >
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import router from "../../../src/router";
export default {
  props: {
    currentPath: {
      // 当前页面路径
      type: String,
      default: "/pages/recommend/recommend",
    },
    zIndex: {
      // 界面层级
      type: Number,
      default: 10,
    },
  },
  data() {
    const color = "#000";
    const selectedColor = "#00f";
    return {
      tabBars: [
        {
          name: "会议",
          iconPath: "/src/static/icons/tab/meetting.png",
          selectedIconPath: "/src/static/icons/tab/meetting-selected.png",
          pagePath: "/src/roomkit/pages/home",
          color,
          selectedColor,
        },
        {
          name: "推荐",
          iconPath: "/src/static/icons/tab/recommend.png",
          selectedIconPath: "/src/static/icons/tab/recommend-selected.png",
          pagePath: "/pages/recommend/recommend",
          color,
          selectedColor,
        },
        {
          name: "我的",
          iconPath: "/src/static/icons/tab/mine.png",
          selectedIconPath: "/src/static/icons/tab/mine-selected.png",
          pagePath: "/pages/mine/mine",
          color,
          selectedColor,
        },
      ],
      ratio: 0,
      isLogin: false,
    };
  },
  mounted() {
    this.ratio = 100 / this.tabBars.length;
  },
  methods: {
    onNav(url) {
      if (url === this.currentPath) return;
      router.replace({ path: url });
    },
  },
};
</script>

<style lang="scss" scoped>
.content {
  height: 8vh;
  border-top: 1px solid #dcdcdc; // 更浅的分割线颜色
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #ffffff; // 明亮的背景色
  box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.1); // 添加阴影，增加层次感

  .tabber_box {
    display: flex;
    justify-content: space-around; // 平均分布TabBar项
    align-items: center;
    padding-bottom: calc(env(safe-area-inset-bottom) - 20rpx); // 调整底部间距

    .tabber_item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center; // 垂直居中
      height: 100%; // 使项的高度充满容器
      transition: color 0.3s ease; // 添加颜色过渡效果

      image {
        width: 56rpx;
        height: 56rpx;
        margin-bottom: 2rpx; // 调整图标和文字的间距
        transition: transform 0.3s ease; // 添加图标缩放过渡效果
      }

      text {
        font-size: 10px; // 调整字体大小
        color: #666666; // 默认文字颜色
        transition: color 0.3s ease; // 添加颜色过渡效果
      }

      // 选中状态的样式
      &.active {
        image {
          transform: scale(1.1); // 图标放大
        }

        text {
          color: #0066cc; // 选中文字颜色
        }
      }
    }
  }

  // 选中项的指示器
  .indicator {
    position: absolute;
    bottom: 10rpx; // 调整指示器位置
    height: 4rpx;
    background-color: #0066cc; // 指示器颜色
    border-radius: 2rpx; // 圆角
    transition: left 0.3s ease; // 添加位置过渡效果
  }
}
</style>
