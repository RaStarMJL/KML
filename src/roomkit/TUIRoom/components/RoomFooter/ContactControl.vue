<template>
  <div class="more-control-container">
    <icon-button
      icon="MoreIcon"
      :is-active="sidebarName === 'more'"
      title="AI助手"
      @click-icon="toggleContactSidebar" />
    <icon-button
      icon="MoreIcon"
      :is-active="sidebarName === 'more'"
      :title="t('Contact us')"
      @click-icon="toggleContactSidebar" />
    <icon-button
      icon="MoreIcon"
      :is-active="sidebarName === 'more'"
      title="实时翻译"
      @click-icon="openRealtimeTranslation" />
    <div v-if="isShowContactTab" class="contact-container">
      <room-contact
        ref="contactRef"
        @on-close-contact="handleOnCloseContact"></room-contact>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import IconButton from "../common/base/IconButton.vue";
import { useBasicStore } from "../../stores/basic";
import { storeToRefs } from "pinia";
import { useI18n } from "../../locales";
import { isMobile } from "../../utils/environment";
import roomContact from "../RoomMore/index.vue";

const basicStore = useBasicStore();
const { sidebarName } = storeToRefs(basicStore);
const { t } = useI18n();
const isShowContactTab = ref(false);
const contactRef = ref();

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

function handleOnCloseContact() {
  isShowContactTab.value = false;
}

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
  align-items: center;
  justify-content: space-around;
}
</style>
