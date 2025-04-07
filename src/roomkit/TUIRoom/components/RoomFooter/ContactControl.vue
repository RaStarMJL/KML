<template>
  <div class="more-control-container">
    <chat-control
      style="margin-top: -5px !important"
      v-if="roomStore.isSpeakAfterTakingSeatMode"
      @click="handleControlClick('chatControl')"></chat-control>
    <!--     <icon-button
      icon="EmojiIcon"
      :is-active="sidebarName === 'more'"
      title="AI助手"
      @click-icon="toggleContactSidebar" />
    <icon-button
      icon="MoreIcon"
      :is-active="sidebarName === 'more'"
      :title="t('Contact us')"
      @click-icon="toggleContactSidebar" />
    <icon-button
      icon="NextIcon"
      :is-active="sidebarName === 'more'"
      title="实时翻译"
      @click-icon="toggleSubtitleSetting" />
    <icon-button
      icon="NextIcon"
      :is-active="sidebarName === 'more'"
      :title="signText"
      @click-icon="toggleSign" />
    <icon-button
      icon="NextIcon"
      :is-active="sidebarName === 'more'"
      title="会议笔记"
      @click-icon="toggleMeetingNote" /> -->
    <view class="item" @tap="toggleContactSidebar">
      <image
        class="item-img"
        src="/src/static/icons/menus/AI.png"
        mode="scaleToFill" />
      <text class="item-text">AI助手</text>
    </view>
    <view class="item" @tap="toggleSubtitleSetting">
      <image
        class="item-img"
        src="/src/static/icons/menus/translate.png"
        mode="scaleToFill" />
      <text class="item-text">实时翻译</text>
    </view>
    <view class="item" @tap="toggleSign">
      <image
        class="item-img"
        src="/src/static/icons/menus/sign.png"
        mode="scaleToFill" />
      <text class="item-text">{{ signText }}</text>
    </view>
    <view class="item" @tap="toggleMeetingNote">
      <image
        class="item-img"
        src="/src/static/icons/menus/note.png"
        mode="scaleToFill" />
      <text class="item-text">会议笔记</text>
    </view>

    <view class="item" @tap="toggleAiNote">
      <image
        class="item-img"
        src="/src/static/icons/menus/ai_note.png"
        mode="scaleToFill" />
      <text class="item-text">AI笔记</text>
    </view>
    <view class="item" @tap="toggleAiSummary">
      <image
        class="item-img"
        src="/src/static/icons/menus/ai_summary.png"
        mode="scaleToFill" />
      <text class="item-text">AI总结</text>
    </view>
    <view class="item" style="margin-left: -4px" @tap="toggleContactSidebar">
      <image
        class="item-img"
        src="/src/static/icons/menus/contact.png"
        mode="scaleToFill" />
      <text class="item-text">联系我们</text>
    </view>
    <div v-if="isShowContactTab" class="contact-container">
      <room-contact
        ref="contactRef"
        @on-close-contact="handleOnCloseContact"></room-contact>
    </div>
    <uni-popup ref="popup" type="center" :is-mask-click="false">
      <view class="note-container">
        <view class="note-header">
          <text class="title">我的笔记</text>
          <icon-button
            icon="CloseIcon"
            :is-active="sidebarName === 'more'"
            title=""
            @click-icon="closeNote" />
        </view>

        <scroll-view
          scroll-y
          class="note-content"
          :style="{ height: contentHeight + 'px' }">
          <textarea
            v-model="noteContent"
            placeholder="请输入笔记内容..."
            class="note-textarea"
            auto-height
            maxlength="500" />
        </scroll-view>

        <view class="note-footer">
          <view class="word-count">{{ noteContent.length }}/500</view>
          <button class="save-btn" @tap="saveNote">
            <text class="btn-text">提交</text>
          </button>
        </view>
      </view>
    </uni-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from "vue";
import { onBeforeMount } from "vue";
import IconButton from "../common/base/IconButton.vue";
import { useBasicStore } from "../../stores/basic";
import { storeToRefs } from "pinia";
import { useI18n } from "../../locales";
import { isMobile } from "../../utils/environment";
import roomContact from "../RoomMore/index.vue";
import { useRoomStore } from "../../stores/room";
import meetingNote from "../../../../../components/meetingNote/meetingNote.vue";
import { api_saveMeetingNotes, aimanage } from "../../../../services/api";
import ChatControl from "./ChatControl.vue";
const basicStore = useBasicStore();
const { sidebarName } = storeToRefs(basicStore);
const { t } = useI18n();
const isShowContactTab = ref(false);
const contactRef = ref();
// #region ---------------------- 会议笔记相关代码 start ------------------
const notePopupRef = ref();
const popup = ref();
const openNotePopup = () => {
  notePopupRef.value.open();
};
const noteContent = ref("");
const systemInfo = uni.getSystemInfoSync();

// 计算内容区域高度
const contentHeight = computed(() => {
  return systemInfo.windowHeight * 0.6 - 100; // 减去头部和底部高度
});
const onNoteSaved = (content) => {
  console.log("保存的笔记内容:", content);
  // 处理保存逻辑
};

const closeNote = () => {
  if (noteContent.value !== "") {
    uni.showModal({
      title: "提示",
      content: "笔记内容未保存，是否退出？",
      success: (res) => {
        if (res.confirm) {
          noteContent.value = "";
          popup.value.close();
        }
      },
    });
  } else {
    noteContent.value = "";
    popup.value.close();
  }
};

const saveNote = async () => {
  const data = {
    meetingId: meetingId,
    userId: roomStore.localUser.userId,
    noteType: "manual", // 提交类型
    content: noteContent.value, // 笔记内容
  };
  try {
    const res = await api_saveMeetingNotes(data);
    if (res.code === 1) {
      console.log("用户:" + data.userId + "保存笔记成功:" + res.data);
      uni.showToast({
        title: "提交成功",
        icon: "success",
        duration: 500,
      });
      noteContent.value = "";
      popup.value.close();
    }
  } catch (error) {
    console.error("保存笔记失败:", error);
  }
};

const toggleMeetingNote = () => {
  popup.value.open();
};
// #endregion ------------------- 会议笔记相关代码 end --------------------

// #region ---------------------- 发起签到相关代码 start ------------------
const roomStore = useRoomStore();
const signText = computed(() => {
  return roomStore.isMaster ? "发起签到" : "参与签到";
});
const role = computed(() => {
  return roomStore.isMaster ? "host" : "attendee";
});
const meetingName = inject("meetingTitle");
const meetingId = inject("meetingId");
function toggleSign() {
  uni.navigateTo({
    url: `/src/roomkit/pages/sign/sign?role=${role.value}&meetingId=${meetingId}&meetingname=${meetingName}`,
  });
}
// #endregion ------------------- 发起签到相关代码 end --------------------
function handleControlClick(name: string) {
  TUIRoomAegis.reportEvent({ name, ext1: name });
  bus.emit("experience-communication", name);
}

// #region ---------------------- AI功能 start ------------------
const handleAI = inject("handleAI");
// AI总结
const toggleAiSummary = () => {
  handleAI("summary");
};
// AI笔记
const toggleAiNote = () => {
  handleAI("note");
};
// #endregion ------------------- AI功能 end --------------------

// 打开联系我们底部弹框
function toggleContactSidebar() {
  if (!isMobile) {
    if (basicStore.setSidebarOpenStatus && basicStore.sidebarName === "more") {
      basicStore.setSidebarOpenStatus(false);
      basicStore.setSidebarName("");
      return;
    }
    basicStore.setSidebarOpenStatus(true);
    basicStore.setSidebarName("more");
  } else {
    isShowContactTab.value = true;
    if (basicStore.sidebarName === "more") {
      basicStore.setSidebarName("");
      return;
    }
    basicStore.setSidebarName("more");
  }
}

// 关闭联系我们
function handleOnCloseContact() {
  isShowContactTab.value = false;
}

const toggleSubtitleSetting = () => {
  uni.navigateTo({
    url: "/src/roomkit/pages/subtitleSetting/subtitleSetting",
  });
};

const openRealtimeTranslation = () => {
  if (basicStore.isTranslate) {
    basicStore.setRealtimeTranslation(false);
    uni.showToast({
      title: "实时翻译已关闭",
      icon: "none",
      duration: 1000,
    });
  } else {
    basicStore.setRealtimeTranslation(true);
    uni.showToast({
      title: "实时翻译已开启",
      icon: "none",
      duration: 1000,
    });
  }
};
</script>

<style lang="scss" scoped>
.contact-container {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 750rpx;

  background-color: rgba(0, 0, 0, 0.7);
  z-index: 11;
}
.more-control-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  .item {
    width: 52px;
    // margin: 0 5px;
    height: 43px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    .item-img {
      width: 25px;
      height: 25px;
    }
    .item-text {
      font-size: 12px;
      color: #000;
    }
  }
}

//
.note-container {
  display: flex;
  width: 250px;
  height: 400px;
  max-width: 300px;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  flex-direction: column;
  /* 头部样式 */
  .note-header {
    flex: 1;
    height: 44px;
    padding-left: 12px;
    padding-right: 12px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-bottom-width: 1px;
    border-bottom-color: #f0f0f0;
    .title {
      font-size: 16px;
      font-weight: bold;
      color: #333333;
    }
  }
  /* 内容区样式 */
  .note-content {
    flex: 6;
    padding: 12px;
    .note-textarea {
      flex: 1;
      padding: 5px;
      width: 226px;
      // min-height: 120px;
      font-size: 14px;
      color: #333333;
    }
  }
  /* 底部样式 */
  .note-footer {
    display: flex;
    flex-direction: row;
    flex: 1;
    padding: 12px;
    width: 250px;
    height: 60px;
    justify-content: space-between;
    align-items: center;
    border-top-width: 1px;
    border-top-color: #f0f0f0;
    .word-count {
      border-radius: 4px;
      padding: 6px;
      text-align: right;
      font-size: 12px;
      color: #999999;
    }
    .save-btn {
      width: 60px;
      height: 40px;
      padding: 6px;
      border-radius: 4px;
      justify-content: center;
      align-items: center;
      .btn-text {
        color: #000;
        font-size: 16px;
      }
    }

    // .disabled {
    //   background-color: #cccccc;
    // }
  }
}
</style>
