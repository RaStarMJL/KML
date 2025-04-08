<template>
  <view class="meeting-upload-container">
    <view class="header">
      <text class="title">会议附件上传</text>
    </view>

    <view v-if="meetingId" class="content">
      <text class="meeting-id">当前会议ID: {{ meetingId }}</text>

      <view class="upload-area" @touchmove.prevent @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave" @drop.prevent="handleDrop" :class="{ 'dragover': isDragging }"
        @click="triggerFileInput">
        <input type="file" ref="fileInput" @change="handleFileSelect" accept=".pdf,.ppt,.pptx,.doc,.docx"
          style="display: none;">
        <view class="upload-prompt">
          <text class="prompt-text">点击选择文件上传</text>
          <text class="prompt-text">支持格式: PDF, PPT, DOCX</text>
          <text class="prompt-text">最大50MB</text>
        </view>
      </view>

      <view v-if="filehadupload.length > 0" class="ffile-list-container">
        <view v-for="(file, index) in filehadupload" :key="index" class="ffile-item">
          <!-- 根据文件类型显示不同图标 -->
          <view class="ffile-icon">
            <uni-icons v-if="file.fileextension === 'pdf'" type="pdf" size="24" color="#FF5252"></uni-icons>
            <uni-icons v-else-if="file.fileextension === 'docx'" type="word" size="24" color="#2B579A"></uni-icons>
            <uni-icons v-else type="file" size="24" color="#757575"></uni-icons>
          </view>

          <!-- 文件信息 -->
          <view class="ffile-info">
            <text class="ffile-name">{{ file.filename }}</text>
            <text class="ffile-size">{{ formatFileSize(file.filesize) }}</text>
          </view>
        </view>
      </view>

      <view v-if="selectedFile" class="file-info">
        <text class="file-info-text">已选择文件: {{ selectedFile.name }}</text>
        <text class="file-info-text">文件大小: {{ formatFileSize(selectedFile.size) }}</text>
        <view class="button-group">
          <button @click="uploadFile" class="submit-btn" :disabled="uploading">
            {{ uploading ? '上传中...' : '上传文件' }}
          </button>
          <button @click="clearFile" class="cancel-btn">取消</button>
        </view>
      </view>

      <view v-if="uploadSuccess" class="result-message success">
        <text>文件上传成功!</text>
        <button @click="resetForm" class="upload-btn">继续上传</button>
      </view>

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
      path: 'Download/QQ'
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
      complete: () => {
        uploading.value = false;
      }
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


</script>
<style lang="scss">
.meeting-upload-container {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.header {
  padding: 30rpx 0;
  text-align: center;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.meeting-id {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 30rpx;
  display: block;
}

.upload-area {
  border: 4rpx dashed #ccc;
  border-radius: 16rpx;
  padding: 60rpx 40rpx;
  text-align: center;
  margin-bottom: 40rpx;
  background-color: #fff;
  transition: all 0.3s;
}

.upload-area.dragover {
  border-color: #2979ff;
  background-color: #f0f7ff;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.prompt-text {
  font-size: 28rpx;
  color: #666;
}

.file-info {
  padding: 30rpx;
  background-color: #ebf5ff;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
}

.file-info-text {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 30rpx;
  margin-top: 30rpx;
}

button {
  font-size: 28rpx;
  padding: 15rpx 40rpx;
  border-radius: 8rpx;
  border: none;
}

.upload-btn {
  background-color: #2979ff;
  color: white;
}

.submit-btn {
  background-color: #18b566;
  color: white;
}

.submit-btn[disabled] {
  background-color: #a0d8b9;
}

.cancel-btn {
  background-color: #ff4d4f;
  color: white;
}

.result-message {
  padding: 30rpx;
  border-radius: 16rpx;
  text-align: center;
  margin-top: 30rpx;

  text {
    font-size: 28rpx;
    display: block;
    margin-bottom: 20rpx;
  }
}

.success {
  background-color: #f0f9eb;
  color: #18b566;
}

.error {
  background-color: #fef0f0;
  color: #ff4d4f;
}

.no-meeting-id {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #ff4d4f;

  text {
    font-size: 28rpx;
    margin-bottom: 30rpx;
  }
}

/////
.ffile-list-container {
  padding: 20rpx;
}

.ffile-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  margin-bottom: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.ffile-icon {
  margin-right: 20rpx;
}

.ffile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.ffile-name {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400rpx;
}

.ffile-size {
  font-size: 24rpx;
  color: #999;
}

.ffile-actions {
  display: flex;
  align-items: center;
}

</style>