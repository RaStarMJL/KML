<template>
  <view class="account-security">
    <!-- 我的认证 -->
    <view class="section-title">我的认证</view>
    <view class="auth-card">
      <view class="auth-info">
        <image
          :src="userInfoStore.userInfo.avatarUrl"
          class="auth-avatar"></image>
        <view class="auth-detail">
          <view class="auth-name">{{ userInfoStore.userInfo.userNme }}</view>
          <view class="auth-type">
            <image
              src="/src/static/icons/tab/verify.png"
              class="verify-icon"></image>
            职业/达人身份
            <image src="/static/images/info.png" class="info-icon"></image>
          </view>
        </view>
      </view>

      <!-- 认证展示开关 -->
      <view class="auth-display">
        <view class="display-left">
          <view class="display-title"> 对外展示认证身份 </view>
          <view class="display-preview">
            <image src="/static/images/preview.png" class="preview-img"></image>
          </view>
        </view>
        <switch class="display-switch" color="#2B58F9" />
      </view>

      <!-- 认证状态 -->
      <view class="auth-status">
        <view class="status-text">尚未进行身份认证</view>
        <view class="status-btn">前往认证 ></view>
      </view>
    </view>

    <!-- 账号信息 -->
    <view class="section-title">账号信息</view>
    <view class="account-list">
      <view class="account-item">
        <text>手机号</text>
        <view class="item-right">
          <text class="phone-number">点击绑定</text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="account-item">
        <text>邮箱</text>
        <view class="item-right">
          <text class="email">点击绑定</text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="account-item">
        <text>微信</text>
        <view class="item-right">
          <text class="wechat">点击绑定</text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="account-item">
        <text>登录密码</text>
        <text class="arrow">></text>
      </view>

      <view class="account-item">
        <text>登录设备</text>
        <text class="arrow">></text>
      </view>
    </view>
  </view>
</template>

<script>
import { useUserInfoStore } from "/src/stores/modules/userInfo";
export default {
  data() {
    return {
      userInfoStore: useUserInfoStore(),
    };
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.account-security {
  min-height: 100vh;
  background: #f5f6f7;
  padding: 20rpx;
}

.section-title {
  font-size: 28rpx;
  color: #666;
  margin: 20rpx 0;
}

.auth-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.auth-info {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.auth-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #f5f6f7; /* 添加背景色，防止头像加载前显示空白 */
}

.auth-detail {
  flex: 1;
}

.auth-name {
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 8rpx;
  margin-left: 20rpx;
}

.auth-type {
  font-size: 24rpx;
  color: #999;
  display: flex;
  align-items: center;
}

.verify-icon,
.info-icon {
  width: 28rpx;
  height: 28rpx;
  margin: 0 8rpx;
}

.auth-display {
  background: #f8f9fc;
  border-radius: 8rpx;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30rpx;
}

.display-left {
  flex: 1;
}

.display-title {
  font-size: 28rpx;
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.display-tag {
  font-size: 20rpx;
  color: #2b58f9;
  background: rgba(43, 88, 249, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  margin-left: 12rpx;
}

.display-desc {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.preview-img {
  width: 100%;
  height: 160rpx;
  border-radius: 8rpx;
}

.auth-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
}

.status-text {
  color: #999;
}

.status-btn {
  color: #2b58f9;
}

.account-list {
  background: #fff;
  border-radius: 12rpx;
}

.account-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  font-size: 28rpx;
  border-bottom: 1rpx solid #f5f6f7;

  &:last-child {
    border-bottom: none;
  }
}

.item-right {
  display: flex;
  align-items: center;
  color: #999;
}

.arrow {
  color: #999;
  margin-left: 10rpx;
}

.phone-number,
.email,
.wechat {
  margin-right: 10rpx;
}
</style>
