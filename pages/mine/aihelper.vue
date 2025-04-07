<template>
	<view class="page-container">
		<!-- 标题区 -->
		<view class="title-section">
			<view class="title-wrapper">
				<view class="title-icon">
					<uni-icons type="robot" size="24" color="#4080FF"></uni-icons>
				</view>
				<text class="main-title">AI助手</text>
				<view class="title-badge">
					<text>4</text>
				</view>
			</view>
			<view class="title-divider"></view>
		</view>

		<!-- 卡片列表 -->
		<view class="card-list">
			<!-- 功能用例AI助手 -->
			<view class="ai-card" @click="navigateTo('aimanage')">
				<view class="card-header">
					<image class="card-avatar" src="/src/static/images/function-ai.png" mode="aspectFill"></image>
					<view class="header-content">
						<text class="card-title">通用型AI助手</text>
						<text class="card-date"></text>
					</view>
				</view>
				
				<view class="card-desc">
					<text>可以快速创建、加入会议</text>
				</view>
				
				<view class="card-footer">
					<view class="left-tags">
						<text class="tag blue">创建会议</text>
						<text class="tag green">加入会议</text>
					</view>
					<view class="right-info">
						<view class="info-item">
							<img src="/src/static/images/aiicon2.png" class="info-text">
						</view>
						<view class="info-divider"></view>
					</view>
				</view>
				
				
			</view>

			<!-- 北京定制化版本库 -->
			<view class="ai-card" @click="navigateTo('aicheckout')">
				<view class="card-header">
					<image class="card-avatar" src="/src/static/images/aicheckout.png" mode="aspectFill"></image>
					<view class="header-content">
						<text class="card-title">文档管理型AI助手</text>
						<text class="card-date"></text>
					</view>
				</view>
				
				<view class="card-desc">
					<text>通过文档管理型AI,可以快速获取总结性文档内容</text>
				</view>
				
				<view class="card-footer">
					<view class="left-tags">
						<text class="tag blue">文档管理</text>
						<text class="tag green">总结性文档</text>
					</view>
					<view class="right-info">
						<view class="info-item">
							<img src="/src/static/images/aiicon.png" class="info-text">
						</view>
						<view class="info-divider"></view>
					</view>
				</view>
				
				
			</view>

			<!-- 排班智能体 -->
			<view class="ai-card" @click="navigateTo('aiSchedule')">
				<view class="card-header">
					<image class="card-avatar" src="/static/images/ai/schedule-ai.png" mode="aspectFill"></image>
					<view class="header-content">
						<text class="card-title">智能体1</text>
						<text class="card-date"></text>
					</view>
				</view>
				
				<view class="card-desc">
					<text>暂未开发</text>
				</view>
				
				<view class="card-footer">
					<view class="left-tags">
						<text class="tag blue">智能体1</text>
						<text class="tag gray">智能体1</text>
					</view>
					<view class="right-info">
						<view class="info-item">
							
						</view>
						<view class="info-divider"></view>
					</view>
				</view>
				
				
			</view>

			<!-- Debug子生成模块代码 -->
			<view class="ai-card" @click="navigateTo('aiDebug')">
				<view class="card-header">
					<image class="card-avatar" src="/static/images/ai/debug-ai.png" mode="aspectFill"></image>
					<view class="header-content">
						<text class="card-title">智能体2</text>
						<text class="card-date"></text>
					</view>
				</view>
				
				<view class="card-desc">
					<text>暂未开发</text>
				</view>
				
				<view class="card-footer">
					<view class="left-tags">
						<text class="tag blue">智能体2</text>
						<text class="tag gray">智能体2</text>
					</view>
					<view class="right-info">
						<view class="info-item">
						
						</view>
						<view class="info-divider"></view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
			}
		},
		methods: {
			navigateTo(aiType) {
				uni.navigateTo({
					url: `/pages/mine/aidetail/`+aiType
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
.page-container {
	min-height: 100vh;
	background-color: #F5F7FA;
}

/* 标题区样式 */
.title-section {
	padding: 30rpx 40rpx 20rpx;
	background-color: #fff;
	border-bottom: 1px solid #EEEEEE;
}

.title-wrapper {
	display: flex;
	align-items: center;
	position: relative;
}

.title-icon {
	margin-right: 16rpx;
	background: linear-gradient(135deg, #4080FF, #2B58F9);
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 8rpx rgba(64, 128, 255, 0.2);
}

.main-title {
	font-size: 40rpx;
	font-weight: bold;
	background: linear-gradient(135deg, #4080FF, #2B58F9);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
	letter-spacing: 2rpx;
}

.title-badge {
	position: absolute;
	right: 0;
	background-color: #FF6B6B;
	border-radius: 30rpx;
	padding: 4rpx 16rpx;
	min-width: 40rpx;
	text-align: center;
	box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.3);
}

.title-badge text {
	color: #FFFFFF;
	font-size: 24rpx;
	font-weight: bold;
}

.title-divider {
	height: 6rpx;
	width: 100rpx;
	background: linear-gradient(to right, #4080FF, transparent);
	border-radius: 3rpx;
	margin-top: 16rpx;
}

/* 卡片列表样式 */
.card-list {
	padding: 20rpx;
	display: flex;
	flex-direction: column;
	gap: 50rpx;
}

.ai-card {
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(136, 182, 243, 0.692);
	position: relative;
}

.card-header {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx;
	padding: 6rpx 0;
}

.card-avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 16rpx;
	margin-right: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.01);
	transition: transform 0.3s ease;
}

.header-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 8rpx;
}

.card-title {
	font-size: 32rpx;
	color: #333;
	font-weight: 600;
}

.card-date {
	font-size: 24rpx;
	color: #999;
}

.card-star {
	font-size: 40rpx;
	color: #DDDDDD;
	margin-left: 10rpx;
}

.card-desc {
	margin-bottom: 30rpx;
	padding: 0 10rpx;
}

.card-desc text {
	font-size: 30rpx;
	color: #666;
	line-height: 1.6;
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
}

.card-footer {
	display: flex;
	justify-content: space-between;
	margin-bottom: 24rpx;
	padding: 0 10rpx;
}

.left-tags {
	display: flex;
	gap: 16rpx;
}

.tag {
	font-size: 26rpx;
	padding: 6rpx 16rpx;
	border-radius: 6rpx;
	
	&.blue {
		background-color: rgba(64, 128, 255, 0.1);
		color: #4080FF;
	}
	
	&.gray {
		background-color: rgba(153, 153, 153, 0.1);
		color: #999;
	}
	
	&.green {
		background-color: rgba(13, 206, 90, 0.1);
		color: #0DCE5A;
	}
}

.right-info {
	display: flex;
	align-items: center;
}

.info-item {
	display: flex;
	align-items: center;
}

.info-text {
	width: 40rpx;
	height: 40rpx;
	font-size: 26rpx;
	color: #999;
}

.info-divider {
	width: 2rpx;
	height: 24rpx;
	background-color: #EEE;
	margin: 0 16rpx;
}

.detail-link {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding: 10rpx 10rpx 0;
	border-top: 1px solid #F5F5F5;
}

.detail-link text {
	font-size: 26rpx;
	color: #4080FF;
	margin-right: 8rpx;
}
</style>
