<template>
  <div
    id="roomContainer"
    ref="roomRef"
    class="tui-room"
    :style="{
      height: systemScreenHeight + 'px',
      marginTop: systemStatusBarHeight + 'px',
    }">
    <room-content
      ref="roomContentRef"
      class="content"
      @tap="handleRoomContentTap"></room-content>
    <room-header
      class="header"
      @log-out="logOut"
      @on-destroy-room="onDestroyRoom"
      @on-exit-room="onExitRoom"
      @touchmove.stop.prevent="() => {}"></room-header>
    <room-footer
      @on-destroy-room="onDestroyRoom"
      @on-exit-room="onExitRoom"
      @touchmove.stop.prevent="() => {}" />
    <room-sidebar></room-sidebar>
    <room-setting></room-setting>
    <subTitle :text="subtitleText" class="subtitle-layer" />
    <!-- <yueasrxf
      ref="yueAsrRefs"
      :options="optionsxf"
      @countDown="countDown"
      @result="resultMsg"
      @onStop="onStop"
      @onOpen="onOpen"
      @change="change"></yueasrxf>
    <button
      class="btn-bottom"
      :disabled="disabled"
      @touchstart.stop="start"
      @touchend.stop="end">
      按下说话
    </button> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, Ref, watch, provide } from "vue";
import subTitle from "/pages/components/customSubtitle/index.vue";
import RoomHeader from "./components/RoomHeader/index/index.vue";
import RoomFooter from "./components/RoomFooter/index/index.vue";
import RoomSidebar from "./components/RoomSidebar/index.vue";
import RoomContent from "./components/RoomContent/index.vue";
import RoomSetting from "./components/RoomSetting/index.vue";
import { debounce, throttle } from "./utils/utils";
import { isMobile, isWeChat } from "./utils/environment";
import { TUIKickedOutOfRoomReason } from "@tencentcloud/tuiroom-engine-uniapp-app";

import TUIRoomAegis from "./utils/aegis";
import { MESSAGE_DURATION } from "./constants/message";

import TUIMessageBox from "./components/common/base/MessageBox/index";
import TUIMessage from "./components/common/base/Message/index";
import {
  roomService,
  EventType,
  RoomParam,
  RoomInitData,
  RoomService,
} from "./services/index";
import useDeviceManager from "./hooks/useDeviceManager";

import { storeToRefs } from "pinia";
import { useBasicStore } from "./stores/basic";
import { useRoomStore } from "./stores/room";
import { baseURL } from "/src/utils/http";
import { onShow } from "@dcloudio/uni-app";
import crypto from "crypto-js";
import yueasrxf from "/uni_modules/yue-asr-xf/components/yue-asr-xf/yue-asr-xf.vue";
import * as SpeechRealTimeTrans from "../../../uni_modules/bsf-baidu-realtime-speech-trans";

useDeviceManager({ listenForDeviceChange: true });

const { t } = roomService;
const systemScreenHeight = ref(0);
const systemStatusBarHeight = ref(0);
defineExpose({
  init,
  createRoom,
  enterRoom,
  dismissRoom,
  leaveRoom,
  resetStore,
  t,
});

const emit = defineEmits([
  "on-log-out",
  "on-create-room",
  "on-enter-room",
  "on-exit-room",
  "on-destroy-room",
  // 用户被踢出房间
  "on-kicked-out-of-room",
  // 用户被踢下线
  "on-kicked-off-line",
  // 用户 userSig 过期
  "on-userSig-expired",
]);

const showMessageBox = (data: {
  code?: number;
  message: string;
  title: string;
  confirmButtonText: string;
  showCancel?: boolean;
  appendToRoomContainer?: boolean;
  callback?: () => void;
}) => {
  const {
    message,
    showCancel,
    title = roomService.t("Note"),
    confirmButtonText = roomService.t("Sure"),
    appendToRoomContainer = true,
    callback = () => {},
  } = data;
  TUIMessageBox({
    title,
    message,
    showCancel,
    confirmButtonText,
    appendToRoomContainer,
    callback: async () => {
      callback && callback();
    },
  });
};
const showMessage = (data: {
  type: "warning" | "success" | "error" | "info";
  message: string;
  duration: MESSAGE_DURATION;
}) => {
  const { type, message, duration } = data;
  TUIMessage({
    type,
    message,
    duration,
  });
};

onMounted(() => {
  const { windowHeight, statusBarHeight } = uni.getSystemInfoSync();
  systemScreenHeight.value = windowHeight;
  systemStatusBarHeight.value = statusBarHeight;
  roomService.setComponentConfig({
    InviteControl: { visible: false },
  });
  roomService.on(EventType.ROOM_NOTICE_MESSAGE, showMessage);
  roomService.on(EventType.ROOM_NOTICE_MESSAGE_BOX, showMessageBox);
  roomService.on(EventType.KICKED_OUT, onKickedOutOfRoom);
  roomService.on(EventType.USER_SIG_EXPIRED, onUserSigExpired);
  roomService.on(EventType.KICKED_OFFLINE, onKickedOffLine);
  roomService.on(EventType.ROOM_START, onStartRoom);
  roomService.on(EventType.ROOM_JOIN, onJoinRoom);
  roomService.on(EventType.ROOM_LEAVE, onLeaveRoom);
  roomService.on(EventType.ROOM_DISMISS, onDismissRoom);
  roomService.on(EventType.USER_LOGOUT, onLogout);

  // 请求录音权限
  SpeechRealTimeTrans.requestRecordingPermission();
});
onUnmounted(() => {
  roomService.off(EventType.ROOM_NOTICE_MESSAGE, showMessage);
  roomService.off(EventType.ROOM_NOTICE_MESSAGE_BOX, showMessageBox);
  roomService.off(EventType.KICKED_OUT, onKickedOutOfRoom);
  roomService.off(EventType.USER_SIG_EXPIRED, onUserSigExpired);
  roomService.off(EventType.KICKED_OFFLINE, onKickedOffLine);
  roomService.off(EventType.ROOM_START, onStartRoom);
  roomService.off(EventType.ROOM_JOIN, onJoinRoom);
  roomService.off(EventType.ROOM_LEAVE, onLeaveRoom);
  roomService.off(EventType.ROOM_DISMISS, onDismissRoom);
  roomService.off(EventType.USER_LOGOUT, onLogout);
  roomService.resetStore();
  RoomService.destroyInstance();
});

const { sdkAppId } = roomService.basicStore;
watch(
  () => sdkAppId,
  (val: number) => {
    if (val) {
      TUIRoomAegis.setSdkAppId(val);
      TUIRoomAegis.reportEvent({
        name: "loaded",
        ext1: "loaded-success",
      });
    }
  }
);

/**
 * Handle page mouse hover display toolbar logic
 *
 * 处理页面鼠标悬浮显示工具栏逻辑
 **/
const roomContentRef = ref<InstanceType<typeof RoomContent>>();
const showRoomTool: Ref<boolean> = ref(true);
const roomRef: Ref<Node | undefined> = ref();
function handleHideRoomTool() {
  showRoomTool.value = false;
}
provide("showRoomTool", showRoomTool);

watch(
  () => roomRef.value,
  (newValue, oldValue) => {
    // PC 端处理 room 控制栏交互
    if (!isWeChat && !isMobile) {
      if (newValue) {
        addRoomContainerEvent(newValue);
      } else {
        oldValue && removeRoomContainerEvent(oldValue);
      }
    }
  }
);

const handleHideRoomToolDebounce = debounce(handleHideRoomTool, 5000);
const handleHideRoomToolThrottle = throttle(handleHideRoomToolDebounce, 1000);
const showTool = () => {
  showRoomTool.value = true;
  handleHideRoomToolDebounce();
};
const showToolThrottle = () => {
  showRoomTool.value = true;
  handleHideRoomToolThrottle();
};
const hideTool = () => {
  handleHideRoomTool();
};
const addRoomContainerEvent = (container: Node) => {
  container.addEventListener("mouseenter", showTool);
  container.addEventListener("click", showTool);
  container.addEventListener("mousemove", showToolThrottle);
  container.addEventListener("mouseleave", hideTool);
};
const removeRoomContainerEvent = (container: Node) => {
  container.removeEventListener("mouseenter", showTool);
  container.removeEventListener("click", showTool);
  container.removeEventListener("mousemove", showToolThrottle);
  container.removeEventListener("mouseleave", hideTool);
};
// H5 及小程序端处理 room 控制栏交互
function handleRoomContentTap() {
  showRoomTool.value = !showRoomTool.value;
  if (showRoomTool.value) {
    handleHideRoomToolDebounce();
  }
}

async function dismissRoom() {
  await roomService.dismissRoom();
}

async function leaveRoom() {
  await roomService.leaveRoom();
  emit("on-exit-room");
}

async function init(option: RoomInitData) {
  await roomService.initRoomKit(option);
}

async function createRoom(options: {
  roomId: string;
  roomName: string;
  roomMode: "FreeToSpeak" | "SpeakAfterTakingSeat";
  roomParam?: RoomParam;
}) {
  await roomService.createRoom(options);
  emit("on-create-room", {
    code: 0,
    message: "create room success",
  });
  await roomService.enterRoom(options);
  emit("on-enter-room", {
    code: 0,
    message: "enter room success",
  });
}

async function enterRoom(options: { roomId: string; roomParam?: RoomParam }) {
  await roomService.enterRoom(options);
  emit("on-enter-room", {
    code: 0,
    message: "enter room success",
  });
}

function resetStore() {
  roomService.resetStore();
}

const logOut = () => {
  roomService.logOut();
};

const onStartRoom = () => {
  emit("on-create-room", { code: 0, message: "create room" });
};

const onJoinRoom = () => {
  emit("on-enter-room", { code: 0, message: "enter room" });
};

const onLeaveRoom = () => {
  emit("on-exit-room", { code: 0, message: "exit room" });
};

const onDismissRoom = () => {
  emit("on-destroy-room", { code: 0, message: "destroy room" });
};

const onLogout = () => {
  emit("on-log-out", { code: 0, message: "user logout" });
};

const onKickedOutOfRoom = async (eventInfo: {
  roomId: string;
  reason: TUIKickedOutOfRoomReason;
  message: string;
}) => {
  const { roomId, reason, message } = eventInfo;
  emit("on-kicked-out-of-room", { roomId, reason, message });
};

const onUserSigExpired = () => {
  emit("on-userSig-expired");
};

const onKickedOffLine = (eventInfo: { message: string }) => {
  const { message } = eventInfo;
  emit("on-kicked-off-line", { message });
};

// #region ---------------------- 百度实时翻译相关代码 start ------------------
const basicStore = useBasicStore();
let sockeTask = null;
let Totalsentence = "";
// 监听麦克风状态
watch(
  () => basicStore.isTranslate,
  (newValue) => {
    if (newValue) {
      console.log("开始百度实时翻译");
      SpeechRealTimeTrans.start({
        url: "wss://aip.baidubce.com/ws/realtime_speech_trans", // WebSocket服务地址
        appId: "115883236", // 百度应用的AppID
        appKey: "sqL04acqrwEWEwgGCPVIdM3e", // 百度应用的AppKey
        samplingRate: 16000, // 音频采样率
        fromLan: "zh", // 源语言
        toLan: "en", // 目标语言
        isReturnTts: true, // 是否返回TTS语音
        ttsSpeaker: "woman", // TTS发音人

        // 开始失败回调
        onStartFailure: (code, msg) => {
          console.log("百度翻译启动失败", code, msg);
        },

        // WebSocket连接成功回调
        onWebsocketConnected: () => {
          console.log("百度翻译WebSocket已连接");
          socketTask = uni.connectSocket({
            url: "ws://192.168.31.115:5000/socket",
            complete: () => {
              console.log("服务器socket已连接");
            },
          });
          socketTask.onMessage((res) => {
            const res_ = JSON.parse(res.data);
            const sentence = res_.zimu;
            translatedText.value = sentence;
          });
        },

        // WebSocket断开连接回调
        onWebsocketDisconnect: (code, reason) => {
          console.log("百度翻译WebSocket断开连接", code, reason);
        },

        // 接收文本消息回调
        onReceiveTextMessage: (message) => {
          const res = JSON.parse(message);
          const sentence = res.data.result.sentence;
          if (sentence === "") {
            return;
          }
          const payload = JSON.stringify({
            type: "subtitle",
            zimu: sentence,
            timestamp: Date.now(),
            meetingId: "123211",
            attendeesUid: '["U88888"]',
          });
          socketTask.send({ data: payload });
          // translatedText.value = sentence;
          Totalsentence += sentence;
          // console.log("收到总文本消息：", Totalsentence);
        },

        // 接收TTS语音回调
        onReceiveTtsMessage: (audioPath) => {
          // console.log("收到TTS音频文件路径", audioPath);
        },

        // 接收消息失败回调
        onReceiveMessageFailure: (error) => {
          console.log("接收消息失败", error);
        },
      });
    } else {
      console.log("结束翻译");
      SpeechRealTimeTrans.stop();
    }
  }
);

// #endregion ------------------- 百度实时翻译相关代码 end --------------------

// #region -------------实时翻译相关代码 start---------------
// -------------实时翻译相关代码 start---------------
const roomStore = useRoomStore();
const { userVolumeObj, localUser } = storeToRefs(roomStore);

const subtitleText = ref("等待发言...");
const showSubtitle = ref(true);
const currentSpeakerId = ref("");
const recorderManager = uni.getRecorderManager();
let isRecording = false;
const originText = ref("");
const translatedText = ref("");
const downtime = ref(-1); // 默认-1
const downed = ref(false);
const disabled = ref(false);
const second = ref(60);
const yueAsrRefs = ref();
let socketTask;
// 科大讯飞实时翻译插件配置信息
const optionsxf = {
  receordingDuration: 60,
  APPID: "5ec48c09",
  API_SECRET: "012c79882f38864458e483a4f95d6c74",
  API_KEY: "5b22b6e819d6a72b476b19083a854ddc",
};

const translationConfig = {
  host: "itrans.xfyun.cn",
  path: "/v2/its",
  apiKey: "f9c246b2d8353252b0ef705771d8df22", // 替换为翻译API Key
  apiSecret: "NDJmYWRjYTBkYmI1YTE0MWZjZDM4MTMw", // 替换为翻译API Secret
};

// -------------------- 实时翻译相关函数 start --------------------
const start = () => {
  console.log("start开始运行了");
  // if (disabled.value) {
  //   return;
  // }
  console.log("开始");
  downed.value = true;
  yueAsrRefs.value.start();
  disabled.value = true;
  //建立连接
};

const end = () => {
  console.log("结束");
  yueAsrRefs.value.end();
};

const countDown = (e) => {
  console.log("countDown", e);
  downtime.value = e;
};

const onStop = (e) => {
  console.log("onStop", e);
  resumeUi();
};
const resumeUi = () => {
  downed.value = false;
  downtime.value = -1;
  disabled.value = false;
  downtime.value = second.value;
};

const onOpen = (e) => {
  console.log("onOpen", e);
};

const change = (e) => {
  console.log("change", e);
};
const resultMsg = async (e) => {
  originText.value = e;
  try {
    const translated = await translateText(e, "en", "cn");
    translatedText.value = translated;
  } catch (err) {
    console.error("翻译失败:", err);
    translatedText.value = "翻译失败";
  }
  // 构造协议数据
  const payload = JSON.stringify({
    type: "subtitle",
    zimu: originText.value,
    timestamp: Date.now(),
    meetingId: "123211",
    attendeesUid: '["U88888"]',
  });
  socketTask.send({ data: payload });

  console.log(originText.value);
};

const translateText = async (text, from, to) => {
  const { host, path, apiKey, apiSecret } = translationConfig;

  // 1. 准备请求数据
  const body = {
    common: { app_id: "e79198f1" }, // 使用翻译的APPID
    business: { from, to },
    data: { text: base64Encode(text) },
  };

  // 2. 生成鉴权头
  const date = new Date().toUTCString();
  const digest = generateDigest(body);
  const signature = generateSignature(host, path, date, digest, apiSecret);

  // 3. 发送请求
  const res = await uni.request({
    url: `https://${host}${path}`,
    method: "POST",
    header: {
      "Content-Type": "application/json",
      Host: host,
      Date: date,
      Digest: digest,
      Authorization: `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line digest", signature="${signature}"`,
    },
    data: body,
  });
  console.log("translate:", res);
  // 4. 处理响应
  if (res.data.code === 0) {
    return res.data.data.result.trans_result.dst;
  } else {
    throw new Error(`翻译错误 ${res.data.code}: ${res.data.message}`);
  }
};
// 生成Digest
const generateDigest = (body) => {
  const str = JSON.stringify(body);
  const hash = crypto.SHA256(str);
  return `SHA-256=${crypto.enc.Base64.stringify(hash)}`;
};
// Base64编码
const base64Encode = (text) => {
  return crypto.enc.Base64.stringify(crypto.enc.Utf8.parse(text));
};
// 生成签名
const generateSignature = (host, path, date, digest, secret) => {
  const signatureOrigin = [
    `host: ${host}`,
    `date: ${date}`,
    `POST ${path} HTTP/1.1`,
    `digest: ${digest}`,
  ].join("\n");

  const signature = crypto.HmacSHA256(signatureOrigin, secret);
  return crypto.enc.Base64.stringify(signature);
};
// -------------------- 实时翻译相关函数 end --------------------
// #endregion

// 配置录音参数
const recordOptions = {
  duration: 5000,
  sampleRate: 16000,
  numberOfChannels: 1,
  encodeBitRate: 96000,
  format: "mp3",
  frameSize: 50,
};

// 监听录音结束事件
/* recorderManager.onStop((res) => {
  isRecording = false;
  const { tempFilePath } = res;
  console.log("录音文件:", tempFilePath);

  // 模拟语音识别和翻译过程
  // 实际应用中应调用语音识别和翻译API
  // simulateRecognitionAndTranslation(currentSpeakerId.value);
}); */

// 监听用户音量变化
watch(
  () => userVolumeObj.value,
  (volumes) => {
    // 寻找当前音量最大的用户
    let maxVolume = 20; // 设置音量阈值
    let speakerId = "";

    Object.entries(volumes).forEach(([userId, volume]) => {
      if (volume > maxVolume) {
        maxVolume = volume;
        speakerId = userId;
      }
    });

    // 如果找到发言人且不是当前正在处理的发言人
    if (speakerId && speakerId !== currentSpeakerId.value && !isRecording) {
      currentSpeakerId.value = speakerId;

      // 获取发言人信息
      const speaker =
        roomStore.remoteUserObj[speakerId] ||
        (speakerId === localUser.value.userId ? localUser.value : null);

      if (speaker && speaker.hasAudioStream) {
        // 如果发言人麦克风打开，开始录音
        isRecording = true;
        recorderManager.start(recordOptions);

        // 在字幕上显示正在识别
        subtitleText.value = `正在识别 ${
          speaker.userName || speakerId
        } 的发言...`;
      }
    }
  },
  { deep: true }
);

// 模拟语音识别和翻译过程
// function simulateRecognitionAndTranslation(speakerId) {
//   const speaker =
//     roomStore.remoteUserObj[speakerId] ||
//     (speakerId === localUser.value.userId ? localUser.value : null);

//   if (!speaker) return;

//   // 模拟延迟
//   setTimeout(() => {
//     // 模拟翻译结果 - 实际应用中应替换为真实翻译结果
//     const translatedText = `${
//       speaker.userName || speakerId
//     } 说: 这是一个模拟的翻译结果，实际应用中这里应该是翻译API返回的文本。`;
//     subtitleText.value = translatedText;
//   }, 1000);
// }

// 监听翻译文字
watch(
  () => translatedText.value,
  (newValue) => {
    console.log(newValue);
    subtitleText.value = newValue;
  }
);

// 监听麦克风状态
/* watch(
  () => roomStore.localUser.hasAudioStream,
  (newValue) => {
    if (newValue) {
      console.log("开始翻译");
      start();
    } else {
      console.log("结束翻译");
      end();
    }
  }
); */

onShow(() => {
  // #ifdef APP
  plus.android.requestPermissions(
    ["android.permission.RECORD_AUDIO"],
    (e) => {},
    (e) => {}
  );
  // #endif

  socketTask = uni.connectSocket({
    url: `ws://${baseURL}socket`,
    complete: () => {
      console.log("socket连接成功");
    },
  });
  socketTask.onMessage((res) => {
    console.log("收到消息:", res.data);
  });
});
// -------------实时翻译相关代码 end-----------------
</script>

<style lang="scss" scoped>
.tui-room {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  color: #fff;
  background-color: #fff;
}
.btn-bottom {
  position: absolute;
  bottom: 300px;
  width: 100vw;
}
.subtitle-layer {
  z-index: 9999 !important; /* 确保字幕显示在其他UI元素之上 */
  pointer-events: auto !important; /* 确保触摸事件能够被捕获 */
}
</style>
