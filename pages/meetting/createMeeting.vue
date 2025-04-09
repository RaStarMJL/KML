<template>
  <view class="page">
    <view class="form-container">
      <view class="sticky-note">
        <view class="note-header">
          <text class="note-title">创建会议</text>
        </view>

        <!-- 基本信息 -->
        <view class="section-block">
          <text class="section-title">基本信息</text>
          <view class="input-group">
            <view class="input-item">
              <text class="label">会议主题</text>
              <input
                v-model="meeting.meetingName"
                class="input"
                placeholder="请输入会议主题"
                required
                @input="onInputChange" />
            </view>

            <view class="input-item">
              <text class="label">会议简介</text>
              <textarea
                v-model="meeting.meetingDescription"
                class="textarea"
                placeholder="请输入会议简介"
                required
                @input="onInputChange" />
            </view>
          </view>
        </view>

        <!-- 时间地点 -->
        <view class="section-block">
          <text class="section-title">时间地点</text>
          <view class="input-group">
            <picker
              mode="date"
              :value="meeting.startDate"
              @change="onStartDateChange"
              class="picker-item">
              <view class="picker-content">
                <text class="label">开始日期</text>
                <view class="picker-value">
                  <text class="icon">📅</text>
                  <text>{{ meeting.startDate || "请选择日期" }}</text>
                </view>
              </view>
            </picker>

            <picker
              mode="time"
              :value="meeting.startTime"
              @change="onStartTimeChange"
              class="picker-item">
              <view class="picker-content">
                <text class="label">开始时间</text>
                <view class="picker-value">
                  <text class="icon">🕒</text>
                  <text>{{ meeting.startTime || "请选择时间" }}</text>
                </view>
              </view>
            </picker>

            <picker
              mode="date"
              :value="meeting.endDate"
              @change="onEndDateChange"
              class="picker-item">
              <view class="picker-content">
                <text class="label">结束日期</text>
                <view class="picker-value">
                  <text class="icon">📅</text>
                  <text>{{ meeting.endDate || "请选择日期" }}</text>
                </view>
              </view>
            </picker>

            <picker
              mode="time"
              :value="meeting.endTime"
              @change="onEndTimeChange"
              class="picker-item">
              <view class="picker-content">
                <text class="label">结束时间</text>
                <view class="picker-value">
                  <text class="icon">🕒</text>
                  <text>{{ meeting.endTime || "请选择时间" }}</text>
                </view>
              </view>
            </picker>

            <view class="input-item">
              <text class="label">会议地点</text>
              <input
                v-model="meeting.meetingLocation"
                class="input"
                placeholder="请输入会议地点"
                required
                @input="onInputChange" />
            </view>

            <view class="input-item">
              <text class="label">预计人数</text>
              <input
                v-model.number="meeting.numAttendees"
                class="input"
                type="number"
                placeholder="请输入预计人数"
                required
                @input="onInputChange" />
            </view>
          </view>
        </view>

        <!-- 会议详情 -->
        <view class="section-block">
          <text class="section-title">会议详情</text>
          <view class="input-group">
            <view class="upload-section">
              <text class="label">会议封面</text>
              <view class="upload-area" @click="chooseImage">
                <image
                  v-if="imagePreview"
                  :src="imagePreview"
                  mode="aspectFill"
                  class="preview-image" />
                <view v-else class="upload-placeholder">
                  <text class="upload-icon">📸</text>
                  <text class="upload-text">点击上传封面图片</text>
                </view>
              </view>
            </view>

            <view class="input-item">
              <text class="label">会场规则</text>
              <textarea
                v-model="meeting.meetingRules"
                class="textarea"
                placeholder="请输入会场规则"
                @input="onInputChange" />
            </view>

            <view class="input-item">
              <text class="label">会场布局</text>
              <input
                v-model="meeting.venueLayout"
                class="input"
                placeholder="请输入会场布局"
                @input="onInputChange" />
            </view>

            <view class="input-item">
              <text class="label">餐饮服务</text>
              <input
                v-model="meeting.cateringService"
                class="input"
                placeholder="请输入餐饮安排"
                @input="onInputChange" />
            </view>
          </view>
        </view>

        <button class="submit-btn" @click="submitForm">创建会议</button>
      </view>
    </view>
  </view>
</template>

<script>
import { useUserInfoStore } from "/src/stores/modules/userInfo";

export default {
  data() {
    return {
      mapSelData: {},
      meeting: {
        meetingId: "",
        meetingName: "",
        meetingDescription: "",
        meetingImageUrl: "",
        meetingLocation: "",
        meetingRules: "",
        venueLayout: "",
        cateringService: "",
        meetingAttachments: [],
        numAttendees: 0,
        attendeesUid: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        organizerUid: "",
        meetingStatus: "Waiting",
        meetingType: "online",
        aiSummary: "",
        meetingHeat: 0,
        //meetingImage: '',
      },
      imagePreview: "",
      imageFile: null,
      formRules: {
        meetingName: { required: true, message: "请输入会议主题" },
        meetingDescription: { required: true, message: "请输入会议简介" },
        startDate: { required: true, message: "请选择开始日期" },
        startTime: { required: true, message: "请选择开始时间" },
        endDate: { required: true, message: "请选择结束日期" },
        endTime: { required: true, message: "请选择结束时间" },
        meetingLocation: { required: true, message: "请输入会议地点" },
        numAttendees: { required: true, message: "请输入预计人数" },
        meetingRules: { required: true, message: "请输入会场规则" },
        venueLayout: { required: true, message: "请输入会场布局" },
        cateringService: { required: true, message: "请输入餐饮安排" },
        //meetingImage: { required: true, message: '请选择会议封面图片' },
      },
      isFormModified: false,
      isNavigatingBack: false,
    };
  },
  watch: {
    meeting: {
      handler(newVal, oldVal) {
        if (oldVal.meetingName !== "") {
          this.isFormModified = true;
        }
      },
      deep: true,
    },
  },
  onBackPress(options) {
    if (this.isNavigatingBack) {
      return false;
    }

    if (!this.isFormModified) {
      return false;
    }

    uni.showModal({
      title: "提示",
      content: "当前页面内容未保存，是否确认退出？",
      cancelText: "取消",
      confirmText: "确认退出",
      success: (res) => {
        if (res.confirm) {
          this.isNavigatingBack = true;
          uni.navigateBack();
        }
      },
    });

    return true;
  },
  onUnload() {
    this.isNavigatingBack = false;
  },
  methods: {
    onInputChange() {
      this.isFormModified = true;
    },
    onStartDateChange(e) {
      this.meeting.startDate = e.detail.value;
      this.onInputChange();
    },
    onStartTimeChange(e) {
      this.meeting.startTime = e.detail.value;
      this.onInputChange();
    },
    onEndDateChange(e) {
      this.meeting.endDate = e.detail.value;
      this.onInputChange();
    },
    onEndTimeChange(e) {
      this.meeting.endTime = e.detail.value;
      this.onInputChange();
    },
    async chooseImage() {
      try {
        const res = await uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
        });
        
        console.log('选择图片的res:',res);
        this.imagePreview = res.tempFilePaths[0];
        this.imageFile = res.tempFiles[0];
        this.onInputChange();
      } catch (error) {
        console.error("选择图片失败:", error);
        uni.showToast({
          title: "选择图片失败",
          icon: "none",
        });
      }
    },
    validateForm() {
      for (const key in this.formRules) {
        const rule = this.formRules[key];
        const value = this.meeting[key];

        if (rule.required && !value) {
          uni.showToast({
            title: rule.message,
            icon: "none",
            duration: 2000,
          });
          return false;
        }
      }

      if (
        this.meeting.startDate &&
        this.meeting.startTime &&
        this.meeting.endDate &&
        this.meeting.endTime
      ) {
        const startDateTime = new Date(
          `${this.meeting.startDate} ${this.meeting.startTime}`
        );
        const endDateTime = new Date(
          `${this.meeting.endDate} ${this.meeting.endTime}`
        );

        if (endDateTime <= startDateTime) {
          uni.showToast({
            title: "结束时间必须晚于开始时间",
            icon: "none",
            duration: 2000,
          });
          return false;
        }
      }

      if (this.meeting.numAttendees <= 0) {
        uni.showToast({
          title: "预计人数必须大于0",
          icon: "none",
          duration: 2000,
        });
        return false;
      }

      return true;
    },
    generateRoomId() {
      const roomId = String(Math.ceil(Math.random() * 1000000));
      return roomId;
    },

    async submitForm() {
      if (!this.validateForm()) {
        return;
      }

      try {
        uni.showLoading({
          title: "创建中...",
        });

        // 获取用户信息
        const userInfoStore = useUserInfoStore();
        const userId = userInfoStore.userInfo?.userId;

        if (!userId) {
          throw new Error("用户未登录");
        }

        // 检查是否选择了图片
        if (!this.imagePreview) {
          throw new Error("请选择会议封面图片");
        }

        // 组合日期和时间为ISO格式
        const startDateTime = new Date(
          `${this.meeting.startDate} ${this.meeting.startTime}`
        ).toISOString();
        const endDateTime = new Date(
          `${this.meeting.endDate} ${this.meeting.endTime}`
        ).toISOString();

        // 准备会议记录数据
        const meetrec = {
          meetingId: this.generateRoomId(),
          meetingName: this.meeting.meetingName,
          meetingDescription: this.meeting.meetingDescription,
          meetingImageUrl: "", // 这个字段会由后端处理后返回
          meetingLocation: this.meeting.meetingLocation,
          meetingRules: this.meeting.meetingRules,
          venueLayout: this.meeting.venueLayout,
          cateringService: this.meeting.cateringService,
          meetingAttachments: [],
          numAttendees: parseInt(this.meeting.numAttendees),
          attendeesUid: [],
          startTime: startDateTime,
          endTime: endDateTime,
          organizerUid: userId,
          meetingStatus: "Waiting",
          meetingType: this.meeting.meetingType,
          aiSummary: "",
          meetingHeat: 0,
          meetingDetail: this.meeting.meetingDescription, // 使用会议简介作为详细信息
        };

        console.log("准备发送的会议数据:", meetrec);
        console.log("图片信息:", {
          path: this.imagePreview,
          size: this.imageFile.size,
        });

        // 发送请求
        const response = await new Promise((resolve, reject) => {
          uni.uploadFile({
            url: "http://192.168.31.115:5000/user/hostmeetings",
            filePath: this.imagePreview,
            name: "meetingImage", // 与后端 MultipartFile meetingImage 字段对应
            formData: {
              meetrec: JSON.stringify(meetrec),
            },
            success: (uploadRes) => {
              try {
                console.log("上传响应:", uploadRes);
                const result = JSON.parse(uploadRes.data);
                resolve(result);
              } catch (e) {
                console.error("解析响应失败:", e);
                reject(new Error("解析响应失败"));
              }
            },
            fail: (error) => {
              console.error("上传失败:", error);
              reject(error);
            },
          });
        });

        uni.hideLoading();

        console.log("response是", response);

        if (response.code === 1) {
          this.isFormModified = false;
          uni.showToast({
            title: "创建成功",
            icon: "success",
          });
          setTimeout(() => {
            uni.navigateBack({
              delta: 1,
            });
          }, 1500);
        } else {
          throw new Error(response.msg || "创建失败");
        }
      } catch (error) {
        uni.hideLoading();
        console.error("创建失败:", error);
        uni.showToast({
          title: error.message || "创建失败",
          icon: "none",
        });
      }
    },
  },
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.sticky-note {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.note-header {
  margin-bottom: 32px;
  text-align: center;
}

.note-title {
  font-size: 24px;
  font-weight: 600;
  color: #2d3748;
}

.section-block {
  margin-bottom: 32px;
  padding: 24px;
  border-radius: 12px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

/* 为不同区块设置不同的样式 */
.section-block:nth-child(2) {
  background: linear-gradient(to right bottom, #eef2ff, #ffffff);
  border: 1px solid #c7d2fe;
}

.section-block:nth-child(3) {
  background: linear-gradient(to right bottom, #f0fdf4, #ffffff);
  border: 1px solid #bbf7d0;
}

.section-block:nth-child(4) {
  background: linear-gradient(to right bottom, #fef2f2, #ffffff);
  border: 1px solid #fecaca;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 为不同区块的标题添加不同的颜色 */
.section-block:nth-child(2) .section-title {
  color: #4f46e5;
}

.section-block:nth-child(3) .section-title {
  color: #16a34a;
}

.section-block:nth-child(4) .section-title {
  color: #dc2626;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
}

.input-item {
  width: 100%;
  box-sizing: border-box;
}

.label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 8px;
  opacity: 0.8;
}

.choose-des {
}

.input {
  width: 100%;
  height: 40px;
  padding: 0 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 8px;
  font-size: 14px;
  color: #2d3748;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  transition: all 0.2s;
  box-sizing: border-box;
}

.textarea {
  width: 100%;
  height: 100px;
  padding: 12px 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 8px;
  font-size: 14px;
  color: #2d3748;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  resize: none;
  box-sizing: border-box;
}

.input:focus,
.textarea:focus {
  background: #ffffff;
  border-color: currentColor;
  box-shadow: 0 0 0 3px rgba(currentColor, 0.1);
}

.section-block:nth-child(2) .input:focus,
.section-block:nth-child(2) .textarea:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.section-block:nth-child(3) .input:focus,
.section-block:nth-child(3) .textarea:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
}

.section-block:nth-child(4) .input:focus,
.section-block:nth-child(4) .textarea:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.picker-item {
  width: 100%;
  box-sizing: border-box;
}

.picker-content {
  width: 100%;
  box-sizing: border-box;
}

.picker-value {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 40px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  box-sizing: border-box;
}

.upload-section {
  width: 100%;
  box-sizing: border-box;
}

.upload-area {
  width: 100%;
  height: 200px;
  border: 2px dashed rgba(226, 232, 240, 0.8);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
}

.upload-area:hover {
  border-color: currentColor;
  background: rgba(255, 255, 255, 0.95);
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  background: white;
}

.upload-icon {
  font-size: 32px;
}

.upload-text {
  font-size: 14px;
  color: #4a5568;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.submit-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, #4f46e5, #3730a3);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  margin-top: 32px;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  transition: all 0.3s ease;
}

.submit-btn:active {
  background: linear-gradient(135deg, #3730a3, #312e81);
  transform: translateY(1px);
}

/* 添加图标到标题 */
.section-block:nth-child(2) .section-title::before {
  content: "📝";
}

.section-block:nth-child(3) .section-title::before {
  content: "📅";
}

.section-block:nth-child(4) .section-title::before {
  content: "📋";
}

/* 响应式优化 */
@media screen and (max-width: 640px) {
  .page {
    padding: 12px;
  }

  .sticky-note {
    padding: 16px;
  }

  .section-block {
    padding: 20px;
  }

  .section-title {
    font-size: 16px;
  }
}
</style>
