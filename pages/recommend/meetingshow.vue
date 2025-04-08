<template>
  <kml-agent :x="0" :y="600" :isDock="true"> </kml-agent>
  <view class="meeting-detail">
    <!-- 会议状态卡片 -->
    <view class="status-card">
      <view class="status-tag" :class="meetingInfo.meetingStatus">
        {{ status }}
      </view>
      <view class="heat-info">
        <uni-icons
          type="fire-filled"
          color="red"
          size="24"
          class="title-icon" />
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
        <uni-icons type="compose" color="" size="24" class="title-icon" />
        会议简介
      </view>
      <view class="section-content">{{ meetingInfo.meetingDescription }}</view>
    </view>

    <!-- 会议详细介绍 -->
    <view class="section">
      <view class="section-title">
        <uni-icons type="wallet" color="" size="24" class="title-icon" />
        详细介绍
      </view>
      <view class="section-content">{{ meetingInfo.aiSummary }}</view>
    </view>

    <!-- 参会人员 -->
    <view class="section">
      <view class="section-title">
        <uni-icons type="person" color="" size="24" class="title-icon" />
        <!-- <image src="/src/static/images/ok.png" class="title-icon" /> -->
        参会人员
      </view>
      <view class="attendees-list">
        <view
          class="attendee-item"
          v-for="(uid, index) in meetingInfo.attendeesUid.slice(0, 4)"
          :key="index">
          <image
            class="attendee-avatar"
            :src="attendeesAvatar[index]"
            mode="aspectFill" />
          <text class="attendee-name">用户{{ uid }}</text>
        </view>
        <view
          class="attendee-item add-more"
          v-if="meetingInfo.attendeesUid.length > 4">
          <view class="more-circle">
            <text>+{{ meetingInfo.attendeesUid.length - 4 }}</text>
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

    <!-- 会议附件 -->
    <view class="section">
      <view class="section-title">
        <uni-icons type="file" color="" size="24" class="title-icon" />
        会议附件
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-buttons">
      <button class="btn join-btn" @click="handleMeetingOption()">
        {{ isHost ? "开始会议" : isSignUp ? "加入会议" : "报名会议" }}
      </button>
      <button class="btn nav-btn" @click="openNavigation">地图导航</button>
    </view>
  </view>

</template>

<script>
import { useRoomStore } from "../../src/roomkit/TUIRoom/stores/room.ts";
import { useUserInfoStore } from "../../src/stores/modules/userInfo.ts";
import router from "../../src/router/index.ts";
import {
  getMeetingData,
  userSignUpMeeting,
  getPathPlanning,
} from "../../src/services/api.ts";
import { updateMeetingStatus } from "../../src/services/api.ts";
import { incrementJoinCount } from "../../src/services/api.ts";
import { get_avatar } from "../../src/services/api.ts";
export default {
  onLoad: function (option) {
    // 获取meetingId
    this.meetingInfo.meetingId = option.meetingId;
    console.log("meetingId:", this.meetingInfo.meetingId);
    // 获取会议数据
    this.fetchMeetingInfo();
    // 获取房间信息
    this.roomStore = useRoomStore();
    // 获取用户信息
    const userInfoStore = useUserInfoStore();
    this.userId = userInfoStore.userInfo.userId;
    // 自动加入会议
    if (option.autoJoin) {
      uni.showToast({
        title: "正在加入会议",
        icon: "loading",
        duration: 1000,
      });
      setTimeout(() => {
        this.joinMeeting();
      }, 1000);
    }
    // 自动开始会议
    if (option.autoStart) {
      uni.showToast({
        title: "正在开始会议",
        icon: "loading",
        duration: 1000,
      });
      setTimeout(() => {
        this.startMeeting();
      }, 1000);
    }
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
      tuiRoomParam: {
        isOpenCamera: true,
        isOpenMicrophone: true,
        defaultCameraId: "",
        defaultMicrophoneId: "",
        defaultSpeakerId: "",
      },
      mode: "SpeakAfterTakingSeat",
      roomStore: null,
      userId: "",
      attendeesAvatar: [],
    };
  },
  methods: {
    async handleUpdateMeetingStatus(status) {
      const meetingId = this.meetingInfo.meetingId;
      // 调用接口更新会议状态
      const res = await updateMeetingStatus({
        meetingId,
        status,
      });
      console.log("修改成功:", res);
    },
    startMeeting() {
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
      const meetingTitle = this.meetingInfo.meetingName;
      router.replace({
        path: "/src/roomkit/pages/room",
        query: {
          roomId,
          meetingTitle,
        },
      });
    },
    joinMeeting() {
      const roomParam = this.getRoomParam();
      const roomOption = {
        roomId: this.meetingInfo.meetingId,
        roomParam,
      };
      this.setTUIRoomData("enterRoom", roomOption);
      const meetingTitle = this.meetingInfo.meetingName;
      router.replace({
        path: "/src/roomkit/pages/room",
        query: {
          roomId: roomOption.roomId,
          meetingTitle,
        },
      });
    },
    // 获取rommParam
    getRoomParam() {
      this.tuiRoomParam.defaultCameraId = this.roomStore.currentCameraId;
      this.tuiRoomParam.defaultMicrophoneId =
        this.roomStore.currentMicrophoneId;
      this.tuiRoomParam.defaultSpeakerId = this.roomStore.currentSpeakerId;
      return this.tuiRoomParam;
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
        const res = await getMeetingData(this.meetingInfo.meetingId);
        if (res.code === 1) {
          this.meetingInfo = res.data;
          for (let i = 0; i < 4; i++) {
            const avatar = await get_avatar(res.data.attendeesUid[i]);
            this.attendeesAvatar.push(avatar.data);
          }
        }
      } catch (error) {
        uni.showToast({
          title: "获取会议信息失败",
          icon: "none",
        });
      }
    },
    async handleMeetingOption() {
      if (this.isHost) {
        uni.showModal({
          title: "提示",
          content: "确定开始会议吗",
          showCancel: true,
          success: ({ confirm, cancel }) => {
            if (confirm) {
              this.startMeeting();
              // 修改会议状态
              this.handleUpdateMeetingStatus("Ongoing");
            } else if (cancel) {
              return;
            }
          },
        });
      } else {
        if (this.isSignUp) {
          // 用户已经报名会议
          switch (this.meetingInfo.meetingStatus) {
            case "Waiting": {
              uni.showToast({
                title: "会议还未开始，请耐心等待",
                icon: "none",
              });
              /*  uni.showModal({
                title: "提示",
                content: "会议正在进行中，确定加入会议吗",
                showCancel: true,
                success: ({ confirm, cancel }) => {
                  if (confirm) {
                    incrementJoinCount(this.meetingInfo.meetingId);
                    this.joinMeeting();
                  } else if (cancel) {
                    return;
                  }
                },
              }); */
              break;
            }
            case "Ongoing": {
              uni.showModal({
                title: "提示",
                content: "会议正在进行中，确定加入会议吗",
                showCancel: true,
                success: ({ confirm, cancel }) => {
                  if (confirm) {
                    this.joinMeeting();
                    // 记录用户加入会议
                    logUserJoinMeeting({
                      operatorUid: this.userId,
                      operationType: "加入会议",
                      meetingUid: this.meetingInfo.meetingId,
                    });
                  } else if (cancel) {
                    return;
                  }
                },
              });
              break;
            }
            case "Ended": {
              uni.showToast({
                title: "会议已经结束",
                icon: "none",
              });
              break;
            }
            default:
              return;
          }
        } else {
          // 用户未报名会议 点击进行报名
          const res = await userSignUpMeeting({
            userId: this.userId,
            meetingId: this.meetingInfo.meetingId,
          });
          if (res.code === 1) {
            uni.showToast({
              title: "报名成功",
              icon: "none",
              duration: 2000,
            });
            this.meetingInfo.attendeesUid.push(this.userId);
            this.meetingInfo.numAttendees++;
            this.fetchMeetingInfo();
          }
        }
      }
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
      // 选择会议地点
      /* uni.chooseLocation({
        fail: function (res) {
          console.log("选择位置失败：" + res.errMsg);
        },
        success: function (res) {
          console.log("选择位置成功：");
        },
      }); */
      // 调用地图API进行导航
      // uni.openLocation({
      //   // latitude: Number(this.meetingInfo.latitude),
      //   // longitude: Number(this.meetingInfo.longitude),
      //   // name: this.meetingInfo.meetingLocation,
      //   // address: this.meetingInfo.meetingLocation,
      //   latitude: 39.9085,
      //   longitude: 116.39747,
      //   name: "天安门",
      //   address: "北京市东城区东长安街",
      //   success: (success) => {
      //     console.log("导航成功", success);
      //   },
      // });
      uni.navigateTo({
        url: "/pages/recommend/navigation/navigation",
      });
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
  computed: {
    isSignUp() {
      return this.meetingInfo.attendeesUid.includes(this.userId);
    },
    isHost() {
      console.log(this.userId, this.meetingInfo.organizerUid);
      if (this.userId === this.meetingInfo.organizerUid) {
        return true;
      } else {
        return false;
      }
    },
    status() {
      switch (this.meetingInfo.meetingStatus) {
        case "Waiting": {
          return "会议即将开始";
        }
        case "Ongoing": {
          return "会议进行中";
        }
        case "Ended": {
          return "会议已结束";
        }
        default: {
          return "error";
        }
      }
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

    &.Waiting {
      background: rgba(43, 88, 249, 0.1);
      color: #2b58f9;
    }

    &.Ongoing {
      background: rgba(82, 196, 26, 0.1);
      color: #52c41a;
    }

    &.Ended {
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
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 20rpx;
  border-radius: 16rpx;
  margin-bottom: 12rpx;

  .info-box {
    width: 30%;
    flex: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
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
    margin-bottom: 10rpx;
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
