<template>
  <view class="container">
    <view class="search-bar">
      <input type="text" placeholder="会议名称、会议室、会议号、发起人" />
    </view>
    <view class="meeting-list">
      <view
        v-for="(meeting, index) in meetings"
        :key="index"
        class="meeting-item">
        <view class="date">{{ meeting.date }}</view>
        <view class="meeting-details">
          <view class="meeting-title">{{ meeting.title }}</view>
          <view class="meeting-info">
            <text>时间：{{ meeting.time }}</text>
            <text>发起人：{{ meeting.initiator }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";

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

<style scoped>
.container {
  padding: 10px;
}

.search-bar input {
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.meeting-list {
  margin-top: 10px;
}

.meeting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.date {
  font-size: 12px;
  color: #999;
}

.meeting-details {
  flex-grow: 1;
  margin-left: 10px;
}

.meeting-title {
  font-weight: bold;
}

.meeting-info text {
  display: block;
  font-size: 12px;
  color: #666;
}
</style>
