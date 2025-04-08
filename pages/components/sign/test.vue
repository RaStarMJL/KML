<template>
	<view class="test-container">
		<view class="role-section">
			<text class="role-text">当前身份：{{ isHost ? '主持人' : '参会者' }}</text>
		</view>
		
		<view class="button-group">
			<button class="test-btn" @click="switchRole">
				切换身份 (当前: {{ isHost ? '主持人' : '参会者' }})
			</button>
			
			<button class="test-btn primary" @click="goToSignPage">
				进入{{ isHost ? '发起' : '参与' }}签到页面
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isHost: true, // 默认为主持人身份
				meetingId: '123211', // 测试用的会议ID
				meetingname: '气垫船大会'
			}
		},
		methods: {
			// 切换身份
			switchRole() {
				this.isHost = !this.isHost;
			},
			
			// 跳转到签到页面
			goToSignPage() {
				uni.navigateTo({
					url: `/pages/sign/sign?role=${this.isHost ? 'host' : 'attendee'}&meetingId=${this.meetingId}&meetingname=${this.meetingname}`
				});
			}
		}
	}
</script>

<style lang="scss">
.test-container {
	padding: 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 40rpx;
}

.role-section {
	background: #f5f6f7;
	padding: 20rpx 40rpx;
	border-radius: 16rpx;
	
	.role-text {
		font-size: 32rpx;
		color: #333;
		font-weight: 500;
	}
}

.button-group {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.test-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	text-align: center;
	font-size: 32rpx;
	border-radius: 44rpx;
	background: #fff;
	color: #666;
	border: 2rpx solid #eee;
	
	&.primary {
		background: linear-gradient(135deg, #2B58F9, #1a3d8f);
		color: #fff;
		border: none;
		box-shadow: 0 6rpx 20rpx rgba(43, 88, 249, 0.2);
	}
	
	&:active {
		transform: scale(0.98);
	}
}
</style>
