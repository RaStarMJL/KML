<template>
	<view class="message-container">
		<view class="header">
			<text class="header-title">消息中心</text>
		</view>

		<!-- 消息类型选择器 -->
		<view class="message-tabs">
			<view 
				class="tab-item" 
				:class="{ 'active': activeTab === 'all' }" 
				@click="switchTab('all')"
			>
				<text>全部</text>
			</view>
			<view 
				class="tab-item" 
				:class="{ 'active': activeTab === 'meeting' }" 
				@click="switchTab('meeting')"
			>
				<text>会议提醒</text>
			</view>
			<view 
				class="tab-item" 
				:class="{ 'active': activeTab === 'system' }" 
				@click="switchTab('system')"
			>
				<text>系统通知</text>
			</view>
		</view>

		<!-- 消息列表 -->
		<scroll-view scroll-y class="message-list">
			<view 
				class="message-item" 
				v-for="(message, index) in filteredMessages" 
				:key="index"
				:class="{ 'unread': !message.read }"
			>
				<view class="message-icon">
					<uni-icons 
						:type="message.type === 'meeting' ? 'calendar' : 'info'" 
						size="24" 
						:color="message.type === 'meeting' ? '#2B58F9' : '#FF9500'"
					></uni-icons>
				</view>
				<view class="message-content">
					<view class="message-header">
						<text class="message-title">{{ message.title }}</text>
						<text class="message-time">{{ formatDate(message.time) }}</text>
					</view>
					<text class="message-body">{{ message.body }}</text>
				</view>
				<view class="message-actions">
					<uni-icons 
						type="more-filled" 
						size="20" 
						color="#999"
						@click="showActions(message, index)"
					></uni-icons>
				</view>
			</view>
			
			<!-- 空状态 -->
			<view v-if="filteredMessages.length === 0" class="empty-state">
				<image class="empty-image" src="/static/images/empty.png" mode="aspectFit"></image>
				<text class="empty-text">暂无{{ activeTab === 'all' ? '消息' : activeTab === 'meeting' ? '会议提醒' : '系统通知' }}</text>
			</view>
		</scroll-view>
		
		<!-- 底部操作栏 -->
		<view class="action-bar">
			<button class="action-btn" @click="markAllAsRead">
				<uni-icons type="eye" size="16" color="#666"></uni-icons>
				<text>全部已读</text>
			</button>
			<button class="action-btn" @click="clearAllMessages">
				<uni-icons type="trash" size="16" color="#666"></uni-icons>
				<text>清空消息</text>
			</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				activeTab: 'all',
				messages: [
					{
						id: 1,
						title: "会议提醒",
						body: "您有一场会议将在30分钟后开始，请及时参加。会议主题：产品开发讨论会，会议地点：3号会议室。",
						time: "2024-03-01 14:00:00",
						type: "meeting",
						read: false
					},
					{
						id: 2,
						title: "系统通知",
						body: "您的账户信息已更新，请查看个人资料确认更新内容。如有疑问，请联系系统管理员。",
						time: "2024-02-28 10:30:00",
						type: "system",
						read: true
					},
					{
						id: 3,
						title: "会议取消通知",
						body: "原定于今日15:00的项目进度汇报会议已取消，请知悉。",
						time: "2024-02-27 09:15:00",
						type: "meeting",
						read: false
					},
					{
						id: 4,
						title: "系统维护通知",
						body: "系统将于本周六凌晨2:00-4:00进行例行维护，期间部分功能可能暂时无法使用。",
						time: "2024-02-26 16:45:00",
						type: "system",
						read: true
					}
				]
			}
		},
		computed: {
			filteredMessages() {
				if (this.activeTab === 'all') {
					return this.messages;
				} else {
					return this.messages.filter(msg => msg.type === this.activeTab);
				}
			},
			unreadCount() {
				return this.messages.filter(msg => !msg.read).length;
			}
		},
		methods: {
			formatDate(dateStr) {
				const date = new Date(dateStr);
				const now = new Date();
				const diff = now - date;
				
				// 如果是今天的消息，只显示时间
				if (diff < 24 * 60 * 60 * 1000 && 
					date.getDate() === now.getDate() &&
					date.getMonth() === now.getMonth() &&
					date.getFullYear() === now.getFullYear()) {
					return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
				}
				
				// 如果是昨天的消息
				const yesterday = new Date(now);
				yesterday.setDate(yesterday.getDate() - 1);
				if (date.getDate() === yesterday.getDate() &&
					date.getMonth() === yesterday.getMonth() &&
					date.getFullYear() === yesterday.getFullYear()) {
					return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
				}
				
				// 其他情况显示完整日期
				return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
			},
			switchTab(tab) {
				this.activeTab = tab;
			},
			showActions(message, index) {
				uni.showActionSheet({
					itemList: ['标记为已读', '删除'],
					success: (res) => {
						if (res.tapIndex === 0) {
							// 标记为已读
							this.messages[index].read = true;
						} else if (res.tapIndex === 1) {
							// 删除消息
							this.messages.splice(index, 1);
						}
					}
				});
			},
			markAllAsRead() {
				this.messages.forEach(msg => {
					msg.read = true;
				});
				uni.showToast({
					title: '已全部标记为已读',
					icon: 'success'
				});
			},
			clearAllMessages() {
				uni.showModal({
					title: '确认清空',
					content: '确定要清空所有消息吗？',
					success: (res) => {
						if (res.confirm) {
							this.messages = [];
							uni.showToast({
								title: '已清空所有消息',
								icon: 'success'
							});
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss" scoped>
	.message-container {
		min-height: 100vh;
		background: #f5f6f7;
		display: flex;
		flex-direction: column;
	}

	.header {
		background: #2B58F9;
		padding: 30rpx 20rpx;
		position: relative;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.header-title {
		font-size: 36rpx;
		color: #fff;
		text-align: center;
		font-weight: 500;
	}
	
	.message-tabs {
		display: flex;
		background: #fff;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.tab-item {
		flex: 1;
		text-align: center;
		padding: 15rpx 0;
		font-size: 28rpx;
		color: #666;
		position: relative;
		transition: all 0.3s;
		
		&.active {
			color: #2B58F9;
			font-weight: 500;
			
			&::after {
				content: '';
				position: absolute;
				bottom: 0;
				left: 50%;
				transform: translateX(-50%);
				width: 40rpx;
				height: 4rpx;
				background: #2B58F9;
				border-radius: 2rpx;
			}
		}
	}

	.message-list {
		flex: 1;
		padding: 0 20rpx;
		height: calc(100vh - 240rpx);
	}

	.message-item {
		display: flex;
		background: #fff;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		transition: transform 0.3s;
		position: relative;
		
		&.unread::before {
			content: '';
			position: absolute;
			top: 20rpx;
			left: 20rpx;
			width: 16rpx;
			height: 16rpx;
			background: #FF3B30;
			border-radius: 50%;
		}
		
		&:active {
			transform: scale(0.98);
		}
	}
	
	.message-icon {
		margin-right: 20rpx;
		display: flex;
		align-items: flex-start;
		padding-top: 6rpx;
	}

	.message-content {
		flex: 1;
	}
	
	.message-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10rpx;
	}

	.message-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
	}

	.message-time {
		font-size: 24rpx;
		color: #999;
	}

	.message-body {
		font-size: 26rpx;
		color: #666;
		line-height: 1.5;
	}
	
	.message-actions {
		padding: 10rpx;
	}
	
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
	}
	
	.empty-image {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 20rpx;
		opacity: 0.5;
	}
	
	.empty-text {
		font-size: 28rpx;
		color: #999;
	}
	
	.action-bar {
		display: flex;
		padding: 20rpx;
		background: #fff;
		border-top: 1rpx solid #eee;
	}
	
	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f5f6f7;
		border: none;
		border-radius: 8rpx;
		padding: 15rpx 0;
		margin: 0 10rpx;
		font-size: 26rpx;
		color: #666;
		
		uni-icons {
			margin-right: 10rpx;
		}
	}
</style>
