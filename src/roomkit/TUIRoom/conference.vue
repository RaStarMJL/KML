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
    <subTitle
      :class="{ movedown: !showRoomTool, moveup: showRoomTool }"
      :totalSubtitleInfo="totalSubtitleInfo"
      v-if="showSubtitle"></subTitle>
    <kmlAgent :outContent="outContent"> </kmlAgent>
    <!-- <kmlAgent2></kmlAgent2> -->
  </div>
</template>

<script setup lang="ts">
import kmlAgent from "../../../components/kml-agent-nvue/kml-agent-nvue.nvue";
import kmlAgent2 from "../../../components/kml-agent/kml-agent.vue";
// #region ---------------------- 导包 start ------------------
import {
  ref,
  onMounted,
  onUnmounted,
  Ref,
  watch,
  provide,
  defineComponent,
  computed,
  inject,
} from "vue";
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
import { baseURL, socketBaseURL } from "/src/utils/http";
import * as SpeechRealTimeTrans from "../../../uni_modules/bsf-baidu-realtime-speech-trans";
import { useUserInfoStore } from "/src/stores/modules/userInfo";
import { useTranSettingStore } from "../../stores/modules/tranSetting";
import { aimanage, getMeetingData } from "/src/services/api.ts";
import { baiduTranslate } from "../../assets/config/config";
// #endregion ------------------- 导包 end --------------------

const clickButton = () => {
  console.log("点击了按钮");
};
const attendees = ref([]);
const hostId = ref("");
const meetingId = inject("meetingId");
const handleGetMeetingData = async () => {
  try {
    const res = await getMeetingData(meetingId);
    attendees.value = res.data.attendeesUid;
    hostId.value = res.data.organizerUid;
  } catch (error) {
    console.error("获取会议数据失败:", error);
  }
};
// #region ---------------------- 智能体 start ------------------
const outContent = ref("");
const meetingName = inject("meetingTitle");
const generateSummary = async () => {
  console.log("生成总结");
  if (!totalSpeakerInfo.value[hostId.value]) {
    uni.showToast({
      title: "主持人还没有开始讲话哦~,请稍后再试试吧~",
      icon: "none",
    });
    return;
  }
  outContent.value = "正在努力为您生成会议总结，请稍等...";
  const input =
    "会议名称:" +
    meetingName +
    "字幕内容:" +
    totalSpeakerInfo.value[hostId.value].totalSentence +
    "请你根据以上会议内容帮我自动总结会议";
  const res = await aimanage({
    sid: "550e8400-e29b-41d4-a716-446655440000",
    id: "ec6ed326-ab26-4aa2-87ac-fac05e622409",
    input,
  });
  console.log("生成会议总结成功:", res);
  outContent.value = res.data.answer;
};
const generateNote = async () => {
  const userId = roomStore.localUser.userId;
  const meetingId = basicStore.roomId;
  if (!totalSpeakerInfo.value[hostId.value]) {
    uni.showToast({
      title: "主持人还没有开始讲话哦~,请稍后再试试吧~",
      icon: "none",
    });
    return;
  }
  outContent.value = "正在努力为您生成会议笔记，请稍等...";
  const hostTotalSentence = totalSpeakerInfo.value[hostId.value].totalSentence;
  console.log(
    "生成笔记:userId:" +
      userId +
      "meetingId:" +
      meetingId +
      "hostTotalSentence:" +
      hostTotalSentence
  );
  const prompt =
    "用户uid:" +
    userId +
    "会议id:" +
    meetingId +
    "+字幕内容:" +
    hostTotalSentence +
    "请你根据以上内容生成会议笔记，用中文回答";
  const res = await aimanage({
    sid: "550e8400-e29b-41d4-a716-446655440000",
    id: "ec6ed326-ab26-4aa2-87ac-fac05e622409",
    input: prompt,
  });
  console.log("生成笔记成功:", res);
  outContent.value = res.data.answer;
};
// 接受来自AI总结和AI笔记的事件提交
const handleAI = (event) => {
  if (event === "summary") {
    generateSummary();
  } else if (event === "note") {
    generateNote();
  }
};
provide("handleAI", handleAI);
// #endregion ------------------- 智能体 end --------------------

// #region ---------------------- 腾讯会议会议相关代码 start ------------------
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
  // 获取参会者数据（用于socket转发字幕）和主持人ID（用于总结主持人说的话）
  handleGetMeetingData();
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
  // 房间销毁时停止百度实时翻译以及断开服务器的WebSocket连接
  if (basicStore.isTranslate) {
    socketTask.close();
    SpeechRealTimeTrans.stop();
    basicStore.setRealtimeTranslation(false);
  }
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
  console.log("隐藏控制栏");
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
  console.log("显示控制栏");
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
// #endregion ------------------- 腾讯会议会议相关代码 end --------------------

// #region ---------------------- 百度实时翻译相关代码 start ------------------
type totalSpeakerInfoType = {
  [userId: string]: {
    userName: string;
    avatarUrl: string;
    zimu: string;
  };
};
const tranSettingStore = useTranSettingStore();
const userInfoStore = useUserInfoStore();
const totalSpeakerInfo = ref({});
const basicStore = useBasicStore();
let socketTask;
let Totalsentence = "";
const roomStore = useRoomStore();
const { userVolumeObj, localUser } = storeToRefs(roomStore);

const subtitleText = ref("等待识别发言中...");
const showSubtitle = ref(false);
const currentSpeakerId = ref("");
const recorderManager = uni.getRecorderManager();
let isRecording = false;
const translatedText = ref("");
const avatarUrl = ref("");

const totalSubtitleInfo = computed(() => {
  console.log("totalSpeakerInfo.value", totalSpeakerInfo.value);
  return Object.fromEntries(
    Object.entries(totalSpeakerInfo.value).filter(([key, value]) => ({
      key,
      value,
    }))
  );
});
// 监听翻译文字
watch(
  () => translatedText.value,
  (newValue) => {
    subtitleText.value = newValue;
  }
);
// 监听是否开启翻译
watch(
  () => basicStore.isTranslate,
  (newValue) => {
    if (newValue) {
      console.log("开始百度实时翻译");
      showSubtitle.value = true;
      SpeechRealTimeTrans.start({
        url: "wss://aip.baidubce.com/ws/realtime_speech_trans", // WebSocket服务地址
        appId: baiduTranslate.appid, // 百度应用的AppID
        appKey: baiduTranslate.appkey, // 百度应用的AppKey
        samplingRate: 16000, // 音频采样率
        fromLan: tranSettingStore.srcLangCode, // 源语言
        toLan: tranSettingStore.desLangCode, // 目标语言
        isReturnTts: true, // 是否返回TTS语音
        ttsSpeaker: "woman", // TTS发音人

        // 开始失败回调
        onStartFailure: (code, msg) => {
          console.log("百度翻译启动失败", code, msg);
        },

        // WebSocket连接成功回调
        onWebsocketConnected: () => {
          console.log("百度翻译WebSocket已连接");
          // 连接服务器的WebSocket，转发消息
          socketTask = uni.connectSocket({
            url: socketBaseURL,
            complete: () => {
              console.log("服务器socket已连接");
            },
          });
          // 监听WebSocket消息发送
          socketTask.onMessage((res) => {
            const res_ = JSON.parse(res.data);
            if (res_.type !== "subtitle") return; // 如果不是字幕类型的消息，直接结束
            if (res_.meetingId !== basicStore.roomId) return; // 如果不是当前会议的字幕，直接结束
            // 获取发言人头像
            avatarUrl.value = res_.avatarUrl;
            // 获取发言人字幕
            translatedText.value = res_.zimu;

            // 获取发言人ID
            const SpeakerId = res_.userId;
            // 判断是否有新的发言人
            if (!totalSpeakerInfo.value[res_.userId]) {
              const SpeakerInfo = {
                userName: res_.userName,
                avatarUrl: res_.avatarUrl,
                zimu: res_.zimu,
                totalSentence: res_.zimu,
              };
              totalSpeakerInfo.value[SpeakerId] = SpeakerInfo;
              console.log("新的发言人加入", totalSpeakerInfo.value);
            } else {
              totalSpeakerInfo.value[SpeakerId].zimu = res_.zimu;
              totalSpeakerInfo.value[SpeakerId].totalSentence += res_.zimu;
              console.log("更新已有发言人信息", totalSpeakerInfo.value);
            }
          });
        },

        // WebSocket断开连接回调
        onWebsocketDisconnect: (code, reason) => {
          uni.showToast({
            title: "实时翻译断开连接",
            icon: "none",
            duration: 2500,
          });
          basicStore.setRealtimeTranslation(false);
          showSubtitle.value = false;
          console.log("百度翻译WebSocket断开连接", code, reason);
        },

        // 接收文本消息回调
        onReceiveTextMessage: (message) => {
          const res = JSON.parse(message);
          if (!res.data.result) return;
          const sentence = tranSettingStore.onlySrc
            ? res.data.result.sentence
            : res.data.result.sentence_trans;
          if (sentence === "") {
            return;
          }
          const payload = JSON.stringify({
            type: "subtitle",
            userName: userInfoStore.userInfo.userName,
            userId: userInfoStore.userInfo.userId,
            avatarUrl: userInfoStore.userInfo.avatarUrl,
            zimu: sentence,
            timestamp: Date.now(),
            meetingId: basicStore.roomId,
            attendeesUid: '["U88888"]',
          });
          socketTask.send({ data: payload });
          // translatedText.value = sentence;
          Totalsentence += sentence;
          // console.log("收到总文本消息：", Totalsentence);
        },

        // 接收TTS语音回调
        onReceiveTtsMessage: (audioPath) => {
          console.log("收到TTS音频文件路径", audioPath);
        },

        // 接收消息失败回调
        onReceiveMessageFailure: (error) => {
          console.log("接收消息失败", error);
        },
      });
    } else {
      console.log("结束百度实时翻译");
      // 停止百度实时翻译以及断开服务器的WebSocket连接
      socketTask.close();
      SpeechRealTimeTrans.stop();
      showSubtitle.value = false;
    }
  }
);

// #endregion ------------------- 百度实时翻译相关代码 end --------------------

// #region ---------------------- 字幕参数设置 start ------------------
const position = ref({
  x: 50,
  y: 600,
});
const size = ref({
  width: 300,
  height: 150,
});

// #endregion ------------------- 字幕参数设置 end --------------------

// #region ---------------------- 识别发言人 start ------------------
// 配置录音参数
// const recordOptions = {
//   duration: 5000,
//   sampleRate: 16000,
//   numberOfChannels: 1,
//   encodeBitRate: 96000,
//   format: "mp3",
//   frameSize: 50,
// };

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
/* watch(
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
        // isRecording = true;
        // recorderManager.start(recordOptions);

        // 在字幕上显示正在识别
        subtitleText.value = `正在识别 ${
          speaker.userName || speakerId
        } 的发言...`;
      }
    }
  },
  { deep: true }
); */

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

// #endregion ------------------- 识别发言人 end --------------------
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

.subTitle-container {
  position: absolute;
  margin: auto;
  flex-direction: column;
  // background-color: pink;
}
</style>
