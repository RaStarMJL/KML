<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { TUIUserService } from "@tencentcloud/chat-uikit-engine";
import tabber from "../components/tabbar/tabbar.vue";
import { onShow } from "@dcloudio/uni-app";
import { useUserInfoStore } from "/src/stores/modules/userInfo";
interface UserInfo {
  avatarUrl: string;
  username: string;
  id: string;
  signature: string;
}

//
const subtitleText = ref("hhhhh");

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync();
const defaultAvatar = "/src/static/images/defaultAvatar.png";

const userInfoStore = useUserInfoStore();
const isDot = computed(() => userInfoStore.isunread);
const value = ref(0);
// 用户信息，使用计算属性来响应式获取 store 中的数据
const userInfo = computed(() => ({
  avatarUrl: userInfoStore.userInfo?.avatarUrl || defaultAvatar,
  username: userInfoStore.userInfo?.userName || "未登录",
  id: userInfoStore.userInfo?.userId || "",
  signature: userInfoStore.userInfo?.signature || "这个人很懒，什么都没有留下",
}));

// 功能列表
const features = ref([
  { icon: "ai", text: "AI助手", page: "aihelper" },
  { icon: "record", text: "录制", page: "record" },
  { icon: "note", text: "我的笔记", page: "note" },

  { icon: "message", text: "参会提醒", page: "message" },
  { icon: "favorite", text: "收藏", page: "favorite" },
  { icon: "history", text: "历史", page: "history" },
]);

// 将自定义图标映射到uni-icons类型
const getIconType = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    message: "notification",
    record: "videocam",
    note: "compose",
    ai: "help",
    favorite: "star",
    history: "calendar",
  };

  return iconMap[iconName] || "help";
};

//消息
const message = () => {
  userInfoStore.setIsUnread(false);
  console.log(userInfoStore.isunread);
  uni.navigateTo({
    url: "/pages/mine/message",
  });
};

//我的资料
const myInfo = () => {
  uni.navigateTo({
    url: "/pages/mine/myInfo",
  });
};


//小功能页面跳转
const To = (page) => {
  uni.navigateTo({
    url: "/pages/mine/" + page,
  });
};

//会员升级
const upgradeVip = () => {
  uni.showToast({
    title: "即将推出，敬请期待",
    icon: "none",
  });
};

//会议设置
const meetingSetting = () => {
  uni.navigateTo({
    url: "/pages/mine/meetingSetting",
  });
};

//账号与安全
const accountSecurity = () => {
  uni.navigateTo({
	  //url:'/pages/uploadfile/test'
    url: "/pages/uploadfile/uploadfile?meetingId=M1741876012965&meetingName=南华大学",
  });
};

//关于我们
const aboutUs = () => {
  uni.navigateTo({
    url: "/pages/mine/aboutUs",
  });
};

// 退出登录
const handleLogout = () => {
  if (userInfoStore.isLoggedIn) {
    uni.showModal({
      title: "提示",
      content: "确定要退出登录吗?",
      success: (res) => {
        if (res.confirm) {
          userInfoStore.clearProfile();
          uni.reLaunch({
            url: "/pages/mine/mine", //返回到登录页面
          });
        }
      },
    });
  } else {
    console.log(111);
    uni.navigateTo({
      url: "/pages/login/login",
    });
  }
};

// 跳转到登录页面
const handleLogin = () => {};

// 计算屏幕可用高度
const calculateScreenHeight = () => {};
</script>

<template>
  <kml-agent :x="0" :y="600" :isDock="true"> </kml-agent>
  <view
    class="mine-container"
    :style="{ paddingTop: safeAreaInsets.top + 'px' }">
    <!-- 顶部用户信息 -->
    <view class="user-header">
      <!-- 添加一个包装器来实现相对定位 -->
      <view class="header-wrapper">
        <view class="user-info">
          <image
            class="user-avatar"
            :src="userInfo.avatarUrl"
            mode="aspectFill"></image>
          <view class="user-details">
            <text class="username">{{ userInfo.username }}</text>
            <text class="user-id" v-if="userInfoStore.isLoggedIn"
              >ID: {{ userInfo.id }}</text
            >
          </view>
        </view>

        <!-- 只有登录后才显示这些操作按钮 -->
        <view class="header-actions" v-if="userInfoStore.isLoggedIn">
          <view class="action-item">
            <uni-badge
              v-if="isDot"
              :is-dot="true"
              absolute="rightTop"
              size="small"
              :text="value.toString()">
              <uni-icons
                type="notification"
                size="24"
                color="#fff"
                @click="message"></uni-icons>
            </uni-badge>
            <uni-icons
              v-else
              type="notification"
              size="24"
              color="#fff"
              @click="message"></uni-icons>
          </view>
          <view class="action-item" @click="myInfo">
            <uni-icons type="gear" size="24" color="#fff"></uni-icons>
          </view>
        </view>
      </view>

      <!-- 用户签名 -->
      <view class="user-signature">
        <text>{{ userInfo.signature }}</text>
      </view>
    </view>

    <!-- 只有登录后才显示会员卡片和功能区域 -->
    <template v-if="userInfoStore.isLoggedIn">
      <!-- 会员卡片 -->
      <view class="vip-card">
        <view class="vip-info">
          <view class="vip-title">
            <uni-icons type="star-filled" size="24" color="#fff"></uni-icons>
            <text>免费会员</text>
          </view>
          <text class="vip-desc">升级会员享受更多特权</text>
        </view>
        <view class="upgrade-btn" @click="upgradeVip">立即升级</view>
      </view>

      <!-- 功能区域 -->
      <view class="feature-section">
        <view class="section-title">
          <text>常用功能</text>
        </view>

        <view class="feature-grid">
          <!-- AI助手 -->
          <view class="feature-item" @click="To('aihelper')">
            <view class="feature-icon-wrapper">
              <uni-icons type="help" size="28" color="#4075FF"></uni-icons>
            </view>
            <text class="feature-text">AI助手</text>
          </view>

          <!-- 录制 -->
          <view class="feature-item" @click="To('record')">
            <view class="feature-icon-wrapper">
              <uni-icons type="videocam" size="28" color="#4075FF"></uni-icons>
            </view>
            <text class="feature-text">录制</text>
          </view>

          <!-- 我的笔记 -->
          <view class="feature-item" @click="To('note')">
            <view class="feature-icon-wrapper">
              <uni-icons type="compose" size="28" color="#4075FF"></uni-icons>
            </view>
            <text class="feature-text">我的笔记</text>
          </view>

          <!-- 参会提醒 -->
          <view class="feature-item" @click="To('message')">
            <view class="feature-icon-wrapper">
              <uni-badge
                v-if="isDot"
                :is-dot="true"
                absolute="rightTop"
                size="small"
                :text="value.toString()">
                <uni-icons
                  type="notification"
                  size="28"
                  color="#4075FF"></uni-icons>
              </uni-badge>
              <uni-icons
                v-else
                type="notification"
                size="28"
                color="#4075FF"></uni-icons>
            </view>
            <text class="feature-text">参会提醒</text>
          </view>

          <!-- 收藏 -->
          <view class="feature-item" @click="To('favorite')">
            <view class="feature-icon-wrapper">
              <uni-icons type="star" size="28" color="#4075FF"></uni-icons>
            </view>
            <text class="feature-text">收藏</text>
          </view>

          <!-- 历史 -->
          <view class="feature-item" @click="To('history')">
            <view class="feature-icon-wrapper">
              <uni-icons type="calendar" size="28" color="#4075FF"></uni-icons>
            </view>
            <text class="feature-text">历史</text>
          </view>
        </view>
      </view>

      <!-- 设置列表 -->
      <view class="settings-section">
        <view class="section-title">
          <text>设置</text>
        </view>

        <view class="settings-list">
          <view class="settings-item" @click="meetingSetting">
            <text>会议设置</text>
            <view class="item-right">
              <uni-icons type="right" size="16" color="#CCCCCC"></uni-icons>
            </view>
          </view>

          <view class="settings-item" @click="accountSecurity">
            <text>账号与安全</text>
            <view class="item-right">
              <uni-icons type="right" size="16" color="#CCCCCC"></uni-icons>
            </view>
          </view>

          <view class="settings-item" @click="aboutUs">
            <text>关于我们</text>
            <view class="item-right">
              <uni-icons type="right" size="16" color="#CCCCCC"></uni-icons>
            </view>
          </view>
        </view>
      </view>
    </template>

    <!-- 根据登录状态显示不同的按钮 -->
    <view class="logout-wrapper">
      <button
        class="logout-btn"
        :class="{ 'login-btn': !userInfoStore.isLoggedIn }"
        @click="handleLogout">
        {{ userInfoStore.isLoggedIn ? "退出登录" : "立即登录" }}
      </button>
    </view>

    <!-- 底部导航栏 -->
    <tabber currentPath="/pages/mine/mine"></tabber>
  </view>
</template>

<style lang="scss" scoped>
.mine-container {
  // height: calc(100vh - 120rpx - env(safe-area-inset-top));
  background-color: #f5f6f7;
  padding-bottom: 120rpx;
}

.user-header {
  background: linear-gradient(135deg, #4075ff, #3060e0);
  padding: 40rpx 30rpx 50rpx;
  border-radius: 0 0 30rpx 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(64, 117, 255, 0.2);
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    bottom: -100rpx;
    right: -100rpx;
    width: 300rpx;
    height: 300rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    z-index: 1;
  }

  &::before {
    content: "";
    position: absolute;
    top: -50rpx;
    left: -50rpx;
    width: 200rpx;
    height: 200rpx;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    z-index: 1;
  }
}

.header-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgb(255, 255, 255);
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

.user-details {
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.username {
  font-size: 36rpx;
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 6rpx;
}

.user-id {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.header-actions {
  display: flex;
}

.action-item {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10rpx;
}

.user-signature {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  z-index: 2;
  position: relative;
}

.vip-card {
  margin: -30rpx 30rpx 30rpx;
  background: linear-gradient(135deg, #ffd700, #ffa500);
  border-radius: 20rpx;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(255, 165, 0, 0.2);
  position: relative;
  z-index: 10;
}

.vip-info {
  display: flex;
  flex-direction: column;
}

.vip-title {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;

  text {
    font-size: 32rpx;
    color: #fff;
    font-weight: 600;
    margin-left: 10rpx;
  }
}

.vip-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.upgrade-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  text-align: center;
  padding: 15rpx 30rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
    background-color: rgba(255, 255, 255, 0.3);
  }
}

.section-title {
  padding: 30rpx 30rpx 20rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.feature-section,
.settings-section {
  margin-bottom: 30rpx;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  margin: 0 30rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 0;
  transition: all 0.3s;

  &:active {
    transform: scale(0.95);
  }
}

.feature-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: rgba(64, 117, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.feature-text {
  font-size: 26rpx;
  color: #333;
}

.settings-list {
  background-color: #ffffff;
  border-radius: 20rpx;
  margin: 0 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f6f7;
  font-size: 30rpx;
  color: #333;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: #f9f9f9;
  }
}

.item-right {
  display: flex;
  align-items: center;
}

.logout-wrapper {
  padding: 40rpx 30rpx 80rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background-color: #ffffff;
  color: #ff584c;
  font-size: 32rpx;
  border-radius: 44rpx;
  border: none;

  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  &:active {
    background-color: #f9f9f9;
  }
}

// 添加登录按钮样式
.login-btn {
  background: linear-gradient(135deg, #4075ff, #3060e0) !important;
  color: #ffffff !important;
}
</style>
