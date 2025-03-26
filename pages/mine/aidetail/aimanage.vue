<template>
	<view class="chat-container">
		<!-- 顶部导航栏 -->		
		<!-- 子标题区域 -->
		<view class="subtitle-bar">
			<view class="subtitle-content">
				<text class="subtitle-text">通用智能助手</text>
				<view class="more-options">
					<uni-icons type="more-filled" size="20" color="#333333"></uni-icons>
				</view>
			</view>
		</view>
		
		<!-- 聊天内容区域 -->
		<scroll-view 
			scroll-y 
			class="chat-messages" 
			:scroll-top="scrollTop"
			@scrolltolower="onScrollToLower"
			:scroll-with-animation="true"
			:show-scrollbar="false"
			ref="messagesScroll"
			id="chat-scroll"
		>
			<view class="chat-list" id="chat-list">
				<!-- 遍历所有消息，不再通过v-if区分类型 -->
				<view 
					v-for="(message, index) in messages" 
					:key="message.type + '-' + index"
					:class="['message', message.type === 'ai' ? 'ai-message' : 'user-message']"
				>
					<!-- AI消息的头像 -->
					<image v-if="message.type === 'ai'" class="avatar" :src="aiAvatar" mode="aspectFill"></image>
					
					<view class="message-content">
						<view class="message-bubble">
							<text>{{ message.content }}</text>
						</view>
						
						<!-- 仅AI消息显示操作按钮 -->
						<view v-if="message.type === 'ai'" class="message-actions">
							<view class="action-btn" @click="copyMessage(message.content)">
								<uni-icons type="upload" size="16" color="#8a8a8a"></uni-icons>
							</view>
							<view class="action-btn" @click="likeMessage(index)">
								<uni-icons type="hand-up" size="16" :color="message.liked ? '#4080FF' : '#8a8a8a'"></uni-icons>
							</view>
							<view class="action-btn" @click="dislikeMessage(index)">
								<uni-icons type="hand-down" size="16" :color="message.disliked ? '#ff6666' : '#8a8a8a'"></uni-icons>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 底部输入区域 -->
		<view class="input-area">
			<view class="input-container">
				<input 
					type="text" 
					v-model="inputMessage" 
					class="message-input" 
					placeholder="请输入您的问题..."
					placeholder-style="color: #999;"
					confirm-type="send"
					@confirm="sendMessage"
				/>
				<view class="send-btn" :class="{ 'active': inputMessage.trim() }" @click="sendMessage">
					<uni-icons type="paperplane-filled" size="20" color="#fff"></uni-icons>
				</view>
			</view>
			
			<!-- 底部工具栏 -->
			<view class="toolbar">
				<view class="toolbar-item">
					<uni-icons type="folder" size="20" color="#666"></uni-icons>
					<text>文件</text>
				</view>
				<view class="toolbar-item">
					<uni-icons type="calendar" size="20" color="#666"></uni-icons>
					<text>日程</text>
				</view>
				<view class="toolbar-item" @click="startNewChat">
					<uni-icons type="refresh" size="20" color="#666"></uni-icons>
					<text>新会话</text>
				</view>
				<view class="toolbar-item">
					<uni-icons type="gear" size="20" color="#666"></uni-icons>
					<text>设置</text>
				</view>
			</view>
		</view>

		<!-- 调试信息，测试完成后可移除 -->
		<view v-if="debug" class="debug-info">
			<text>消息数: {{messages.length}}</text>
			<text>滚动位置: {{scrollTop}}</text>
		</view>
	</view>
</template>

<script>
import { useUserInfoStore } from '@/src/stores/modules/userInfo'
import { aimanage } from '@/src/services/api'
	export default {
		data() {
			return {
				aiAvatar: '/src/static/images/function-ai.png', 	
				inputMessage: '',
				scrollTop: 0,
				messages: [
					{
						type: 'ai',
						content: '您好！我是通用智能助手，可以协助您快速创建、加入会议。',
						liked: false,
						disliked: false,
						time: new Date()
					}
				],
				debug: false // 调试模式开关
			}
		},
		mounted() {
			this.scrollToBottom();
			
			// 打印初始消息列表，用于调试
			console.log('初始消息列表：', JSON.stringify(this.messages));
		},
		methods: {
			// 生成符合UUID格式的随机sid

			
			async sendMessage() {
				if (!this.inputMessage.trim()) return;

				// 创建用户消息并添加到列表
				const userMessage = {
					type: 'user',
					content: this.inputMessage.trim(),
					time: new Date()
				};
				this.messages = [...this.messages, userMessage];
				
				// 清空输入框
				const userInput = this.inputMessage.trim();
				this.inputMessage = '';
				
				// 立即滚动到底部
				this.$nextTick(() => {
					this.scrollToBottom();
				});

				const userInfoStore = useUserInfoStore();
				const userId = userInfoStore.userInfo?.userId;
				
	
				const res = await aimanage({
					"sid": "550e8400-e29b-41d4-a716-446655440000", 
  					"id": "ec6ed326-ab26-4aa2-87ac-fac05e622409",
					"input":`用户uid:${userId}`+userInput
				})
				
				console.log('通用智能助手响应:', res);

				
				try {
					// 安全地解析返回内容
					const str = res.data.answer;
					console.log('原始响应:', str);
					
				
					if(str){
						try {
							// 检查响应格式并提取内容
							if (str) {
								const content = str;
								console.log('AI举办会议结果内容:', content);
								
								// 创建AI回复消息对象
								const aiMessage = {
									type: 'ai',
									content: content,
									liked: false,
									disliked: false,
									time: new Date()
								};
								
								// 添加AI回复到列表
								this.messages = [...this.messages, aiMessage];
								
								// 再次滚动到底部
								this.$nextTick(() => {
									this.scrollToBottom();
								});
							} else {
								throw new Error('AI举办会议结果格式不正确');
							}
						} catch (error) {
							// 处理文档检索过程中的错误
							console.error('AI举办会议过程错误:', error);
							uni.hideLoading();
							
							// 创建错误消息
							const errorMessage = {
								type: 'ai',
								content: '很抱歉AI举办会议过程中遇到了问题: ' + (error.message || '未知错误'),
								liked: false,
								disliked: false,
								time: new Date()
							};
							
							// 添加错误消息到列表
							this.messages = [...this.messages, errorMessage];
							
							// 再次滚动到底部
							this.$nextTick(() => {
								this.scrollToBottom();
							});
						}
					}
					
				} catch (error) {
					console.error('处理消息错误:', error);
					
					// 创建错误消息
					const errorMessage = {
						type: 'ai',
						content: '很抱歉，处理您的请求时遇到了问题，请稍后再试。',
						liked: false,
						disliked: false,
						time: new Date()
					};
					
					// 添加错误消息到列表
					this.messages = [...this.messages, errorMessage];
					
					// 再次滚动到底部
					this.$nextTick(() => {
						this.scrollToBottom();
					});
				}
			},
			scrollToBottom() {
				// 使用更可靠的方式计算滚动位置
				setTimeout(() => {
					const query = uni.createSelectorQuery().in(this);
					query.select('#chat-list').boundingClientRect(data => {
						if (data) {
							console.log('聊天列表高度:', data.height);
							// 设置一个足够大的值确保滚动到底部
							this.scrollTop = data.height * 2;
						}
					}).exec();
				}, 100);
			},
			onScrollToLower() {
				console.log('已滚动到底部');
			},
			copyMessage(content) {
				uni.setClipboardData({
					data: content,
					success: () => {
						uni.showToast({
							title: '已复制到剪贴板',
							icon: 'none'
						});
					}
				});
			},
			likeMessage(index) {
				if (this.messages[index].type === 'ai') {
					this.messages[index].liked = !this.messages[index].liked;
					if (this.messages[index].liked) {
						this.messages[index].disliked = false;
						uni.showToast({
							title: '感谢您的反馈',
							icon: 'none'
						});
					}
				}
			},
			dislikeMessage(index) {
				if (this.messages[index].type === 'ai') {
					this.messages[index].disliked = !this.messages[index].disliked;
					if (this.messages[index].disliked) {
						this.messages[index].liked = false;
						uni.showToast({
							title: '已收到您的反馈',
							icon: 'none'
						});
					}
				}
			},
			startNewChat() {
				uni.showModal({
					title: '开启新会话',
					content: '确定要开启新会话吗？当前对话内容将不会保存。',
					confirmText: '确定',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							this.messages = [{
								type: 'ai',
								content: '您好！我是功能用例智能助手，可以协助您规划和设计产品功能用例。请问您需要针对哪个产品或功能进行规划？',
								liked: false,
								disliked: false,
								time: new Date()
							}];
							this.scrollToBottom();
						}
					}
				});
			}
		}
	}
</script>

<style lang="scss">
.chat-container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f8f9fc;
	position: relative;
}

/* 顶部导航栏 */
.navbar {
	height: 90rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 30rpx;
	background: linear-gradient(135deg, #4080FF, #5B6AFF);
	position: relative;
	z-index: 100;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.back-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-btn:active {
	opacity: 0.7;
}

.title {
	font-size: 36rpx;
	font-weight: 500;
	color: #FFFFFF;
	letter-spacing: 2rpx;
	text-align: center;
	flex: 1;
}

.right-placeholder {
	width: 60rpx;
	height: 60rpx;
}

/* 子标题区域 */
.subtitle-bar {
	padding: 20rpx 30rpx;
	background-color: #FFFFFF;
	border-bottom: 1px solid rgba(0,0,0,0.05);
}

.subtitle-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.subtitle-text {
	font-size: 32rpx;
	font-weight: 500;
	color: #333333;
}

.more-options {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
}

.more-options:active {
	background-color: #f5f5f5;
}

/* 聊天消息区域 */
.chat-messages {
	flex: 1;
	padding: 30rpx;
	box-sizing: border-box;
	position: relative;
}

.chat-list {
	display: flex;
	flex-direction: column;
	gap: 40rpx;
}

.message {
	display: flex;
	margin-bottom: 20rpx;
	animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
	from { opacity: 0; transform: translateY(10rpx); }
	to { opacity: 1; transform: translateY(0); }
}

.ai-message {
	align-self: flex-start;
	justify-content: flex-start;
	margin-right: 60rpx;
}

.user-message {
	align-self: flex-end;
	justify-content: flex-end;
	margin-left: 60rpx;
}

.avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	margin-right: 20rpx;
	flex-shrink: 0;
	border: 2rpx solid #fff;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.message-content {
	display: flex;
	flex-direction: column;
}

.message-bubble {
	max-width: 70vw;
	padding: 24rpx 30rpx;
	border-radius: 18rpx;
	font-size: 28rpx;
	line-height: 1.6;
	word-break: break-word;
	position: relative;
	box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}

.ai-message .message-bubble {
	background-color: #fff;
	color: #333;
	border-top-left-radius: 4rpx;
}

.ai-message .message-bubble::before {
	content: '';
	position: absolute;
	left: -12rpx;
	top: 20rpx;
	border: 6rpx solid transparent;
	border-right-color: #fff;
}

.user-message .message-bubble {
	background-color: #4080FF;
	color: #fff;
	border-top-right-radius: 4rpx;
	align-self: flex-end;
}

.user-message .message-bubble::before {
	content: '';
	position: absolute;
	right: -12rpx;
	top: 20rpx;
	border: 6rpx solid transparent;
	border-left-color: #4080FF;
}

.message-actions {
	display: flex;
	gap: 30rpx;
	margin-top: 12rpx;
	padding-left: 10rpx;
}

.action-btn {
	opacity: 0.7;
	transition: opacity 0.2s, transform 0.2s;
	padding: 6rpx;
}

.action-btn:active {
	opacity: 1;
	transform: scale(1.1);
}

/* 底部输入区域 */
.input-area {
	background-color: #fff;
	border-top: 1px solid rgba(0,0,0,0.05);
	padding: 20rpx 30rpx 30rpx;
	box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.03);
}

.input-container {
	display: flex;
	align-items: center;
	height: 80rpx;
	margin-bottom: 20rpx;
}

.message-input {
	flex: 1;
	height: 80rpx;
	background-color: #f5f5f7;
	border-radius: 40rpx;
	padding: 0 30rpx;
	font-size: 28rpx;
	color: #333;
	box-shadow: inset 0 1rpx 4rpx rgba(0,0,0,0.05);
	transition: all 0.3s;
}

.message-input:focus {
	background-color: #fff;
	box-shadow: inset 0 1rpx 6rpx rgba(0,0,0,0.1);
}

.send-btn {
	width: 80rpx;
	height: 80rpx;
	background: linear-gradient(135deg, #4080FF, #1a60d6);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 20rpx;
	opacity: 0.8;
	transition: all 0.3s;
	box-shadow: 0 4rpx 12rpx rgba(64, 128, 255, 0.3);
}

.send-btn.active {
	opacity: 1;
	transform: scale(1.05);
}

.send-btn:active {
	transform: scale(0.95);
	box-shadow: 0 2rpx 6rpx rgba(64, 128, 255, 0.3);
}

/* 底部工具栏 */
.toolbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10rpx 20rpx;
	border-top: 1px solid #f0f0f0;
}

.toolbar-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 10rpx 20rpx;
	transition: all 0.2s;
}

.toolbar-item:active {
	transform: scale(0.95);
}

.toolbar-item text {
	font-size: 22rpx;
	color: #666;
	margin-top: 6rpx;
}

/* 调试信息样式 */
.debug-info {
	position: absolute;
	bottom: 200rpx;
	right: 20rpx;
	background-color: rgba(0,0,0,0.7);
	color: white;
	padding: 10rpx;
	border-radius: 8rpx;
	font-size: 20rpx;
	z-index: 1000;
	display: flex;
	flex-direction: column;
}
</style>
