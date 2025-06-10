<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import tabbar from "/pages/components/tabbar/tabbar.vue";
import { useUserInfoStore } from "/src/stores/modules/userInfo";
import { getRecommendList } from "../../src/services/api";
import { getSwiperData } from "../../src/services/api";
import { incrementClickCount } from "../../src/services/api";
import MagicNavigation from "../components/MagicNavigation/MagicNavigation.vue";

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
const swiperList = ref([]);
const allrecommendList = ref();
const recommendList = ref([]);
const userInfo = ref();
const userInfoStore = useUserInfoStore();
const isDot = computed(() => userInfoStore.isunread);
const value = ref(0);
// 控制返回顶部按钮的显示/隐藏
const showBackTop = ref(false);
const scrollTop = ref(0);

// 最热会议推荐轮播图
const recommendSwiperData = ref();

onShow(() => {
  const userInfoStore = useUserInfoStore();
  userInfo.value = userInfoStore.userInfo;
  if (userInfo.value) {
    // 获取用户推荐会议列表;
    getRecommendListData(0);
  } else {
    // #ifdef H5
    getRecommendListData(1);
    uni.showToast({
      title: "请先登录账号，以获取最佳推荐会议",
      icon: "none",
      duration: 3000,
    });
    // #endif
    // #ifdef APP-PLUS

    // plus.nativeUI.toast("请先登录账号，以获取最佳推荐会议", {
    //   vertical: "center",
    //   style:"inline"
    // });
    uni.showToast({
      title: "请先登录账号，以获取最佳推荐会议",
      icon: "none",
      duration: 3000,
    });
    // #endif
  }
  // 获取推荐会议轮播图列表
  getSwiperData_();
});

const getStatus = (val) => {
  switch (val) {
    case "Ongoing": {
      return "会议进行中";
    }
    case "Waiting": {
      return "会议待开始";
    }
    case "Ended": {
      return "会议已结束";
    }
    default: {
      return "未知状态";
    }
  }
};

const getStatusByTime = (val) => {
  switch (val) {
    case "Ongoing": {
      return "会议进行中";
    }
    case "Waiting": {
      return "会议待开始";
    }
    case "Ended": {
      return "会议已结束";
    }
    default: {
      return "未知状态";
    }
  }
};

const getSwiperData_ = async () => {
  const res = await getSwiperData();
  recommendSwiperData.value = res.data;
};
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
const getRecommendListData = async (t) => {
  let res;
  if (t) {
    res = await getRecommendList("99623");
  } else {
    res = await getRecommendList(userInfo.value.userId);
  }
  recommendList.value = res.data;
  console.log("recommendList", recommendList.value);
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
    success: () => {
      addMeetingHeat(meetingid);
    },
  });
};

const addMeetingHeat = async (meetingid: string) => {
  incrementClickCount(meetingid);
};

const goTomessage = () => {
  uni.navigateTo({
    url: "/pages/mine/message",
  });
};

const message = () => {
  userInfoStore.setIsUnread(false);
  console.log(userInfoStore.isunread);
  uni.navigateTo({
    url: "/pages/mine/message",
  });
};
</script>

<template>
  <kml-agent :isDock="true"> </kml-agent>
  <view
    class="page-container"
    :style="{ paddingTop: safeAreaInsets.top + 'px' }"
  >
    <!-- 固定头部 -->
    <view class="header">
      <!-- 搜索栏 -->
      <view class="search-bar">
        <image
          :src="userInfo?.avatarUrl || defaultAvatar"
          class="user-avatar"
          @tap="goToMine"
        ></image>
        <view class="search-input" @click="goToSearch">
          <uni-icons type="search" size="20" color="#666"></uni-icons>
          <input type="text" placeholder="搜索会议" />
        </view>
        <!-- <uni-icons type="videocam" size="24" color="#666"></uni-icons> -->
        <uni-badge
          v-if="isDot"
          :is-dot="true"
          absolute="rightTop"
          size="small"
          :text="value.toString()"
        >
          <uni-icons
            type="email"
            size="24"
            color="#39baf4"
            @click="message"
          ></uni-icons>
        </uni-badge>
        <uni-icons
          v-else
          type="email"
          size="24"
          color="#39baf4"
          @click="message"
        ></uni-icons>
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
    <view class="main-content">
      <scroll-view
        scroll-y
        class="content-scroll"
        @scroll="onScroll"
        scroll-with-animation
      >
        <!-- 轮播图 -->
        <swiper
          class="banner-swiper"
          circular
          :indicator-dots="true"
          :autoplay="true"
          interval="3000"
          duration="1000"
        >
          <swiper-item
            v-for="item in recommendSwiperData"
            :key="item.id"
            @tap="goTomeetingshow(item.meetingId)"
          >
            <view class="banner-item">
              <image :src="item.meetingImageUrl" mode="aspectFill"></image>
              <view class="banner-title">{{ item.meetingName }}</view>
            </view>
          </swiper-item>
        </swiper>
        <!-- 会议推荐网格 -->
        <view class="meeting-grid">
          <view
            class="meeting-item"
            v-for="item in recommendList"
            :key="item.meetingId"
          >
            <view
              class="meeting-cover"
              @click="goTomeetingshow(item.meetingId)"
            >
              <image
                :src="item.meetingImageUrl || defaultCover"
                mode="aspectFill"
              ></image>
              <!-- <view class="meeting-duration">{{ item.duration }}</view> -->
            </view>
            <view class="meeting-info">
              <view class="meeting-title">{{ item.meetingName }}</view>
              <view class="meeting-views">
                <view class="meeting-views-item1">
                  <uni-icons
                    type="fire-filled"
                    size="12"
                    color="red"
                  ></uni-icons>
                  <text>{{ item.meetingHeat }}</text>
                </view>

                <view class="meeting-views-item2" :class="item.meetingStatus"
                  ><text>{{ getStatus(item.meetingStatus) }}</text></view
                >
              </view>
            </view>
          </view>
        </view>
        <view class="loading-text">
          {{ finish ? "没有更多数据~" : "正在加载..." }}
        </view>
      </scroll-view>
    </view>

    <!-- 底部导航栏 -->
    <tabbar currentPath="/pages/recommend/recommend"></tabbar>
    <!-- <view style="height: 8vh; width:100vw; background: #222327">
      <MagicNavigation></MagicNavigation>
    </view> -->
  </view>
</template>

<style scoped>
.Waiting {
  background: rgba(43, 88, 249, 0.1);
  color: #2b58f9;
}

.Ongoing {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.Ended {
  background: rgba(153, 153, 153, 0.1);
  color: #999;
}
.page-container {
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
.main-content {
  flex: 1;
  height: 80vh;
  background-color: #f5f6f7;
  overflow: hidden; /* 确保没有其他样式影响滚动 */
}
.content-scroll {
  height: 100%;
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
  justify-content: space-between;
}

.meeting-views-item2 {
  border-radius: 3px;
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
