<template>
	<view class="search-container">
		<!-- 顶部搜索栏 -->
		<view class="search-header">
			<view class="search-box">
				<view class="search-input-wrapper">
					<uni-icons type="search" size="20" color="#999"></uni-icons>
					<input 
						type="text" 
						v-model="searchKeyword"
						:placeholder="searchText" 
						class="search-input"
						@confirm="handleSearch"
					/>
					<uni-icons 
						v-if="searchKeyword" 
						type="clear" 
						size="20" 
						color="#999"
						@click="clearSearch"
					></uni-icons>
				</view>
				<view class="ai-icon">
					<uni-icons type="help" size="24" color="#666"></uni-icons>
				</view>
			</view>
			<text class="search-btn" @click="handleSearch">搜索</text>
		</view>

		
		<!-- 搜索结果列表 -->
		<scroll-view 
			scroll-y 
			class="search-results"
			@scrolltolower="loadMore"
		>
			<view 
				v-for="(item, index) in searchResults" 
				:key="index"
				class="result-item"
				@click="navigateToDetail(item)"
			>
				<!-- 左侧图片 -->
				<image 
					:src="item.coverImage || '/static/images/default-cover.png'" 
					mode="aspectFill" 
					class="item-image"
				></image>
				
				<!-- 右侧内容 -->
				<view class="item-content">
					<view class="item-title">
						<text>{{ item.title }}</text>
					</view>
					<view class="item-info">
						<view class="item-tags">
							<text class="tag">{{ item.type }}</text>
						</view>
						<view class="item-heat">
							<uni-icons type="fire" size="14" color="#FF6B6B"></uni-icons>
							<text>{{ item.heat || '0' }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 加载状态 -->
			<view v-if="isLoading" class="loading-state">
				<text>加载中...</text>
			</view>
			
			<!-- 空状态 -->
			<view v-if="!isLoading && searchResults.length === 0" class="empty-state">
				<image src="/static/images/empty.png" mode="aspectFit" class="empty-image"></image>
				<text>暂无搜索结果</text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getSearchResult } from '@/src/services/api';
import { useUserInfoStore } from '@/src/stores/modules/userInfo'

interface SearchResult {
	id: string;
	title: string;
	coverImage?: string;
	type: string;
	heat?: string;
}

// 获取路由参数中的搜索文本
const searchText = ref('');
const userInfoStore = useUserInfoStore();
const userId = userInfoStore.userInfo?.userId;
const searchKeyword = ref('');
const isLoading = ref(false);
const searchResults = ref<SearchResult[]>([]);

onLoad((options: Record<string, string>) => {
	searchText.value = options.searchText || '';
	searchKeyword.value = options.searchText || '';
	console.log("搜索结果", searchKeyword.value);
	if (searchKeyword.value) {
		handleSearch();
	}
	searchText.value = '';
});

// 清空搜索
const clearSearch = () => {
	searchKeyword.value = '';
	searchResults.value = [];
};

// 处理搜索
const handleSearch = async () => {
	if (!searchKeyword.value.trim()) {
		uni.showToast({
			title: '请输入搜索关键词',
			icon: 'none'
		});
		return;
	}
	
	try {
		isLoading.value = true;
		
		const res = await getSearchResult({
			operatorUid: userId,
			operationType: "搜索词汇",
			searchQuery: searchKeyword.value
		});
		
		console.log("搜索结果", res);
		
		if (res.code === 1 && res.data) {
			// 假设返回的数据需要转换成我们需要的格式
			searchResults.value = res.data.map((item: any) => ({
				id: item.meetingId || Math.random(),
				title: item.meetingName ||  '未知标题',
				coverImage: item.meetingImageUrl || '/static/images/default-cover.png',
				type: item.meetingType || '未分类',
				heat: item.meetingHeat || '0'
			}));
		} else {
			searchResults.value = [];
			uni.showToast({
				title: res.msg || '搜索失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('搜索错误:', error);
		uni.showToast({
			title: '搜索出错，请重试',
			icon: 'none'
		});
		searchResults.value = [];
	} finally {
		isLoading.value = false;
	}
};

// 加载更多
const loadMore = () => {
	// 实现加载更多逻辑
	console.log('加载更多');
};

// 跳转到详情页
const navigateToDetail = (item: SearchResult) => {
	uni.navigateTo({
		url: "/pages/recommend/meetingshow?meetingId=" + item.id,
	});
};

</script>

<style lang="scss">
.search-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #f8f9fa, #e9ecef);
	display: flex;
	flex-direction: column;
}

.search-header {
	background: linear-gradient(135deg, #ffffff, #f8f9fa);
	padding: 20rpx 30rpx;
	display: flex;
	align-items: center;
	position: sticky;
	top: 0;
	z-index: 100;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.back-icon {
	padding: 10rpx;
	margin-right: 20rpx;
}

.search-box {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.search-input-wrapper {
	flex: 1;
	height: 72rpx;
	background: linear-gradient(135deg, #f5f5f5, #ffffff);
	border-radius: 36rpx;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
	gap: 20rpx;
	box-shadow: inset 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
	border: 2rpx solid #f0f0f0;
}

.search-input {
	flex: 1;
	height: 100%;
	font-size: 28rpx;
	color: #333;
}

.ai-icon {
	width: 72rpx;
	height: 72rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #f5f5f5, #ffffff);
	border-radius: 50%;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	border: 2rpx solid #f0f0f0;
	transition: all 0.3s ease;
	
	&:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
	}
}

.search-btn {
	margin-left: 20rpx;
	background: linear-gradient(135deg, #ff6b6b, #ff4757);
	color: #fff;
	font-size: 28rpx;
	padding: 12rpx 30rpx;
	border-radius: 30rpx;
	box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.3);
	transition: all 0.3s ease;
	
	&:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 6rpx rgba(255, 107, 107, 0.2);
	}
}

.nav-tabs {
	display: flex;
	background: #fff;
	padding: 20rpx 30rpx;
	gap: 40rpx;
	overflow-x: auto;
	white-space: nowrap;
	border-bottom: 1rpx solid #eee;
}

.tab-item {
	font-size: 28rpx;
	color: #666;
	position: relative;
	padding: 10rpx 0;
	
	&.active {
		color: #333;
		font-weight: 500;
		
		&::after {
			content: '';
			position: absolute;
			bottom: -20rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 40rpx;
			height: 4rpx;
			background: #ff6b6b;
			border-radius: 2rpx;
		}
	}
}

.tab-count {
	font-size: 24rpx;
	color: #999;
	margin-left: 4rpx;
}

.search-results {
	flex: 1;
	padding: 20rpx;
}

.result-item {
	display: flex;
	background: linear-gradient(135deg, #ffffff, #f8f9fa);
	padding: 24rpx;
	border-radius: 20rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	transition: all 0.3s ease;
	border: 2rpx solid rgba(255, 255, 255, 0.8);
	
	&:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		background: linear-gradient(135deg, #f8f9fa, #f0f0f0);
	}
}

.item-image {
	width: 280rpx;
	height: 160rpx;
	border-radius: 16rpx;
	margin-right: 24rpx;
	object-fit: cover;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
	transition: transform 0.3s ease;
	border: 2rpx solid rgba(255, 255, 255, 0.9);
}

.item-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.item-title {
	font-size: 30rpx;
	color: #333;
	font-weight: 600;
	line-height: 1.4;
	margin-bottom: 20rpx;
	background: linear-gradient(135deg, #333333, #666666);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

.item-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.item-tags {
	display: flex;
	gap: 10rpx;
}

.tag {
	font-size: 24rpx;
	color: #4080FF;
	background: linear-gradient(135deg, rgba(64, 128, 255, 0.1), rgba(64, 128, 255, 0.05));
	padding: 6rpx 16rpx;
	border-radius: 8rpx;
	border: 1rpx solid rgba(64, 128, 255, 0.2);
	box-shadow: 0 2rpx 6rpx rgba(64, 128, 255, 0.1);
}

.item-heat {
	display: flex;
	align-items: center;
	gap: 8rpx;
	font-size: 24rpx;
	background: linear-gradient(135deg, #ff6b6b, #ff4757);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
	border: 1rpx solid rgba(255, 107, 107, 0.2);
}

.loading-state {
	text-align: center;
	padding: 30rpx;
	color: #999;
	font-size: 28rpx;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
	
	.empty-image {
		width: 240rpx;
		height: 240rpx;
		margin-bottom: 30rpx;
		opacity: 0.8;
		filter: drop-shadow(0 4rpx 12rpx rgba(0, 0, 0, 0.1));
	}
	
	text {
		font-size: 28rpx;
		background: linear-gradient(135deg, #666666, #999999);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
	}
}
</style>
