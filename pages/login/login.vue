<template>
  <view class="login-container">
    <view class="login-box">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
      <view class="title">欢迎登录</view>

      <view class="input-group">
        <view class="input-item">
          <uni-icons type="person" size="20"></uni-icons>
          <input type="text" v-model="username" placeholder="请输入用户名" />
        </view>
        <view class="input-item">
          <uni-icons type="locked" size="20"></uni-icons>
          <input type="password" v-model="password" placeholder="请输入密码" />
        </view>
      </view>

      <button class="login-btn" @click="handleLogin">登录</button>

      <view class="footer-links">
        <text @click="handleForgotPassword">忘记密码</text>
        <text @click="handleRegister">注册账号</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { useUserInfoStore } from "/src/stores/modules/userInfo";
import { TUIRoomEngine } from "@tencentcloud/tuiroom-engine-uniapp-app";
import { GETSdkAppIdSDKSECRETKEY } from "/src/services/login";
const username = ref("");
const password = ref("");
const userInfoStore = useUserInfoStore();
const handleLogin = () => {
  // 登录逻辑
  uni.showToast({
    title: "登录成功",
    icon: "success",
    duration: 2000,
    success: () => {
      console.log("登录成功");
      // TUIRoomEngine.once("ready", async () => {
      //   const roomEngine = new TUIRoomEngine();
      //   const res = await GETSdkAppIdSDKSECRETKEY();
      //   await TUIRoomEngine.login({
      //     sdkAppId: res.SDKAPPID, // 填写您申请的 sdkAppId
      //     userId: "1001", // 填写您业务对应的 userId
      //     userSig: "kml12138", // 填写服务器或本地计算的 userSig
      //   });
      // });
      // todo 登录并设置用户信息
      userInfoStore.setProfile({
        userName: "KML",
        userId: "1001",
        avatarUrl: "/src/static/images/ok.png",
        signature: "山风平平，湖水仄仄",
        token: "kml12138",
      });
      uni.reLaunch({
        url: "/pages/mine/mine",
      });
    },
  });
};

const handleForgotPassword = () => {
  uni.navigateTo({
    url: "/pages/forgot-password/forgot-password",
  });
};

const handleRegister = () => {
  uni.navigateTo({
    url: "/pages/register/register",
  });
};
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;

  .login-box {
    width: 80%;
    padding: 40rpx;
    background-color: #fff;
    border-radius: 20rpx;
    box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.1);

    .logo {
      width: 160rpx;
      height: 160rpx;
      margin: 0 auto 40rpx;
      display: block;
    }

    .title {
      font-size: 40rpx;
      font-weight: bold;
      text-align: center;
      margin-bottom: 60rpx;
      color: #333;
    }

    .input-group {
      margin-bottom: 40rpx;

      .input-item {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #eee;
        padding: 20rpx 0;
        margin-bottom: 20rpx;

        input {
          flex: 1;
          margin-left: 20rpx;
          font-size: 28rpx;
        }
      }
    }

    .login-btn {
      background-color: #007aff;
      color: #fff;
      border-radius: 40rpx;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 32rpx;
      margin: 40rpx 0;

      &:active {
        opacity: 0.8;
      }
    }

    .footer-links {
      display: flex;
      justify-content: space-between;
      font-size: 26rpx;
      color: #666;

      text {
        &:active {
          opacity: 0.6;
        }
      }
    }
  }
}
</style>
