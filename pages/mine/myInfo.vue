<template>
	<view class="page-container">
		<!-- 背景图片 -->
		<view class="background-container" @click="changeBackground">
			<image :src="userInfo.backgroundUrl" mode="aspectFill" class="background-image"></image>
			<view class="change-bg-text">
				<uni-icons type="camera-filled" size="16" color="#fff"></uni-icons>
				<text>点击设置背景图片</text>
			</view>
		</view>

		<!-- 头像 -->
		<view class="avatar-container" @click="changeAvatar">
			<image :src="userInfo.avatarUrl" class="avatar"></image>
			<view class="avatar-edit-hint">
				<uni-icons type="camera-filled" size="20" color="#fff"></uni-icons>
			</view>
		</view>

		<!-- 用户信息列表 -->
		<view class="info-list">
			<view class="info-item" hover-class="item-hover" @click="changeUsername">
				<text class="item-label">名称</text>
				<view class="item-content">
					<text>{{ userInfo.username }}</text>
					<uni-icons type="arrowright" size="16" color="#999"></uni-icons>
				</view>
			</view>

			<view class="info-item" hover-class="item-hover" @click="changeSignature">
				<text class="item-label">签名</text>
				<view class="item-content">
					<text>{{ userInfo.signature }}</text>
					<uni-icons type="arrowright" size="16" color="#999"></uni-icons>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserInfoStore } from "/src/stores/modules/userInfo";
import { change_userInfo } from "/src/services/api";
import { baseURL } from "/src/utils/http";
interface UserInfo {
	username: string;
	signature: string;
	backgroundUrl: string;
	avatarUrl: string;
}

const userInfo = ref<UserInfo>({
	username: '',
	signature: '',
	backgroundUrl: '',
	avatarUrl: ''  
});

// 修改用户名
const changeUsername = async () => {
	try{
		const userInfoStore = useUserInfoStore();
		const uid = userInfoStore.userInfo?.userId;
		if(!uid){
			throw new Error('用户未登录');
		}
		
		const res = await uni.showModal({
			title: '修改名称',
			editable: true,
			placeholderText: '请输入新的名称',
		});

		if(res.confirm&&res.content){
			uni.showLoading({
				title: '修改中...'
			});

			const response = await change_userInfo({
				uid: uid,
				username: res.content
			})			
			const result = response;	
			console.log(result);

			if(result.code ===  1){
				userInfo.value.username = res.content;
				userInfoStore.userInfo.userName = res.content;
				uni.showToast({
					title: '修改成功',
					icon: 'success'
				});
			}else{
				throw new Error(result.msg || '修改失败');
			}	
		}
	} catch (error) {
		console.error('修改名称失败:', error);
		uni.showToast({
			title: error.message || '修改名称失败',
			icon: 'none'
		});
	} finally {
		uni.hideLoading();
	}
};

// 修改签名
const changeSignature = async () => {
	try{
		const userInfoStore =  useUserInfoStore()
		const uid = userInfoStore.userInfo?.userId;
		if(!uid){
			throw new Error('用户未登录');
		}
		
		const res = await uni.showModal({
			title: '修改签名',
			editable: true,
			placeholderText: '请输入新的签名',
		});
		
		if(res.confirm&&res.content){
			uni.showLoading({
				title: '修改中...'
			});

			const response = await change_userInfo({
				uid: uid,
				signature: res.content
			})
			const result = response;
			console.log(result);
			
			if(result.code === 1){
				userInfo.value.signature = res.content;
				userInfoStore.userInfo.signature = res.content;
				uni.showToast({
					title: '修改成功',
					icon: 'success'
				});
			}else{
				throw new Error(result.msg || '修改失败');
			}
		}
	} catch (error) {
		console.error('修改签名失败:', error);
		uni.showToast({
			title: error.message || '修改签名失败',
			icon: 'none'
		});
	} finally {	
		uni.hideLoading();
	}
};

// 更换背景图片
const changeBackground = async () => {
	try {
		// 选择图片
		const res = await uni.chooseImage({
			count: 1,
			sizeType: ['compressed']
		});

		if (!res.tempFilePaths?.[0]) {
			throw new Error('未选择图片');
		}

		// 显示加载提示
		uni.showLoading({
			title: '上传中...'
		});

		// 获取用户信息
		const userInfoStore = useUserInfoStore();
		const uid = userInfoStore.userInfo?.userId;

		if (!uid) {
			throw new Error('用户未登录');
		}

		// 创建FormData对象
		const formData = new FormData();
		formData.append('uid', uid);
		formData.append('file', {
			uri: res.tempFilePaths[0],
			type: 'image/jpeg',
			name: 'background.jpg'
		});

		// 发送请求
		const response = await uni.uploadFile({
			url: baseURL + 'user',
			filePath: res.tempFilePaths[0],
			name: 'file',
			method: 'PUT'
		});

		// 解析响应
		const result = JSON.parse(response.data);
		if (result.code === 1) {
			// 更新本地显示的背景图片
			userInfo.value.backgroundUrl = result.data.backUrl || res.tempFilePaths[0];
			uni.showToast({
				title: '背景更新成功',
				icon: 'success'
			});
		} else {
			throw new Error(result.msg || '更新失败');
		}

	} catch (error) {
		console.error('更换背景失败:', error);
		uni.showToast({
			title: error.message || '更换背景失败',
			icon: 'none'
		});
	} finally {
		uni.hideLoading();
	}
};

// 更换头像
const changeAvatar = async () => {
	try {
		// 选择图片
		const res = await uni.chooseImage({
			count: 1,
			sizeType: ['compressed']
		});

		if (!res.tempFilePaths?.[0]) {
			throw new Error('未选择图片');
		}

		// 显示加载提示
		uni.showLoading({
			title: '上传中...'
		});

		// 获取用户信息
		const userInfoStore = useUserInfoStore();
		const uid = userInfoStore.userInfo?.userId;

		if (!uid) {
			throw new Error('用户未登录');
		}

		// 发送请求
		const response = await uni.uploadFile({
			url: baseURL + 'user',
			filePath: res.tempFilePaths[0],
			name: 'file',
			method: 'PUT'
		});

		// 解析响应
		const result = JSON.parse(response.data);
		if (result.code === 1) {
			// 更新本地显示的头像
			userInfo.value.avatarUrl = result.data.avatarUrl || res.tempFilePaths[0];
			uni.showToast({
				title: '头像更新成功',
				icon: 'success'
			});
		} else {
			throw new Error(result.msg || '更新失败');
		}

	} catch (error) {
		console.error('更换头像失败:', error);
		uni.showToast({
			title: error.message || '更换头像失败',
			icon: 'none'
		});
	} finally {
		uni.hideLoading();
	}
};

const getUserInfo = async () => {
	try {
		const userInfoStore = useUserInfoStore();
		const storeUserInfo = userInfoStore.userInfo;
		
		if (!storeUserInfo) {
			throw new Error('未获取到用户信息');
		}

		console.log('store中的用户信息:', storeUserInfo); // 添加日志查看store中的数据

		userInfo.value = {
			username: storeUserInfo.userName ,
			signature: storeUserInfo.signature || '这个人很懒，什么都没留下...',
			backgroundUrl: storeUserInfo.backgroundUrl || '/src/static/images/default-bg.jpg', 
			avatarUrl: storeUserInfo.avatarUrl || '/src/static/images/defaultAvatar.png'
		};

		console.log('设置后的用户信息:', userInfo.value); // 添加日志查看设置后的数据

	} catch (error) {
		console.error('获取用户信息失败:', error);
		// 设置默认值
		userInfo.value = {
			username: '未设置昵称',
			signature: '这个人很懒，什么都没留下...',
			backgroundUrl: '/static/images/default-bg.jpg',
			avatarUrl: '/static/images/default-avatar.png'
		};
	}
};

// 页面加载时获取用户信息
getUserInfo();
</script>

<style scoped>
.page-container {
	min-height: 100vh;
	background-color: #f5f6f7;
}

.background-container {
	position: relative;
	height: 400rpx;
	overflow: hidden;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	background-color: #666;
}

.background-image {
	width: 100%;
	height: 100%;
	transition: transform 0.3s ease;
}

.background-container:active .background-image {
	transform: scale(1.05);
}

.change-bg-text {
	position: absolute;
	bottom: 20rpx;
	right: 20rpx;
	color: #fff;
	font-size: 24rpx;
	padding: 10rpx 20rpx;
	background-color: rgba(0, 0, 0, 0.5);
	border-radius: 30rpx;
	display: flex;
	align-items: center;
	gap: 6rpx;
	backdrop-filter: blur(10px);
	transition: all 0.3s ease;
}

.change-bg-text:active {
	transform: scale(0.95);
	background-color: rgba(0, 0, 0, 0.7);
}

.avatar-container {
	position: absolute;
	top: 300rpx;
	left: 40rpx;
	z-index: 1;
}

.avatar {
	width: 160rpx;
	height: 160rpx;
	border-radius: 50%;
	border: 6rpx solid #fff;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
	transition: transform 0.3s ease;
}

.avatar-container:active .avatar {
	transform: scale(0.95);
}

.avatar-edit-hint {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 50rpx;
	height: 50rpx;
	background-color: rgba(0, 0, 0, 0.6);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 4rpx solid #fff;
	backdrop-filter: blur(4px);
}

.info-list {
	background-color: #fff;
	margin: 100rpx 20rpx 0;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
	overflow: hidden;
}

.info-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx;
	border-bottom: 1rpx solid #f5f6f7;
	position: relative;
	transition: all 0.3s ease;
}

.info-item::after {
	content: '';
	position: absolute;
	left: 0;
	bottom: 0;
	width: 0;
	height: 2rpx;
	background-color: #0052d9;
	transition: width 0.3s ease;
}

.info-item:active::after {
	width: 100%;
}

.item-hover {
	background-color: #f9f9f9;
}

.item-label {
	font-size: 28rpx;
	color: #333;
	font-weight: 500;
}

.item-content {
	display: flex;
	align-items: center;
	color: #666;
	font-size: 28rpx;
}

.item-content text {
	margin-right: 10rpx;
}

/* 添加最后一个项目的特殊样式 */
.info-item:last-child {
	border-bottom: none;
}

/* 添加点击波纹效果 */
@keyframes ripple {
	to {
		transform: scale(2);
		opacity: 0;
	}
}

.info-item:active::before {
	content: '';
	position: absolute;
	left: 50%;
	top: 50%;
	width: 100rpx;
	height: 100rpx;
	background-color: rgba(0, 82, 217, 0.1);
	border-radius: 50%;
	transform: translate(-50%, -50%) scale(0);
	animation: ripple 0.6s ease-out;
}
</style>
