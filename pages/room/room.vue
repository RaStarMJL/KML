<template>
  <room ref="TUIRoomRef"></room>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
// 引入 TUIRoom 组件，注意确认引入路径是否正确
import Room from "/src/roomkit/TUIRoom/index.vue";
import { onLoad } from "@dcloudio/uni-app";
import { getBasicInfo } from "../../src/roomkit/config/basic-info-config";
// 获取 TUIRoom 组件元素，用于调用 TUIRoom 组件的方法
const TUIRoomRef = ref();
const basicInfo = getBasicInfo();
const roomId = ref();
const role = ref();
onLoad((options: any) => {
  roomId.value = options.roomId; // 获取房间号
  role.value = options.role; // 获取角色信息
});

onMounted(async () => {
  // 初始化 TUIRoom 组件
  // 主持人在创建房间前需要先初始化 TUIRoom 组件
  // 普通成员在进入房间前需要先初始化 TUIRoom 组件
  await TUIRoomRef.value.init({
    // 获取 sdkAppId 请您参考 步骤一
    sdkAppId: basicInfo?.sdkAppId,
    // 用户在您业务中的唯一标示 Id
    userId: basicInfo?.userId,
    // 本地开发调试可在 https://console.cloud.tencent.com/trtc/usersigtool 页面快速生成 userSig, 注意 userSig 与 userId 为一一对应关系
    userSig: basicInfo?.userSig,
    // 用户在您业务中使用的昵称
    userName: basicInfo?.userName,
    // 用户在您业务中使用的头像链接
    avatarUrl: basicInfo?.avatarUrl,
    // 用户在您业务中需要的皮肤主题颜色及是否支持切换皮肤主题
    theme: {
      defaultTheme: "white",
      isSupportSwitchTheme: true,
    },
  });
  // 默认执行创建房间，实际接入可按需求择机执行 handleCreateRoom 方法
  if (role.value === "host") {
    await handleCreateRoom({
      roomId: roomId.value,
    });
  } else if (role.value === "member") {
    await handleEnterRoom();
  }
});

// 主持人创建房间，该方法只在创建房间时调用
async function handleCreateRoom(obj: any) {
  // roomId 为用户进入的房间号, 要求 roomId 类型为 string
  // roomMode 包含'FreeToSpeak'(自由发言模式) 和'SpeakAfterTakingSeat'(上台发言模式) 两种模式，默认为'FreeToSpeak'，注意目前仅支持自由发言模式
  // roomParam 指定了用户进入房间的默认行为（是否默认开启麦克风，是否默认开启摄像头，默认媒体设备Id)
  const roomId = obj.roomId;
  const roomMode = "FreeToSpeak";
  const roomParam = {
    isOpenCamera: true,
    isOpenMicrophone: true,
  };
  try {
    await TUIRoomRef.value.createRoom({
      roomId,
      roomName: roomId,
      roomMode,
      roomParam,
    });
  } catch (error: any) {
    alert("TUIRoomKit.createRoom error: " + error.message);
  }
}

// 普通成员进入房间，该方法在普通成员进入已创建好的房间时调用
async function handleEnterRoom() {
  // roomId 为用户进入的房间号, 要求 roomId 类型为 string
  // roomParam 指定了用户进入房间的默认行为（是否默认开启麦克风，是否默认开启摄像头，默认媒体设备Id)
  const roomId = "123456";
  const roomParam = {
    isOpenCamera: true,
    isOpenMicrophone: true,
  };
  try {
    await TUIRoomRef.value.enterRoom({ roomId, roomParam });
  } catch (error: any) {
    alert("TUIRoomKit.enterRoom error: " + error.message);
  }
}
</script>
<style>
page {
  width: 100%;
  height: 100%;
}
</style>
