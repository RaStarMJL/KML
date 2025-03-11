<template>
	<view class="aihelper-container">
		<view class="header">
			<text class="header-title">AI助手</text>
		</view>

		<view class="aihelper-content">
			<text class="description">欢迎使用AI助手，您可以在这里获取智能建议和帮助。</text>
			<view class="input-area">
				<input v-model="userInput" class="input-box" placeholder="请输入您的问题..." />
				<button class="submit-btn" @click="getResponse">提交</button>
			</view>
			<view class="response-area" v-if="response">
				<text class="response-title">AI助手回复：</text>
				<text class="response-body">{{ response }}</text>
			</view>
		</view>

		<!-- 新增按钮区域 -->
		<view class="button-grid">
			<view class="button-item" @click="navigateTo('feature1')">
				<uni-icons type="star" size="40" color="#2B58F9"></uni-icons>
				<text>功能1</text>
			</view>
			<view class="button-item" @click="navigateTo('feature2')">
				<uni-icons type="chat" size="40" color="#2B58F9"></uni-icons>
				<text>功能2</text>
			</view>
			<view class="button-item" @click="navigateTo('feature3')">
				<uni-icons type="settings" size="40" color="#2B58F9"></uni-icons>
				<text>功能3</text>
			</view>
			<view class="button-item" @click="navigateTo('feature4')">
				<uni-icons type="info" size="40" color="#2B58F9"></uni-icons>
				<text>功能4</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInput: '',
				response: ''
			}
		},
		methods: {
			getResponse() {
				// 模拟AI助手的回复
				this.response = `您问的是：${this.userInput}，这是AI助手的回复。`;
				this.userInput = ''; // 清空输入框
			},
			navigateTo(feature) {
				// 根据功能名称进行导航
				uni.navigateTo({
					url: `/pages/${feature}/${feature}`
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.aihelper-container {
		min-height: 100vh;
		background: #f5f6f7;
		padding: 20rpx;
		display: flex;
		flex-direction: column;
		justify-content: flex-start; /* 改为向上对齐 */
		margin-top: 20rpx; /* 增加顶部间距 */
	}

	.header {
		background: #2B58F9;
		padding: 20rpx;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.header-title {
		font-size: 36rpx;
		color: #fff;
		text-align: center;
	}

	.aihelper-content {
		background: #fff;
		border-radius: 12rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.description {
		font-size: 28rpx;
		color: #666;
		margin-bottom: 20rpx;
		text-align: center;
	}

	.input-area {
		display: flex;
		margin-bottom: 20rpx;
		justify-content: center;
	}

	.input-box {
		flex: 1;
		padding: 10rpx;
		border: 1rpx solid #ccc;
		border-radius: 8rpx;
		margin-right: 10rpx;
	}

	.submit-btn {
		background: #2B58F9;
		color: #fff;
		border: none;
		border-radius: 8rpx;
		padding: 10rpx 20rpx;
		cursor: pointer;
		transition: background 0.3s;
	}

	.submit-btn:hover {
		background: #1a3d8f; /* 悬停效果 */
	}

	.response-area {
		margin-top: 20rpx;
	}

	.response-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
	}

	.response-body {
		font-size: 26rpx;
		color: #666;
	}

	.button-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
		margin-top: 30rpx;
	}

	.button-item {
		background: #fff;
		border-radius: 12rpx;
		padding: 20rpx;
		text-align: center;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		cursor: pointer;
		transition: transform 0.2s;
	}

	.button-item:hover {
		transform: scale(1.05); /* 悬停放大效果 */
	}

	.button-item text {
		margin-top: 10rpx;
		font-size: 24rpx;
		color: #333;
	}
</style>
