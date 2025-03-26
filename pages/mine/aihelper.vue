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
						<text class="card-title">普通AI助手</text>
						<text class="card-date">2025-03-19 20:37:15</text>
					</view>
					<text class="card-star">☆</text>
				</view>
				
				<view class="card-desc">
					<text>你是一个功能用例生成器</text>
				</view>
				
				<view class="card-footer">
					<view class="left-tags">
						<text class="tag blue">智能体应用</text>
						<text class="tag gray">低代码</text>
					</view>
					<view class="right-info">
						<view class="info-item">
							<text class="info-text">👨‍🏫 教师</text>
						</view>
						<view class="info-divider"></view>
						<view class="info-item">
							<text class="info-text">👁 44</text>
						</view>
					</view>
				</view>
				
				<view class="detail-link">
					<text>详情</text>
					<uni-icons type="right" size="14" color="#4080FF"></uni-icons>
				</view>
			</view>

			<!-- 北京定制化版本库 -->
			<view class="ai-card" @click="navigateTo('aicheckout')">
				<view class="card-header">
					<image class="card-avatar" src="/src/static/images/aicheckout.png" mode="aspectFill"></image>
					<view class="header-content">
						<text class="card-title">文档管理型AI</text>
						<text class="card-date">2025-03-19 20:24:50</text>
					</view>
					<text class="card-star">☆</text>
				</view>
				
				<view class="card-desc">
					<text>版本号管理，可以查询北京定制项目的版本号</text>
				</view>
				
				<view class="card-footer">
					<view class="left-tags">
						<text class="tag blue">智能体应用</text>
						<text class="tag green">零代码</text>
					</view>
					<view class="right-info">
						<view class="info-item">
							<text class="info-text">👨‍💼 运营</text>
						</view>
						<view class="info-divider"></view>
						<view class="info-item">
							<text class="info-text">👁 0</text>
						</view>
					</view>
				</view>
				
				<view class="detail-link">
					<text>详情</text>
					<uni-icons type="right" size="14" color="#4080FF"></uni-icons>
				</view>
			</view>

			<!-- 排班智能体 -->
			<view class="ai-card" @click="navigateTo('aiSchedule')">
				<view class="card-header">
					<image class="card-avatar" src="/static/images/ai/schedule-ai.png" mode="aspectFill"></image>
					<view class="header-content">
						<text class="card-title">排班智能体</text>
						<text class="card-date">2025-03-19 18:07:06</text>
					</view>
					<text class="card-star">☆</text>
				</view>
				
				<view class="card-desc">
					<text>该智能体支持通过输入网络空间人员清单文件和用户价值需求，经过深刻的分析和规划，输出高质量的价值表。每次...</text>
				</view>
				
				<view class="card-footer">
					<view class="left-tags">
						<text class="tag blue">智能体应用</text>
						<text class="tag gray">低代码</text>
					</view>
					<view class="right-info">
						<view class="info-item">
							<text class="info-text">👨‍💻 流量管理员</text>
						</view>
						<view class="info-divider"></view>
						<view class="info-item">
							<text class="info-text">👁 0</text>
						</view>
					</view>
				</view>
				
				<view class="detail-link">
					<text>详情</text>
					<uni-icons type="right" size="14" color="#4080FF"></uni-icons>
				</view>
			</view>

			<!-- Debug子生成模块代码 -->
			<view class="ai-card" @click="navigateTo('aiDebug')">
				<view class="card-header">
					<image class="card-avatar" src="/static/images/ai/debug-ai.png" mode="aspectFill"></image>
					<view class="header-content">
						<text class="card-title">debug子生成模块代码</text>
						<text class="card-date">2025-03-19 17:30:32</text>
					</view>
					<text class="card-star">☆</text>
				</view>
				
				<view class="card-desc">
					<text>根据系统模块名生成完整代码</text>
				</view>
				
				<view class="card-footer">
					<view class="left-tags">
						<text class="tag blue">智能体应用</text>
						<text class="tag gray">低代码</text>
					</view>
					<view class="right-info">
						<view class="info-item">
							<text class="info-text">👨‍💻 架构师</text>
						</view>
						<view class="info-divider"></view>
						<view class="info-item">
							<text class="info-text">👁 0</text>
						</view>
					</view>
				</view>
				
				<view class="detail-link">
					<text>详情</text>
					<uni-icons type="right" size="14" color="#4080FF"></uni-icons>
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
	gap: 30rpx;
}

.ai-card {
	background: #FFFFFF;
	border-radius: 16rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
	position: relative;
}

.card-header {
	display: flex;
	align-items: center;
	margin-bottom: 24rpx;
}

.card-avatar {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	margin-right: 20rpx;
}

.header-content {
	flex: 1;
}

.card-title {
	font-size: 36rpx;
	color: #333;
	font-weight: 500;
	margin-bottom: 8rpx;
	display: block;
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
