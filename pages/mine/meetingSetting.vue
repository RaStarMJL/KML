<template>
  <div class="container">
    <div class="header">
      <div class="icon">
        <text>音频</text>
        <uni-icons
          type="sound"
          size="20"
          class="icons"
          color="#1ba035"></uni-icons>
      </div>
      <div class="setting-items">
        <text>入会开启麦克风</text>
        <switch checked />
      </div>
      <div class="setting-items">
        <text>入会开启扬声器</text>
        <switch checked />
      </div>
      <div class="setting-items">
        <text>开启麦克风浮窗</text>
        <switch />
      </div>
      <div class="setting-items">
        <text>开麦时播放提示音</text>
        <switch />
      </div>
    </div>

    <div class="header">
      <div class="icon">
        <text>视频</text>
        <uni-icons
          type="videocam"
          size="20"
          color="#1ba035"
          class="icons"></uni-icons>
      </div>

      <div class="setting-items">
        <text>入会开启摄像头</text>
        <switch />
      </div>

      <div class="setting-items">
        <text>虚拟数字人</text>
        <switch />
      </div>

      <div class="setting-items">
        <text>水牌</text>
        <switch @change="" />
      </div>

      <div class="setting-items">
        <text>虚拟头像</text>
        <uni-icons type="arrowright" size="20" @click=""></uni-icons>
      </div>
    </div>

    <div class="header">
      <div class="icon">
        <text>聊天</text>
        <uni-icons
          type="chat"
          size="20"
          color="#007aff"
          class="icons"></uni-icons>
      </div>
      <div class="setting-items">
        <text>显示弹幕</text>
        <switch checked @change="" />
      </div>
    </div>

    <div class="header">
      <div class="icon">
        <text>通用</text>
        <uni-icons
          type="gear"
          size="20"
          color="#57617c"
          class="icons"></uni-icons>
      </div>
      <div class="setting-items">
        <text>字幕和转写</text>
        <uni-icons type="arrowright" size="20"></uni-icons>
      </div>

      <div class="setting-items">
        <text>显示参会时长</text>
        <switch checked="true" @change="" />
      </div>

      <div class="setting-items">
        <text>AI浮窗</text>
        <switch checked="true" @change="" />
      </div>

      <div class="setting-items">
        <text>实时语音转文字</text>
        <switch checked="true" @change="" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    switch1Change: function (e) {
      console.log("switch1 发生 change 事件，携带值为", e.detail.value);
    },
    switch2Change: function (e) {
      console.log("switch2 发生 change 事件，携带值为", e.detail.value);
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding: 20rpx;
  padding-bottom: 120rpx; /* 增加底部间距 */
  border-radius: 1rpx solid #f5f6f7;
}

.header {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.setting-items {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f6f7;
  background-color: white;
  border-radius: 8px;
}

.icon {
  display: flex;
  font-size: 25rpx;
  color: gray;
  margin-left: 5rpx;
  align-items: center;
}
.icons {
  margin-left: 5rpx;
}
</style>
