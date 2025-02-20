<template>
	<view class="page-container">
		<!-- 背景图片 -->
		<view class="background-container" @click="changeBackground">
			<image :src="userInfo.backgroundUrl" mode="aspectFill" class="background-image"></image>
			<view class="change-bg-text">
				<uni-icons type="camera-filled" size="16" color="#fff"></uni-icons>
				<text>点击设置背景图片</text>
			</view>
		</view>

		<!-- 头像 -->
		<view class="avatar-container" @click="changeAvatar">
			<image :src="userInfo.avatarUrl" class="avatar"></image>
			<view class="avatar-edit-hint">
				<uni-icons type="camera-filled" size="20" color="#fff"></uni-icons>
			</view>
		</view>

		<!-- 用户信息列表 -->
		<view class="info-list">
			<view class="info-item" hover-class="item-hover" @click="changeUsername">
				<text class="item-label">名称</text>
				<view class="item-content">
					<text>{{ userInfo.username }}</text>
					<uni-icons type="arrowright" size="16" color="#999"></uni-icons>
				</view>
			</view>

			<view class="info-item" hover-class="item-hover" @click="changeSignature">
				<text class="item-label">签名</text>
				<view class="item-content">
					<text>{{ userInfo.signature }}</text>
					<uni-icons type="arrowright" size="16" color="#999"></uni-icons>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { TUIUserService } from '@tencentcloud/chat-uikit-engine';

interface UserInfo {
	username: string;
	signature: string;
	backgroundUrl: string;
	avatarUrl: string;
}

const userInfo = ref<UserInfo>({
	username: '詹宇航',
	signature: '山风平平，湖水仄仄',
	backgroundUrl: '/static/default-bg.jpg',
	avatarUrl: '/src/static/icons/tab/ok.png'  // 默认头像
});

// 修改用户名
const changeUsername = () => {
	uni.showModal({
		title: '修改名称',
		editable: true,
		placeholderText: '请输入新的名称',
		success: (res) => {
			if (res.confirm && res.content) {
				userInfo.value.username = res.content;
			}
		}
	});
};

// 修改签名
const changeSignature = () => {
	uni.showModal({
		title: '修改签名',
		editable: true,
		placeholderText: '请输入新的签名',
		success: (res) => {
			if (res.confirm && res.content) {
				userInfo.value.signature = res.content;
			}
		}
	});
};

// 更换背景图片
const changeBackground = () => {
	uni.chooseImage({
		count: 1,
		success: (res) => {
			userInfo.value.backgroundUrl = res.tempFilePaths[0];
		}
	});
};

// 更换头像
const changeAvatar = () => {
	uni.chooseImage({
		count: 1,
		success: (res) => {
			userInfo.value.avatarUrl = res.tempFilePaths[0];
		}
	});
};


const getUserInfo = async () => {
	const res = await TUIUserService.getUserProfile();
	if(res?.data) {
		userInfo.value = {
			username: res.data.nick || res.data.id,	
			signature: res.data.signature || '这个人很懒什么都没留下..',
			backgroundUrl: res.data.avatar || '/static/default-bg.jpg',
			avatarUrl: res.data.avatar || '/src/static/icons/tab/ok.png'
		}
	}
}
getUserInfo();
</script>

<style scoped>
.page-container {
	min-height: 100vh;
	background-color: #f5f6f7;
}

.background-container {
	position: relative;
	height: 400rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	background-color: #666;
}

.background-image {
	width: 100%;
	height: 100%;
	transition: transform 0.3s ease;
}

.background-container:active .background-image {
	transform: scale(1.05);
}

.change-bg-text {
	position: absolute;
	bottom: 20rpx;
	right: 20rpx;
	color: #fff;
	font-size: 24rpx;
	padding: 10rpx 20rpx;
	background-color: rgba(0, 0, 0, 0.5);
	border-radius: 30rpx;
	display: flex;
	align-items: center;
	gap: 6rpx;
	backdrop-filter: blur(10px);
	transition: all 0.3s ease;
}

.change-bg-text:active {
	transform: scale(0.95);
	background-color: rgba(0, 0, 0, 0.7);
}

.avatar-container {
	position: absolute;
	top: 300rpx;
	left: 40rpx;
	z-index: 1;
}

.avatar {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	border: 6rpx solid #fff;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
	transition: transform 0.3s ease;
}

.avatar-container:active .avatar {
	transform: scale(0.95);
}

.avatar-edit-hint {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 50rpx;
	height: 50rpx;
	background-color: rgba(0, 0, 0, 0.6);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 4rpx solid #fff;
	backdrop-filter: blur(4px);
}

.info-list {
	background-color: #fff;
	margin: 100rpx 20rpx 0;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
	overflow: hidden;
}

.info-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #f5f6f7;
	position: relative;
	transition: all 0.3s ease;
}

.info-item::after {
	content: '';
	position: absolute;
	left: 0;
	bottom: 0;
	width: 0;
	height: 2rpx;
	background-color: #0052d9;
	transition: width 0.3s ease;
}

.info-item:active::after {
	width: 100%;
}

.item-hover {
	background-color: #f9f9f9;
}

.item-label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.item-content {
	display: flex;
	align-items: center;
	color: #666;
	font-size: 28rpx;
}

.item-content text {
	margin-right: 10rpx;
}

/* 添加最后一个项目的特殊样式 */
.info-item:last-child {
	border-bottom: none;
}

/* 添加点击波纹效果 */
@keyframes ripple {
	to {
		transform: scale(2);
		opacity: 0;
	}
}

.info-item:active::before {
	content: '';
	position: absolute;
	left: 50%;
	top: 50%;
	width: 100rpx;
	height: 100rpx;
	background-color: rgba(0, 82, 217, 0.1);
	border-radius: 50%;
	transform: translate(-50%, -50%) scale(0);
	animation: ripple 0.6s ease-out;
}
</style>
