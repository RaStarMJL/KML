<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useUserInfoStore } from "../../../src/stores/modules/userInfo";
import { api_getUserHostedMeetings } from "../../../src/services/api";
const props = defineProps({
  hostedMeetingInfo: {
    type: [Array],
    required: true,
  },
});

const convertDateString = (dateStr) => {
  const weekDays = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  const date = new Date(dateStr);
  const month = date.getMonth() + 1; // 月份是从0开始的
  const day = date.getDate();
  const weekDay = weekDays[date.getDay()];

  return `${month}月${day}号 ${weekDay}`;
};

const goToMeetingShow = (meetingId) => {
  uni.navigateTo({
    url: `/pages/recommend/meetingshow?meetingId=${meetingId}`,
  });
};
const uploadFile = (meetingId, meetingName) => {
  console.log(111);
  console.log("上传文件：", meetingId, meetingName);
  uni.navigateTo({
    url: `/pages/uploadfile/uploadfile?meetingId=${meetingId}&meetingName=${meetingName}`,
  });
};
const meetings = ref([]);
</script>

<template>
  <!-- 会议列表 -->
  <view class="meeting-list">
    <view
      v-for="(meeting, index) in hostedMeetingInfo"
      :key="index"
      class="meeting-item">
      <view class="date">{{ convertDateString(meeting.startTime) }}</view>
      <view class="meeting-details" @tap="goToMeetingShow(meeting.meetingId)">
        <view class="meeting-title">{{ meeting.meetingName }}</view>
        <view class="meeting-info">
          <view class="info-item">
            <uni-icons type="calendar" size="14" color="#666" />
            <text>时间：{{ meeting.startTime.slice(11, 16) }}</text>
          </view>
          <view class="info-item">
            <uni-icons type="person" size="14" color="#666" />
            <text>发起人：{{ meeting.organizerUid }}</text>
          </view>
        </view>
      </view>
      <view
        @tap="uploadFile(meeting.meetingId, meeting.meetingName)"
        class="upload">
        <uni-icons type="folder-add" size="24" color="#999" class="more-icon" />
        <text class="upload-text">上传附件</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
/* 会议列表 */
.meeting-list {
  margin-top: 16px;
}

.meeting-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  background-color: #f7f8fa;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: transform 0.2s, box-shadow 0.2s;
  .upload {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-items: center;
    justify-content: center;
    margin-left: 16px;
    .upload-text {
      // text-align: center;
      font-size: 20rpx;
    }
  }
}

.meeting-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.date {
  font-size: 12px;
  color: var(--text-light);
  min-width: 80px;
}

.meeting-details {
  flex: 1;
  margin-left: 16px;
}

.meeting-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 8px;
}

.meeting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: var(--text-light);
}

.info-item uni-icons {
  margin-right: 4px;
}

.more-icon {
  cursor: pointer;
  transition: color 0.2s;
}

.more-icon:hover {
  color: var(--primary-color);
}
</style>
