<template>
  <view class="record-detail">
    <!-- 视频播放区域 -->
    <view class="video-container">
      <video
        :src="videoInfo.replayUrl"
        :poster="videoInfo.meetingImageUrl"
        class="video-player"
        :controls="true"
        :show-center-play-btn="true"
        :enable-progress-gesture="true"
        :show-fullscreen-btn="true"></video>
    </view>

    <!-- 视频信息区域 -->
    <view class="video-info">
      <view class="info-header">
        <text class="video-title">{{ videoInfo.meetingName }}</text>
        <view class="video-meta">
          <text class="replay-name">{{ videoInfo.replayName }}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn share" @click="handleShare">
          <uni-icons type="redo" size="20" color="#666"></uni-icons>
          <text>分享</text>
        </button>
        <button class="action-btn download" @click="handleDownload">
          <uni-icons type="download" size="20" color="#666"></uni-icons>
          <text>下载</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad, computed } from "@dcloudio/uni-app";
import { baseURL } from "/src/utils/http";
interface VideoInfo {
  id: number;
  meetingId: string;
  meetingName: string;
  replayName: string;
  replayUrl: string;
  meetingImageUrl: string;
}

const videoInfo = ref<VideoInfo>({
  id: 0,
  meetingId: "",
  meetingName: "",
  replayName: "",
  replayUrl: "",
  meetingImageUrl: "",
});

// 处理视频播放错误
const handleVideoError = (err: any) => {
  console.error("视频播放错误:", err);
};

const meetingId = ref("");
const id = ref(0);
// 分享视频
const handleShare = () => {
  uni.showActionSheet({
    itemList: ["分享给好友", "复制链接"],
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
          // 分享给好友
          uni.share({
            provider: "weixin",
            scene: "WXSceneSession",
            type: 0,
            title: videoInfo.value.meetingName,
            success: function () {
              console.log("分享成功");
            },
            fail: function () {
              console.log("分享失败");
            },
          });
          break;
        case 1:
          // 复制链接
          uni.setClipboardData({
            data: videoInfo.value.replayUrl,
            success: () => {
              uni.showToast({
                title: "链接已复制",
                icon: "success",
              });
            },
          });
          break;
      }
    },
  });
};

// 下载视频
const handleDownload = () => {
  uni.showLoading({
    title: "下载中...",
  });

  uni.downloadFile({
    url: videoInfo.value.replayUrl,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.saveFile({
          tempFilePath: res.tempFilePath,
          success: function () {
            uni.showToast({
              title: "下载成功",
              icon: "success",
            });
          },
          fail: function () {
            uni.showToast({
              title: "保存失败",
              icon: "none",
            });
          },
        });
      }
    },
    fail: () => {
      uni.showToast({
        title: "下载失败",
        icon: "none",
      });
    },
    complete: () => {
      uni.hideLoading();
    },
  });
};

const getVideoInfo = async (id: number) => {
  try {
    const response = await uni.request({
      url: `${baseURL}api/trtc/getreplay?id=${id}`,
      method: "GET",
    });
    console.log("response", response);
    const result = response.data;
    if (result.code === 1) {
      videoInfo.value = result.data;
      console.log("视频url", videoInfo.value.replayUrl);
    } else {
      throw new Error(result.msg || "获取视频详情失败");
    }
    console.log("获取视频详情result", result);
  } catch (error) {
    console.error("获取视频详情失败:", error);
  }
};

onLoad((options) => {
  console.log("options:", options);
  id.value = options.id;
  console.log("id:", id.value);
  getVideoInfo(id.value);
});
</script>
<style lang="scss">
.record-detail {
  min-height: 100vh;
  background: #f8f9fa;
}

.video-container {
  width: 100%;
  height: 422rpx;
  background: #000;
  position: relative;
}

.video-player {
  width: 100%;
  height: 100%;
}

.video-info {
  padding: 30rpx;
  background: #fff;
  margin-top: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.info-header {
  margin-bottom: 30rpx;
}

.video-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 16rpx;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.replay-name {
  font-size: 26rpx;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
  padding-top: 30rpx;
  border-top: 2rpx solid #f5f6f7;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: #f8f9fa;
  border: none;
  border-radius: 8rpx;

  text {
    font-size: 28rpx;
    color: #666;
  }

  &:active {
    opacity: 0.8;
  }

  &.share {
    background: #f0f2f5;
  }

  &.download {
    background: #e6f0ff;

    text {
      color: #2b58f9;
    }
  }
}
</style>
