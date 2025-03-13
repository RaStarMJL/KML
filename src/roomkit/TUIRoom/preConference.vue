<template>
  <div class="home-container" :class="[`tui-theme-${tuiRoomThemeClass}`]">
    <div class="header" :style="{ top: safeAreaInsets.top + 'px' }">
      <!-- <div class="left-header">
        <switch-theme :visible="false" class="header-item"></switch-theme>
      </div>
      <div class="right-header">
        <user-info
          class="header-item user-info"
          :user-id="props.userInfo.userId"
          :user-name="props.userInfo.userName"
          :avatar-url="props.userInfo.avatarUrl"
          @log-out="handleLogOut"></user-info>
      </div> -->
      <div class="left-header" style="position: relative">
        <image
          :src="userInfoStore.isLoggedIn ? userInfo.avatarUrl : defaultAvatar"
          class="my-avatar"
          mode="scaleToFill"
          style="border-radius: 50%; width: 50px; height: 50px" />
        <span
          class="user-name"
          style="
            width: 30vw;
            left: 58px;
            font-size: 20px;
            font-weight: 500;
            position: absolute;
            top: 0;
          "
          >{{ userInfoStore.isLoggedIn ? userInfo.userName : "未登录" }}</span
        >
      </div>
      <div class="message-icon">
        <uni-icons custom-prefix="iconfont" type="email" size="30"></uni-icons>
      </div>
    </div>
    <room-control
      ref="roomControlRef"
      :user-name="props.userInfo.userName"
      @create-room="handleCreateRoom"
      @enter-room="handleEnterRoom">
    </room-control>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import UserInfo from "./components/RoomHeader/UserInfo/index.vue";
import RoomControl from "./components/RoomHome/RoomControl/index.vue";
import SwitchTheme from "./components/common/SwitchTheme.vue";
import { EventType, roomService } from "./services/index";
import TUIMessageBox from "./components/common/base/MessageBox/index";
import TUIMessage from "./components/common/base/Message/index";
import { MESSAGE_DURATION } from "./constants/message";
import tabbar from "../../../pages/components/tabbar/tabbar.vue";
import { useUserInfoStore } from "/src/stores/modules/userInfo";
const roomControlRef = ref();

const userInfoStore = useUserInfoStore();

const userInfo = userInfoStore.userInfo;

const defaultAvatar = "/src/static/images/defaultAvatar.png";

// 距离手机头部的安全距离
const { safeAreaInsets } = uni.getSystemInfoSync();
const props = withDefaults(
  defineProps<{
    userInfo: {
      userId: string;
      userName: string;
      avatarUrl: string;
    };
    showEditNameInPc: boolean;
    roomId: string;
    enableScheduledConference: boolean;
    isShowLogo?: boolean;
  }>(),
  {
    userInfo: () => ({
      userId: "",
      userName: "",
      avatarUrl: "/src/static/images/ok.png",
    }),
    showEditNameInPc: false,
    roomId: "",
    enableScheduledConference: true,
    isShowLogo: true,
  }
);

const emits = defineEmits([
  "on-create-room",
  "on-enter-room",
  "on-update-user-name",
  "on-logout",
]);

const tuiRoomThemeClass = computed(
  () => `tui-theme-${roomService.basicStore.defaultTheme}`
);

async function handleCreateRoom(roomOption: Record<string, any>) {
  emits("on-create-room", roomOption);
}

async function handleEnterRoom(roomOption: Record<string, any>) {
  emits("on-enter-room", roomOption);
}

async function handleLogOut() {
  emits("on-logout");
}

const showMessageBox = (data: {
  code?: number;
  message: string;
  title: string;
  cancelButtonText: string;
  confirmButtonText: string;
  callback?: () => void;
}) => {
  const {
    message,
    title = roomService.t("Note"),
    cancelButtonText,
    confirmButtonText = roomService.t("Sure"),
    callback = () => {},
  } = data;
  TUIMessageBox({
    title,
    message,
    cancelButtonText,
    confirmButtonText,
    callback,
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
  roomService.on(EventType.ROOM_NOTICE_MESSAGE, showMessage);
  roomService.on(EventType.ROOM_NOTICE_MESSAGE_BOX, showMessageBox);
});
onUnmounted(() => {
  roomService.off(EventType.ROOM_NOTICE_MESSAGE, showMessage);
  roomService.off(EventType.ROOM_NOTICE_MESSAGE_BOX, showMessageBox);
});
</script>
<style lang="scss" scoped>
.my-avatar {
  width: 30px;
  height: 30px;
}
.tui-theme-black.home-container {
  --background: var(--background-color-1);
}

.tui-theme-white.home-container {
  --background: var(--background-color-1);
}

.home-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-family: "PingFang SC";
  color: var(--font-color-1);
  background: var(--background);
  background-size: cover;

  .header {
    position: absolute;
    top: 0;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 22px 24px;
    .left-header,
    .right-header {
      display: flex;
      align-items: center;

      .header-item {
        &:not(:first-child) {
          margin-left: 16px;
        }
      }
    }
  }
}
</style>
