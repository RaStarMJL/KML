<template>
  <view class="meeting-upload-container">
    <view class="header">
      <text class="title">会议附件上传</text>
    </view>

    <view v-if="meetingId" class="content">
      <text class="meeting-id">当前会议名称: {{ meetingName }}</text>

      <view class="upload-area" @touchmove.prevent @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop" :class="{ 'dragover': isDragging, 'uploading': uploading }"
        @click="triggerFileInput">
        <input type="file" ref="fileInput" @change="handleFileSelect" accept=".pdf,.ppt,.pptx,.doc,.docx"
          style="display: none;">
        <view class="upload-prompt" v-if="!selectedFile">
          <uni-icons custom-prefix="custom-icon" type="icon-upload" size="48" color="#2B58F9"></uni-icons>
          <text class="prompt-text">点击此处上传</text>
          <text class="prompt-text">支持 PDF、PPT、Word 格式</text>
        </view>
        
        <view class="upload-progress" v-else-if="uploading">
          <view class="progress-circle">
            <uni-icons type="refresh" size="24" color="#2B58F9" :class="{ 'rotating': true }"></uni-icons>
          </view>
          <text class="progress-text">正在上传...</text>
        </view>
        
        <view class="selected-file" v-else>
          <view class="file-preview">
            <view class="ffile-icon" :class="getFileIconClass(selectedFile.name.split('.').pop() || '')">
              <image class="file-type-icon" :src="getFileIconSrc(selectedFile.name.split('.').pop() || '')" mode="aspectFit"></image>
            </view>
            <view class="preview-info">
              <text class="preview-name">{{ selectedFile.name }}</text>
              <text class="preview-size">{{ formatFileSize(selectedFile.size) }}</text>
            </view>
          </view>
          <view class="file-actions">
            <button class="action-btn cancel" @click.stop="clearFile">
              <uni-icons type="close" size="16" color="#666"></uni-icons>
              <text>取消</text>
            </button>
            <button class="action-btn upload" @click.stop="uploadFile">
              <uni-icons type="upload" size="16" color="#fff"></uni-icons>
              <text>上传</text>
            </button>
          </view>
        </view>
      </view>

      <view v-if="filehadupload.length > 0" class="ffile-list-container">
        <view class="ffile-list-header">
          <text class="ffile-list-title">已上传文件</text>
          <text class="ffile-list-count">共 {{ filehadupload.length }} 个文件</text>
        </view>
        <view class="ffile-list">
          <view class="ffile-item" v-for="(file, index) in filehadupload" :key="index">
            <view class="ffile-icon" :class="getFileIconClass(file.fileextension)">
              <image class="file-type-icon" :src="getFileIconSrc(file.fileextension)" mode="aspectFit" ></image>
            </view>
            <view class="ffile-info">
              <text class="ffile-name">{{ file.filename }}</text>
              <text class="ffile-size">{{ formatFileSize(file.filesize) }}</text>
            </view>
            <view class="ffile-status">
              <view class="status-icon success">
                <text class="iconfont icon-success"></text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- <view v-if="selectedFile" class="file-info">
        <text class="file-info-text">已选择文件: {{ selectedFile.name }}</text>
        <text class="file-info-text">文件大小: {{ formatFileSize(selectedFile.size) }}</text>
        <view class="button-group">
          <button @click="uploadFile" class="submit-btn" :disabled="uploading">
            {{ uploading ? '上传中...' : '上传文件' }}
          </button>
          <button @click="clearFile" class="cancel-btn">取消</button>
        </view>
      </view> -->
<!-- 
      <view v-if="uploadSuccess" class="result-message success">
        <text>文件上传成功!</text>
        <button @click="resetForm" class="upload-btn">继续上传</button>
      </view> -->

      <view v-if="errorMessage" class="result-message error">
        <text>{{ errorMessage }}</text>
        <button @click="clearError" class="cancel-btn">确定</button>
      </view>
    </view>

    <view v-else class="no-meeting-id">
      <text>未获取到会议ID，请从正确入口进入</text>
      <button @click="goBack" class="upload-btn">返回</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { get_localsign } from '@/src/services/api';
import { useUserInfoStore } from "/src/stores/modules/userInfo";
import { api_uploadDocument } from '@/src/services/api';

interface IFileHadUpload {
  filename: string;
  filesize: string;
  fileextension: string;
}

const userInfoStore = useUserInfoStore();
const userid = userInfoStore.userInfo.userId;

const meetingId = ref<string>('');
const meetingName = ref<string>('');
const selectedFile = ref<File | null>(null);
const selectedFilePath = ref<string>('');
const uploading = ref(false);
const uploadSuccess = ref(false);
const errorMessage = ref('');
const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const filehadupload = ref<IFileHadUpload[]>([]);

const specialfileid = ref('');

// 获取页面参数
onLoad((options) => {
  meetingId.value = options.meetingId || '';
  meetingName.value = options.meetingName || '';
  console.log(meetingId.value);
  console.log(meetingName.value);
});


// 触发文件选择
const triggerFileInput = async () => {
  const chooseFilePlugin = uni.requireNativePlugin('GW-ChooseFileModule')
  chooseFilePlugin.chooseFile({
    count: 1,
    extension: ["pdf", "ppt", "docx"],
    paths: [{
      deep: true,
      path: 'Download'
    }
    ]
  },
    (res) => {
      console.log(res)
      validateAndSetFile(res.files[0])
      if(errorMessage.value != ''){
        uni.showToast({
          title: errorMessage.value,
          icon: 'none'
        });
        return;
      }
      selectedFile.value = res.files[0];
      selectedFilePath.value = "file://" + res.files[0].path
      errorMessage.value = '';
      uploadSuccess.value = false;
    })
};



// 验证并设置文件
const validateAndSetFile = (file: File) => {
  if (!file) return;

  const validExtensions = ['.pdf', '.ppt', '.docx', '.txt'];
  console.log('选择文件的name:', file.name);
  console.log('选择文件的size:', file.size);
  console.log('选择文件的extension:', file.extension);
  console.log('选择文件的path:', file.path);

  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

  if (!validExtensions.includes(fileExtension)) {
    uni.showToast({
      title: '不支持的文件格式，请上传PDF、PPT、DOCX等文档格式',
      icon: 'none'
    });
    errorMessage.value = '不支持的文件格式，请上传PDF、PPT、DOCX等文档格式';
    return;
  }

  // 检查文件大小 (限制50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {

    uni.showToast({
      title: '文件大小超过50MB限制',
      icon: 'none'
    });
    errorMessage.value = '文件大小超过50MB限制';
    return;
  }

  if(!file.name.includes(meetingName.value)){
    uni.showToast({
      title: '文件名需要包含会议名称，请重新命名(“会议名称-文件名”)',
      icon: 'none'
    });
    errorMessage.value = '文件名需要包含会议名称，请重新命名(“会议名称-文件名”)';
    return;
  }
  console.log('已上传的文件:', filehadupload.value);
};



// 上传文件
const uploadFile = async () => {
  if (!selectedFilePath.value || !meetingId.value) return;
  try {
    uploading.value = true;
    errorMessage.value = '';
    const res = await get_localsign({
      key: 'hengnaozYW3SnQJNy5hIzs2pp8w',
      secret: 'ytr013e66pdjdf5fns5j0ca8u2c5hu41'
    });
    console.log('获取到的本地签名:', res.data);
    const localsign = res.data;


    //在UniApp中上传文件使用uni.uploadFile
    const uploadTask = uni.uploadFile({
      url: 'https://www.das-ai.com/open/api/v2/agent/file/upload', // 第一次上传
      filePath: selectedFilePath.value || '',
      name: 'file',
      header: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
        'appKey': 'hengnaozYW3SnQJNy5hIzs2pp8w',
        'sign': localsign
      },

      success: (uploadRes) => {
        console.log('第一层上传成功后的uploadRes:', uploadRes);
        const data = JSON.parse(uploadRes.data);
        if (data.code === 0) {

          specialfileid.value = data.data;
          console.log('上传成功后的specialfileid:', specialfileid.value);

          ///////////////////////////////////////////////////////////////
          const uploadTask2 = uni.uploadFile({
            url: 'https://www.das-ai.com/open/api/v2/document/upload', // 第二次上传
            filePath: selectedFilePath.value || '',
            name: 'file',
            header: {
              'Content-Type': 'multipart/form-data',
              'Accept': 'application/json',
              'appKey': 'hengnaozYW3SnQJNy5hIzs2pp8w',
              'sign': localsign
            },
            formData: {
              owner: userid,
              sourceId: meetingId.value,
              fileId: generateSixDigitString(),
              label: [meetingName.value]
            },

            success: (uploadRes) => {
              console.log('第二层上传成功后的uploadRes:', uploadRes);

              ///////////////////////////////////////////////////////////////
              const data = {                                                  //第三次上传
                meetingId: meetingId.value,
                meetingName: meetingName.value,
                attachmentUrl: "",
                fileId: specialfileid.value,
                sourceId: meetingId.value,
                ownerId: userid,
                attachmentName: selectedFile.value?.name || '',
                attachmentType: selectedFile.value?.extension || '',
              }
              console.log('第三层上传的data:', data);


              api_uploadDocument(data).then((res) => {
                console.log('第三层上传的res:', res);
                if (res.code === 1) {
                  console.log('第三层上传成功后的res:', res);
                  
                  const hadupload: IFileHadUpload = {
                    filename: selectedFile.value?.name || '',
                    filesize: selectedFile.value?.size.toString() || '',
                    fileextension: selectedFile.value?.extension || '',
                  }
                  selectedFile.value = null;
                  uploadSuccess.value = true;
                  uploading.value = false;
                  filehadupload.value.push(hadupload);
                  
                  console.log('第三层上传成功后的filehadupload:', filehadupload.value);
                } else {
                  errorMessage.value = res.data.message || '上传失败';
                }
              })
              ///////////////////////////////////////////////////////////////
            },

            fail: (err) => {
              console.error('上传失败:', err);
              errorMessage.value = '上传失败，请稍后重试';
            },
          })

          uploadTask2.onProgressUpdate((res) => {
            console.log('第二层上传进度:', res.progress);
          });
          ///////////////////////////////////////////////////////////////

        } else {
          errorMessage.value = data.message || '上传失败';
        }
      },
      fail: (err) => {
        console.error('上传失败:', err);
        errorMessage.value = '上传失败，请稍后重试';
      },
      
    });

    // 可以监听上传进度
    uploadTask.onProgressUpdate((res) => {
      console.log('第一层上传进度:', res.progress);
    });

  } catch (error) {
    errorMessage.value = '上传失败，请稍后重试';
    uploading.value = false;
  }
};


// 生成6位随机字符串
const generateSixDigitString = (): string => {
  const num = Math.floor(Math.random() * 1000000);
  return num.toString().padStart(6, '0');
}
// 拖拽相关处理 (在部分移动端可能不支持)
const handleDragOver = () => {
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    validateAndSetFile(event.dataTransfer.files[0]);
  }
};
// 清除文件
const clearFile = () => {
  selectedFile.value = null;
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 重置表单
const resetForm = () => {
  uploadSuccess.value = false;
  errorMessage.value = '';
};

// 清除错误
const clearError = () => {
  errorMessage.value = '';
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

// 获取文件图标类名
const getFileIconClass = (extension: string) => {
  const ext = extension.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc' || ext === 'docx') return 'docx';
  if (ext === 'ppt' || ext === 'pptx') return 'ppt';
  return 'file';
};




// 获取文件图标路径
const getFileIconSrc = (extension: string) => {
  const ext = extension.toLowerCase();
  if (ext === 'pdf') return '/src/static/images/pdf.png';
  if (ext === 'doc' || ext === 'docx') return '/src/static/images/word.png';
  if (ext === 'ppt' || ext === 'pptx') return '/src/static/images/ppt.png';
  return '/src/static/images/file.png';
};

</script>
<style lang="scss">
.meeting-upload-container {
  min-height: 100vh;
  background: linear-gradient(145deg, #f0f2f5, #e6e9ed);
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.header {
  margin-bottom: 40rpx;
  text-align: center;
  position: relative;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 30rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  animation: slideDown 0.6s ease-out;
}

.title {
  font-size: 40rpx;
  font-weight: 600;
  background: linear-gradient(135deg, #1a73e8, #4285f4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 4rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.meeting-id {
  font-size: 28rpx;
  color: #666;
  padding: 24rpx 36rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  gap: 16rpx;
  border: 1px solid rgba(26, 115, 232, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:active {
    transform: scale(0.98) translateY(2rpx);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
  }
}

.upload-area {
  background: rgba(255, 255, 255, 0.98);
  border: 2rpx dashed rgba(26, 115, 232, 0.3);
  border-radius: 30rpx;
  padding: 80rpx 40rpx;
  text-align: center;
  margin: 40rpx 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(20px);
  
  &.dragover {
    border-color: #1a73e8;
    background: rgba(26, 115, 232, 0.03);
    transform: scale(1.02);
    box-shadow: 0 16rpx 48rpx rgba(26, 115, 232, 0.12);
  }
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  animation: float 3s ease-in-out infinite;
  
  .prompt-text {
    font-size: 28rpx;
    color: #666;
    text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
    
    &:first-child {
      font-size: 34rpx;
      color: #1a73e8;
      font-weight: 600;
      letter-spacing: 2rpx;
    }
  }
}

.file-info {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  border: 2rpx solid rgba(43, 88, 249, 0.1);
}

.file-info-text {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  
  &::before {
    content: "📄";
    font-size: 32rpx;
  }
}

.button-group {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

button {
  flex: 1;
  height: 88rpx;
  font-size: 30rpx;
  font-weight: 500;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  transition: all 0.3s ease;
}

.upload-btn {
  background: linear-gradient(135deg, #2B58F9, #4080FF);
  color: white;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(43, 88, 249, 0.2);
  
  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 12rpx rgba(43, 88, 249, 0.15);
  }
}

.submit-btn {
  background: linear-gradient(135deg, #18b566, #0DCE5A);
  color: white;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(24, 181, 102, 0.2);
  
  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 12rpx rgba(24, 181, 102, 0.15);
  }
  
  &[disabled] {
    background: linear-gradient(135deg, #a0d8b9, #b8e6c7);
    box-shadow: none;
  }
}

.cancel-btn {
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
  color: white;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(255, 77, 79, 0.2);
  
  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.15);
  }
}

.result-message {
  padding: 40rpx;
  border-radius: 24rpx;
  text-align: center;
  margin-top: 30rpx;
  backdrop-filter: blur(10px);
  animation: slideIn 0.5s ease;
  
  text {
    font-size: 30rpx;
    display: block;
    margin-bottom: 24rpx;
    font-weight: 500;
  }
}

.success {
  background: rgba(24, 181, 102, 0.1);
  border: 2rpx solid rgba(24, 181, 102, 0.2);
  color: #18b566;
}

.error {
  background: rgba(255, 77, 79, 0.1);
  border: 2rpx solid rgba(255, 77, 79, 0.2);
  color: #ff4d4f;
}

.no-meeting-id {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 30rpx;
  color: #ff4d4f;
  animation: fadeIn 0.5s ease;
  
  text {
    font-size: 32rpx;
    font-weight: 500;
    background: rgba(255, 77, 79, 0.1);
    padding: 20rpx 40rpx;
    border-radius: 16rpx;
    border: 2rpx solid rgba(255, 77, 79, 0.2);
  }
}

/* 文件列表样式 */
.ffile-list-container {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 30rpx;
  padding: 40rpx;
  margin-top: 40rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  animation: slideUp 0.6s ease-out;
}

.ffile-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 36rpx;
  padding-bottom: 24rpx;
  border-bottom: 2rpx solid rgba(26, 115, 232, 0.1);
}

.ffile-list-title {
  font-size: 34rpx;
  font-weight: 600;
  background: linear-gradient(135deg, #1a73e8, #4285f4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 2rpx;
}

.ffile-list-count {
  font-size: 24rpx;
  color: #1a73e8;
  background: rgba(26, 115, 232, 0.08);
  padding: 8rpx 24rpx;
  border-radius: 24rpx;
  font-weight: 500;
}

.ffile-item {
  display: flex;
  align-items: center;
  padding: 28rpx;
  margin-bottom: 20rpx;
  background: #ffffff;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(26, 115, 232, 0.08);
  animation: slideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  
  &:hover {
    transform: translateY(-4rpx) scale(1.01);
    box-shadow: 0 12rpx 36rpx rgba(26, 115, 232, 0.08);
  }
}

.ffile-icon {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
  margin-right: 28rpx;
  transition: all 0.3s ease;
  
  &.pdf {
    background: linear-gradient(135deg, rgba(255, 82, 82, 0.1), rgba(255, 82, 82, 0.05));
  }
  
  &.docx {
    background: linear-gradient(135deg, rgba(26, 115, 232, 0.1), rgba(26, 115, 232, 0.05));
  }
  
  &.ppt {
    background: linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(255, 153, 0, 0.05));
  }
  
  .file-type-icon {
    width: 52rpx;
    height: 52rpx;
    object-fit: contain;
    filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
  }
}

.ffile-info {
  flex: 1;
  margin-right: 20rpx;
}

.ffile-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ffile-size {
  font-size: 24rpx;
  color: #999;
  display: flex;
  align-items: center;
  gap: 8rpx;
  
  &::before {
    content: "📊";
    font-size: 24rpx;
  }
}

.ffile-status {
  .status-icon {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &.success {
      background: rgba(24, 181, 102, 0.1);
    }
    
    &.error {
      background: rgba(255, 77, 79, 0.1);
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-12rpx) scale(1.02);
  }
}

.upload-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  padding: 48rpx;
  
  .progress-circle {
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(26, 115, 232, 0.1), rgba(26, 115, 232, 0.05));
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    
    .rotating {
      animation: rotate 1.5s linear infinite;
    }
  }
  
  .progress-text {
    font-size: 30rpx;
    color: #1a73e8;
    font-weight: 600;
    letter-spacing: 1rpx;
  }
}

.selected-file {
  .file-preview {
    display: flex;
    align-items: center;
    gap: 24rpx;
    padding: 32rpx;
    background: rgba(255, 255, 255, 0.98);
    border-radius: 20rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(26, 115, 232, 0.08);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2rpx);
      box-shadow: 0 12rpx 36rpx rgba(26, 115, 232, 0.08);
    }
  }
  
  .preview-info {
    flex: 1;
  }
  
  .preview-name {
    font-size: 30rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 8rpx;
    display: block;
  }
  
  .preview-size {
    font-size: 24rpx;
    color: #666;
    display: flex;
    align-items: center;
    gap: 8rpx;
  }
  
  .file-actions {
    display: flex;
    gap: 24rpx;
    justify-content: flex-end;
    margin-top: 24rpx;
  }
  
  .action-btn {
    height: 76rpx;
    padding: 0 44rpx;
    border-radius: 38rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    font-size: 28rpx;
    font-weight: 500;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &.cancel {
      background: #f5f7fa;
      color: #666;
      border: 1px solid #e0e3e7;
      
      &:active {
        background: #e8eaed;
        transform: scale(0.98);
      }
    }
    
    &.upload {
      background: linear-gradient(135deg, #1a73e8, #4285f4);
      color: #fff;
      box-shadow: 0 8rpx 24rpx rgba(26, 115, 232, 0.2);
      
      &:active {
        transform: scale(0.98) translateY(2rpx);
        box-shadow: 0 4rpx 12rpx rgba(26, 115, 232, 0.15);
      }
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(26, 115, 232, 0.4);
    transform: scale(1);
  }
  70% {
    box-shadow: 0 0 0 20rpx rgba(26, 115, 232, 0);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(26, 115, 232, 0);
    transform: scale(1);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>