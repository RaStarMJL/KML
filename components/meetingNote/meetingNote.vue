<template>
  <view class="note-container">
    <view class="note-header">
      <text class="title">写笔记</text>
      <uni-icons type="closeempty" size="24" color="#999" @click="close" />
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
        maxlength="500"
        @input="onContentInput" />
      <view class="word-count">{{ noteContent.length }}/500</view>
    </scroll-view>

    <view class="note-footer">
      <button
        class="save-btn"
        :disabled="!noteContent.trim()"
        @click="saveNote">
        <text class="btn-text">保存</text>
      </button>
    </view>
  </view>
</template>

<script>
import { ref, computed } from "vue";
import { onReady } from "@dcloudio/uni-app";
import { defineExpose } from "vue";
const popupRef = ref(null);
const noteContent = ref("");
const systemInfo = uni.getSystemInfoSync();

// 计算内容区域高度
const contentHeight = computed(() => {
  return systemInfo.windowHeight * 0.6 - 100; // 减去头部和底部高度
});

// 内容输入处理
const onContentInput = (e) => {
  // 可以在这里添加内容过滤逻辑
};

// 保存笔记
const saveNote = () => {
  if (!noteContent.value.trim()) return;

  uni.showLoading({ title: "保存中..." });

  // 这里调用保存接口
  setTimeout(() => {
    uni.hideLoading();
    uni.showToast({ title: "保存成功", icon: "success" });
    close();
    emit("saved", noteContent.value);
  }, 800);
};

// 弹窗状态变化
const onPopupChange = (e) => {
  if (!e.show) {
    emit("closed");
  }
};
</script>

<style scoped>
/* 容器样式 */
.note-container {
  width: 250px;
  height: 400px;
  max-width: 300px;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  flex-direction: column;
}

/* 头部样式 */
.note-header {
  height: 44px;
  padding-left: 12px;
  padding-right: 12px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom-width: 1px;
  border-bottom-color: #f0f0f0;
}

.title {
  font-size: 16px;
  font-weight: bold;
  color: #333333;
}

.close-btn {
  width: 24px;
  height: 24px;
  justify-content: center;
  align-items: center;
}

.close-icon {
  font-size: 20px;
  color: #999999;
}

/* 内容区样式 */
.note-content {
  padding: 12px;
}

.note-textarea {
  width: 100%;
  min-height: 120px;
  font-size: 14px;
  color: #333333;
  lines: 8;
}

.word-count {
  text-align: right;
  font-size: 12px;
  color: #999999;
  margin-top: 8px;
}

/* 底部样式 */
.note-footer {
  height: 60px;
  padding-left: 12px;
  padding-right: 12px;
  justify-content: center;
  align-items: center;
  border-top-width: 1px;
  border-top-color: #f0f0f0;
}

.save-btn {
  width: 100%;
  height: 40px;
  background-color: #007aff;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
}

.btn-text {
  color: #ffffff;
  font-size: 14px;
}

.save-btn.disabled {
  background-color: #cccccc;
}
</style>
