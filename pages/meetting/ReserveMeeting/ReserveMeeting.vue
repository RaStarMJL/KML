<template>
  <view class="history-container" :style="safeArea">
    <!-- 顶部标题 -->
    <!-- <uni-nav-bar
      title="历史会议"
      left-icon="back"
      @clickLeft="goBack"
      background-color="#409EFF"
      color="#fff" /> -->

    <!-- 时间筛选 -->
    <view class="filter-section">
      <picker mode="date" :value="filterDate" @change="filterMeetings">
        <view class="date-picker">
          <text>{{ filterDate || "选择日期" }}</text>
          <uni-icons type="arrowdown" size="14" color="#666"></uni-icons>
        </view>
      </picker>
    </view>

    <!-- 会议列表 -->
    <scroll-view scroll-y class="meeting-list">
      <!-- 空状态 -->
      <view v-if="meetings.length === 0" class="empty-state">
        <image src="/static/images/empty.png" class="empty-image"></image>
        <text class="empty-text">暂无会议记录</text>
      </view>

      <!-- 会议卡片 -->
      <view
        v-for="(meeting, index) in meetings"
        :key="meeting.id"
        class="meeting-card"
        :class="{ 'last-item': index === meetings.length - 1 }"
        @click="viewDetail(meeting.meetingId)">
        <view class="card-content">
          <view class="card-header">
            <text class="meeting-title">{{ meeting.meetingName }}</text>
            <view
              class="status-tag"
              :class="getStatusClass(meeting.meetingStatus)">
              {{ getStatusText(meeting.meetingStatus) }}
            </view>
          </view>

          <view class="card-body">
            <view class="info-item">
              <uni-icons type="calendar" size="16" color="#888"></uni-icons>
              <text class="info-text">{{ getDate(meeting.startTime) }}</text>
            </view>

            <view class="info-item">
              <uni-icons type="location" size="16" color="#888"></uni-icons>
              <text class="info-text">{{ meeting.meetingLocation }}</text>
            </view>

            <view class="info-item">
              <uni-icons type="person" size="16" color="#888"></uni-icons>
              <text class="info-text">{{ meeting.organizerUid }}</text>
            </view>
          </view>

          <view class="card-footer">
            <text class="time-text">{{
              getDurationTime(meeting.startTime, meeting.endTime)
            }}</text>
            <uni-icons type="arrowright" size="16" color="#999"></uni-icons>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import {
  api_getHistoryMeetings,
  api_getUserHostedMeetings,
} from "/src/services/api";
import { useUserInfoStore } from "/src/stores/modules/userInfo";
export default {
  data() {
    return {
      filterDate: "",
      refreshing: false,
      meetings: [],
      safeArea: {},
    };
  },
  async created() {
    // 获取距离顶部的安全距离
    const safeArea = uni.getSystemInfoSync().safeArea;
    this.safeArea = {
      paddingTop: safeArea.top + "px",
    };
    const userId = useUserInfoStore().userInfo.userId;
    const res = await api_getHistoryMeetings(userId);
    this.meetings = res.data;
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },

    filterMeetings(e) {
      this.filterDate = e.detail.value;
      uni.showLoading({ title: "筛选中..." });
      setTimeout(() => {
        uni.hideLoading();
        if (this.filterDate) {
          console.log(this.filterDate);
          this.meetings = this.meetings.filter((item) => {
            const itemDate = this.getDate(item.startTime);
            return itemDate === this.filterDate;
          });
        } else {
          this.resetMeetings();
        }
      }, 500);
    },

    onRefresh() {
      this.refreshing = true;
      setTimeout(() => {
        this.resetMeetings();
        this.refreshing = false;
        uni.showToast({ title: "刷新成功", icon: "success" });
      }, 1000);
    },

    resetMeetings() {
      // 刷新数据
    },
    // 获取日期
    getDate(date) {
      return date.slice(0, 10);
    },
    getDurationTime(startTime, endTime) {
      const start = startTime.slice(11, 16);
      const end = endTime.slice(11, 16);
      return `${start} - ${end}`;
    },
    viewDetail(meetingId) {
      uni.navigateTo({
        url: `/pages/recommend/meetingshow?meetingId=${meetingId}`,
      });
    },

    getStatusClass(status) {
      const map = {
        Ended: "status-success",
        Waiting: "status-error",
        Ongoing: "status-warning",
      };
      return map[status] || "status-default";
    },
    getStatusText(status) {
      const map = {
        Ended: "已结束",
        Waiting: "待开始",
        Ongoing: "进行中",
      };
      return map[status] || status;
    },
  },
};
</script>

<style lang="scss">
/* 确保所有容器都有正确的盒模型 */
view,
scroll-view {
  box-sizing: border-box;
}

.history-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  overflow-x: hidden;
}

.filter-section {
  padding: 15px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  width: 100%;

  .date-picker {
    width: calc(100% - 20px);
    margin: 0 auto;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  width: 100%;

  .empty-image {
    width: 120px;
    height: 120px;
    margin-bottom: 20px;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 14px;
    color: #999;
  }
}

.meeting-list {
  flex: 1;
  padding: 10px 0;
  width: 100%;
}

.meeting-card {
  width: calc(100% - 30px);
  margin: 0 auto 12px auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s;

  &.last-item {
    margin-bottom: 0;
  }

  &:active {
    transform: scale(0.98);
  }
}

.card-content {
  padding: 16px;
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.meeting-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  flex-shrink: 0;

  &.status-success {
    background: rgba(153, 153, 153, 0.1);
    color: #999;
  }

  &.status-error {
    background: rgba(43, 88, 249, 0.1);
    color: #2b58f9;
  }

  &.status-warning {
    background: rgba(82, 196, 26, 0.1);
    color: #52c41a;
  }

  &.status-default {
    background-color: #f2f6fc;
    color: #909399;
  }
}

.card-body {
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-text {
  font-size: 14px;
  color: #666;
  margin-left: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.time-text {
  font-size: 13px;
  color: #999;
}
</style>
