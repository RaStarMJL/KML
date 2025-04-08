<template>
  <view class="record-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <text class="header-title">会议回放</text>
    </view>

    <!-- 视频列表 -->
    <scroll-view scroll-y class="video-list" @scrolltolower="loadMore">
      <view
        v-for="(video, index) in videoList"
        :key="index"
        class="video-item"
        @click="navigateToDetail(video.meetingId)">
        <!-- 视频封面 -->
        <view class="video-cover">
          <image
            :src="video.meetingImageUrl || '/static/images/default-cover.jpg'"
            mode="aspectFill"
            class="cover-image"></image>
          <view class="video-duration">
            <uni-icons
              type="videocam-filled"
              size="14"
              color="#fff"></uni-icons>
            <text>回放</text>
          </view>
        </view>

        <!-- 视频信息 -->
        <view class="video-info">
          <text class="video-title">{{ video.meetingName }}</text>
          <view class="video-meta">
            <text class="replay-name">{{ video.replayName }}</text>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="isLoading" class="loading-state">
        <text>加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!isLoading && videoList.length === 0" class="empty-state">
        <image
          src="/static/images/empty.png"
          mode="aspectFit"
          class="empty-image"></image>
        <text>暂无回放视频</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUserInfoStore } from "@/src/stores/modules/userInfo";
import { baseURL } from "/src/utils/http";

interface VideoItem {
  meetingId: string;
  meetingName: string;
  replayName: string;
  replayUrl: string;
  meetingImageUrl: string;
}

const videoList = ref<VideoItem[]>([]);
const isLoading = ref(false);

// 获取视频列表
const getVideoList = async () => {
  try {
    isLoading.value = true;
    const response = await uni.request({
      url: baseURL + "api/trtc/getreplaylist",
      method: "GET",
    });

    const result = response.data;
    if (result.code === 1) {
      videoList.value = result.data;
    } else {
      throw new Error(result.msg || "获取视频列表失败");
    }
  } catch (error) {
    console.error("获取视频列表失败:", error);
    uni.showToast({
      title: "获取视频列表失败",
      icon: "none",
    });
  } finally {
    isLoading.value = false;
  }
};

const navigateToDetail = (meetingId: string) => {
  console.log(meetingId);
  uni.navigateTo({
    url: `/pages/mine/recorddetail/recorddetail?meetingId=${meetingId}`,
  });
};

// 加载更多
const loadMore = () => {
  // 实现加载更多逻辑
  console.log("加载更多");
};

// 页面加载时获取视频列表
onMounted(() => {
  getVideoList();
});
</script>

<style lang="scss">
.record-container {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
  padding-right: 30rpx;
}
.header {
  background: #fff;
  padding: 24rpx 20rpx;
  border-bottom: 1rpx solid #eee;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.header-title {
  font-size: 32rpx;
  color: #2b58f9;
  font-weight: bold;
  text-align: center;
}

.video-list {
  flex: 1;
  padding: 20rpx;
}

.video-item {
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  border: 2rpx solid rgba(43, 88, 249, 0.1);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  }
}

.video-cover {
  position: relative;
  width: 100%;
  height: 320rpx;
  border-bottom: 2rpx solid rgba(43, 88, 249, 0.08);

  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: linear-gradient(to bottom, #f0f2f5, #e6e9ed);
  }

  .video-duration {
    position: absolute;
    right: 16rpx;
    bottom: 16rpx;
    background: rgba(0, 0, 0, 0.85);
    padding: 6rpx 16rpx;
    border-radius: 6rpx;
    display: flex;
    align-items: center;
    gap: 6rpx;
    backdrop-filter: blur(4px);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
    border: 1rpx solid rgba(255, 255, 255, 0.1);

    text {
      color: #fff;
      font-size: 22rpx;
      text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
    }
  }
}

.video-info {
  padding: 20rpx;
  background: linear-gradient(to bottom, #fff, #fafbfc);
  border-top: 2rpx solid rgba(43, 88, 249, 0.05);
}

.video-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  line-height: 1.4;
  margin-bottom: 12rpx;
  text-shadow: 0 1rpx 0 rgba(255, 255, 255, 0.8);

  // 最多显示两行
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.replay-name {
  font-size: 24rpx;
  color: #2b58f9;
  opacity: 0.85;
  font-weight: 500;
}

.loading-state {
  text-align: center;
  padding: 24rpx;
  color: #999;
  font-size: 26rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;

  .empty-image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 24rpx;
    opacity: 0.7;
  }

  text {
    font-size: 26rpx;
    color: #999;
  }
}
</style>
