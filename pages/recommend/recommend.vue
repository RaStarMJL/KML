<script setup lang="ts">
import { onMounted, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { recommendListdata, swiperListdata } from "./assets/data";
import tabbar from "/pages/components/tabbar/tabbar.vue";
import { useUserInfoStore } from "/src/stores/modules/userInfo";
import { getRecommendList } from "../../src/services/api";
import subtitle from "/pages/components/SubtitleDraggable/index.vue";
// 定义轮播图数据接口
interface SwiperItem {
  meetingId: string;
  image: string;
  title: string;
}

// 定义推荐列表数据接口
interface RecommendItem {
  meetingId: string;
  title: string;
  views: string;
  duration: string;
  cover: string;
}

// 定义分页参数接口
interface PageParams {
  page: number;
  pageSize: number;
}

// 定义API返回数据接口
interface ApiResponse {
  result: {
    items: RecommendItem[];
    pages: number;
  };
}

const defaultAvatar = "/src/static/images/defaultAvatar.png";
const defaultCover = "/src/static/images/cover.jpg";
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync();

// 使用定义的接口类型
const swiperList = ref(swiperListdata);
const allrecommendList = ref();
const recommendList = ref();
const userInfo = ref();

// 控制返回顶部按钮的显示/隐藏
const showBackTop = ref(false);
const scrollTop = ref(0);

onShow(() => {
  console.log(111);
  const userInfoStore = useUserInfoStore();
  userInfo.value = userInfoStore.userInfo;
  getRecommendListData();
});
// scroll-view 的滚动事件处理
const onScroll = (e: any) => {
  // event.detail.scrollTop 是滚动距离
  /*   if (e.detail.scrollTop > 800) {
    showBackTop.value = true;
  } else {
    showBackTop.value = false;
  } */
};
// 返回顶部方法
const backToTop = () => {
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  });
};

// 已结束标记
const finish = ref(true);
const getRecommendListData = async () => {
  const res = await getRecommendList(userInfo.value.userId);
  console.log(res);
  recommendList.value = res.data;
};
const onRefresh = () => {};

const goToSearch = () => {
  uni.navigateTo({
    url: "/pages/search/search",
  });
};

const goToMine = () => {
  console.log("跳转到-‘我的’");

  uni.reLaunch({
    url: "/pages/mine/mine",
  });
};

const goTomeetingshow = (meetingid: string) => {
  console.log("跳转到-'会议信息'");
  uni.navigateTo({
    url: "/pages/recommend/meetingshow?meetingId=" + meetingid,
  });
};

const goTomessage = () => {
  uni.navigateTo({
    url: "/pages/mine/message",
  });
};
</script>

<template>
  <view
    class="page-container"
    :style="{ paddingTop: safeAreaInsets.top + 'px' }">
    <!-- 固定头部 -->
    <view class="header">
      <!-- 搜索栏 -->
      <view class="search-bar">
        <image
          :src="userInfo?.avatarUrl || defaultAvatar"
          class="user-avatar"
          @tap="goToMine"></image>
        <view class="search-input" @click="goToSearch">
          <uni-icons type="search" size="20" color="#666"></uni-icons>
          <input type="text" placeholder="搜索会议" />
        </view>
        <!-- <uni-icons type="videocam" size="24" color="#666"></uni-icons> -->
        <uni-icons
          type="email"
          size="24"
          color="#666"
          @click="goTomessage"></uni-icons>
      </view>

      <!-- 导航栏 -->
      <view class="nav-bar">
        <!-- <view class="nav-item active">推荐</view>
        <view class="nav-item">热门</view>
        <view class="nav-item">直播</view>
        <view class="nav-item">会议</view>
        <view class="nav-item">盛典</view> -->
      </view>
    </view>

    <!-- 滚动内容区域 -->
    <scroll-view
      style="margin-bottom: 1vh"
      scroll-y
      class="content-scroll"
      @scroll="onScroll"
      scroll-with-animation>
      <!-- 轮播图 -->
      <swiper
        class="banner-swiper"
        circular
        :indicator-dots="true"
        :autoplay="true"
        interval="3000"
        duration="1000">
        <swiper-item v-for="item in swiperList" :key="item.meetingId">
          <view class="banner-item">
            <image :src="item.image" mode="aspectFill"></image>
            <view class="banner-title">{{ item.title }}</view>
          </view>
        </swiper-item>
      </swiper>

      <!-- 会议推荐网格 -->
      <view class="meeting-grid">
        <view
          class="meeting-item"
          v-for="item in recommendList"
          :key="item.meetingId">
          <view class="meeting-cover" @click="goTomeetingshow(item.meetingId)">
            <image
              :src="item.meetingImageUrl || defaultCover"
              mode="aspectFill"></image>
            <!-- <view class="meeting-duration">{{ item.duration }}</view> -->
          </view>
          <view class="meeting-info">
            <view class="meeting-title">{{ item.meetingName }}</view>
            <view class="meeting-views">
              <uni-icons type="fire-filled" size="12" color="#100"></uni-icons>
              <text>{{ item.meetingHeat }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="loading-text">
        {{ finish ? "没有更多数据~" : "正在加载..." }}
      </view>
    </scroll-view>

    <!-- 底部导航栏 -->
    <tabbar currentPath="/pages/recommend/recommend"></tabbar>
  </view>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 92vh;
  overflow: hidden;
}
.header {
  background-color: #fff;
  z-index: 100;
}
.search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
}
.user-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}
.search-input {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f5f6f7;
  border-radius: 32rpx;
  padding: 12rpx 24rpx;
  margin-right: 20rpx;
}
.search-input input {
  flex: 1;
  margin-left: 16rpx;
  font-size: 28rpx;
}
.nav-bar {
  display: flex;
  justify-content: space-around;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
}
.nav-item {
  font-size: 28rpx;
  color: #666;
  padding: 0 20rpx;
}
.nav-item.active {
  color: #0052d9;
  font-weight: bold;
  position: relative;
}
.nav-item.active::after {
  content: "";
  position: absolute;
  bottom: -10rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background-color: #0052d9;
  border-radius: 2rpx;
}
.content-scroll {
  flex: 1;
  background-color: #f5f6f7;
  overflow: hidden; /* 确保没有其他样式影响滚动 */
}
.banner-swiper {
  height: 300rpx;
  margin: 20rpx;
}
.banner-item {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
  overflow: hidden;
}
.banner-item image {
  width: 100%;
  height: 100%;
}
.banner-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: #fff;
  font-size: 28rpx;
}
.meeting-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 20rpx;
}
.meeting-item {
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}
.meeting-cover {
  position: relative;
  width: 100%;
  height: 200rpx;
}
.meeting-cover image {
  width: 100%;
  height: 100%;
}
.meeting-duration {
  position: absolute;
  bottom: 10rpx;
  right: 10rpx;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 24rpx;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
}
.meeting-info {
  padding: 16rpx;
}
.meeting-title {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 8rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.meeting-views {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
}
.meeting-views text {
  margin-left: 6rpx;
}
/* 返回顶部按钮样式 */
.back-to-top {
  position: fixed;
  right: 30rpx;
  bottom: 120rpx;
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #0052d9;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 99;
}
/* // 加载提示文字 */
.loading-text {
  text-align: center;
  font-size: 28rpx;
  color: #666;
  padding: 20rpx 0;
}
</style>
