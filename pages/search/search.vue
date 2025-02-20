<script setup lang="ts">
import { ref } from "vue";
const searchText = ref("");
// 历史搜索记录
const historyList = ref([
  "泡小芙",
  "grok3测试翻车",
  "杨丞琳力挺妍希",
  "赵露思开工状态",
]);

// 猜你想搜
const suggestList = ref([
  "阿姨三角洲行动",
  "迈入g7",
  "组装厂密码门",
  "江科网红先野",
]);

// 热点推荐
const hotList = ref([
  { id: 1, title: "习近平：希望民企先富带共富", views: "12141万" },
  { id: 2, title: "苹果发布iPhone 16e", views: "11774万" },
  { id: 3, title: "乌民谈谈美使谈判：乌只是棋子", views: "11383万" },
  { id: 4, title: "余承东直播尊贵技术发布会", views: "11275万" },
  { id: 5, title: "哪吒2回应预售全球动画票房榜", views: "10427万" },
  { id: 6, title: "刘诗诗将所持股权转让给吴奇隆", views: "10342万" },
  { id: 7, title: "周星驰经纪人否认郑恺峰投资传闻", views: "9201万" },
]);

// 清除历史记录
const clearHistory = () => {
  uni.showModal({
    title: "提示",
    content: "确定要清除全部历史记录吗？",
    success: (res) => {
      if (res.confirm) {
        historyList.value = [];
      }
    },
  });
};

// 返回上一页
const handleSearch = () => {
  historyList.value.push(searchText.value);
  console.log("搜索", searchText.value);
  searchText.value = "";
};
</script>

<template>
  <view class="search-page">
    <!-- 搜索栏 -->
    <view class="search-header">
      <view class="search-bar">
        <uni-icons type="search" size="20" color="#666"></uni-icons>
        <input type="text" placeholder="搜索会议" focus v-model="searchText" />
      </view>
      <text class="cancel-btn" @tap="handleSearch">搜索</text>
    </view>

    <!-- 历史搜索 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">历史记录</text>
        <uni-icons
          type="trash"
          size="18"
          color="#999"
          @click="clearHistory"></uni-icons>
      </view>
      <view class="tag-list">
        <text class="tag" v-for="(item, index) in historyList" :key="index">{{
          item
        }}</text>
      </view>
    </view>

    <!-- 猜你想搜 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">猜你想搜</text>
        <uni-icons type="reload" size="18" color="#999"></uni-icons>
      </view>
      <view class="tag-list">
        <text class="tag" v-for="(item, index) in suggestList" :key="index">{{
          item
        }}</text>
      </view>
    </view>

    <!-- 热点推荐 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热点推荐</text>
      </view>
      <view class="hot-list">
        <view class="hot-item" v-for="(item, index) in hotList" :key="item.id">
          <view class="hot-rank" :class="{ topThree: index < 3 }">
            {{ index + 1 }}
          </view>
          <view class="hot-content">
            <text class="hot-title">{{ item.title }}</text>
            <text class="hot-views">{{ item.views }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.search-page {
  min-height: 100vh;
  background-color: #fff;
  padding-top: var(--status-bar-height);
}

.search-header {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
}

.search-bar {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f5f6f7;
  border-radius: 32rpx;
  padding: 12rpx 24rpx;
  margin-right: 20rpx;
}

.search-bar input {
  flex: 1;
  margin-left: 16rpx;
  font-size: 28rpx;
}

.cancel-btn {
  font-size: 28rpx;
  color: #666;
}

.section {
  padding: 30rpx 20rpx;
  border-bottom: 1rpx solid #f5f6f7;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.tag {
  padding: 10rpx 20rpx;
  background-color: #f5f6f7;
  border-radius: 26rpx;
  font-size: 26rpx;
  color: #666;
}

.hot-list {
  display: flex;
  flex-direction: column;
}

.hot-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
}

.hot-rank {
  width: 40rpx;
  font-size: 30rpx;
  font-weight: bold;
  color: #999;
  text-align: center;
}

.topThree {
  color: #ff584c;
}

.hot-content {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hot-title {
  font-size: 28rpx;
  color: #333;
}

.hot-views {
  font-size: 24rpx;
  color: #999;
}
</style>
