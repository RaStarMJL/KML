<template>
  <view>
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
      if (this.currentPath === url) return;
      if (url === "/src/roomkit/pages/home") {
        router.replace({ path: url });
      }
      if (url === "/pages/recommend/recommend") {
        router.replace({ path: url });
      }
      if (url === "/pages/mine/mine") {
        router.replace({ path: url });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./index.scss";
</style>
