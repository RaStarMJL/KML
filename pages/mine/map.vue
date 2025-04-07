<template>
  <view class="map-container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">
        <image src="/static/icons/back.png" mode="aspectFit"></image>
      </view>
      <text class="nav-title">地图导航</text>
    </view>
    <!-- 地图导航部分 -->
    <map
      id="map"
      style="width: 100%; height: 60vh"
      :latitude="center.latitude"
      :longitude="center.longitude"
      :markers="markers"
      :polyline="polyline"
      :include-points="includePoints"
      show-location></map>

    <!-- 智能体出行建议部分 -->
    <view class="ai-card">
      <view class="card-header">
        <image
          class="card-avatar"
          src="/static/images/ai/navigation-ai.png"
          mode="aspectFill"></image>
        <view class="header-content">
          <text class="card-title">导航智能体</text>
          <text class="card-date">{{ currentDate }}</text>
        </view>
      </view>

      <view class="card-desc">
        <text>{{ travelAdvice }}</text>
      </view>

      <view class="card-footer">
        <view class="left-tags">
          <text class="tag blue">智能导航</text>
          <text class="tag gray">实时建议</text>
        </view>
        <button class="nav-btn" @click="startNavigation">一键导航</button>
      </view>
    </view>
  </view>
</template>

<script>
import Map from "@/js_sdk/fx-openMap/openMap.js";
import { getPathPlanning } from "/src/services/api.ts";
export default {
  data() {
    return {
      currentDate: new Date().toLocaleString(),
      travelAdvice: "正在获取最佳出行建议...",
      options: {
        origin: {
          latitude: 39.92848272,
          longitude: 116.39560823,
          name: "南华大学雨母校区",
        },
        destination: {
          latitude: 39.98848272,
          longitude: 116.47560823,
          name: "火车站",
        },
        mode: "drive",
        mapId: "map",
      },
      center: {
        latitude: 39.95848272,
        longitude: 116.43560823,
      },
      scale: 12,
      markers: [
        {
          id: 1,
          latitude: 39.92848272,
          longitude: 116.39560823,
          title: "南华大学雨母校区",
          iconPath: "/static/images/map/start.png",
        },
        {
          id: 2,
          latitude: 39.98848272,
          longitude: 116.47560823,
          title: "火车站",
          iconPath: "/static/images/map/end.png",
        },
      ],
      polyline: [
        {
          points: [
            { latitude: 39.92848272, longitude: 116.39560823 },
            { latitude: 39.98848272, longitude: 116.47560823 },
          ],
          color: "#1890ff",
          width: 8,
          dottedLine: false,
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
      includePoints: [
        { latitude: 39.92848272, longitude: 116.39560823 },
        { latitude: 39.98848272, longitude: 116.47560823 },
      ],
    };
  },
  mounted() {
    // Map.routePlan(this.options, "gcj02");
    try {
      this.getTravelAdvice();
    } catch (error) {
      console.error("获取智能体建议失败：", error);
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    async getTravelAdvice() {
      const obj = {
        from: "上海东方明珠",
        to: "上海陆家嘴",
      };
      // 这里可以调用API获取智能体建议
      const res = await getPathPlanning(obj);
      this.travelAdvice = res.data.answer;
    },
    startNavigation() {
      Map.routePlan(this.options, "gcj02");
    },
  },
};
</script>

<style lang="scss" scoped>
.nav-bar {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #fff;
  border-bottom: 1rpx solid #f5f5f5;
}
.nav-back {
  width: 40rpx;
  height: 40rpx;
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
}

.map-container {
  padding: 20rpx;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.ai-card {
  flex: 1;
  padding: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  overflow: auto;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.card-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.header-content {
  flex: 1;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
}

.card-date {
  font-size: 24rpx;
  color: #999;
}

.card-desc {
  font-size: 28rpx;
  line-height: 1.5;
  margin-bottom: 20rpx;
}

.card-footer {
  display: flex;
  position: relative;
  padding-bottom: 40rpx;
}

.tag {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-right: 10rpx;
}

.blue {
  background: #e6f7ff;
  color: #1890ff;
}

.gray {
  background: #f5f5f5;
  color: #666;
}

.nav-btn {
  background: #1890ff;
  color: #fff;
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 28rpx;
  border: none;
  position: absolute;
  right: 0;
  bottom: 0;
}
</style>
