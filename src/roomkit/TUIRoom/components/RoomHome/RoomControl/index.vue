<template>
  <div class="control-container">
    <div v-if="!showRoomDetail" class="container-header">
      <!-- 背景lOGO -->
      <!-- <Logo class="container-icon" style="background-color: red" /> -->
      <div class="container-bottom">
        <!-- 加入房间按钮 -->
        <div class="join-room2-body common-button-body">
          <div class="join-room2 common-button" @tap="enterRoom">
            <svg-icon class="enter-icon svg-icon" :icon="EnterRoomIcon" />
          </div>
          <span class="text"> 加入会议</span>
        </div>
        <!-- 创建房间按钮 -->
        <div class="create-room2-body common-button-body" @tap="createRoom">
          <div class="create-room2 common-button">
            <svg-icon class="add-icon svg-icon" :icon="CreateRoomIcon" />
          </div>
          <span class="text"> 快速会议</span>
        </div>
        <!-- 预约会议按钮 -->
        <div class="reserve-room2-body common-button-body" @tap="reserveRoom">
          <div class="reserve-room2 common-button">
            <svg-icon class="reserve-icon svg-icon" :icon="ReserveRoomIcon" />
          </div>
          <span class="text"> 预约会议</span>
        </div>
        <!-- 会议总结 / 会议回放 -->
        <div class="summary-room2-body common-button-body" @click="handlecreate">
          <div class="summary-room2 common-button" >
            <svg-icon
              class="summary-icon svg-icon"
              :icon="MeetingSummaryIcon" />
          </div>
          <span class="text" > 创建会议</span>
        </div>
      </div>
      <!-- 历史会议 -->
      <div class="history-meeting" style="width: 100vw; height: 300px">
        <div
          class="history-header"
          style="width: 100%; height: 50px; position: relative">
          <span
            class="history-title"
            style="
              position: absolute;
              right: 20px;
              height: 30px;
              width: 80px;
              font-size: 14px;
              line-height: 30px;
              margin-top: 10px;
              background-color: #f5f6f8;
              text-align: center;
              border-radius: 5px;
            "
            >历史会议 ></span
          >
        </div>
      </div>
      <!-- <div class="container-bottom">
        <div class="join-room" @tap="enterRoom">
          <svg-icon
            style="display: flex"
            class="enter-icon"
            :icon="EnterRoomIcon" />
          <span class="title">{{ t("Join Room") }}</span>
        </div>
        <div class="create-room" @tap="createRoom">
          <svg-icon
            style="display: flex"
            class="add-icon"
            :icon="CreateRoomIcon" />
          <span class="title">{{ t("New Room") }}</span>
        </div>
      </div> -->
    </div>
    <!-- 新建房间页面 -->
    <div
      v-if="showRoomDetail || hasGivenRoomId"
      class="room-detail"
      :style="{ top: safeAreaInsets.top + 'px' }">
      <div class="room-detail-header">
        <div class="close-icon" @tap="handleClose">
          <svg-icon
            style="display: flex"
            :icon="ArrowStrokeBackIcon"></svg-icon>
        </div>
        <span
          v-if="isJoinRoom || hasGivenRoomId"
          class="room-detail-header-title"
          >{{ t("Join Room") }}</span
        >
        <span v-else class="room-detail-header-title">{{ t("New Room") }}</span>
      </div>
      <div class="room-detail-middle">
        <div class="room-detail-info">
          <div v-if="isJoinRoom || hasGivenRoomId" class="room-detail-info-box">
            <span class="room-detail-title"> {{ t("Room ID") }}</span>
            <input
              v-model="roomId"
              class="roomid-input"
              type="number"
              :placeholder="t('Enter room ID')"
              maxlength="10"
              enterkeyhint="complete" />
          </div>
          <div v-else class="room-detail-info-box" @click="chooseRoomType">
            <span class="room-detail-title"> {{ t("Room Type") }}</span>
            <div class="room-show-title">
              <span class="room-show-title">{{ roomType }}</span>
            </div>
            <div class="chevron-down-icon">
              <svg-icon
                style="display: flex"
                :icon="ArrowStrokeSelectDownIcon"></svg-icon>
            </div>
          </div>
          <div class="room-detail-info-box">
            <span class="room-detail-title">{{ t("Your Name") }}</span>
            <span class="roomid-input">{{ userName }}</span>
          </div>
        </div>
        <scroll-view scroll-y style="margin-top: 20px">
          <div class="room-detail-setting">
            <!-- 入会开启麦克风 -->
            <div class="room-detail-setting-list">
              {{ t("Turn on the microphone") }}
              <div
                class="slider-box"
                :class="[isMicOn && 'slider-open']"
                @tap="() => toggle('isMicOn')">
                <span class="slider-block"></span>
              </div>
            </div>
            <!--入会 开启视频 -->
            <div class="room-detail-setting-list">
              {{ t("Turn on the video") }}
              <div
                class="slider-box"
                :class="[isCamerOn && 'slider-open']"
                @tap="() => toggle('isCamerOn')">
                <span class="slider-block"></span>
              </div>
            </div>
            <!-- 入会开启扬声器 -->
            <div class="room-detail-setting-list">
              开启扬声器
              <div
                class="slider-box"
                :class="[isCamerOn && 'slider-open']"
                @tap="() => toggle('isCamerOn')">
                <span class="slider-block"></span>
              </div>
            </div>
            <!-- AI浮窗 -->
            <div class="room-detail-setting-list">
              显示AI浮窗
              <div
                class="slider-box"
                :class="[isCamerOn && 'slider-open']"
                @tap="() => toggle('isCamerOn')">
                <span class="slider-block"></span>
              </div>
            </div>
            <!-- 虚拟头像 -->
            <div class="room-detail-setting-list">
              使用虚拟头像
              <div
                class="slider-box"
                :class="[isCamerOn && 'slider-open']"
                @tap="() => toggle('isCamerOn')">
                <span class="slider-block"></span>
              </div>
            </div>
            <!-- 显示弹幕 -->
            <div class="room-detail-setting-list">
              自动显示弹幕
              <div
                class="slider-box"
                :class="[isCamerOn && 'slider-open']"
                @tap="() => toggle('isCamerOn')">
                <span class="slider-block"></span>
              </div>
            </div>
            <!-- 实时语音转文字 -->
            <div class="room-detail-setting-list">
              实时语音转文字
              <div
                class="slider-box"
                :class="[isCamerOn && 'slider-open']"
                @tap="() => toggle('isCamerOn')">
                <span class="slider-block"></span>
              </div>
            </div>
            <!-- <meetingSetting></meetingSetting> -->
          </div>
        </scroll-view>
      </div>
      <div class="room-detail-bottom">
        <span
          v-if="isJoinRoom || hasGivenRoomId"
          class="button"
          @tap="() => handleRoomOption('Join')"
          >{{ t("Join Room") }}</span
        >
        <span v-else class="button" @tap="() => handleRoomOption('New')">{{
          t("New Room")
        }}</span>
      </div>
    </div>
    <!-- 加入房间页面 -->
    <div
      v-if="showMoreType"
      class="room-choose-mobile"
      :style="{ top: safeAreaInsets.top + 'px' }">
      <div
        ref="moreTypeRef"
        :class="[
          showMoreType ? 'room-type-container' : 'close-room-type-container',
        ]">
        <div class="room-choose-button">
          <span class="choose-cancel" @click="showMoreType = false">{{
            t("Cancel")
          }}</span>
          <span class="choose-confirm" @tap="handleConfirm">{{
            t("Sure")
          }}</span>
        </div>
        <div class="room-type-hidden">
          <span
            :class="[mode === 'FreeToSpeak' && 'room-current-title']"
            class="room-choose-title"
            @tap="() => chooseCurrentType('FreeToSpeak')"
            >{{ t("Free Speech Room") }}</span
          >
          <span
            :class="[mode === 'SpeakAfterTakingSeat' && 'room-current-title']"
            class="room-choose-title"
            @tap="() => chooseCurrentType('SpeakAfterTakingSeat')"
            >{{ t("On-stage Speaking Room") }}</span
          >
        </div>
      </div>
    </div>
    <!-- 底部导航栏 -->
    <tabbar currentPath="/src/roomkit/pages/home"></tabbar>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import SvgIcon from "../../common/base/SvgIconFile.vue";
import { useRoomStore } from "../../../stores/room";
import useRoomControl from "./useRoomControlHooks";
import CreateRoomIcon from "../../../assets/icons/CreateRoomIcon.svg";
import EnterRoomIcon from "../../../assets/icons/EnterRoomIcon.svg";
import ReserveRoomIcon from "../../../assets/icons/ReserveRoomIcon.svg";
import MeetingSummaryIcon from "../../../assets/icons/MeetingSummaryIcon.svg";
import ArrowStrokeBackIcon from "../../../assets/icons/ArrowStrokeBackIcon.svg";
import ArrowStrokeSelectDownIcon from "../../../assets/icons/ArrowStrokeSelectDownIcon.svg";
import Logo from "../../common/Logo.vue";
import TUIMessage from "../../common/base/Message/index";
import tabbar from "../../../../../../pages/components/tabbar/tabbar.vue";
import { useUserInfoStore } from "/src/stores/modules/userInfo";
import meetingSetting from "../../../../../../pages/mine/meetingSetting.vue";
const { t } = useRoomControl();

// 距离手机头部的安全距离
const { safeAreaInsets } = uni.getSystemInfoSync();

// 用户信息
const userInfoStore = useUserInfoStore();

const moreTypeRef = ref();
const roomStore = useRoomStore();
const showRoomDetail = ref(false);
const showMoreType = ref(false);
const isJoinRoom = ref(false);
const roomType = computed(() =>
  mode.value === "FreeToSpeak"
    ? t("Free Speech Room")
    : t("On-stage Speaking Room")
);
const isMicOn = ref(true);
const isCamerOn = ref(true);
const mode = ref("FreeToSpeak");
const roomId = ref("");
const tuiRoomParam = {
  isOpenCamera: true,
  isOpenMicrophone: true,
  defaultCameraId: "",
  defaultMicrophoneId: "",
  defaultSpeakerId: "",
};
const emit = defineEmits(["create-room", "enter-room", "update-user-name"]);

interface Props {
  userName: string;
  givenRoomId?: string | null;
}
const props = defineProps<Props>();
defineExpose({
  getRoomParam,
});
const hasGivenRoomId = computed(
  () => typeof props.givenRoomId === "string" && props.givenRoomId !== ""
);

watch(
  () => props.givenRoomId,
  (val: any) => {
    if (val) {
      roomId.value = val;
    }
  },
  { immediate: true }
);

function createRoom() {
  // 未登录
  if (!userInfoStore.userInfo) {
    uni.showToast({
      icon: "none",
      title: "请先登录",
    });
    return;
  }

  showRoomDetail.value = !showRoomDetail.value;
  isJoinRoom.value = false;
}

const createRoom2 = () => {
  // 未登录
  if (!userInfoStore.userInfo) {
    uni.showToast({
      icon: "none",
      title: "请先登录",
    });
    return;
  }
};

function reserveRoom() {
  // 未登录
  if (!userInfoStore.userInfo) {
    uni.showToast({
      icon: "none",
      title: "请先登录",
    });
    return;
  }
  uni.navigateTo({
    url: "/pages/meetting/ReserveMeeting/ReserveMeeting",
  });
  console.log(111);
}

function enterRoom() {
  // 未登录
  if (!userInfoStore.userInfo) {
    uni.showToast({
      icon: "none",
      title: "请先登录",
    });
    return;
  }
  showRoomDetail.value = !showRoomDetail.value;
  isJoinRoom.value = true;
}
function chooseRoomType() {
  showMoreType.value = !showMoreType.value;
}
function chooseCurrentType(roomType: string) {
  mode.value = roomType;
}
function handleConfirm() {
  showMoreType.value = !showMoreType.value;
}
function handleClose() {
  showRoomDetail.value = false;
  showMoreType.value = false;
}
function toggle(type: string) {
  switch (type) {
    case "isMicOn":
      isMicOn.value = !isMicOn.value;
      tuiRoomParam.isOpenMicrophone = isMicOn.value;
      break;
    case "isCamerOn":
      isCamerOn.value = !isCamerOn.value;
      tuiRoomParam.isOpenCamera = isCamerOn.value;
      break;
    default:
      break;
  }
}
function getRoomParam() {
  tuiRoomParam.defaultCameraId = roomStore.currentCameraId;
  tuiRoomParam.defaultMicrophoneId = roomStore.currentMicrophoneId;
  tuiRoomParam.defaultSpeakerId = roomStore.currentSpeakerId;
  return tuiRoomParam;
}

function handleDocumentClick(event: MouseEvent) {
  if (showMoreType.value && !moreTypeRef.value.contains(event.target)) {
    showMoreType.value = false;
  }
}

function handlecreate(){
  uni.navigateTo(
    {
      url:'/pages/meetting/createMeeting'
    }
  )
}

function handleRoomOption(type: string) {
  console.log(11111);
  const roomParam = getRoomParam();
  switch (type) {
    case "Join":
      if (!roomId.value) {
        TUIMessage({
          type: "error",
          message: t("Please enter the room number"),
        });
        return;
      }
      emit("enter-room", {
        roomId: String(roomId.value),
        roomParam,
      });
      break;
    case "New":
      emit("create-room", {
        roomMode: mode.value,
        roomParam,
        isSeatEnabled: Boolean(mode.value === "SpeakAfterTakingSeat"),
      });
      break;
    default:
      break;
  }
}

onMounted(() => {
  document?.addEventListener("click", handleDocumentClick, true);
});

onUnmounted(() => {
  document?.removeEventListener("click", handleDocumentClick, true);
});
</script>
<style lang="scss" scoped>
.control-container {
  width: 100vw;
  height: 100%;
  // display: flex;
  // flex-direction: column;
  align-items: center;
  justify-content: space-around;
}

.container-header {
  padding-top: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.container-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.container-bottom {
  width: 100vw;
  height: 150px;
  /* background-color: pink; */
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  position: relative; /* 设置为相对定位容器 */
}

// .container-bottom2 {
//   padding: 20px;
// }

// .container-bottom2-cld {
//   height: 60px;
//   width: 90vw;
//   display: flex;
//   flex-direction: row;
//   justify-content: space-between;
// }

// .join-room2 {
//   width: 100px;
//   height: 60px;
//   background-color: yellow;
// }

// .create-room2 {
//   width: 100px;
//   height: 60px;
//   background-color: yellow;
// }

.create-room {
  background-image: linear-gradient(-45deg, #006eff 0%, #0c59f2 100%);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 6%;
  margin-top: 5%;
}

.add-icon {
  width: 60px;
  height: 60px;
}

.join-room {
  background-image: linear-gradient(-45deg, #006eff 0%, #0c59f2 100%);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 6%;
}

.enter-icon {
  width: 60px;
  height: 60px;
}

.title {
  line-height: 34px;
  color: #ffffff;
  padding-left: 10px;
}

.room-detail {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 100vw;
  z-index: 9;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.room-detail-header {
  background: white;
  display: flex;
  align-items: center;
  width: 100%;
  padding-top: 5%;
  padding-bottom: 5%;

  &-title {
    flex: 1;
    text-align: center;
    color: black;
  }
}

.close-icon {
  position: absolute;
  left: 22px;
  width: 10px;
  height: 18px;
}

.room-detail-middle {
  width: 90%;
}

.room-detail-info {
  background: white;
  margin-top: 20px;
  border-radius: 6px;
}

.room-detail-info-box {
  display: flex;
  padding: 15px 12px;
  align-items: center;
}

.room-detail-title {
  color: black;
}

.chevron-down-icon {
  width: 14px;
  height: 9px;
  display: flex;
}

.room-show-title {
  color: black;
  flex: 1;
  padding-left: 26px;
}

.room-show-name {
  color: black;
  flex: 1;
  padding-left: 56px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.roomid-input {
  width: 100%;
  border: 0px;
  flex: 1;
  padding-left: 56px;
  background: white;
  color: #676c80;
  font-size: 16px;
}

.room-detail-setting {
  height: 56vh;
  background: white;
  border-radius: 6px;
}

.room-detail-setting-list {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 12px;
  color: black;
}

.room-detail-bottom {
  background-image: linear-gradient(-45deg, #006eff 0%, #0c59f2 100%);
  width: 90%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  padding: 10px 0;
  position: absolute;
  bottom: 10vh;
}

.button {
  color: white;
  padding: 0px 5.75rem;
}

.room-type-container {
  position: fixed;
  bottom: 0;
  left: 0;
  background: #ffffff;
  width: 100vw;
  z-index: 11;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding-bottom: 25px;
  transition: all 0.25s linear;
}

.close-room-type-container {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 0;
  background: #ffffff;
  width: 100vw;
  z-index: 11;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  transition: all 0.25s linear;
}

.room-choose-mobile {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 100vw;
  z-index: 9;
  background: rgba(0, 0, 0, 0.7);
}

.room-choose-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.choose-cancel {
  color: black;
  z-index: 11;
  padding: 20px;
}

.choose-confirm {
  color: #146efa;
  z-index: 11;
  padding: 20px;
}

.room-type-hidden {
  background: #ffffff;
  border-radius: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.room-choose-title {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  width: 100%;
}

.room-current-title {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: #e1e1e3;
  color: black;
  width: 100%;
}

.slider {
  &-box {
    display: flex;
    align-items: center;
    width: 44px;
    height: 24px;
    border-radius: 15px;
    background: #e1e1e3;
  }

  &-open {
    background: #006eff !important;
    justify-content: flex-end;
  }

  &-block {
    width: 16px;
    height: 16px;
    border-radius: 8px;
    margin: 0 2px;
    background: #ffffff;
    border: 0 solid rgba(0, 0, 0, 0.85);
    box-shadow: 0 2px 4px 0 #d1d1d1;
  }
}

.svg-icon {
  width: 50px;
  height: 50px;
}

.common-button {
  width: 100%;
  height: 65px;
  // background-color: #0370fe;
  background: linear-gradient(45deg, #0370fe 0%, #1dd7dd 100%);
  border-radius: 20px;
  display: flex; /* 设置为Flex容器 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.common-button-body {
  width: 65px;
  height: 120px;
  /* background-color: red; */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.text {
  margin-top: 10px;
  font-size: 14px;
}

.container-bottom::before,
.container-bottom::after {
  content: ""; /* 必须有内容，即使是空字符串 */
  position: absolute; /* 绝对定位 */
  left: 50%; /* 从容器中心开始 */
  transform: translateX(-50%); /* 水平居中 */
  width: 90%; /* 边框的长度为容器的80% */
  border-top: 1px solid #f4f4f7; /* 顶部边框样式 */
  border-bottom: 1px solid #f4f4f7; /* 底部边框样式 */
}

.container-bottom::before {
  top: 0; /* 顶部边框位置 */
}

.container-bottom::after {
  bottom: 0; /* 底部边框位置 */
}
</style>
