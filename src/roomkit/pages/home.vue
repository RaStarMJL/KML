<script setup lang="ts">
import { TUILogin } from "@tencentcloud/tui-core";
import PreConferenceView from "../TUIRoom/preConference.vue";
import router from "../../router/index";
import { reactive, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { getBasicInfo } from "../config/basic-info-config";
import { useBasicStore } from "../TUIRoom/stores/basic";
import { roomChatInit } from "../TUIKit";
import { onMounted } from "vue";
import tabbar from "../../../pages/components/tabbar/tabbar.vue";
import { useUserInfoStore } from "/src/stores/modules/userInfo";
// 距离手机头部的安全距离
const { safeAreaInsets } = uni.getSystemInfoSync();

const userInfoStore = useUserInfoStore();
const userInfo = ref({
  userId: userInfoStore.userInfo.userId,
  userName: userInfoStore.userInfo.userName,
  avatarUrl: userInfoStore.userInfo.avatarUrl,
});

const basicStore = useBasicStore();

function setTUIRoomData(action: string, roomOption: Record<string, any>) {
  uni.setStorageSync(
    "tuiRoom-roomInfo",
    JSON.stringify({
      action,
      ...roomOption,
    })
  );
}

/**
 * Generate room number when creating a room
 *
 * 创建房间时生成房间号
 **/
async function generateRoomId(): Promise<string> {
  const roomId = String(Math.ceil(Math.random() * 1000000));
  return roomId;
}

/**
 * Processing Click [Create Room]
 *
 * 处理点击【创建房间】
 **/
async function handleCreateRoom(roomOption: Record<string, any>) {
  setTUIRoomData("createRoom", roomOption);
  const roomId = await generateRoomId();
  router.replace({
    path: "room",
    query: {
      roomId,
    },
  });
}

/**
 * Processing Click [Enter Room]
 *
 * 处理点击【进入房间】
 **/
async function handleEnterRoom(roomOption: Record<string, any>) {
  setTUIRoomData("enterRoom", roomOption);
  router.replace({
    path: "room",
    query: {
      roomId: roomOption.roomId,
    },
  });
}

async function handleInit() {
  uni.removeStorageSync("tuiRoom-roomInfo");
  uni.removeStorageSync("tuiRoom-userInfo");
  const BasicInfo = await getBasicInfo(userInfo.value.userId);
  if (!BasicInfo) {
    return;
  }
  const currentUserInfo = { ...BasicInfo, ...userInfo.value };
  uni.setStorageSync("tuiRoom-userInfo", JSON.stringify(currentUserInfo));
  basicStore.setBasicInfo(currentUserInfo);
  const { sdkAppId, userSig } = currentUserInfo;

  TUILogin.login({
    SDKAppID: sdkAppId,
    userID: userInfo.value.userId,
    userSig,
    useUploadPlugin: false, // If you need to send rich media messages, please set to true.
  });
  roomChatInit();
}

handleInit();
</script>
<template>
  <div class="home-container">
    <PreConferenceView
      :user-info="userInfo"
      @on-create-room="handleCreateRoom"
      @on-enter-room="handleEnterRoom"></PreConferenceView>
  </div>
</template>
<style lang="scss" scoped>
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
