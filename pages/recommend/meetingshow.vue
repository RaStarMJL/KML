<template>
  <kml-agent :x="0" :y="600" :isDock="true"> </kml-agent>
  <view class="meeting-detail">
    <!-- 会议状态卡片 -->
    <view class="status-card">
      <view class="status-tag" :class="meetingInfo.meetingStatus">
        {{ status }}
      </view>
      <view class="heat-info">
        <uni-icons
          type="fire-filled"
          color="red"
          size="24"
          class="title-icon"
        />
        <text>热度 {{ meetingInfo.meetingHeat }}</text>
      </view>
    </view>

    <!-- 会议基本信息 -->
    <view class="info-section">
      <view class="meeting-title">{{ meetingInfo.meetingName }}</view>
      <!-- 会议图片 -->
      <view class="meeting-image">
        <image
          :src="meetingInfo.meetingImageUrl"
          mode="aspectFill"
          class="cover-image"
        />
      </view>
      <view class="basic-info">
        <view class="info-row">
          <image src="/static/icons/time.png" class="icon" />
          <view class="time-info">
            <text class="date">{{ formatDate(meetingInfo.startTime) }}</text>
            <text class="time"
              >{{ formatTime(meetingInfo.startTime) }} -
              {{ formatTime(meetingInfo.endTime) }}</text
            >
          </view>
        </view>
        <view class="info-row">
          <image src="/static/icons/location.png" class="icon" />
          <text>{{ meetingInfo.meetingLocation }}</text>
        </view>
        <view class="info-row">
          <image src="/static/icons/organizer.png" class="icon" />
          <text>主办方：{{ meetingInfo.organizerUid }}</text>
        </view>
      </view>
    </view>

    <!-- 快速信息 -->
    <view class="quick-info">
      <view class="info-box">
        <text class="number">{{ meetingInfo.numAttendees }}</text>
        <text class="label">参会人数</text>
      </view>
      <view class="info-box">
        <text class="number">{{ getMeetingDuration() }}</text>
        <text class="label">会议时长</text>
      </view>
      <view class="info-box">
        <text class="type-tag">{{ meetingInfo.meetingType }}</text>
        <text class="label">会议类型</text>
      </view>
    </view>

    <!-- 会议介绍 -->
    <view class="section">
      <view class="section-title">
        <uni-icons type="compose" color="" size="24" class="title-icon" />
        会议简介
      </view>
      <view class="section-content">{{ meetingInfo.meetingDescription }}</view>
    </view>

    <!-- 会议详细介绍 -->
    <view class="section">
      <view class="section-title">
        <uni-icons type="wallet" color="" size="24" class="title-icon" />
        详细介绍
      </view>
      <view class="section-content">{{ meetingInfo.aiSummary }}</view>
    </view>

    <!-- 参会人员 -->
    <view class="section">
      <view class="section-title">
        <uni-icons type="person" color="" size="24" class="title-icon" />
        <!-- <image src="/src/static/images/ok.png" class="title-icon" /> -->
        参会人员
      </view>
      <view class="attendees-list">
        <view
          class="attendee-item"
          v-for="(uid, index) in meetingInfo.attendeesUid.slice(0, 4)"
          :key="index"
        >
          <image
            class="attendee-avatar"
            :src="attendeesAvatar[index]"
            mode="aspectFill"
          />
          <text class="attendee-name">用户{{ uid }}</text>
        </view>
        <view
          class="attendee-item add-more"
          v-if="meetingInfo.attendeesUid.length > 4"
        >
          <view class="more-circle">
            <text>+{{ meetingInfo.attendeesUid.length - 4 }}</text>
          </view>
          <text class="attendee-name">更多</text>
        </view>
      </view>
    </view>

    <!-- 其他信息 -->
    <view class="section">
      <view class="section-title">
        <image src="/static/icons/info.png" class="title-icon" />
        会议须知
      </view>
      <view class="info-grid">
        <view class="grid-item">
          <text class="grid-label">会议规则</text>
          <text class="grid-value">{{ meetingInfo.meetingRules }}</text>
        </view>
        <view class="grid-item">
          <text class="grid-label">场地布局</text>
          <text class="grid-value">{{ meetingInfo.venueLayout }}</text>
        </view>
        <view class="grid-item">
          <text class="grid-label">餐饮服务</text>
          <text class="grid-value">{{ meetingInfo.cateringService }}</text>
        </view>
      </view>
    </view>

    <!-- 会议附件 -->
    <view class="section">
      <view class="section-title">
        <uni-icons type="file" color="" size="24" class="title-icon" />
        会议附件
      </view>
      <view v-if="attachments.length < 1">
        <text>暂无附件</text>
      </view>
      <view v-else class="attachments-list">
        <view
          v-for="(file, index) in attachments"
          :key="index"
          class="attachment-item"
        >
          <view class="file-icon" :class="getFileClass(file.attachmentType)">
            <image
              :src="getFileIconSrc(file.attachmentType)"
              mode="aspectFit"
              :class="[
                'icon-image',
                { disabled: downloadStatus[file.fileId] === 'downloading' },
              ]"
              @click="
                downloadFile(
                  file.fileId,
                  file.attachmentType,
                  file.attachmentName,
                  file.attachmentUrl
                )
              "
            ></image>
            <!-- 下载状态指示器 -->
            <view
              v-if="downloadStatus[file.fileId] === 'downloading'"
              class="download-progress"
            >
              <view class="progress-bar">
                <view
                  class="progress-inner"
                  :style="{
                    width: downloadProgress[file.fileId] + '%',
                  }"
                ></view>
              </view>
              <text class="progress-text"
                >{{ downloadProgress[file.fileId] }}%</text
              >
            </view>
            <view
              v-else-if="downloadStatus[file.fileId] === 'completed'"
              class="download-completed"
            >
              <uni-icons
                type="checkmarkempty"
                color="#4CD964"
                size="16"
              ></uni-icons>
            </view>
          </view>
          <text class="file-name">{{
            file.attachmentName || getFileName(file.fileId)
          }}</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-buttons">
      <button class="btn join-btn" @click="handleMeetingOption()">
        {{ isHost ? "开始会议" : isSignUp ? "加入会议" : "报名会议" }}
      </button>
      <button class="btn nav-btn" @click="openNavigation">地图导航</button>
    </view>
  </view>
</template>

<script>
import { useRoomStore } from "../../src/roomkit/TUIRoom/stores/room.ts";
import { useUserInfoStore } from "../../src/stores/modules/userInfo.ts";
import router from "../../src/router/index.ts";
import {
  getMeetingData,
  userSignUpMeeting,
  getPathPlanning,
} from "../../src/services/api.ts";
import { updateMeetingStatus } from "../../src/services/api.ts";
import { incrementJoinCount } from "../../src/services/api.ts";
import { get_avatar } from "../../src/services/api.ts";
import { api_getMeetingDetail } from "../../src/services/api.ts";
import { api_downloadFile } from "../../src/services/api.ts";
import { get_localsign } from "../../src/services/api.ts";

export default {
  onLoad: function (option) {
    // 获取meetingId
    this.meetingInfo.meetingId = option.meetingId;
    console.log("meetingId:", this.meetingInfo.meetingId);
    // 获取会议数据
    this.fetchMeetingInfo();
    // 获取会议附件
    this.getMeetingAttachments();
    // 获取房间信息
    this.roomStore = useRoomStore();
    // 获取用户信息
    const userInfoStore = useUserInfoStore();
    this.userId = userInfoStore.userInfo.userId;
    // 自动加入会议
    if (option.autoJoin) {
      uni.showToast({
        title: "正在加入会议",
        icon: "loading",
        duration: 1000,
      });
      setTimeout(() => {
        this.joinMeeting();
      }, 1000);
    }
    // 自动开始会议
    if (option.autoStart) {
      uni.showToast({
        title: "正在开始会议",
        icon: "loading",
        duration: 1000,
      });
      setTimeout(() => {
        this.startMeeting();
      }, 1000);
    }
  },

  data() {
    return {
      meetingInfo: {
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
        attendeesUid: [],
        startTime: "",
        endTime: "",
        organizerUid: "",
        meetingStatus: "",
        meetingType: "",
        aiSummary: "",
        meetingHeat: 0,
        TUIRoomRef: null,
      },
      tuiRoomParam: {
        isOpenCamera: true,
        isOpenMicrophone: true,
        defaultCameraId: "",
        defaultMicrophoneId: "",
        defaultSpeakerId: "",
      },
      mode: "SpeakAfterTakingSeat",
      roomStore: null,
      userId: "",
      attendeesAvatar: [],
      attachments: [],
      localsign: "",
      // 下载状态管理
      downloadStatus: {}, // 存储每个文件的下载状态：'idle'(未下载), 'downloading'(下载中), 'completed'(已下载)
      downloadProgress: {}, // 存储每个文件的下载进度
    };
  },
  methods: {
    async handleUpdateMeetingStatus(status) {
      const meetingId = this.meetingInfo.meetingId;
      // 调用接口更新会议状态
      const res = await updateMeetingStatus({
        meetingId,
        status,
      });
      console.log("修改会议状态成功:", res);
    },
    startMeeting() {
      const roomMode = this.mode;
      const isSeatEnabled = Boolean(roomMode === "SpeakAfterTakingSeat");
      const roomParam = this.getRoomParam();
      const roomOption = {
        roomMode,
        roomParam,
        isSeatEnabled,
      };

      this.setTUIRoomData("createRoom", roomOption);
      const roomId = this.meetingInfo.meetingId;
      const meetingTitle = this.meetingInfo.meetingName;
      router.replace({
        path: "/src/roomkit/pages/room",
        query: {
          roomId,
          meetingTitle,
        },
      });
    },
    joinMeeting() {
      const roomParam = this.getRoomParam();
      const roomOption = {
        roomId: this.meetingInfo.meetingId,
        roomParam,
      };
      this.setTUIRoomData("enterRoom", roomOption);
      const meetingTitle = this.meetingInfo.meetingName;
      router.replace({
        path: "/src/roomkit/pages/room",
        query: {
          roomId: roomOption.roomId,
          meetingTitle,
        },
      });
    },
    // 获取rommParam
    getRoomParam() {
      this.tuiRoomParam.defaultCameraId = this.roomStore.currentCameraId;
      this.tuiRoomParam.defaultMicrophoneId =
        this.roomStore.currentMicrophoneId;
      this.tuiRoomParam.defaultSpeakerId = this.roomStore.currentSpeakerId;
      return this.tuiRoomParam;
    },

    setTUIRoomData(action, roomOption) {
      uni.setStorageSync(
        "tuiRoom-roomInfo",
        JSON.stringify({
          action,
          ...roomOption,
        })
      );
    },
    async fetchMeetingInfo() {
      try {
        // 这里替换为实际的API调用
        const res = await getMeetingData(this.meetingInfo.meetingId);
        if (res.code === 1) {
          this.meetingInfo = res.data;
          for (let i = 0; i < 4; i++) {
            const avatar = await get_avatar(res.data.attendeesUid[i]);
            this.attendeesAvatar.push(avatar.data);
          }
        }
      } catch (error) {
        uni.showToast({
          title: "获取会议信息失败",
          icon: "none",
        });
      }
    },
    async handleMeetingOption() {
      if (this.isHost) {
        uni.showModal({
          title: "提示",
          content: "确定开始会议吗",
          showCancel: true,
          success: ({ confirm, cancel }) => {
            if (confirm) {
              this.startMeeting();
              // 修改会议状态
              const res = this.handleUpdateMeetingStatus("Ongoing");
            } else if (cancel) {
              return;
            }
          },
        });
      } else {
        if (this.isSignUp) {
          // 用户已经报名会议
          switch (this.meetingInfo.meetingStatus) {
            case "Waiting": {
              uni.showToast({
                title: "会议还未开始，请耐心等待",
                icon: "none",
              });
              /*  uni.showModal({
                title: "提示",
                content: "会议正在进行中，确定加入会议吗",
                showCancel: true,
                success: ({ confirm, cancel }) => {
                  if (confirm) {
                    incrementJoinCount(this.meetingInfo.meetingId);
                    this.joinMeeting();
                  } else if (cancel) {
                    return;
                  }
                },
              }); */
              break;
            }
            case "Ongoing": {
              uni.showModal({
                title: "提示",
                content: "会议正在进行中，确定加入会议吗",
                showCancel: true,
                success: ({ confirm, cancel }) => {
                  if (confirm) {
                    this.joinMeeting();
                    // 记录用户加入会议
                    logUserJoinMeeting({
                      operatorUid: this.userId,
                      operationType: "加入会议",
                      meetingUid: this.meetingInfo.meetingId,
                    });
                  } else if (cancel) {
                    return;
                  }
                },
              });
              break;
            }
            case "Ended": {
              uni.showToast({
                title: "会议已经结束",
                icon: "none",
              });
              break;
            }
            default:
              return;
          }
        } else {
          // 用户未报名会议 点击进行报名
          const res = await userSignUpMeeting({
            userId: this.userId,
            meetingId: this.meetingInfo.meetingId,
          });
          if (res.code === 1) {
            uni.showToast({
              title: "报名成功",
              icon: "none",
              duration: 2000,
            });
            this.meetingInfo.attendeesUid.push(this.userId);
            this.meetingInfo.numAttendees++;
            this.fetchMeetingInfo();
          }
        }
      }
    },
    async handleCreateRoom(roomOption) {
      this.setTUIRoomData("createRoom", roomOption);
      // const roomId = await generateRoomId();
      router.replace({
        path: "/src/roomkit/pages/rome",
        query: {
          roomId: this.meetingInfo.meetingId,
        },
      });
    },
    openNavigation() {
      uni.navigateTo({
        url: `/pages/recommend/navigation/navigation?destination=${this.meetingInfo.meetingLocation}`,
      });
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },
    formatTime(dateStr) {
      const date = new Date(dateStr);
      return `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
    },
    getMeetingDuration() {
      const start = new Date(this.meetingInfo.startTime);
      const end = new Date(this.meetingInfo.endTime);
      const hours = Math.round((end - start) / (1000 * 60 * 60));
      return `${hours}小时`;
    },

    //获取会议附件
    async getMeetingAttachments() {
      try {
        const res = await api_getMeetingDetail(this.meetingInfo.meetingId);
        if (res.code === 1) {
          this.attachments = res.data;
        }
      } catch (error) {
        console.error("获取会议附件失败:", error);
        uni.showToast({
          title: "获取附件失败",
          icon: "none",
        });
      }
    },

    // 下载文件
    async downloadFile(fileId, attachmentType, attachmentName, attachmentUrl) {
      console.log("点击了文件下载");

      // 如果文件正在下载中，则不允许再次点击
      if (this.downloadStatus[fileId] === "downloading") {
        uni.showToast({
          title: "文件正在下载中",
          icon: "none",
        });
        return;
      }

      // 如果文件已下载完成，直接打开
      if (
        this.downloadStatus[fileId] === "completed" &&
        this.downloadedFiles &&
        this.downloadedFiles[fileId]
      ) {
        this.openDownloadedFile(this.downloadedFiles[fileId], attachmentType);
        return;
      }

      // 设置下载状态为下载中
      this.$set(this.downloadStatus, fileId, "downloading");
      this.$set(this.downloadProgress, fileId, 0);

      const downloadTask = uni.downloadFile({
        url: attachmentUrl,
        success: (res) => {
          console.log(res);
          if (res.statusCode === 200) {
            // 获取文件扩展名
            const fileName = attachmentName;
            console.log(fileName);

            // 设置下载状态为已完成
            this.$set(this.downloadStatus, fileId, "completed");
            this.$set(this.downloadProgress, fileId, 100);

            // 保存已下载文件的路径
            if (!this.downloadedFiles) this.downloadedFiles = {};
            this.downloadedFiles[fileId] = res.tempFilePath;

            if (uni.getSystemInfoSync().platform === "android") {
              uni.saveFile({
                tempFilePath: res.tempFilePath,
                success: (savedRes) => {
                  // 更新保存的文件路径
                  this.downloadedFiles[fileId] = savedRes.savedFilePath;

                  uni.openDocument({
                    filePath: savedRes.savedFilePath,
                    showMenu: true,
                    fileType: attachmentType.replace(".", ""), // 自动识别类型
                  });
                },
              });
            } else {
              uni.openDocument({
                filePath: res.tempFilePath,
                showMenu: true,
              });
            }
          }
        },
        fail: (err) => {
          console.error("下载失败:", err);
          // 重置下载状态
          this.$set(this.downloadStatus, fileId, "idle");
          uni.showToast({
            title: "下载失败",
            icon: "none",
          });
        },
      });

      // 监听下载进度
      downloadTask.onProgressUpdate((res) => {
        // 更新下载进度
        this.$set(this.downloadProgress, fileId, res.progress);

        console.log("下载进度" + res.progress);
        console.log("已经下载的数据长度" + res.totalBytesWritten);
        console.log("预期需要下载的数据总长度" + res.totalBytesExpectedToWrite);
      });
    },

    // 打开已下载的文件
    openDownloadedFile(filePath, attachmentType) {
      if (uni.getSystemInfoSync().platform === "android") {
        uni.openDocument({
          filePath: filePath,
          showMenu: true,
          fileType: attachmentType.replace(".", ""),
        });
      } else {
        uni.openDocument({
          filePath: filePath,
          showMenu: true,
        });
      }
    },
    // 保存文件到设备（Android专用）
    saveFileToDevice(tempPath) {
      const fileName = "document_" + Date.now() + ".docx";

      // 获取下载目录
      plus.io.requestFileSystem(plus.io.PRIVATE_DOC, (fs) => {
        fs.root.getDirectory("Download", { create: true }, (dirEntry) => {
          dirEntry.getFile(fileName, { create: true }, (fileEntry) => {
            // 文件复制操作
            plus.io.resolveLocalFileSystemURL(tempPath, (tmpFile) => {
              tmpFile.copyTo(
                dirEntry,
                fileName,
                (newFile) => {
                  uni.showToast({
                    title: "文件已保存至下载目录",
                    icon: "success",
                  });
                },
                (e) => {
                  console.error("保存失败:", e);
                  uni.showToast({ title: "文件保存失败", icon: "none" });
                }
              );
            });
          });
        });
      });
    },

    // 打开文件（全平台）
    openFile(filePath) {
      // APP/H5打开方式
      plus.runtime.openFile(filePath, {
        error: (e) => {
          console.error("打开失败:", e);
          uni.showToast({ title: "没有找到合适的应用打开", icon: "none" });
        },
      });
    },

    // 获取文件MIME类型
    getMimeType(fileType) {
      switch (fileType.toLowerCase()) {
        case "pdf":
          return "application/pdf";
        case "doc":
        case "docx":
          return "application/msword";
        case "ppt":
        case "pptx":
          return "application/vnd.ms-powerpoint";
        default:
          return "application/octet-stream";
      }
    },

    // 获取文件图标路径
    getFileIconSrc(type) {
      switch (type?.toLowerCase()) {
        case "pdf":
          return "/src/static/images/pdf.png";
        case "doc":
        case "docx":
          return "/src/static/images/word.png";
        case "ppt":
        case "pptx":
          return "/src/static/images/ppt.png";
        default:
          return "/src/static/images/file.png";
      }
    },

    // 获取文件样式类
    getFileClass(type) {
      switch (type?.toLowerCase()) {
        case "pdf":
          return "pdf-file";
        case "doc":
        case "docx":
          return "word-file";
        case "ppt":
        case "pptx":
          return "ppt-file";
        default:
          return "default-file";
      }
    },

    // 从fileId中提取文件名
    getFileName(fileId) {
      if (!fileId) return "未知文件";
      const match = fileId.match(/file:(.*?)</);
      return match ? match[1] : "未知文件";
    },
  },
  computed: {
    isSignUp() {
      return this.meetingInfo.attendeesUid.includes(this.userId);
    },
    isHost() {
      console.log(this.userId, this.meetingInfo.organizerUid);
      if (this.userId === this.meetingInfo.organizerUid) {
        return true;
      } else {
        return false;
      }
    },
    status() {
      switch (this.meetingInfo.meetingStatus) {
        case "Waiting": {
          return "会议即将开始";
        }
        case "Ongoing": {
          return "会议进行中";
        }
        case "Ended": {
          return "会议已结束";
        }
        default: {
          return "error";
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.meeting-detail {
  min-height: 100vh;
  background: #f5f6f7;
  padding: 12rpx;
  padding-bottom: 120rpx;
}

.status-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  margin-bottom: 12rpx;

  .status-tag {
    padding: 8rpx 20rpx;
    border-radius: 20rpx;
    font-size: 24rpx;

    &.Waiting {
      background: rgba(43, 88, 249, 0.1);
      color: #2b58f9;
    }

    &.Ongoing {
      background: rgba(82, 196, 26, 0.1);
      color: #52c41a;
    }

    &.Ended {
      background: rgba(153, 153, 153, 0.1);
      color: #999;
    }
  }

  .heat-info {
    display: flex;
    align-items: center;
    color: #ff4d4f;
    font-size: 24rpx;

    .fire-icon {
      width: 28rpx;
      height: 28rpx;
      margin-right: 8rpx;
    }
  }
}

.info-section {
  background: #fff;
  padding: 20rpx;
  border-radius: 16rpx;
  margin-bottom: 12rpx;
}

.meeting-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

/* 会议图片样式 */
.meeting-image {
  width: 100%;
  height: 240rpx;
  margin-bottom: 16rpx;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.02);
  }
}

.basic-info {
  .info-row {
    display: flex;
    align-items: center;
    font-size: 26rpx;
    color: #666;
    margin-bottom: 8rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .icon {
      width: 28rpx;
      height: 28rpx;
      margin-right: 12rpx;
    }
  }
}

.time-info {
  display: flex;
  align-items: center;

  .date {
    margin-right: 12rpx;
  }
}

.quick-info {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 20rpx;
  border-radius: 16rpx;
  margin-bottom: 12rpx;

  .info-box {
    width: 30%;
    flex: 1;
    text-align: center;
    display: flex;
    flex-direction: column;
    .number {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 8rpx;
    }

    .label {
      font-size: 24rpx;
      color: #999;
    }

    .type-tag {
      display: inline-block;
      padding: 4rpx 16rpx;
      background: rgba(43, 88, 249, 0.1);
      color: #2b58f9;
      border-radius: 12rpx;
      font-size: 24rpx;
      margin-bottom: 8rpx;
    }
  }
}

.section {
  background: #fff;
  padding: 24rpx;
  border-radius: 16rpx;
  margin-bottom: 12rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;

  .title-icon {
    width: 36rpx;
    height: 36rpx;
    margin-right: 12rpx;
    margin-bottom: 10rpx;
  }
}

.section-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.attendees-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.attendee-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100rpx;
}

.attendee-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-bottom: 12rpx;
  border: 2rpx solid #fff;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.more-circle {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;

  text {
    color: #666;
    font-size: 28rpx;
  }
}

.attendee-name {
  font-size: 24rpx;
  color: #666;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
}

.grid-item {
  background: rgba(43, 88, 249, 0.05);
  padding: 16rpx;
  border-radius: 12rpx;

  .grid-label {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 8rpx;
    display: block;
  }

  .grid-value {
    font-size: 28rpx;
    color: #333;
    line-height: 1.4;
  }
}

.bottom-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  padding: 16rpx;
  background: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  margin: 0 10rpx;

  &.join-btn {
    background: #2b58f9;
    color: #fff;
  }

  &.nav-btn {
    background: #fff;
    color: #2b58f9;
    border: 2rpx solid #2b58f9;
  }
}

.attachments-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 10rpx;
}

.attachment-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 140rpx;
  margin-bottom: 20rpx;
}

.file-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
  transition: transform 0.3s ease;

  &.pdf-file {
    background: linear-gradient(135deg, #ff5252, #ff1744);
  }

  &.word-file {
    background: linear-gradient(135deg, #2b579a, #4285f4);
  }

  &.ppt-file {
    background: linear-gradient(135deg, #c43e1c, #ff8f00);
  }

  &.default-file {
    background: linear-gradient(135deg, #757575, #9e9e9e);
  }

  &:hover {
    transform: scale(1.05);
  }
}

.file-name {
  font-size: 24rpx;
  color: #666;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
}
.file-icon {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 8px;
}

.icon-image {
  width: 40px;
  height: 40px;
}

.icon-image.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.download-progress {
  position: absolute;
  bottom: -10px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 2px;
}

.progress-inner {
  height: 100%;
  background-color: #007aff;
  border-radius: 2px;
  transition: width 0.2s;
}

.progress-text {
  font-size: 10px;
  color: #007aff;
}

.download-completed {
  position: absolute;
  bottom: -10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
}
</style>
