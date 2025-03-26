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
				@click="handleMessageClick(message)"
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
				<uni-icons type="eye-filled" size="22" color="#ffffff"></uni-icons>
				<text>全部已读</text>
			</button>
			<button class="action-btn" @click="clearAllMessages">
				<uni-icons type="trash-filled" size="22" color="#666"></uni-icons>
				<text>清空消息</text>
			</button>
		</view>
	</view>
</template>

<script>
import { useUserInfoStore } from "/src/stores/modules/userInfo";
import { get_message } from "/src/services/api";
export default {
	data() {
		return {
			activeTab: 'all',
			messages: [],
			meetingMessages: [],
			systemMessages: [],
			userInfoStore: useUserInfoStore()
		}
	},
	computed: {
		filteredMessages() {
			if (this.activeTab === 'all') {
				return this.messages;
			} else if (this.activeTab === 'meeting') {
				return this.meetingMessages;
			} else {
				return this.systemMessages;
			}
		},
		unreadCount() {
			return this.messages.filter(msg => !msg.read).length;
		}
	},
	onShow() {
		this.getMessages();
	},
	methods: {
		async getMessages() {
			try {
				const userId = this.userInfoStore.userInfo?.userId;
				if (!userId) {
					throw new Error('用户未登录');
				}

				uni.showLoading({
					title: '加载中...'
				});

				const res = await get_message({ 
					UserId: userId 
				});

				console.log(res);
				if (res.code === 1) {
					// 清空现有消息数组
					this.messages = [];
					this.meetingMessages = [];
					this.systemMessages = [];
					
					// 处理消息数据，根据类型分类存储
					res.data.forEach(msg => {
						const processedMsg = {
							...msg,
							read: false,
							title: msg.messageType,
							body: msg.messageContent,
							time: msg.messageTime,
							type: msg.messageType === '会议提醒' ? 'meeting' : 'system'
						};
						
						// 添加到总消息列表
						this.messages.push(processedMsg);
						
						// 根据类型添加到对应的分类数组
						if (msg.messageType === '会议提醒') {
							this.meetingMessages.push(processedMsg);
						} else {
							this.systemMessages.push(processedMsg);
						}
					});
				} else {
					throw new Error(res.data.msg || '获取消息失败');
				}
			} catch (error) {
				console.error('获取消息失败:', error);
				uni.showToast({
					title: error.message || '获取消息失败',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},

		//点击消息已读
		handleMessageClick(message) {
			console.log(message);
			message.read = true;
		},
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
		padding-bottom: 120rpx;
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
		padding: 20rpx 30rpx;
		background: #fff;
		border-top: 1rpx solid #eee;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	
	.action-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #f8f9fa, #ffffff);
		border: 1rpx solid #e9ecef;
		border-radius: 16rpx;
		padding: 24rpx 0;
		margin: 0 10rpx;
		font-size: 28rpx;
		color: #495057;
		transition: all 0.3s ease;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		
		&:active {
			transform: scale(0.98);
			background: linear-gradient(135deg, #f0f1f2, #f8f9fa);
			box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.05);
		}
		
		uni-icons {
			margin-right: 12rpx;
			font-size: 36rpx;
			opacity: 1;
		}
		
		text {
			font-weight: 500;
			letter-spacing: 1rpx;
		}

		&:first-child {
			background: linear-gradient(135deg, #2B58F9, #1a3d8f);
			color: #ffffff;
			border: none;
			box-shadow: 0 4rpx 12rpx rgba(43, 88, 249, 0.2);

			&:active {
				background: linear-gradient(135deg, #1a3d8f, #0f2a6a);
				box-shadow: 0 2rpx 6rpx rgba(43, 88, 249, 0.2);
			}

			uni-icons {
				color: #ffffff;
				opacity: 1;
			}
		}
	}
</style>
