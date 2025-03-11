<template>
	<view class="record-container">
		<!-- 顶部导航栏 -->
		<view class="header">
			<view class="back-icon" @click="goBack">
				<uni-icons type="back" size="24" color="#fff"></uni-icons>
			</view>
			<text class="header-title">录制</text>
		</view>
		
		<!-- 我的记录标题 -->
		<view class="section-title">
			<text>我的记录</text>
		</view>

		<!-- 记录列表 -->
		<view class="record-list">
			<view class="record-item" v-for="(record, index) in records" :key="index" @click="viewRecord(record)">
				<view class="record-content">
					<text class="record-title">{{ record.title }}</text>
					<text class="record-date">{{ record.date }}</text>
					<text class="record-body">{{ record.body }}</text>
				</view>
			</view>
			<view v-if="records.length === 0" class="no-record">
				<text>暂无记录</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				records: [
					{
						title: "项目进展",
						body: "完成了第一阶段的开发工作。",
						date: "2024-03-01"
					},
					{
						title: "学习记录",
						body: "学习了JavaScript的异步编程。",
						date: "2024-02-28"
					}
				]
			}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			viewRecord(record) {
				// 查看记录详情
				uni.showToast({
					title: '查看记录: ' + record.title,
					icon: 'none'
				});
			},
			formatDate(dateStr) {
				const date = new Date(dateStr);
				return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
			}
		}
	}
</script>

<style lang="scss">
	.record-container {
		min-height: 100vh;
		background: #f5f6f7;
	}

	.header {
		background: #4075FF;
		padding: 20rpx;
		display: flex;
		align-items: center;
		position: relative;
	}
	
	.back-icon {
		position: absolute;
		left: 20rpx;
	}

	.header-title {
		width: 100%;
		font-size: 36rpx;
		color: #fff;
		text-align: center;
	}
	
	.section-title {
		background: #4075FF;
		padding: 20rpx;
		color: #fff;
		font-size: 32rpx;
		font-weight: bold;
	}

	.record-list {
		background: #fff;
	}

	.record-item {
		padding: 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.record-content {
		display: flex;
		flex-direction: column;
	}

	.record-title {
		font-size: 30rpx;
		font-weight: 500;
		color: #333;
	}

	.record-date {
		font-size: 24rpx;
		color: #999;
		margin: 6rpx 0;
	}

	.record-body {
		font-size: 28rpx;
		color: #666;
	}

	.no-record {
		text-align: center;
		font-size: 28rpx;
		color: #999;
		padding: 50rpx 0;
	}
</style>
