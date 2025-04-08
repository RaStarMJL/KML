<template>
  <view class="sign-container">
    <!-- 发起签到者视角 -->
    <template v-if="isHost">
      <view class="host-view">
        <view class="header">
          <text class="title">{{
            hasStartedSign ? "签到情况" : "发起签到"
          }}</text>
        </view>

        <!-- 签到表单，仅在未发起签到时显示 -->
        <template v-if="!hasStartedSign">
          <view class="sign-form">
            <view class="form-item">
              <text class="label">签到时长</text>
              <view class="duration-picker">
                <text class="duration" @click="showDurationPicker"
                  >{{ duration }}分钟</text
                >
                <uni-icons type="right" size="16" color="#999"></uni-icons>
              </view>
            </view>
          </view>

          <button class="start-btn" @click="startSign">立即发起</button>
        </template>

        <!-- 签到情况列表，始终显示 -->
        <view class="sign-list" :class="{ 'full-height': hasStartedSign }">
          <view class="list-header">
            <text class="header-title">签到情况</text>
            <text class="sign-count"
              >已签到 {{ signedCount }}/{{ totalCount }}</text
            >
          </view>
          <view class="list-content">
            <view
              v-for="(item, index) in signList"
              :key="index"
              class="sign-item">
              <view class="user-info">
                <text class="username">{{ item.participantUid }}</text>
                <text class="sign-time">{{ formatTime(item.updateTime) }}</text>
              </view>
              <view
                class="sign-status"
                :class="{ signed: item.signInStatus === 1 }">
                {{ item.signInStatus === 1 ? "已签到" : "未签到" }}
              </view>
              <view v-if="item.absenceReason" class="absence-reason">
                {{ item.absenceReason }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- 签到者视角 -->
    <template v-else>
      <view class="attendee-view">
        <view class="header">
          <text class="title">{{ meetingname }}</text>
          <text class="subtitle">{{
            hasSignedIn ? "签到完成" : "主办方发起了签到"
          }}</text>
        </view>

        <view class="timer-section">
          <view class="timer-wrapper">
            <view
              v-if="!hasSignedIn"
              class="timer-circle"
              :style="{
                background: `conic-gradient(#2B58F9 ${progressDegree}deg, #E8EFFF ${progressDegree}deg)`,
              }">
              <view class="timer-inner">
                <text class="time-left">{{ formatTimeLeft }}</text>
                <text class="time-label">剩余时间</text>
              </view>
            </view>
            <view v-else class="success-circle">
              <view class="success-icon">
                <view class="checkmark"></view>
              </view>
              <text class="success-text">签到成功</text>
            </view>
          </view>
        </view>

        <view class="action-section" v-if="!hasSignedIn">
          <button class="sign-btn" @click="handleSign" :disabled="hasSignedIn">
            立即签到
          </button>
          <button class="absence-btn" @click="showAbsenceModal">
            无法参加
          </button>
        </view>
      </view>
    </template>

    <!-- 请假说明弹窗 -->
    <uni-popup ref="absencePopup" type="dialog">
      <uni-popup-dialog
        title="请假说明"
        :before-close="true"
        @close="handleAbsencePopupClose"
        @confirm="submitAbsence">
        <textarea
          v-model="absenceReason"
          class="absence-textarea"
          placeholder="请输入无法参加的原因"
          maxlength="200" />
      </uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useUserInfoStore } from "../../../stores/modules/userInfo";
import {
  getSignStatus,
  submitLeaveReason,
  hostStartSign,
  getRemainingTime,
} from "../../../services/api";
import { baseURL } from "/src/utils/http";

interface SignRecord {
  meetingId: string;
  participantUid: string;
  signInStatus: number;
  absenceReason: string | null;
  createTime: string;
  updateTime: string;
  meetingname: string;
}

// 状态变量
const isHost = ref(true);
const duration = ref(5);

const timeLeft = ref(300);
const hasSignedIn = ref(false);
const signMethod = ref("");
const showSignPopup = ref(false);
const totalTime = ref(300);
const meetingId = ref("");
const userId = ref("");
const signList = ref<SignRecord[]>([]);
const absenceReason = ref("");
const absencePopup = ref(null);
const meetingname = ref("");
const hasStartedSign = ref(false);

// 计算属性
const formatTimeLeft = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60);
  const seconds = timeLeft.value % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
});

const progressDegree = computed(() => {
  return 360 * (timeLeft.value / totalTime.value);
});

const signedCount = computed(() => {
  return signList.value.filter((item) => item.signInStatus === 1).length;
});

const totalCount = computed(() => {
  return signList.value.length;
});

// 格式化时间
const formatTime = (timeStr: string) => {
  const date = new Date(timeStr);
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

// 显示时长选择器
const showDurationPicker = () => {
  uni.showActionSheet({
    itemList: ["5分钟", "10分钟", "15分钟", "30分钟"],
    success: (res) => {
      if (res.tapIndex !== undefined) {
        const durations = [5, 10, 15, 30];
        duration.value = durations[res.tapIndex];
      }
    },
  });
};

// 开始倒计时
const startCountdown = () => {
  const timer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      clearInterval(timer);
      if (!hasSignedIn.value) {
        showSignPopup.value = true;
      }
    }
  }, 1000);
};
// 格式化日期为 YYYY-MM-DDTHH: mm: ss 格式
const formatDateTime = (date) => {
  const pad = (n) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
};
const getTime = (n) => {
  // 获取当前时间
  const now = new Date();

  // 计算截止时间（当前时间 + 5分钟）
  const endTime = new Date(now.getTime() + n * 60 * 1000);

  // 格式化输出
  console.log("当前时间:", formatDateTime(now));
  console.log("截止时间:", formatDateTime(endTime));
  return {
    signInStartTime: formatDateTime(now),
    signInEndTime: formatDateTime(endTime),
  };
};
// 发起签到
const startSign = async () => {
  try {
    hasStartedSign.value = true;
    const hostId = userId.value;
    const { signInStartTime, signInEndTime } = getTime(duration.value);
    await hostStartSign({
      meetingId: meetingId.value,
      hostId,
      signInStartTime,
      signInEndTime,
    });
  } catch (error) {
    console.error("发起签到失败:", error);
    uni.showToast({
      title: error.message || "发起签到失败",
      icon: "none",
    });
  }
};

// 处理签到
const handleSign = async () => {
  try {
    const response = await uni.request({
      url: baseURL + "meetingSign/updateSign",
      method: "POST",
      data: {
        meetingId: meetingId.value,
        participantUid: userId.value,
      },
    });

    console.log(response);

    const result = response.data;
    if (result.code === 1) {
      hasSignedIn.value = true;
    } else {
      throw new Error(result.msg || "签到失败");
    }
  } catch (error) {
    console.error("签到失败:", error);
    uni.showToast({
      title: error.message || "签到失败",
      icon: "none",
    });
  }
};

// 获取签到情况
const onGetSignStatus = async () => {
  try {
    const res = await getSignStatus(meetingId.value);
    console.log("获取签到情况", res.data);
    if (res.code === 1) {
      signList.value = res.data;
      // 检查当前用户是否已签到
      // const userRecord = signList.value.find(
      //   (item) => item.participantUid === userId.value
      // );
      // if (userRecord) {
      //   hasSignedIn.value = userRecord.signInStatus === 1;
      // }
    }
  } catch (error) {
    console.error("获取签到情况失败:", error);
    uni.showToast({
      title: "获取签到情况失败",
      icon: "none",
    });
  }
};

// 提交请假说明
const submitAbsence = async () => {
  if (!absenceReason.value.trim()) {
    uni.showToast({
      title: "请输入缺席原因",
      icon: "none",
    });
    return;
  }

  try {
    const data = {
      meetingId: meetingId.value,
      participantUid: userId.value,
      absenceReason: absenceReason.value,
    };
    const response = submitLeaveReason(data);
    const result = response.data;
    if (result.code === 1) {
      uni.showToast({
        title: "请假说明已提交",
        icon: "success",
      });
      absencePopup.value?.close();
      // 刷新签到列表
      if (isHost.value) {
        onGetSignStatus();
      }
    } else {
      throw new Error(result.msg || "提交失败");
    }
  } catch (error) {
    console.error("提交请假说明失败:", error);
    uni.showToast({
      title: error.message || "提交失败",
      icon: "none",
    });
  }
};

// 显示请假说明弹窗
const showAbsenceModal = () => {
  absencePopup.value?.open();
};

// 处理请假说明弹窗关闭
const handleAbsencePopupClose = () => {
  absenceReason.value = "";
  absencePopup.value?.close();
};

// 页面加载
onLoad(async (options) => {
  const userInfoStore = useUserInfoStore();
  userId.value = userInfoStore.userInfo?.userId || "";
  meetingId.value = options?.meetingId || "";
  isHost.value = options?.role === "host";
  signMethod.value = userInfoStore.userInfo?.userName || "未登录用户";
  meetingname.value = options?.meetingname || "未登录用户";

  if (!isHost.value) {
    // 获取签到状态
    onGetSignStatus();
    const res = await getSignStatus(meetingId.value);
    const userRecord = signList.value.find(
      (item) => item.participantUid === userId.value
    );
    if (userRecord) {
      hasSignedIn.value = userRecord.signInStatus === 1;
    }
    if (!hasSignedIn.value) {
      // 用户未签到，开始倒计时
      // 获取剩余时间和总时间
      const res = await getRemainingTime(meetingId.value);
      timeLeft.value = res.data.endTime;
      totalTime.value = res.data.totalTime;
      startCountdown();
    }
  } else {
    // 获取签到者信息
    onGetSignStatus();
    // 如果是主持人，检查是否已经开始了签到
    const res = await getRemainingTime(meetingId.value);
    // 判断主持人是否已经开始了签到
    res.data.endTime === 0
      ? (hasStartedSign.value = false)
      : (hasStartedSign.value = true);
    if (hasStartedSign.value) {
      // 如果已经开始过签到 每隔10s刷新签到情况
      const t = setInterval(() => {
        onGetSignStatus();
        if (!hasStartedSign.value) {
          clearInterval(t);
        }
      }, 10000); // 每10秒刷新一次
    }
  }
});
</script>

<style scoped lang="scss">
.sign-container {
  min-height: 100vh;
  background: #f5f6f7;
  padding: 30rpx;
}

/* 发起签到者样式 */
.host-view {
  .header {
    margin-bottom: 40rpx;

    .title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .sign-form {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 40rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  }

  .form-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .label {
      width: 160rpx;
      font-size: 30rpx;
      color: #333;
    }

    .duration-picker {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .duration {
        font-size: 30rpx;
        color: #666;
        margin-right: 10rpx;
      }
    }

    .input {
      flex: 1;
      font-size: 30rpx;
      color: #333;
    }

    .word-count {
      font-size: 24rpx;
      color: #999;
      margin-left: 20rpx;
    }
  }

  .sign-list {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 40rpx;
    transition: all 0.3s ease;

    &.full-height {
      margin-top: 20rpx;
      min-height: calc(100vh - 200rpx);
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .header-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
      }

      .sign-count {
        font-size: 28rpx;
        color: #666;
      }
    }

    .sign-item {
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .user-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10rpx;

        .username {
          font-size: 30rpx;
          color: #333;
        }

        .sign-time {
          font-size: 26rpx;
          color: #999;
        }
      }

      .sign-status {
        display: inline-block;
        padding: 4rpx 16rpx;
        border-radius: 8rpx;
        font-size: 24rpx;
        color: #ff6b6b;
        background: rgba(255, 107, 107, 0.1);

        &.signed {
          color: #52c41a;
          background: rgba(82, 196, 26, 0.1);
        }
      }

      .absence-reason {
        margin-top: 10rpx;
        font-size: 26rpx;
        color: #666;
        background: #f9f9f9;
        padding: 10rpx;
        border-radius: 8rpx;
      }
    }
  }

  .start-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    background: linear-gradient(135deg, #2b58f9, #1a3d8f);
    color: #fff;
    font-size: 32rpx;
    border-radius: 44rpx;
    box-shadow: 0 6rpx 20rpx rgba(43, 88, 249, 0.2);
    border: none;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 4rpx 10rpx rgba(43, 88, 249, 0.15);
    }
  }
}

/* 签到者样式 */
.attendee-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60rpx;

  .header {
    text-align: center;
    margin-bottom: 60rpx;

    .title {
      font-size: 40rpx;
      font-weight: 600;
      color: #333;
      margin-bottom: 20rpx;
      display: block;
    }

    .subtitle {
      font-size: 28rpx;
      color: #666;
    }
  }

  .timer-section {
    margin-bottom: 60rpx;

    .timer-wrapper {
      width: 400rpx;
      height: 400rpx;
      padding: 20rpx;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 8rpx 30rpx rgba(43, 88, 249, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .timer-circle,
    .success-circle {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.3s linear;
    }

    .timer-inner {
      width: 85%;
      height: 85%;
      border-radius: 50%;
      background: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .time-left {
      font-size: 80rpx;
      color: #333;
      font-weight: 600;
      margin-bottom: 10rpx;
    }

    .time-label {
      font-size: 28rpx;
      color: #666;
    }
  }

  .sign-info {
    text-align: center;
    margin-bottom: 60rpx;

    .sign-method {
      font-size: 32rpx;
      color: #333;
      margin-bottom: 20rpx;
      display: block;
    }

    .sign-tip {
      font-size: 26rpx;
      color: #999;
    }
  }

  .sign-btn {
    width: 400rpx;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    background: linear-gradient(135deg, #2b58f9, #1a3d8f);
    color: #fff;
    font-size: 32rpx;
    border-radius: 44rpx;
    box-shadow: 0 6rpx 20rpx rgba(43, 88, 249, 0.2);
    border: none;
    margin-bottom: 30rpx;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 4rpx 10rpx rgba(43, 88, 249, 0.15);
    }

    &[disabled] {
      background: #ccc;
      box-shadow: none;
    }
  }

  .absence-btn {
    width: 400rpx;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    background: #fff;
    color: #666;
    font-size: 28rpx;
    border-radius: 44rpx;
    border: 2rpx solid #eee;

    &:active {
      background: #f5f5f5;
    }
  }
}

.absence-textarea {
  width: 100%;
  height: 200rpx;
  padding: 20rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  line-height: 1.5;
  border: 2rpx solid #eee;
  border-radius: 8rpx;
}

.success-circle {
  background: linear-gradient(135deg, #e8efff, #ffffff);
  box-shadow: 0 8rpx 32rpx rgba(43, 88, 249, 0.1);
  position: relative;
  animation: appear 0.5s ease-out;
  width: 300rpx;
  height: 300rpx;
}

.success-icon {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #52c41a, #389e0d);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 16rpx rgba(82, 196, 26, 0.2);
  position: relative;
  animation: scale-in 0.3s ease-out 0.2s both;
}

.checkmark {
  width: 32rpx;
  height: 56rpx;
  border-right: 6rpx solid #fff;
  border-bottom: 6rpx solid #fff;
  transform: rotate(45deg);
  position: absolute;
  top: 50%;
  left: 50%;
  margin: -32rpx 0 0 -16rpx;
  animation: checkmark 0.4s ease-out 0.5s both;
}

.success-text {
  font-size: 32rpx;
  color: #52c41a;
  font-weight: 600;
  margin-top: 10rpx;
  background: linear-gradient(135deg, #52c41a, #389e0d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fade-in 0.3s ease-out 0.7s both;
}

@keyframes appear {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes scale-in {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@keyframes checkmark {
  from {
    width: 0;
    height: 0;
    opacity: 0;
    transform: rotate(45deg) scale(0.5);
  }
  to {
    width: 32rpx;
    height: 56rpx;
    opacity: 1;
    transform: rotate(45deg) scale(1);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
