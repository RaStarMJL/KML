<template>
  <view v-if="visible" class="modal-mask">
    <view class="modal-container">
      <view class="modal-header">
        <text class="modal-title">{{ title }}</text>
      </view>
      <view class="modal-content">
        <text>{{ content }}</text>
      </view>
      <view class="modal-footer">
        <button class="modal-button cancel" @click="handleCancel">
          {{ cancelText }}
        </button>
        <button class="modal-button confirm" @click="handleConfirm">
          {{ confirmText }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

// 定义 props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "提示",
  },
  content: {
    type: String,
    default: "确定要执行此操作吗？",
  },
  confirmText: {
    type: String,
    default: "确定",
  },
  cancelText: {
    type: String,
    default: "取消",
  },
});

// 定义 emits
const emit = defineEmits(["confirm", "cancel", "update:visible"]);

// 确认按钮点击事件
const handleConfirm = () => {
  emit("confirm");
  closeModal();
};

// 取消按钮点击事件
const handleCancel = () => {
  emit("cancel");
  closeModal();
};

// 关闭弹框
const closeModal = () => {
  emit("update:visible", false);
};
</script>

<style scoped>
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-container {
  width: 80%;
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
}

.modal-content {
  padding: 20px;
  text-align: center;
  font-size: 16px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #eee;
}

.modal-button {
  flex: 1;
  padding: 15px;
  text-align: center;
  font-size: 16px;
  border: none;
  background-color: transparent;
}

.modal-button.cancel {
  color: #999;
}

.modal-button.confirm {
  color: #576b95;
}

.modal-button.cancel:active,
.modal-button.confirm:active {
  background-color: #f5f5f5;
}
</style>
