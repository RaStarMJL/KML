<template>
	<view class="meeting-container">
		<!-- 顶部信息栏 -->
		<view class="header">
			<view class="title-section">
				<image class="logo" src="/static/images/logo.png" mode="aspectFit"></image>
				<view class="title-info">
					<text class="app-name">詹宇航</text>
					<text class="version">升级专业版</text>
				</view>
			</view>
			<view class="header-right">
				<view class="device-status">
					<text>Windows 已登录(未入会)</text>
				</view>
			</view>
		</view>

		<!-- 功能按钮区域 -->
		<view class="function-grid">
			<view class="function-item" @click="joinMeeting">
				<view class="icon-wrapper blue">
					<uni-icons type="plus" size="28" color="#FFFFFF"></uni-icons>
				</view>
				<text class="function-text">加入会议</text>
			</view>
			
			<view class="function-item" @click="quickMeeting">
				<view class="icon-wrapper blue">
					<uni-icons type="lightning" size="28" color="#FFFFFF"></uni-icons>
				</view>
				<text class="function-text">快速会议</text>
			</view>
			
			<view class="function-item" @click="scheduleMeeting">
				<view class="icon-wrapper blue">
					<uni-icons type="checkmarkempty" size="28" color="#FFFFFF"></uni-icons>
				</view>
				<text class="function-text">预定会议</text>
			</view>
			
			<view class="function-item" @click="shareScreen">
				<view class="icon-wrapper blue">
					<uni-icons type="upload" size="28" color="#FFFFFF"></uni-icons>
				</view>
				<text class="function-text">共享屏幕</text>
			</view>
		</view>

		<!-- 历史会议入口 -->
		<view class="history-section">
			<view class="history-header">
				<text>历史会议</text>
				<uni-icons type="right" size="16" color="#999"></uni-icons>
			</view>
		</view>

		<!-- 空状态提示 -->
		<view class="empty-state">
			<image class="empty-image" src="/static/images/empty.png" mode="aspectFit"></image>
			<text class="empty-text">暂无会议</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 加入会议
const joinMeeting = () => {
	uni.navigateTo({
		url: '/pages/meeting/joinMeeting'
	});
};

// 快速会议
const quickMeeting = () => {
	uni.navigateTo({
		url: '/pages/meeting/quickMeeting'
	});
};

// 预定会议
const scheduleMeeting = () => {
	uni.navigateTo({
		url: '/pages/meeting/scheduleMeeting'
	});
};

// 共享屏幕
const shareScreen = () => {
	uni.showToast({
		title: '共享屏幕功能开发中',
		icon: 'none'
	});
};
</script>

<style lang="scss">
.meeting-container {
	min-height: 100vh;
	background-color: #f5f6f7;
	padding: 20rpx;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 20rpx 0;
}

.title-section {
	display: flex;
	align-items: center;
}

.logo {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	margin-right: 20rpx;
}

.title-info {
	display: flex;
	flex-direction: column;
}

.app-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
}

.version {
	font-size: 24rpx;
	color: #666;
	margin-top: 4rpx;
}

.header-right {
	.device-status {
		font-size: 24rpx;
		color: #666;
	}
}

.function-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 30rpx;
	padding: 40rpx 20rpx;
}

.function-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;
	transition: transform 0.3s ease;
	
	&:active {
		transform: scale(0.95);
	}
}

.icon-wrapper {
	width: 120rpx;
	height: 120rpx;
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
	
	&.blue {
		background: linear-gradient(135deg, #0066ff, #0052cc);
		box-shadow: 0 8rpx 16rpx rgba(0, 102, 255, 0.2);
		
		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: linear-gradient(rgba(255, 255, 255, 0.1), transparent);
			border-radius: 24rpx;
		}
		
		&:active {
			box-shadow: 0 4rpx 8rpx rgba(0, 102, 255, 0.15);
			transform: translateY(2rpx);
		}
	}
}

.function-text {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
	transition: color 0.3s ease;
}

.function-item:active .function-text {
	color: #0066ff;
}

.history-section {
	margin: 20rpx;
	background-color: #fff;
	border-radius: 24rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
	transition: all 0.3s ease;
	
	&:active {
		transform: scale(0.99);
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}
}

.history-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	
	text {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
	opacity: 0.8;
	transition: opacity 0.3s ease;
	
	&:active {
		opacity: 0.6;
	}
}

.empty-image {
	width: 240rpx;
	height: 240rpx;
	margin-bottom: 30rpx;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
	letter-spacing: 2rpx;
}
</style>
