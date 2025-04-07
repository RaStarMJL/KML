<template>
	<view class="note-detail-container">
		<!-- 顶部导航栏 -->
		<view class="nav-bar">
			<text class="nav-title">笔记详情</text>
			<view class="right-action">
				<uni-icons type="more-filled" size="24" color="#333" @click="showActionSheet"></uni-icons>
			</view>
		</view>
		
		<!-- 笔记内容区域 -->
		<scroll-view scroll-y class="content-scroll">
			<view class="note-content">
				<!-- 笔记标题 -->
				<view class="note-header">
					<text class="note-title">{{ noteData.meetingName }}</text>
					<view class="note-meta">
						<text class="note-time">{{ formatDate(noteData.createTime) }}</text>
						<view class="note-tags">
							<text class="tag" v-if="noteData.noteType === 'manual'">人工笔记</text>
							<text class="tag" v-if="noteData.noteType === 'ai'">AI总结</text>
						</view>
					</view>
				</view>
				
				<!-- 笔记正文 -->
				<view class="note-body">
					<text class="note-text">{{ noteData.content }}</text>
				</view>
			</view>
		</scroll-view>
		
		<!-- 底部操作栏 -->
		<view class="bottom-actions">
			<button class="action-btn edit" @click="editNote">
				<uni-icons type="compose" size="20" color="#FFFFFF"></uni-icons>
				<text>编辑笔记</text>
			</button>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { api_getNoteDetail } from '@/src/services/api';

const noteId = ref('');
// 笔记数据
const noteData = ref({
	meetingName: '',
	content: '',
	createTime: '',
	noteType: '',
});

// 格式化日期
const formatDate = (dateStr: string) => {
	const date = new Date(dateStr);
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};



const getNoteDetail = async () => {
	try {
		const res = await api_getNoteDetail(noteId.value);
		console.log('获取笔记详情', res);
		
		if (res.code === 1) {
			noteData.value = res.data;
		}
		console.log(noteData.value.noteType);
	} catch (error) {
		console.log(error, '获取笔记详情失败');
		uni.showToast({
			title: '获取笔记详情失败',
			icon: 'none'
		});
	}
};

// 显示操作菜单
const showActionSheet = () => {
	uni.showActionSheet({
		itemList: ['分享', '导出', '删除'],
		success: (res) => {
			switch(res.tapIndex) {
				case 0:
					shareNote();
					break;
				case 1:
					exportNote();
					break;
				case 2:
					deleteNote();
					break;
			}
		}
	});
};

// 删除笔记
const deleteNote = () => {
	uni.showModal({
		title: '确认删除',
		content: '确定要删除这条笔记吗？',
		success: (res) => {
			if (res.confirm) {
				uni.showToast({
					title: '删除成功',
					icon: 'success',
					success: () => {
						setTimeout(() => {
							uni.navigateBack();
						}, 1500);
					}
				});
			}
		}
	});
};

// 预览附件
const previewAttachment = (item: any) => {
	uni.showToast({
		title: '预览功能开发中',
		icon: 'none'
	});
};

// 编辑笔记
const editNote = () => {
	uni.showToast({
		title: '编辑功能开发中',
		icon: 'none'
	});
};

// 分享笔记
const shareNote = () => {
	uni.showToast({
		title: '分享功能开发中',
		icon: 'none'
	});
};

// 导出笔记
const exportNote = () => {
	uni.showToast({
		title: '导出功能开发中',
		icon: 'none'
	});
};

// 页面加载
onLoad((options) => {
	// 这里可以根据传入的参数获取笔记详情
	console.log(options);
	noteId.value = options.noteId;
	getNoteDetail();
});
</script>

<style lang="scss">
.note-detail-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #f8f9fa, #e9ecef);
	display: flex;
	flex-direction: column;
}

.nav-bar {
	padding: 20rpx 30rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(10px);
	position: sticky;
	top: 0;
	z-index: 100;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.left-action, .right-action {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.content-scroll {
	flex: 1;
	padding: 30rpx;
}

.note-content {
	background: #fff;
	border-radius: 24rpx;
	padding: 40rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.note-header {
	margin-bottom: 40rpx;
}

.note-title {
	font-size: 40rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 20rpx;
	line-height: 1.4;
}

.note-meta {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 20rpx;
}

.note-time {
	font-size: 26rpx;
	color: #999;
}

.note-tags {
	display: flex;
	gap: 16rpx;
}

.tag {
	font-size: 24rpx;
	color: #2B58F9;
	background: rgba(43, 88, 249, 0.1);
	padding: 4rpx 16rpx;
	border-radius: 6rpx;
}

.note-body {
	margin-bottom: 40rpx;
}

.note-text {
	font-size: 30rpx;
	color: #666;
	line-height: 1.8;
}

.attachments {
	border-top: 2rpx solid #f0f0f0;
	padding-top: 30rpx;
}

.section-title {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 20rpx;
	
	text {
		font-size: 28rpx;
		color: #666;
		font-weight: 500;
	}
}

.attachment-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.attachment-item {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 20rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
	transition: all 0.3s ease;
	
	&:active {
		transform: scale(0.98);
		background: #f0f1f2;
	}
}

.attachment-name {
	font-size: 28rpx;
	color: #666;
}

.bottom-actions {
	padding: 30rpx;
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(10px);
	border-top: 2rpx solid rgba(0, 0, 0, 0.05);
}

.action-btn {
	width: 100%;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	border-radius: 44rpx;
	font-size: 32rpx;
	transition: all 0.3s ease;
	
	&.edit {
		background: linear-gradient(135deg, #2B58F9, #1a3d8f);
		color: #fff;
		border: none;
		box-shadow: 0 6rpx 20rpx rgba(43, 88, 249, 0.2);
		
		&:active {
			transform: scale(0.98);
			box-shadow: 0 4rpx 10rpx rgba(43, 88, 249, 0.15);
		}
	}
}
</style>
