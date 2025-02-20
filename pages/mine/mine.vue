<script setup lang="ts">
import { ref } from 'vue';
import { TUIUserService } from '@tencentcloud/chat-uikit-engine';

interface UserInfo {
  avatarUrl: string;
  username: string;
  id: string;
  signature:string;
}

const userInfo = ref<UserInfo>({
  avatarUrl: '/src/static/icons/tab/ok.png',
  username: 'zyh',
  id: '0001',
  signature:'山风平平，湖水仄仄',
});



// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await TUIUserService.getUserProfile();
    if(res?.data) {
      userInfo.value = {
        avatarUrl: res.data.avatar || '/src/static/icons/tab/ok.png',  
        username: res.data.nick || res.data.id,
        id: res.data.id,
		    signature:res.data.signature || '这个人很懒什么都没留下..'
      };
    }
  } catch(error) {
    console.warn('获取用户信息失败:', error);
  }
};

//消息
const message = () =>{
  uni.navigateTo(
    {
      url:'/pages/mine/message'
    }
  )
}


//我的资料
const myInfo = () => {
  uni.navigateTo({
    url: '/pages/mine/myInfo'
  });
}

//小功能页面跳转
const To = (page:string):void =>{
  uni.navigateTo(
    {
      url:'/pages/mine/'+ page
    }
  )

}

//会议设置
const meetingSetting = () =>{
  uni.navigateTo({
    url:'/pages/mine/meetingSetting'
  })
}

//账号与安全
const accountSecurity = () =>{
  uni.navigateTo({
    url:'/pages/mine/accountSecurity'
  })
}

//关于我们
const aboutUs = () =>{
  uni.navigateTo({
    url:'/pages/mine/aboutUs'
  })
}
// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗?',
    success: (res: UniApp.ShowModalRes) => {
      if(res.confirm) {
        uni.reLaunch({
          url: '/pages/login/login'//返回到登录页面
        });
      }
    }
  });
};


// 页面加载时获取用户信息
getUserInfo();


</script>

<template>
  <div class="user-info-container">
    <!-- 顶部用户信息 -->
    <div class="user-header">
      <!-- 添加一个包装器来实现相对定位 -->
      <div class="header-wrapper">
        <!-- 消息图标和我的资料 -->
        <div class='header-right'>
          <div class='message-icon' @click="message">
            <uni-icons custom-prefix="iconfont" type="email" size="30"></uni-icons>
          </div>
          <div class="profile-link" @click="myInfo">
            <text>我的资料</text>
            <uni-icons type="arrowright" size="14" color="#666"></uni-icons>
          </div>
        </div>
        
        <div class="user-info">
          <image :src="userInfo.avatarUrl" class="avatar"></image>
          <div class="info-right">
            <text class="username">{{ userInfo.username }}</text>
            <div class="user-type">
              <text class="user-signature">签名：{{userInfo.signature}}</text>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 会议信息 -->
    <div class="meeting-info">
        <text>参会提醒</text>
        <uni-icons type="arrowright" size="20"></uni-icons>
    </div>

    <!-- 功能区域 -->
    <div class="feature-grid">
		
      <div class="feature-item" v-for="(item, index) in [
		    {icon: 'ai', text: 'AI小助手',page:'aihelper'},
        {icon: 'meeting', text: '个人会议室',page:'meeting'},
        {icon: 'record', text: '录制',page:'record'},
        {icon: 'note', text: '我的笔记',page:'note'},
      ]" :key="index">
        <image :src="`/src/static/icons/tab/${item.icon}.svg`" class="feature-icon"  @click =To(item.page)></image>
        <text class="feature-text" @click =To(item.page)>{{ item.text }}</text>
      </div>
    </div>

    <!-- 设置项 -->
    <div class="settings-list">
      <div class="settings-item" @click="meetingSetting">
        <text>会议设置</text>
        <uni-icons type="arrowright" size="20"></uni-icons>
      </div>
      <div class="settings-item" @click="accountSecurity">
        <text>账号与安全</text>
       <uni-icons type="arrowright" size="20"></uni-icons>
      </div>
      <div class="settings-item" @click="aboutUs">
        <text>关于我们</text>
        <uni-icons type="arrowright" size="20"></uni-icons>
      </div>
    </div>

    <!-- 添加退出登录按钮 -->
    <div class="logout-wrapper">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </div>
	
  </div>
</template>

<style scoped>

	
.user-info-container {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding: 20rpx;
  padding-bottom: 120rpx; /* 增加底部间距 */
}

.user-header {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.header-wrapper {
  position: relative; /* 添加相对定位 */
}

.header-right {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-icon {
  padding: 10rpx;
}

.profile-link {
  display: flex;
  align-items: center;
  padding: 10rpx;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #666;
}

.profile-link text {
  margin-right: 4rpx;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  padding-right: 120rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background-color: #f5f6f7; /* 添加背景色，防止头像加载前显示空白 */
}

.info-right {
  margin-left: 20rpx;
}

.username {
  font-size: 36rpx;
  font-weight: 500;
  margin-bottom: 10rpx;
}

.user-type {
  display: flex;
  align-items: center;
  margin-top: 5rpx;
}

.type-tag {
  background-color: #f0f1f2;
  color: #666;
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
  margin-right: 20rpx;
}

.user-signature {
  color: #666;
  font-size: 18rpx;
}

.meeting-info {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;  
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 30rpx;
  margin-bottom: 20rpx;
}

.meeting-types {
  margin-bottom: 30rpx;
}

.type-item {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.type-title {
  font-size: 28rpx;
  color: #333;
}

.upgrade-btn {
  background-color: #0052d9;
  color: #ffffff;
  text-align: center;
  padding: 20rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rpx;
  background-color: #ffffff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 0;
}

.feature-icon {
  width: 56rpx;
  height: 56rpx;
  margin-bottom: 16rpx;
}

.feature-text {
  font-size: 26rpx;
  color: #333;
}

.settings-list {
  background-color: #ffffff;
  border-radius: 12rpx;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f6f7;
}

.item-right {
  display: flex;
  align-items: center;
}



.right-icon {
  width: 32rpx;
  height: 32rpx;
}

.right-icon-small {
  width: 24rpx;
  height: 24rpx;
}

.info-icon {
  width: 28rpx;
  height: 28rpx;
  margin-left: 10rpx;
}

/* 添加退出登录按钮样式 */
.logout-wrapper {
  padding: 40rpx 20rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  background-color: #ffffff;
  color: #ff584c;
  font-size: 32rpx;
  border-radius: 12rpx;
  border: none;
}


.meeting-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  margin-bottom: 20rpx;
}
</style>
