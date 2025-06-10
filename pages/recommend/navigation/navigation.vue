<template>
  <view class="map-container">
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
          src="/src/static/images/function-ai.png"
          mode="aspectFill"></image>
        <view class="header-content">
          <text class="card-title">导航智能体</text>
          <text class="card-date">{{ currentDate }}</text>
        </view>
      </view>
      <zero-markdown-view
        class="card-desc"
        :markdown="travelAdvice"></zero-markdown-view>
      <!-- <view class="card-desc">
        <text>{{ travelAdvice }}</text>
      </view> -->

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
import {
  getPathPlanning,
  api_getAddressByLocation,
  api_getLocationByName,
} from "/src/services/api.ts";
export default {
  data() {
    return {
      currentDate: new Date().toLocaleString(),
      travelAdvice: "正在获取最佳出行建议...",
      options: {
        origin: {
          latitude: 31.245105,
          longitude: 121.506377,
          name: "上海东方明珠",
        },
        destination: {
          latitude: 31.24142802,
          longitude: 121.476839,
          name: "外滩",
        },
        mode: "drive",
        mapId: "map",
      },
      scale: 12,
    };
  },
  computed: {
    center() {
      return {
        latitude:
          (this.options.origin.latitude + this.options.destination.latitude) /
          2,
        longitude:
          (this.options.origin.longitude + this.options.destination.longitude) /
          2,
      };
    },
    markers() {
      return [
        {
          id: 1,
          latitude: this.options.origin.latitude,
          longitude: this.options.origin.longitude,
          title: this.options.origin.name,
          iconPath: "/static/images/map/start.png",
        },
        {
          id: 2,
          latitude: this.options.destination.latitude,
          longitude: this.options.destination.longitude,
          title: this.options.destination.name,
          iconPath: "/static/images/map/end.png",
        },
      ];
    },
    polyline() {
      return [
        {
          points: [
            {
              latitude: this.options.origin.latitude,
              longitude: this.options.origin.longitude,
            },
            {
              latitude: this.options.destination.latitude,
              longitude: this.options.destination.longitude,
            },
          ],
          color: "#1890ff",
          width: 8,
          dottedLine: false,
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ];
    },
    includePoints() {
      return [
        {
          latitude: this.options.origin.latitude,
          longitude: this.options.origin.longitude,
        },
        {
          latitude: this.options.destination.latitude,
          longitude: this.options.destination.longitude,
        },
      ];
    },
  },
  async mounted() {
    /**
     * 1.获取当前位置
     * 2.根据经纬度获取所在地地名
     * 3.根据目的地名称获取经纬度
     * 4.调用API获取智能体建议
     * 5.点击一键导航将出发地和目的地传入地图导航
     */
    try {
      // 1. 先获取当前位置
      await this.getCurrentLocation();

      // 2. 然后获取位置名称
      await this.getLocationName(
        this.options.origin.latitude,
        this.options.origin.longitude
      );

      // 3. 获取目的地坐标
      await this.getLocationByAddress(this.options.destination.name);

      // 4. 最后获取建议
      await this.getTravelAdvice();
    } catch (error) {
      console.error("初始化失败:", error);
      uni.showToast({
        title: "初始化失败",
        icon: "none",
      });
    }
  },
  onLoad(options) {
    this.options.destination.name = options.destination;
  },
  methods: {
    // 获取当前位置信息
    async getCurrentLocation() {
      try {
        const res = await new Promise((resolve, reject) => {
          uni.getLocation({
            type: "wgs84",
            success: resolve,
            fail: reject,
          });
        });
        this.options.origin.latitude = res.latitude;
        this.options.origin.longitude = res.longitude;
        // this.$set(this.options.origin, "latitude", res.latitude);
        // this.$set(this.options.origin, "longitude", res.longitude);
        console.log("当前位置已更新", this.options);
      } catch (error) {
        console.error("获取位置失败:", error);
        throw error; // 抛出错误让外层捕获
      }
    },
    // 根据经纬度获取所在地地名
    async getLocationName(latitude, longitude) {
      const obj = {
        latitude: latitude,
        longitude: longitude,
      };
      const res = await api_getAddressByLocation(obj);
      const address = res.data.result.formatted_address;
      this.options.origin.name = address;
      console.log("第二步", this.options);
    },
    // 根据目的地名称获取经纬度
    async getLocationByAddress(address) {
      const res = await api_getLocationByName(address);
      const latitude = res.data.result.location.lat;
      const longitude = res.data.result.location.lng;
      this.options.destination.latitude = latitude;
      this.options.destination.longitude = longitude;
      console.log("第三步", this.options);
    },
    async getTravelAdvice() {
      const obj = {
        from: this.options.origin.name,
        to: this.options.destination.name,
      };
      console.log("第四步", this.options);
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
