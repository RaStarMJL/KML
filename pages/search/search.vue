<script setup lang="ts">
import { ref } from "vue";
const localuserid = "U1001";//uni.getStorageSync("userId");
const localusername = "zyh";//uni.getStorageSync("username");

const searchText = ref("");
// 历史搜索记录
const historyList = ref([
]);
// 猜你想搜
const suggestList = ref([
]);
// 热点推荐
const hotList = ref([
  { id: 1, title: "", views: "" },
  { id: 2, title: "", views: "" },
  { id: 3, title: "", views: "" },
  { id: 4, title: "", views: "" },
  { id: 5, title: "", views: "" },
  { id: 6, title: "", views: "" },
  { id: 7, title: "", views: "" },
  { id: 8, title: "", views: "" },
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

//获取热点
const getHotList = () => {
  uni.request({
    url: "http://192.168.31.115:5000/usersearch?UserId=" + localuserid,
    method: "GET",
    success: (res) => {
      console.log("成功获取到热点");
      console.log(res);
      res.data.data.forEach((item: any,index:number) => {
       if(hotList.value[index]){
        hotList.value[index].title = item.searchQuery;
        hotList.value[index].views = item.id;
       }
      });
    },
    fail: (err) => {
      console.log("获取热点失败");
    }
  });
};

//获取猜你想搜
const getSuggestList = () => {
  uni.request({
    url: "http://192.168.31.115:5000/usersearch?UserId=" + localuserid,
    method: "GET",
    success:(res:any)=>{
      console.log("成功获取到猜你想搜");
      console.log(res);
      res.data.data.forEach((item: any) => {
        suggestList.value.push(item.searchQuery);
      });
    },
    fail: (err) => {
      console.log("获取猜你想搜失败");
    }
  });
};

//获取历史记录
const getHistoryList = () => {
  uni.request({
    url: "http://192.168.31.115:5000/usersearch?UserId=" + localuserid,
    method: "GET",
    success: (res: any) => {
    console.log("成功获取历史搜索记录");
    console.log(res);
    res.data.data.forEach((item: any) => {
      historyList.value.push(item.searchQuery);
    });
    },
    fail: (err) => {
      console.log("获取历史搜索记录失败");
    }
  });
};



//点击历史记录-->搜索历史记录
const clickHistory = (item) => {
  clickSearch(item);
};

//点击猜你想搜-->搜索猜你想搜
const clickSuggest = (item) => {
  clickSearch(item);
};

//点击热点推荐-->搜索热点推荐
const clickHot = (item) => {
  clickSearch(item.title);
};

const clickSearch = (item) => {
  console.log(item);
};

getHistoryList()
getSuggestList()
getHotList()
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
        <text class="tag" v-for="(item, index) in historyList" :key="index" @click="clickHistory(item)">{{
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
        <text class="tag" v-for="(item, index) in suggestList" :key="index" @click="clickSuggest(item)">{{
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
        <view class="hot-item" v-for="(item, index) in hotList" :key="item.id" @click="clickHot(item)">
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
