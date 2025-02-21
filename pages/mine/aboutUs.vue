<template>
	<view class="about-container">
		<image class="background-image" src="/src/static/images/abus-bg.jpg" mode="aspectFill" />
		<view class="content-wrapper">
			<view class="title-wrapper">
				<image 
					src="/src/static/images/kml.jpg" 
					class="title-image"
					mode="aspectFit"
				/>
			</view>
			
			<view class="team-section">
				<!-- 团队成员卡片 -->
				<view class="member-card" v-for="(member, index) in teamMembers" :key="index">
					<view class="avatar-wrapper">
						<image 
							:src="member.avatar" 
							class="avatar"
							:style="{ animationDelay: index * 0.2 + 's' }"
							mode="aspectFill"
						/>
					</view>
					<view class="member-info" :style="{ animationDelay: (index * 0.2 + 0.1) + 's' }">
						<text class="name">{{ member.name }}</text>
						<text class="role">{{ member.role }}</text>
						<text class="description">{{ member.description }}</text>
					</view>
				</view>
			</view>

			<view class="version-info">
				<text class="version">版本 1.0.0</text>
				<text class="copyright">© 2024 TUIRoom Team. All rights reserved.</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				teamMembers: [
					{
						avatar: '/src/static/images/zyh.jpg',
						name: '詹宇航',
						role: '前端开发',
						description: '负责项目的整体前端规划和前端架构设计，带领团队完成核心功能开发。专注于提升用户体验和产品性能。'
					},
					{
						avatar: '/src/static/images/zsl.jpg',
						name: '张世亮',
						role: '前端开发',
						description: '主要负责用户界面设计和前端功能实现，专注于组件开发和性能优化。具有丰富的Vue和uni-app开发经验。'
					},
					{
						avatar: '/src/static/images/mc.jpg',
						name: '马超',
						role: '后端开发',
						description: '负责服务器端开发和数据库设计，确保系统的稳定性和安全性。精通后端架构设计和API开发。'
					}
				]
			}
		},
		methods: {
			
		}
	}
</script>

<style lang="scss" scoped>
.about-container {
	min-height: 100vh;
	position: relative;
	overflow: hidden;
}

.background-image {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
	opacity: 1;
}

.content-wrapper {
	position: relative;
	z-index: 2;
	min-height: 100vh;
	padding: 20rpx 30rpx 40rpx;
	background: rgba(248, 249, 250, 0.3);
}

.title-wrapper {
	display: flex;
	justify-content: center;
	margin: 20rpx 0 60rpx;
	padding: 20rpx;
	animation: fadeInDown 0.8s ease;
	background: rgba(255, 255, 255, 0.5);
	backdrop-filter: blur(5px);
	border-radius: 24rpx;
}

.title-image {
	width: 240rpx;
	height: 120rpx;
	border-radius: 24rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
	transition: all 0.3s ease;
	
	&:hover {
		transform: translateY(-4rpx);
		box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.16);
	}
}

.team-section {
	display: flex;
	flex-direction: column;
	gap: 40rpx;
	padding: 20rpx;
}

.member-card {
	background: rgba(255, 255, 255, 0.7);
	backdrop-filter: blur(10px);
	border-radius: 24rpx;
	padding: 40rpx;
	border: 1px solid rgba(255, 255, 255, 0.3);
	display: flex;
	flex-direction: column;
	align-items: center;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s ease;
	animation: fadeInUp 0.8s ease both;
	
	&:hover {
		transform: translateY(-6rpx);
		box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.12);
	}
}

.avatar-wrapper {
	margin-bottom: 30rpx;
}

.avatar {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	border: 6rpx solid #fff;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
	transition: all 0.3s ease;
	
	&:hover {
		transform: scale(1.05);
		box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.2);
	}
}

.member-info {
	text-align: center;
	width: 100%;
}

.name {
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 12rpx;
	display: block;
}

.role {
	font-size: 26rpx;
	color: #2B58F9;
	background: rgba(43, 88, 249, 0.1);
	padding: 8rpx 24rpx;
	border-radius: 20rpx;
	display: inline-block;
	margin-bottom: 20rpx;
}

.description {
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
	display: block;
	text-align: justify;
	padding: 0 20rpx;
}

.version-info {
	text-align: center;
	margin-top: 80rpx;
	padding: 40rpx 0;
	animation: fadeInUp 0.8s ease;
	border-top: 2rpx solid rgba(255, 255, 255, 0.2);
	background: rgba(255, 255, 255, 0.5);
	backdrop-filter: blur(5px);
}

.version {
	font-size: 26rpx;
	color: #999;
	display: block;
	margin-bottom: 8rpx;
}

.copyright {
	font-size: 24rpx;
	color: #999;
	display: block;
}

@keyframes fadeInDown {
	from {
		opacity: 0;
		transform: translateY(-30rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(30rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
