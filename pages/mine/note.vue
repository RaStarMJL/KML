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
        @click="viewNoteDetail(note)">
        <view class="note-tag" :class="{ ai: note.aiGenerated }"></view>
        <view class="note-content">
          <view class="note-header">
            <text class="note-title">{{ note.title }}</text>
            <text class="note-date">{{ formatDate(note.date) }}</text>
          </view>
          <text class="note-body">{{ note.body }}</text>
          <view class="note-footer">
            <view class="note-meta">
              <view class="meta-item ai-badge" v-if="note.aiGenerated">
                <uni-icons type="robot" size="14" color="#2B58F9"></uni-icons>
                <text>AI总结</text>
              </view>
              <view class="meta-item">
                <uni-icons type="calendar" size="14" color="#666"></uni-icons>
                <text>{{ note.duration || "30分钟" }}</text>
              </view>
              <view class="meta-item" v-if="note.participants">
                <uni-icons type="personadd" size="14" color="#666"></uni-icons>
                <text>{{ note.participants }}人参与</text>
              </view>
            </view>
            <view class="note-actions">
              <uni-icons
                type="more-filled"
                size="18"
                color="#999"
                @click.stop="showActions(note, index)"></uni-icons>
            </view>
          </view>
        </view>
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

    <!-- 悬浮按钮 -->
    <view class="floating-btn" @click="createNewNote">
      <uni-icons type="plusempty" size="24" color="#fff"></uni-icons>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      showSearch: false,
      searchText: "",
      activeCategory: "all",
      notes: [
        {
          id: 1,
          title: "产品开发讨论会",
          body: "会议要点：\n1. 产品UI设计将于下周开始\n2. 两周内完成原型设计\n3. 下个月初开始开发\n4. 测试团队需提前准备测试用例",
          date: "2024-03-01",
          aiGenerated: true,
          duration: "45分钟",
          participants: 8,
          keyPoints: ["UI设计", "原型设计", "开发计划", "测试准备"],
        },
        {
          id: 2,
          title: "市场营销策略会议",
          body: "讨论了Q2季度的营销策略。决定：\n1. 增加社交媒体投放预算\n2. 与三家KOL合作推广新产品\n3. 4月举办线上产品发布会",
          date: "2024-02-28",
          aiGenerated: true,
          duration: "60分钟",
          participants: 6,
          keyPoints: ["预算调整", "KOL合作", "产品发布会"],
        },
        {
          id: 3,
          title: "团队周会",
          body: "回顾了上周工作进度，讨论了本周工作计划。重点项目已完成70%，预计下周可以完成测试。各部门汇报了工作进展和遇到的问题。",
          date: "2024-02-25",
          aiGenerated: true,
          duration: "60分钟",
          participants: 12,
          keyPoints: ["工作进度", "问题解决", "下周计划"],
        },
        {
          id: 4,
          title: "客户需求沟通会",
          body: "与客户讨论了项目需求变更。客户希望增加数据分析功能，并提前交付用户管理模块。我们同意了这些变更，但需要调整项目时间线。",
          date: "2024-02-20",
          aiGenerated: false,
          duration: "45分钟",
          participants: 5,
        },
      ],
    };
  },
  computed: {
    filteredNotes() {
      let result = this.notes;

      // 按分类筛选
      if (this.activeCategory === "ai") {
        result = result.filter((note) => note.aiGenerated);
      } else if (this.activeCategory === "manual") {
        result = result.filter((note) => !note.aiGenerated);
      }

      // 按搜索文本筛选
      if (this.searchText) {
        const searchLower = this.searchText.toLowerCase();
        result = result.filter(
          (note) =>
            note.title.toLowerCase().includes(searchLower) ||
            note.body.toLowerCase().includes(searchLower)
        );
      }

      // 按日期排序（最新的在前面）
      return result.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
  },
  methods: {
    formatDate(dateStr) {
      const date = new Date(dateStr);
      const now = new Date();

      // 计算天数差异
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return "昨天";
      } else if (diffDays <= 7) {
        return `${diffDays}天前`;
      } else {
        return `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
      }
    },
    filterByCategory(category) {
      this.activeCategory = category;
    },
    searchNotes() {
      // 搜索功能已通过计算属性实现
      console.log("搜索:", this.searchText);
    },
    clearSearch() {
      this.searchText = "";
    },
    viewNoteDetail(note) {
      // 查看笔记详情
      uni.navigateTo({
        url: `/pages/mine/note-detail?id=${note.id}`,
      });
    },
    showActions(note, index) {
      uni.showActionSheet({
        itemList: ["分享", "导出", "删除"],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 分享笔记
            uni.showToast({
              title: "分享功能开发中",
              icon: "none",
            });
          } else if (res.tapIndex === 1) {
            // 导出笔记
            uni.showToast({
              title: "导出功能开发中",
              icon: "none",
            });
          } else if (res.tapIndex === 2) {
            // 删除笔记
            this.deleteNote(index);
          }
        },
      });
    },
    deleteNote(index) {
      uni.showModal({
        title: "确认删除",
        content: "确定要删除这条会议笔记吗？",
        success: (res) => {
          if (res.confirm) {
            this.notes.splice(index, 1);
            uni.showToast({
              title: "删除成功",
              icon: "success",
            });
          }
        },
      });
    },
    createNewNote() {
      uni.navigateTo({
        url: "/pages/mine/create-note",
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.note-container {
  min-height: 100vh;
  background: #f5f6f7;
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
  background: #fff;
  margin: 20rpx;
  border-radius: 8rpx;
  padding: 15rpx 20rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  input {
    flex: 1;
    height: 60rpx;
    font-size: 28rpx;
    margin: 0 15rpx;
  }
}

.note-categories {
  display: flex;
  background: #fff;
  padding: 0 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
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

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 20%;
      right: 20%;
      height: 4rpx;
      background: #2b58f9;
      border-radius: 2rpx;
    }
  }
}

.note-list {
  flex: 1;
  padding: 20rpx;
  height: calc(100vh - 220rpx);
}

.note-item {
  background: #fff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
  position: relative;
  transition: transform 0.3s;

  &:active {
    transform: scale(0.98);
  }
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
