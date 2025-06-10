import { defineStore } from "pinia";
import { ref } from "vue";

// 定义 Store
export const useMeetingSettingStore = defineStore(
  "meetingSetting",
  () => {
    // 音频设置
    const enableMicOnJoin = ref(true); // 入会开启麦克风
    const enableSpeakerOnJoin = ref(true); // 入会开启扬声器
    const enableMicFloatWindow = ref(false); // 开启麦克风浮窗
    const enableMicPromptTone = ref(false); // 开麦时播放提示音

    // 视频设置
    const enableCameraOnJoin = ref(false); // 入会开启摄像头
    const enableVirtualDigitalHuman = ref(false); // 虚拟数字人
    const enableWatermark = ref(false); // 水牌

    // 聊天设置
    const enableDanmaku = ref(true); // 显示弹幕

    // 通用设置
    const showMeetingDuration = ref(true); // 显示参会时长
    const enableAIFloatWindow = ref(true); // AI浮窗
    const enableRealTimeSpeechToText = ref(true); // 实时语音转文字

    // 设置方法
    const setAudioSettings = (settings) => {
      enableMicOnJoin.value = settings.enableMicOnJoin;
      enableSpeakerOnJoin.value = settings.enableSpeakerOnJoin;
      enableMicFloatWindow.value = settings.enableMicFloatWindow;
      enableMicPromptTone.value = settings.enableMicPromptTone;
    };

    const setVideoSettings = (settings) => {
      enableCameraOnJoin.value = settings.enableCameraOnJoin;
      enableVirtualDigitalHuman.value = settings.enableVirtualDigitalHuman;
      enableWatermark.value = settings.enableWatermark;
    };

    const setChatSettings = (settings) => {
      enableDanmaku.value = settings.enableDanmaku;
    };

    const setGeneralSettings = (settings) => {
      showMeetingDuration.value = settings.showMeetingDuration;
      enableAIFloatWindow.value = settings.enableAIFloatWindow;
      enableRealTimeSpeechToText.value = settings.enableRealTimeSpeechToText;
    };

    const setAllSettings = (settings) => {
      // 音频设置
      enableMicOnJoin.value = settings.enableMicOnJoin;
      enableSpeakerOnJoin.value = settings.enableSpeakerOnJoin;
      enableMicFloatWindow.value = settings.enableMicFloatWindow;
      enableMicPromptTone.value = settings.enableMicPromptTone;

      // 视频设置
      enableCameraOnJoin.value = settings.enableCameraOnJoin;
      enableVirtualDigitalHuman.value = settings.enableVirtualDigitalHuman;
      enableWatermark.value = settings.enableWatermark;

      // 聊天设置
      enableDanmaku.value = settings.enableDanmaku;

      // 通用设置
      showMeetingDuration.value = settings.showMeetingDuration;
      enableAIFloatWindow.value = settings.enableAIFloatWindow;
      enableRealTimeSpeechToText.value = settings.enableRealTimeSpeechToText;
    };

    const getAllSettings = () => {
      return {
        // 音频设置
        enableMicOnJoin: enableMicOnJoin.value,
        enableSpeakerOnJoin: enableSpeakerOnJoin.value,
        enableMicFloatWindow: enableMicFloatWindow.value,
        enableMicPromptTone: enableMicPromptTone.value,

        // 视频设置
        enableCameraOnJoin: enableCameraOnJoin.value,
        enableVirtualDigitalHuman: enableVirtualDigitalHuman.value,
        enableWatermark: enableWatermark.value,

        // 聊天设置
        enableDanmaku: enableDanmaku.value,

        // 通用设置
        showMeetingDuration: showMeetingDuration.value,
        enableAIFloatWindow: enableAIFloatWindow.value,
        enableRealTimeSpeechToText: enableRealTimeSpeechToText.value,
      };
    };

    // 记得 return
    return {
      // 状态
      enableMicOnJoin,
      enableSpeakerOnJoin,
      enableMicFloatWindow,
      enableMicPromptTone,
      enableCameraOnJoin,
      enableVirtualDigitalHuman,
      enableWatermark,
      enableDanmaku,
      showMeetingDuration,
      enableAIFloatWindow,
      enableRealTimeSpeechToText,

      // 方法
      setAudioSettings,
      setVideoSettings,
      setChatSettings,
      setGeneralSettings,
      setAllSettings,
      getAllSettings,
    };
  },
  {
    // 多端API适配，持久化存储
    persist: {
      storage: {
        getItem(key) {
          return uni.getStorageSync(key);
        },
        setItem(key, value) {
          uni.setStorageSync(key, value);
        },
      },
    },
  }
);