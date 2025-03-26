<template>
  <view class="login-container">
    <!-- 背景遮罩 -->
    <view class="background-overlay"></view>

    <!-- 主要内容区 -->
    <scroll-view
      scroll-y
      class="content-wrapper"
      :scroll-top="scrollTop"
      :style="{ height: windowHeight + 'px' }">
      <!-- Logo区域 -->
      <view
        class="logo-area"
        :class="{ 'fade-in-down': showLoginBox, 'logo-small': isKeyboardOpen }">
        <image
          class="app-logo"
          src="/src/static/images/app.jpg"
          mode="aspectFill"></image>
        <text class="app-name">智慧会议</text>
        <text class="app-slogan" v-if="!isKeyboardOpen"
          >让会议更高效，沟通更便捷</text
        >
      </view>

      <!-- 登录框 -->
      <view
        class="login-box"
        :class="{
          'fade-in-up': showLoginBox,
          'login-box-keyboard-open': isKeyboardOpen,
        }">
        <view class="welcome-text" v-if="!isKeyboardOpen">
          <text class="title">欢迎回来</text>
          <text class="subtitle">请登录您的账号</text>
        </view>

        <view class="input-group">
          <view
            class="input-item"
            :class="{ active: activeInput === 'username' }">
            <uni-icons type="person" size="20" color="#666"></uni-icons>
            <input
              type="text"
              v-model="username"
              placeholder="请输入用户名"
              placeholder-class="placeholder"
              @focus="handleFocus('username')"
              @blur="handleBlur"
              cursor-spacing="140"
              :adjust-position="false" />
          </view>
          <view
            class="input-item"
            :class="{ active: activeInput === 'password' }">
            <uni-icons type="locked" size="20" color="#666"></uni-icons>
            <input
              type="password"
              v-model="password"
              placeholder="请输入密码"
              placeholder-class="placeholder"
              @focus="handleFocus('password')"
              @blur="handleBlur"
              cursor-spacing="80"
              :adjust-position="false" />
          </view>
        </view>

        <button class="login-btn" @click="handleLogin" hover-class="btn-hover">
          <text>登录</text>
          <uni-icons type="arrowright" size="18" color="#fff"></uni-icons>
        </button>

        <view class="login-options">
          <text class="option-text">忘记密码?</text>
          <text class="option-text" @click="goToRegister">注册账号</text>
        </view>
      </view>

      <!-- 添加底部空白区域，确保键盘弹出时有足够的滚动空间 -->
      <view
        class="keyboard-space"
        v-if="isKeyboardOpen"
        :style="{ height: keyboardHeight + 'px' }"></view>

      <view
        class="footer-text"
        :class="{ 'fade-in': showLoginBox, 'footer-hidden': isKeyboardOpen }">
        <text>智慧会议 © 2025</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { login } from "/src/services/api";
import { useUserInfoStore } from "/src/stores/modules/userInfo";
// import { useBasicStore } from "/src/roomkit/TUIRoom/stores/basic";
// import { useRoomStore } from "/src/roomkit/TUIRoom/stores/room";
export default {
  data() {
    return {
      username: "",
      password: "",
      activeInput: "",
      showLoginBox: false,
      rememberPassword: false,
      autoLogin: false,
      loginMethod: "password", // 'password' 或 'code'
      countdown: 0,
      timer: null,
      isLoading: false,
      isKeyboardOpen: false,
      keyboardHeight: 0,
      scrollTop: 0,
      windowHeight: 0,
      systemInfo: null,
    };
  },
  onLoad() {
    // 获取系统信息
    this.systemInfo = uni.getSystemInfoSync();
    this.windowHeight = this.systemInfo.windowHeight;
  },
  mounted() {
    // 延迟显示登录框，添加动画效果
    setTimeout(() => {
      this.showLoginBox = true;
    }, 200);

    // 检查是否有保存的登录信息
    const savedUsername = uni.getStorageSync("savedUsername");
    const savedPassword = uni.getStorageSync("savedPassword");
    const rememberPassword = uni.getStorageSync("rememberPassword");

    if (savedUsername) {
      this.username = savedUsername;
      if (rememberPassword && savedPassword) {
        this.password = savedPassword;
        this.rememberPassword = true;
      }
    }

    // 获取窗口高度
    if (!this.systemInfo) {
      this.systemInfo = uni.getSystemInfoSync();
      this.windowHeight = this.systemInfo.windowHeight;
    }

    // 监听键盘高度变化
    uni.onKeyboardHeightChange((res) => {
      console.log("键盘高度变化:", res.height);
      this.keyboardHeight = res.height;
      this.isKeyboardOpen = res.height > 0;

      // 键盘弹出时，滚动到合适位置
      if (this.isKeyboardOpen) {
        // 根据当前激活的输入框调整滚动位置
        if (this.activeInput === "username") {
          this.scrollTop = this.windowHeight * 0.2;
        } else if (this.activeInput === "password") {
          this.scrollTop = this.windowHeight * 0.3;
        }
      } else {
        this.scrollTop = 0;
      }
    });
  },
  methods: {
    // 处理输入框获取焦点
    handleFocus(inputName) {
      console.log("输入框获取焦点:", inputName);
      this.activeInput = inputName;
      this.isKeyboardOpen = true;

      // 设置滚动位置，确保输入框在键盘上方
      setTimeout(() => {
        if (inputName === "username") {
          this.scrollTop = this.windowHeight * 0.2;
        } else if (inputName === "password") {
          this.scrollTop = this.windowHeight * 0.3;
        }
      }, 100);
    },

    // 处理输入框失去焦点
    handleBlur() {
      console.log("输入框失去焦点");
      this.activeInput = "";
      setTimeout(() => {
        this.isKeyboardOpen = false;
        this.scrollTop = 0; // 恢复滚动位置
      }, 200);
    },

    // 处理登录
    async handleLogin() {
      // 表单验证
      if (!this.username) {
        uni.showToast({
          title: "请输入用户名",
          icon: "none",
        });
        return;
      }

      if (this.loginMethod === "password" && !this.password) {
        uni.showToast({
          title: "请输入密码",
          icon: "none",
        });
        return;
      }

      // 显示加载状态
      this.isLoading = true;

      // 保存登录信息
      if (this.rememberPassword) {
        uni.setStorageSync("savedUsername", this.username);
        uni.setStorageSync("savedPassword", this.password);
      } else {
        uni.removeStorageSync("savedPassword");
        uni.removeStorageSync("rememberPassword");
      }

      const res = await login({
        username: this.username,
        pwd: this.password,
      });
      this.isLoading = false;

      if (res && res.code === 1) {
        // 登录成功
        uni.showToast({
          title: "登录成功",
          icon: "success",
        });

        // 保存用户信息
        if (res.data) {
          console.log(res.data);
          const userInfoStore = useUserInfoStore();
          userInfoStore.setProfile({
            userName: res.data.username,
            userId: res.data.uid,
            avatarUrl: res.data.avatarUrl,
            signature: res.data.signature,
            backgroundUrl: res.data.backUrl,
          });
        }

        // 跳转到推荐页面
        setTimeout(() => {
          uni.redirectTo({
            url: "/pages/recommend/recommend",
          });
        }, 1000);
      } else {
        // 登录失败
        uni.showToast({
          title: res.data?.msg || "登录失败，请检查网络",
          icon: "none",
        });
      }
    },

    // 忘记密码
    forgotPassword() {
      uni.showToast({
        title: "忘记密码功能开发中",
        icon: "none",
      });
    },

    // 注册新账号
    goToRegister() {
      uni.navigateTo({
        url: "/pages/register/register",
      });
    },
  },
};
</script>

<style lang="scss">
.login-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2b58f9, #1a3d8f);
  padding: 0;
  box-sizing: border-box;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url("/src/static/images/login.jpg") no-repeat center center;
  background-size: cover;
  opacity: 0.2;
  z-index: 1;
}

.content-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
  box-sizing: border-box;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 100rpx;
  margin-bottom: 60rpx;
  transition: all 0.3s ease;

  &.logo-small {
    margin-top: 40rpx;
    margin-bottom: 20rpx;
    transform: scale(0.8);
  }

  .app-logo {
    width: 160rpx;
    height: 160rpx;
    border-radius: 40rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
  }

  .app-name {
    font-size: 48rpx;
    font-weight: bold;
    color: #fff;
    margin-bottom: 10rpx;
    text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
  }

  .app-slogan {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
  }
}

.login-box {
  width: 90%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &.login-box-keyboard-open {
    padding: 30rpx;
    margin-bottom: 20rpx;
  }
}

.welcome-text {
  text-align: center;
  margin-bottom: 40rpx;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
    display: block;
  }

  .subtitle {
    font-size: 24rpx;
    color: #666;
  }
}

.input-group {
  margin-bottom: 40rpx;
}

.input-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  transition: all 0.3s ease;

  &.active {
    border-color: #2b58f9;
    box-shadow: 0 0 0 2rpx rgba(43, 88, 249, 0.1);
  }

  uni-icons {
    margin-right: 20rpx;
  }

  input {
    flex: 1;
    font-size: 28rpx;
    color: #333;
  }
}

.placeholder {
  color: #999;
  font-size: 28rpx;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2b58f9, #1a3d8f);
  color: #fff;
  font-size: 32rpx;
  border-radius: 12rpx;
  border: none;
  text-align: center;
  transition: all 0.3s ease;

  text {
    margin-right: 10rpx;
  }
}

.btn-hover {
  background: linear-gradient(135deg, #1a3d8f, #0f2a6a);
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
}

.login-options {
  display: flex;
  justify-content: space-between;
  margin-top: 30rpx;

  .option-text {
    font-size: 24rpx;
    color: #666;
    transition: color 0.3s;

    &:hover {
      color: #2b58f9;
    }
  }
}

.keyboard-space {
  width: 100%;
  transition: height 0.3s ease;
}

.footer-text {
  width: 100%;
  padding: 40rpx 0;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  opacity: 0;
  transition: all 0.3s ease;

  &.footer-hidden {
    opacity: 0;
    height: 0;
    padding: 0;
  }
}

// 动画类
.fade-in-down {
  animation: fadeInDown 0.6s ease forwards;
}

.fade-in-up {
  animation: fadeInUp 0.6s ease forwards;
}

.fade-in {
  animation: fadeIn 0.8s ease forwards;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
