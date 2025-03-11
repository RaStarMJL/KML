<template>
  <view class="meeting-detail">
    <!-- 会议状态卡片 -->
    <view class="status-card">
      <view class="status-tag" :class="meetingInfo.meetingStatus">
        {{ getMeetingStatus(meetingInfo.meetingStatus) }}
      </view>
      <view class="heat-info">
        <image src="/static/icons/fire.png" class="fire-icon" />
        <text>热度 {{ meetingInfo.meetingHeat }}</text>
      </view>
    </view>

    <!-- 会议基本信息 -->
    <view class="info-section">
      <view class="meeting-title">{{ meetingInfo.meetingName }}</view>
      <!-- 会议图片 -->
      <view class="meeting-image">
        <image
          :src="meetingInfo.meetingImageUrl"
          mode="aspectFill"
          class="cover-image" />
      </view>
      <view class="basic-info">
        <view class="info-row">
          <image src="/static/icons/time.png" class="icon" />
          <view class="time-info">
            <text class="date">{{ formatDate(meetingInfo.startTime) }}</text>
            <text class="time"
              >{{ formatTime(meetingInfo.startTime) }} -
              {{ formatTime(meetingInfo.endTime) }}</text
            >
          </view>
        </view>
        <view class="info-row">
          <image src="/static/icons/location.png" class="icon" />
          <text>{{ meetingInfo.meetingLocation }}</text>
        </view>
        <view class="info-row">
          <image src="/static/icons/organizer.png" class="icon" />
          <text>主办方：{{ meetingInfo.organizerUid }}</text>
        </view>
      </view>
    </view>

    <!-- 快速信息 -->
    <view class="quick-info">
      <view class="info-box">
        <text class="number">{{ meetingInfo.numAttendees }}</text>
        <text class="label">参会人数</text>
      </view>
      <view class="info-box">
        <text class="number">{{ getMeetingDuration() }}</text>
        <text class="label">会议时长</text>
      </view>
      <view class="info-box">
        <text class="type-tag">{{ meetingInfo.meetingType }}</text>
        <text class="label">会议类型</text>
      </view>
    </view>

    <!-- 会议介绍 -->
    <view class="section">
      <view class="section-title">
        <image src="/static/icons/intro.png" class="title-icon" />
        会议简介
      </view>
      <view class="section-content">{{ meetingInfo.meetingDescription }}</view>
    </view>

    <!-- 会议详细介绍 -->
    <view class="section">
      <view class="section-title">
        <image src="/static/icons/detail.png" class="title-icon" />
        详细介绍
      </view>
      <view class="section-content">{{ meetingInfo.aiSummary }}</view>
    </view>

    <!-- 参会人员 -->
    <view class="section">
      <view class="section-title">
        <image src="/static/icons/users.png" class="title-icon" />
        参会人员
      </view>
      <view class="attendees-list">
        <view
          class="attendee-item"
          v-for="(uid, index) in meetingInfo.attendeesUid"
          :key="index">
          <image
            class="attendee-avatar"
            :src="'/static/avatars/' + uid + '.jpg'"
            mode="aspectFill" />
          <text class="attendee-name">用户{{ uid }}</text>
        </view>
        <view
          class="attendee-item add-more"
          v-if="meetingInfo.numAttendees > 6">
          <view class="more-circle">
            <text>+{{ meetingInfo.numAttendees - 6 }}</text>
          </view>
          <text class="attendee-name">更多</text>
        </view>
      </view>
    </view>

    <!-- 其他信息 -->
    <view class="section">
      <view class="section-title">
        <image src="/static/icons/info.png" class="title-icon" />
        会议须知
      </view>
      <view class="info-grid">
        <view class="grid-item">
          <text class="grid-label">会议规则</text>
          <text class="grid-value">{{ meetingInfo.meetingRules }}</text>
        </view>
        <view class="grid-item">
          <text class="grid-label">场地布局</text>
          <text class="grid-value">{{ meetingInfo.venueLayout }}</text>
        </view>
        <view class="grid-item">
          <text class="grid-label">餐饮服务</text>
          <text class="grid-value">{{ meetingInfo.cateringService }}</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-buttons">
      <button
        class="btn join-btn"
        @click="
          joinMeeting({
            roomId: meetingInfo.meetingId,
            memberRole: 'host',
          })
        ">
        参加会议
      </button>
      <button class="btn nav-btn" @click="openNavigation">地图导航</button>
      <button class="btn nav-btn" @click="test">测试</button>
    </view>
  </view>
</template>

<script>
import { useRoomStore } from "../../src/roomkit/TUIRoom/stores/room.ts";
import router from "../../src/router/index.ts";
export default {
  onLoad: function (option) {
    // 获取meetingId
    this.meetingInfo.meetingId = option.meetingId;
    console.log("meetingId:", this.meetingInfo.meetingId);
    // 获取会议数据
    this.fetchMeetingInfo();
    this.roomStore = useRoomStore();
  },

  data() {
    return {
      meetingInfo: {
        meetingId: "",
        meetingName: "",
        meetingDescription: "",
        meetingImageUrl: "",
        meetingLocation: "",
        meetingRules: "",
        venueLayout: "",
        cateringService: "",
        meetingAttachments: [],
        numAttendees: 0,
        attendeesUid: [],
        startTime: "",
        endTime: "",
        organizerUid: "",
        meetingStatus: "",
        meetingType: "",
        aiSummary: "",
        meetingHeat: 0,
        TUIRoomRef: null,
      },
      roomOption: {
        roomMode: null,
        roomParam: null,
        isSeatEnabled: null,
      },
      tuiRoomParam: {
        isOpenCamera: true,
        isOpenMicrophone: true,
        defaultCameraId: "",
        defaultMicrophoneId: "",
        defaultSpeakerId: "",
      },
      mode: "FreeToSpeak",
      roomStore: null,
    };
  },
  methods: {
    test() {
      const roomMode = this.mode;
      const isSeatEnabled = Boolean(roomMode === "SpeakAfterTakingSeat");
      const roomParam = this.getRoomParam();
      const roomOption = {
        roomMode,
        roomParam,
        isSeatEnabled,
      };

      this.setTUIRoomData("createRoom", roomOption);
      const roomId = this.meetingInfo.meetingId;
      console.log("roomId123:", roomId);
      router.replace({
        path: "/src/roomkit/pages/room",
        query: {
          roomId,
        },
      });
    },
    setTUIRoomData(action, roomOption) {
      uni.setStorageSync(
        "tuiRoom-roomInfo",
        JSON.stringify({
          action,
          ...roomOption,
        })
      );
    },
    async fetchMeetingInfo() {
      try {
        // 这里替换为实际的API调用
        const response = await uni.request({
          url: `http://192.168.31.115:5000/meetMessage?meetId=${this.meetingInfo.meetingId}`,
          method: "GET",
        });
        console.log("response", response);
        if (response.data.code === 1) {
          this.meetingInfo = response.data.data;
        }
      } catch (error) {
        uni.showToast({
          title: "获取会议信息失败",
          icon: "none",
        });
      }
    },
    // 获取rommParam
    getRoomParam() {
      this.tuiRoomParam.defaultCameraId = this.roomStore.currentCameraId;
      this.tuiRoomParam.defaultMicrophoneId =
        this.roomStore.currentMicrophoneId;
      this.tuiRoomParam.defaultSpeakerId = this.roomStore.currentSpeakerId;
      return this.tuiRoomParam;
    },

    joinMeeting(obj) {
      /* params
				obj.roomId  房间id
				obj.memberRole  参会人员的角色
				*/
      // 如果是会议创建者点击按钮，则创建房间并开始会议
      if (obj.memberRole === "host") {
        this.roomOption.roomMode = "FreeToSpeak";
        this.roomOption.roomParam = this.getRoomParam();
        this.roomOption.isSeatEnabled = Boolean(
          this.mode === "SpeakAfterTakingSeat"
        );
        this.handleCreateRoom(this.roomOption);
      }
    },
    // 设置房间信息
    setTUIRoomData(action, roomOption) {
      uni.setStorageSync(
        "tuiRoom-roomInfo",
        JSON.stringify({
          action,
          ...roomOption,
        })
      );
    },
    async handleCreateRoom(roomOption) {
      this.setTUIRoomData("createRoom", roomOption);
      // const roomId = await generateRoomId();
      router.replace({
        path: "/src/roomkit/pages/rome",
        query: {
          roomId: this.meetingInfo.meetingId,
        },
      });
    },
    openNavigation() {
      // 调用地图API进行导航
      uni.openLocation({
        latitude: Number(this.meetingInfo.latitude),
        longitude: Number(this.meetingInfo.longitude),
        name: this.meetingInfo.meetingLocation,
        address: this.meetingInfo.meetingLocation,
      });
    },

    getMeetingStatus(status) {
      const statusMap = {
        upcoming: "即将开始",
        ongoing: "进行中",
        ended: "已结束",
      };
      return statusMap[status] || status;
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },
    formatTime(dateStr) {
      const date = new Date(dateStr);
      return `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    },
    getMeetingDuration() {
      const start = new Date(this.meetingInfo.startTime);
      const end = new Date(this.meetingInfo.endTime);
      const hours = Math.round((end - start) / (1000 * 60 * 60));
      return `${hours}小时`;
    },
  },
};
</script>

<style lang="scss" scoped>
.meeting-detail {
  min-height: 100vh;
  background: #f5f6f7;
  padding: 12rpx;
  padding-bottom: 120rpx;
}

.status-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  margin-bottom: 12rpx;

  .status-tag {
    padding: 8rpx 20rpx;
    border-radius: 20rpx;
    font-size: 24rpx;

    &.upcoming {
      background: rgba(43, 88, 249, 0.1);
      color: #2b58f9;
    }

    &.ongoing {
      background: rgba(82, 196, 26, 0.1);
      color: #52c41a;
    }

    &.ended {
      background: rgba(153, 153, 153, 0.1);
      color: #999;
    }
  }

  .heat-info {
    display: flex;
    align-items: center;
    color: #ff4d4f;
    font-size: 24rpx;

    .fire-icon {
      width: 28rpx;
      height: 28rpx;
      margin-right: 8rpx;
    }
  }
}

.info-section {
  background: #fff;
  padding: 20rpx;
  border-radius: 16rpx;
  margin-bottom: 12rpx;
}

.meeting-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

/* 会议图片样式 */
.meeting-image {
  width: 100%;
  height: 240rpx;
  margin-bottom: 16rpx;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
}

.basic-info {
  .info-row {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    color: #666;
    margin-bottom: 8rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .icon {
      width: 28rpx;
      height: 28rpx;
      margin-right: 12rpx;
    }
  }
}

.time-info {
  display: flex;
  align-items: center;

  .date {
    margin-right: 12rpx;
  }
}

.quick-info {
  display: flex;
  justify-content: space-between;
  background: #fff;
  padding: 20rpx;
  border-radius: 16rpx;
  margin-bottom: 12rpx;

  .info-box {
    flex: 1;
    text-align: center;

    .number {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 8rpx;
    }

    .label {
      font-size: 24rpx;
      color: #999;
    }

    .type-tag {
      display: inline-block;
      padding: 4rpx 16rpx;
      background: rgba(43, 88, 249, 0.1);
      color: #2b58f9;
      border-radius: 12rpx;
      font-size: 24rpx;
      margin-bottom: 8rpx;
    }
  }
}

.section {
  background: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
  margin-bottom: 12rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;

  .title-icon {
    width: 36rpx;
    height: 36rpx;
    margin-right: 12rpx;
  }
}

.section-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.attendees-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.attendee-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100rpx;
}

.attendee-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-bottom: 12rpx;
  border: 2rpx solid #fff;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.more-circle {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;

  text {
    color: #666;
    font-size: 28rpx;
  }
}

.attendee-name {
  font-size: 24rpx;
  color: #666;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
}

.grid-item {
  background: rgba(43, 88, 249, 0.05);
  padding: 16rpx;
  border-radius: 12rpx;

  .grid-label {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 8rpx;
    display: block;
  }

  .grid-value {
    font-size: 28rpx;
    color: #333;
    line-height: 1.4;
  }
}

.bottom-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 16rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  margin: 0 10rpx;

  &.join-btn {
    background: #2b58f9;
    color: #fff;
  }

  &.nav-btn {
    background: #fff;
    color: #2b58f9;
    border: 2rpx solid #2b58f9;
  }
}
</style>
