<template>
  <div class="container">
    <div class="header">
      <div class="icon">
        <text>音频</text>
        <uni-icons
          type="sound"
          size="20"
          class="icons"
          color="#1ba035"></uni-icons>
      </div>
      <div class="setting-items">
        <text>入会开启麦克风</text>
        <switch :checked="meetingSettings.enableMicOnJoin" @change="handleMicOnJoinChange" />
      </div>
      <div class="setting-items">
        <text>入会开启扬声器</text>
        <switch :checked="meetingSettings.enableSpeakerOnJoin" @change="handleSpeakerOnJoinChange" />
      </div>
      <div class="setting-items">
        <text>开启麦克风浮窗</text>
        <switch :checked="meetingSettings.enableMicFloatWindow" @change="handleMicFloatWindowChange" />
      </div>
      <div class="setting-items">
        <text>开麦时播放提示音</text>
        <switch :checked="meetingSettings.enableMicPromptTone" @change="handleMicPromptToneChange" />
      </div>
    </div>

    <div class="header">
      <div class="icon">
        <text>视频</text>
        <uni-icons
          type="videocam"
          size="20"
          color="#1ba035"
          class="icons"></uni-icons>
      </div>

      <div class="setting-items">
        <text>入会开启摄像头</text>
        <switch :checked="meetingSettings.enableCameraOnJoin" @change="handleCameraOnJoinChange" />
      </div>

      <div class="setting-items">
        <text>虚拟数字人</text>
        <switch :checked="meetingSettings.enableVirtualDigitalHuman" @change="handleVirtualDigitalHumanChange" />
      </div>

      <div class="setting-items">
        <text>水牌</text>
        <switch :checked="meetingSettings.enableWatermark" @change="handleWatermarkChange" />
      </div>

      <div class="setting-items">
        <text>虚拟头像</text>
        <uni-icons type="arrowright" size="20" @click=""></uni-icons>
      </div>
    </div>

    <div class="header">
      <div class="icon">
        <text>聊天</text>
        <uni-icons
          type="chat"
          size="20"
          color="#007aff"
          class="icons"></uni-icons>
      </div>
      <div class="setting-items">
        <text>显示弹幕</text>
        <switch :checked="meetingSettings.enableDanmaku" @change="handleDanmakuChange" />
      </div>
    </div>

    <div class="header">
      <div class="icon">
        <text>通用</text>
        <uni-icons
          type="gear"
          size="20"
          color="#57617c"
          class="icons"></uni-icons>
      </div>
      <div class="setting-items">
        <text>字幕和转写</text>
        <uni-icons type="arrowright" size="20"></uni-icons>
      </div>

      <div class="setting-items">
        <text>显示参会时长</text>
        <switch :checked="meetingSettings.showMeetingDuration" @change="handleShowMeetingDurationChange" />
      </div>

      <div class="setting-items">
        <text>AI浮窗</text>
        <switch :checked="meetingSettings.enableAIFloatWindow" @change="handleAIFloatWindowChange" />
      </div>

      <div class="setting-items">
        <text>实时语音转文字</text>
        <switch :checked="meetingSettings.enableRealTimeSpeechToText" @change="handleRealTimeSpeechToTextChange" />
      </div>
    </div>
  </div>
</template>

<script>
import { useMeetingSettingStore } from "../../src/stores/modules/meetingSetting";
import { storeToRefs } from "pinia";

export default {
  setup() {
    const meetingSettingStore = useMeetingSettingStore();
    const meetingSettings = storeToRefs(meetingSettingStore);

    return {
      meetingSettings,
      meetingSettingStore
    };
  },
  methods: {
    // 音频设置
    handleMicOnJoinChange(e) {
      this.meetingSettingStore.enableMicOnJoin = e.detail.value;
    },
    handleSpeakerOnJoinChange(e) {
      this.meetingSettingStore.enableSpeakerOnJoin = e.detail.value;
    },
    handleMicFloatWindowChange(e) {
      this.meetingSettingStore.enableMicFloatWindow = e.detail.value;
    },
    handleMicPromptToneChange(e) {
      this.meetingSettingStore.enableMicPromptTone = e.detail.value;
    },

    // 视频设置
    handleCameraOnJoinChange(e) {
      this.meetingSettingStore.enableCameraOnJoin = e.detail.value;
    },
    handleVirtualDigitalHumanChange(e) {
      this.meetingSettingStore.enableVirtualDigitalHuman = e.detail.value;
    },
    handleWatermarkChange(e) {
      this.meetingSettingStore.enableWatermark = e.detail.value;
    },

    // 聊天设置
    handleDanmakuChange(e) {
      this.meetingSettingStore.enableDanmaku = e.detail.value;
    },

    // 通用设置
    handleShowMeetingDurationChange(e) {
      this.meetingSettingStore.showMeetingDuration = e.detail.value;
    },
    handleAIFloatWindowChange(e) {
      this.meetingSettingStore.enableAIFloatWindow = e.detail.value;
    },
    handleRealTimeSpeechToTextChange(e) {
      this.meetingSettingStore.enableRealTimeSpeechToText = e.detail.value;
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding: 20rpx;
  padding-bottom: 120rpx; /* 增加底部间距 */
  border-radius: 1rpx solid #f5f6f7;
}

.header {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.setting-items {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f6f7;
  background-color: white;
  border-radius: 8px;
}

.icon {
  display: flex;
  font-size: 25rpx;
  color: gray;
  margin-left: 5rpx;
  align-items: center;
}
.icons {
  margin-left: 5rpx;
}
</style>
