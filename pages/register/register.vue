<template>
  <view class="register-container">
    <!-- 背景遮罩 -->
    <view class="background-overlay"></view>

    <!-- 主要内容区 -->
    <scroll-view scroll-y class="content-wrapper" :scroll-top="scrollTop">
      <!-- 顶部导航 -->
      <view class="nav-bar">
        <text class="page-title">注册账号</text>
      </view>

      <!-- 注册表单 -->
      <view
        class="register-box"
        :class="{ 'register-box-keyboard-open': isKeyboardOpen }">
        <view class="input-group">
          <view
            class="input-item"
            :class="{ active: activeInput === 'username' }">
            <uni-icons type="person" size="20" color="#666"></uni-icons>
            <input
              type="text"
              v-model="formData.username"
              placeholder="请输入用户名"
              placeholder-class="placeholder"
              @focus="handleFocus('username')"
              @blur="handleBlur"
              cursor-spacing="140" />
          </view>

          <view class="input-item" :class="{ active: activeInput === 'phone' }">
            <uni-icons type="phone" size="20" color="#666"></uni-icons>
            <input
              type="number"
              v-model="formData.phone"
              placeholder="请输入手机号"
              placeholder-class="placeholder"
              @focus="handleFocus('phone')"
              @blur="handleBlur"
              cursor-spacing="120" />
          </view>

          <view
            class="input-item"
            :class="{ active: activeInput === 'password' }">
            <uni-icons type="locked" size="20" color="#666"></uni-icons>
            <input
              type="password"
              v-model="formData.password"
              placeholder="请设置密码"
              placeholder-class="placeholder"
              @focus="handleFocus('password')"
              @blur="handleBlur"
              cursor-spacing="100" />
          </view>

          <view
            class="input-item"
            :class="{ active: activeInput === 'confirmPassword' }">
            <uni-icons type="locked" size="20" color="#666"></uni-icons>
            <input
              type="password"
              v-model="formData.confirmPassword"
              placeholder="请确认密码"
              placeholder-class="placeholder"
              @focus="handleFocus('confirmPassword')"
              @blur="handleBlur"
              cursor-spacing="80" />
          </view>

          <view
            class="input-item verification-code"
            :class="{ active: activeInput === 'code' }">
            <uni-icons type="email" size="20" color="#666"></uni-icons>
            <input
              type="number"
              v-model="formData.code"
              placeholder="请输入验证码"
              placeholder-class="placeholder"
              @focus="handleFocus('code')"
              @blur="handleBlur"
              cursor-spacing="60" />
            <button
              class="code-btn"
              :disabled="countdown > 0"
              @click="sendVerificationCode">
              {{ countdown > 0 ? `${countdown}s后重发` : "获取验证码" }}
            </button>
          </view>
        </view>

        <view class="agreement">
          <checkbox
            :checked="agreed"
            @click="toggleAgreement"
            color="#2B58F9"
            style="transform: scale(0.7)" />
          <text class="agreement-text"
            >我已阅读并同意<text class="link">《用户协议》</text>和<text
              class="link"
              >《隐私政策》</text
            ></text
          >
        </view>

        <button
          class="register-btn"
          @click="handleRegister"
          hover-class="btn-hover"
          :disabled="!agreed">
          注册
        </button>

        <view class="login-link">
          <text>已有账号？</text>
          <text class="link" @click="goToLogin">立即登录</text>
        </view>
      </view>

      <!-- 添加底部空白区域，确保键盘弹出时有足够的滚动空间 -->
      <view
        class="keyboard-space"
        v-if="isKeyboardOpen"
        :style="{ height: keyboardHeight + 'px' }"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { baseURL } from "/src/utils/http";

// 表单数据
const formData = reactive({
  username: "",
  phone: "",
  password: "",
  confirmPassword: "",
  code: "",
});

// 状态变量
const agreed = ref(false);
const countdown = ref(0);
const timer = ref(null);
const activeInput = ref("");
const isKeyboardOpen = ref(false);
const keyboardHeight = ref(0);
const scrollTop = ref(0);
const windowHeight = ref(0);
const generatedCode = ref(""); // 存储生成的验证码

// 生命周期钩子
onMounted(() => {
  // 获取窗口高度
  const sysInfo = uni.getSystemInfoSync();
  windowHeight.value = sysInfo.windowHeight;

  // 监听键盘高度变化
  uni.onKeyboardHeightChange((res) => {
    keyboardHeight.value = res.height;
    isKeyboardOpen.value = res.height > 0;

    if (isKeyboardOpen.value) {
      scrollTop.value = 100;
    }
  });
});

// 处理输入框获取焦点
const handleFocus = (inputName) => {
  activeInput.value = inputName;
  isKeyboardOpen.value = true;

  // 根据不同的输入框，设置不同的滚动位置
  setTimeout(() => {
    switch (inputName) {
      case "username":
        scrollTop.value = 100;
        break;
      case "phone":
        scrollTop.value = 150;
        break;
      case "password":
        scrollTop.value = 200;
        break;
      case "confirmPassword":
        scrollTop.value = 250;
        break;
      case "code":
        scrollTop.value = 300;
        break;
    }
  }, 100);
};

// 处理输入框失去焦点
const handleBlur = () => {
  activeInput.value = "";
  setTimeout(() => {
    isKeyboardOpen.value = false;
    scrollTop.value = 0; // 恢复滚动位置
  }, 200);
};

// 切换协议同意状态
const toggleAgreement = () => {
  agreed.value = !agreed.value;
};

// 生成随机验证码
const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// 发送验证码
const sendVerificationCode = () => {
  if (!formData.phone) {
    uni.showToast({
      title: "请输入手机号",
      icon: "none",
    });
    return;
  }

  // 验证手机号格式
  if (!/^1\d{10}$/.test(formData.phone)) {
    uni.showToast({
      title: "请输入正确的手机号",
      icon: "none",
    });
    return;
  }

  // 生成4位随机验证码
  generatedCode.value = generateVerificationCode();

  // 自动填充验证码到输入框
  formData.code = generatedCode.value;

  uni.showToast({
    title: "验证码：" + generatedCode.value,
    icon: "success",
    duration: 2000,
  });

  // 开始倒计时
  countdown.value = 60;
  if (timer.value) {
    clearInterval(timer.value);
  }

  timer.value = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer.value);
      timer.value = null;
    }
  }, 1000);
};

// 处理注册
const handleRegister = () => {
  // 表单验证
  if (!formData.username) {
    uni.showToast({
      title: "请输入用户名",
      icon: "none",
    });
    return;
  }

  if (!formData.phone) {
    uni.showToast({
      title: "请输入手机号",
      icon: "none",
    });
    return;
  }

  if (!formData.password) {
    uni.showToast({
      title: "请设置密码",
      icon: "none",
    });
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    uni.showToast({
      title: "两次密码输入不一致",
      icon: "none",
    });
    return;
  }

  if (!formData.code) {
    uni.showToast({
      title: "请输入验证码",
      icon: "none",
    });
    return;
  }

  // 验证验证码
  if (formData.code !== generatedCode.value) {
    uni.showToast({
      title: "验证码错误",
      icon: "none",
    });
    return;
  }

  if (!agreed.value) {
    uni.showToast({
      title: "请阅读并同意用户协议",
      icon: "none",
    });
    return;
  }

  // 显示加载提示
  uni.showLoading({
    title: "注册中...",
  });

  // 调用注册接口
  uni.request({
    url: baseURL + "login",
    method: "POST",
    data: {
      uid: `U${Date.now().toString().slice(-5)}`, // 生成一个简单的用户ID
      username: formData.username,
      password: formData.password,
      phone: formData.phone,
    },
    success: (res) => {
      uni.hideLoading();

      if (res.data && res.data.code === 1) {
        uni.showToast({
          title: "注册成功",
          icon: "success",
        });

        // 注册成功后延迟跳转到登录页
        setTimeout(() => {
          goToLogin();
        }, 1500);
      } else {
        uni.showToast({
          title: res.data?.msg || "注册失败",
          icon: "none",
        });
      }
    },
    fail: (err) => {
      console.error("注册失败:", err);
      uni.hideLoading();
      uni.showToast({
        title: "注册失败，请检查网络",
        icon: "none",
      });
    },
  });
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 跳转到登录页
const goToLogin = () => {
  uni.navigateBack();
};
</script>

<style lang="scss">
.register-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #2b58f9, #1a3d8f);
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
  box-sizing: border-box;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx;
  position: relative;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  margin-right: 60rpx; /* 为了平衡左侧的返回按钮 */
}

.register-box {
  width: 90%;
  margin: 20rpx auto;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &.register-box-keyboard-open {
    padding: 30rpx 20rpx;
    margin-bottom: 20rpx;
  }
}

.input-group {
  margin-bottom: 30rpx;
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

.verification-code {
  position: relative;

  .code-btn {
    position: absolute;
    right: 10rpx;
    top: 50%;
    transform: translateY(-50%);
    background: #2b58f9;
    color: #fff;
    font-size: 24rpx;
    padding: 10rpx 20rpx;
    border-radius: 8rpx;
    border: none;
    line-height: 1.5;

    &[disabled] {
      background: #ccc;
      color: #fff;
    }
  }
}

.placeholder {
  color: #999;
  font-size: 28rpx;
}

.agreement {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  padding: 0 10rpx;

  .agreement-text {
    font-size: 24rpx;
    color: #666;
  }

  .link {
    color: #2b58f9;
  }
}

.register-btn {
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

  &[disabled] {
    background: #ccc;
    color: #fff;
  }
}

.btn-hover {
  background: linear-gradient(135deg, #1a3d8f, #0f2a6a);
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.2);
}

.login-link {
  text-align: center;
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #666;

  .link {
    color: #2b58f9;
    margin-left: 10rpx;
  }
}

.keyboard-space {
  width: 100%;
  transition: height 0.3s ease;
}
</style>
