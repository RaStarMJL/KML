<template>
  <view class="note-container">
    <!-- 顶部导航栏 -->
    <!-- <view class="header">
			<text class="header-title">会议笔记</text>
			<view class="header-actions">
				<uni-icons type="search" size="22" color="#fff" @click="showSearch = !showSearch"></uni-icons>
			</view>
		</view> -->

    <!-- 搜索框 -->
    <view class="search-box" v-if="showSearch">
      <uni-icons type="search" size="18" color="#999"></uni-icons>
      <input
        type="text"
        v-model="searchText"
        placeholder="搜索会议笔记"
        confirm-type="search"
        @confirm="searchNotes" />
      <uni-icons
        v-if="searchText"
        type="clear"
        size="18"
        color="#999"
        @click="clearSearch"></uni-icons>
    </view>

    <!-- 分类标签 -->
    <view class="note-categories">
      <view
        class="category-item"
        :class="{ active: activeCategory === 'all' }"
        @click="filterByCategory('all')">
        <text>全部笔记</text>
      </view>
      <view
        class="category-item"
        :class="{ active: activeCategory === 'ai' }"
        @click="filterByCategory('ai')">
        <text>AI生成</text>
      </view>
      <view
        class="category-item"
        :class="{ active: activeCategory === 'manual' }"
        @click="filterByCategory('manual')">
        <text>手动记录</text>
      </view>
    </view>

    <!-- 笔记列表 -->
    <scroll-view scroll-y class="note-list">
      <view
        class="note-item"
        v-for="(note, index) in filteredNotes"
        :key="index"
        @touchstart="touchStart($event, index)"
        @touchmove="touchMove($event, index)"
        @touchend="touchEnd($event, index)">
        <view
          class="note-content-wrapper"
          :style="{ transform: `translateX(${note.offset || 0}px)` }">
          <view
            class="note-tag"
            :class="{
              ai: note.noteType === 'ai',
              manual: note.noteType === 'manual',
            }"></view>
          <view class="note-content" @click="viewNoteDetail(note)">
            <view class="note-header">
              <text class="note-title">{{ note.meetingName }}</text>
              <text class="note-date">{{ formatDate(note.createTime) }}</text>
            </view>
            <text class="note-body">{{ note.content }}</text>
            <view class="note-footer">
              <view class="note-meta">
                <view class="meta-item ai-badge" v-if="note.noteType === 'ai'">
                  <text>AI总结</text>
                </view>
                <view
                  class="meta-item manual-badge"
                  v-if="note.noteType === 'manual'">
                  <text>手动记录</text>
                </view>
                <view class="meta-item">
                  <uni-icons type="calendar" size="14" color="#666"></uni-icons>
                  <text>{{ note.time }}分钟</text>
                </view>
                <view class="meta-item">
                  <uni-icons
                    type="personadd"
                    size="14"
                    color="#666"></uni-icons>
                  <text>{{ note.numAttendees }}人参与</text>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="delete-btn" @click="deleteNote(note, index)">删除</view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredNotes.length === 0" class="empty-state">
        <image
          class="empty-image"
          src="/static/images/empty-notes.png"
          mode="aspectFit"></image>
        <text class="empty-text">暂无会议笔记</text>
        <text class="empty-subtext">在会议中使用AI助手可自动生成会议笔记</text>
      </view>
    </scroll-view>

    <!-- 悬浮按钮  //人工创建笔记此功能已经废弃 -->
    <!-- <view class="floating-btn" @click="createNewNote">
      <uni-icons type="plusempty" size="24" color="#fff"></uni-icons>
    </view> -->
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useUserInfoStore } from "/src/stores/modules/userInfo";
import { api_getNoteList, api_deleteNote } from "@/src/services/api";
import { baseURL } from "/src/utils/http";

interface Note {
  meetingId: string;
  noteId: string;
  userId: string;
  subtitleContent: string;
  noteType: string;
  content: string;
  attachmentUrl: string | null;
  createTime: string;
  numAttendees: number;
  time: number;
  meetingName: string;
  offset?: number;
}

const userInfoStore = useUserInfoStore();
const userId = userInfoStore.userInfo?.userId;

const showSearch = ref(false);
const searchText = ref("");
const activeCategory = ref("all");
const notes = ref<Note[]>([]);

// 添加触摸相关的变量
const startX = ref(0);
const currentIndex = ref(-1);
const isTouching = ref(false);
// 获取笔记列表
const getNotes = async () => {
  try {
    const response = await api_getNoteList(userId);
    console.log(response);
    if (response.code === 1) {
      notes.value = response.data;
      showSearch.value = true;
    } else {
      uni.showToast({
        title: "获取笔记失败",
        icon: "none",
      });
    }
  } catch (error) {
    console.error("获取笔记失败:", error);
    uni.showToast({
      title: "获取笔记失败",
      icon: "none",
    });
  }
};

// 过滤笔记
const filteredNotes = computed(() => {
  let result = notes.value;

  // 按分类筛选
  if (activeCategory.value === "ai") {
    result = result.filter((note) => note.noteType === "ai");
  } else if (activeCategory.value === "manual") {
    result = result.filter((note) => note.noteType !== "ai");
  }

  // 按搜索文本筛选
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase();
    result = result.filter(
      (note) =>
        note.content.toLowerCase().includes(searchLower) ||
        note.meetingName.toLowerCase().includes(searchLower)
    );
  }

  // 按日期排序（最新的在前面）
  return result.sort(
    (a, b) =>
      new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
  );
});

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
    .getDate()
    .toString()
    .padStart(2, "0")}`;
};

// 筛选分类
const filterByCategory = (category: string) => {
  activeCategory.value = category;
};

// 搜索笔记
const searchNotes = () => {
  console.log("搜索:", searchText.value);
};

// 清除搜索
const clearSearch = () => {
  searchText.value = "";
};

// 查看笔记详情
const viewNoteDetail = (note: Note) => {
  uni.navigateTo({
    url: `/pages/mine/notedetail/notedetail?noteId=${note.noteId}`,
  });
};

/////滑动删除代码
// 触摸开始
const touchStart = (event: TouchEvent, index: number) => {
  console.log("触摸开始", currentIndex.value, index);
  if (currentIndex.value !== -1 && currentIndex.value !== index) {
    notes.value[currentIndex.value].offset = 0;
    currentIndex.value = -1;
  }
  startX.value = event.touches[0].clientX;
  isTouching.value = true;
  currentIndex.value = index;
};

// 触摸移动
const touchMove = (event: TouchEvent, index: number) => {
  if (!isTouching.value) return;

  const moveX = event.touches[0].clientX;
  const deltaX = moveX - startX.value;

  // 限制只能向左滑动，最大滑动距离为删除按钮宽度
  const offset = Math.min(Math.max(deltaX, -80), 0);
  // 找到原始数组中对应的笔记
  const originalIndex = notes.value.findIndex(
    (note) => note.noteId === filteredNotes.value[index].noteId
  );
  if (originalIndex !== -1) {
    notes.value[originalIndex].offset = offset;
  }
};

// 触摸结束
const touchEnd = (event: TouchEvent, index: number) => {
  if (!isTouching.value) return;

  // 找到原始数组中对应的笔记
  const originalIndex = notes.value.findIndex(
    (note) => note.noteId === filteredNotes.value[index].noteId
  );
  if (originalIndex !== -1) {
    const note = notes.value[originalIndex];
    const offset = note.offset || 0;
    isTouching.value = false;
    // 如果滑动距离超过40px，则完全展开删除按钮
    if (offset < -40) {
      note.offset = -80;
    } else {
      note.offset = 0;
      currentIndex.value = -1;
    }
  }
};

// 删除笔记
const deleteNote = async (note: Note, index: number) => {
  try {
    uni.showModal({
      title: "确认删除",
      content: "确定要删除这条笔记吗？",
      success: async (res) => {
        if (res.confirm) {
          const response = await api_deleteNote(note.noteId);

          if (response.code === 1) {
            // 找到原始数组中对应的笔记并删除
            const originalIndex = notes.value.findIndex(
              (n) => n.noteId === note.noteId
            );
            if (originalIndex !== -1) {
              notes.value.splice(originalIndex, 1);
            }
            uni.showToast({
              title: "删除成功",
              icon: "success",
            });
          } else {
            throw new Error(response.msg || "删除失败");
          }
        }
      },
    });
  } catch (error) {
    console.error("删除笔记失败:", error);
    uni.showToast({
      title: error.message || "删除失败",
      icon: "none",
    });
  }
};
/////滑动删除代码结束

// 创建新笔记  此功能已经废弃
const createNewNote = async () => {
  try {
    if (!userId) {
      uni.showToast({
        title: "请先登录",
        icon: "none",
      });
      return;
    }

    // 弹出输入框获取笔记内容  需要再写一个弹窗组件
    const res = await uni.showModal({
      title: "创建笔记",
      editable: true,
      placeholderText: "请输入笔记内容",
    });

    if (res.confirm && res.content) {
      const noteData = {
        meetingId: Date.now().toString(), // 使用时间戳作为临时会议ID
        userId: userId,
        subtitleContent: "s", // 手动创建的笔记没有字幕内容
        noteType: "manual", // 设置为手动类型
        content: res.content,
      };

      console.log(noteData);

      const response = await uni.request({
        url: baseURL + "meetingnote/info",
        method: "POST",
        data: noteData,
      });

      console.log(response);

      if (response.data.code === 1) {
        uni.showToast({
          title: "创建成功",
          icon: "success",
        });
        // 刷新笔记列表
        getNotes();
      } else {
        throw new Error(response.data.msg || "创建失败");
      }
    }
  } catch (error) {
    console.error("创建笔记失败:", error);
    uni.showToast({
      title: error.message || "创建失败",
      icon: "none",
    });
  }
};

// 页面加载时获取笔记列表
getNotes();
</script>

<style lang="scss" scoped>
.note-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  display: flex;
  flex-direction: column;
  position: relative;
}

.header {
  background: #2b58f9;
  padding: 30rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.header-title {
  font-size: 36rpx;
  color: #fff;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 20rpx;
}

.search-box {
  background: rgba(255, 255, 255, 0.95);
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(41, 196, 235, 0.08);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(43, 108, 248, 0.8);
  transition: all 0.3s ease;

  &:focus-within {
    transform: translateY(-2rpx);
    box-shadow: 0 12rpx 28rpx rgba(0, 0, 0, 0.12);
  }

  input {
    flex: 1;
    height: 60rpx;
    font-size: 28rpx;
    margin: 0 20rpx;
    color: #333;

    &::placeholder {
      color: #999;
    }
  }
}

.note-categories {
  display: flex;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  padding: 10rpx 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 1;
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
}

.category-item {
  padding: 20rpx 30rpx;
  font-size: 28rpx;
  color: #666;
  position: relative;
  transition: all 0.3s;

  &.active {
    color: #2b58f9;
    font-weight: 500;
    background: linear-gradient(180deg, rgba(43, 88, 249, 0.1), transparent);
    border-radius: 30rpx;

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 20%;
      right: 20%;
      height: 4rpx;
      background: linear-gradient(90deg, #2b58f9, #1a3d8f);
      border-radius: 2rpx;
    }
  }

  &:active {
    transform: scale(0.95);
  }
}

.note-list {
  flex: 1;
  padding: 20rpx;
  height: calc(100vh - 220rpx);
}

.note-item {
  position: relative;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.note-content-wrapper {
  display: flex;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
}

.note-tag {
  position: absolute;
  top: 0;
  left: 0;
  width: 8rpx;
  height: 100%;
  background: #999;

  &.ai {
    background: #2b58f9;
  }

  &.manual {
    background: #058867;
  }
}

.note-content {
  padding: 20rpx 20rpx 20rpx 28rpx;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.note-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.note-date {
  font-size: 24rpx;
  color: #999;
}

.note-body {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-line;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10rpx;
  border-top: 1rpx solid #f0f0f0;
}

.note-meta {
  display: flex;
  gap: 20rpx;
}

.meta-item {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666;

  uni-icons {
    margin-right: 6rpx;
  }

  &.ai-badge {
    background: rgba(43, 88, 249, 0.1);
    color: #2b58f9;
    padding: 4rpx 10rpx;
    border-radius: 20rpx;
  }

  &.manual-badge {
    background: rgba(43, 88, 249, 0.1);
    color: #058867;
    padding: 4rpx 10rpx;
    border-radius: 20rpx;
  }
}

.note-actions {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.delete-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 160rpx;
  height: 100%;
  background: #ff4757;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  z-index: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.empty-subtext {
  font-size: 26rpx;
  color: #bbb;
}

.floating-btn {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: #2b58f9;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(43, 88, 249, 0.3);
  z-index: 10;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.95);
  }
}
</style>
