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
const meetings = ref([
  {
    date: "2月20日 周四",
    title: "梦见离的快速会议",
    time: "15:22",
    initiator: "梦见离",
  },
  {
    date: "2月19日 周三",
    title: "梦见离的快速会议",
    time: "23:10",
    initiator: "梦见离",
  },
  {
    date: "2月17日 周一",
    title: "梦见离的快速会议",
    time: "19:58",
    initiator: "梦见离",
  },
  {
    date: "1月2日 周四",
    title: "梦见离预定的会议",
    time: "19:51",
    initiator: "梦见离",
  },
  {
    date: "11月20日 周三",
    title: "梦见离的快速会议",
    time: "20:55",
    initiator: "梦见离",
  },
]);
</script>

<template>
  <!-- 会议列表 -->
  <view class="meeting-list">
    <view
      v-for="(meeting, index) in hostedMeetingInfo"
      :key="index"
      @tap="goToMeetingShow(meeting.meetingId)"
      class="meeting-item">
      <view class="date">{{ convertDateString(meeting.startTime) }}</view>
      <view class="meeting-details">
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
      <uni-icons type="more" size="18" color="#999" class="more-icon" />
    </view>
  </view>
</template>

<style scoped>
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
  margin-left: 16px;
  cursor: pointer;
  transition: color 0.2s;
}

.more-icon:hover {
  color: var(--primary-color);
}
</style>
