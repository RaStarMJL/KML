<template>
  <scroll-view scroll-y>
    <div class="container">
      <div class="header">
        <div class="icon">
          <text>翻译设置</text>
          <uni-icons
            type="sound"
            size="20"
            class="icons"
            color="#1ba035"></uni-icons>
        </div>
        <div class="setting-items">
          <text>开启实时字幕</text>
          <switch :checked="basicStore.isTranslate" @change="handleSubtitle" />
        </div>
        <div class="setting-items">
          <text>声源语言</text>
          <picker
            class=""
            mode="selector"
            :range="srcLang"
            range-key="Name"
            :value="srcIndex"
            @change="handleChangeLang('src', $event)">
            <view class="uni-input">{{ srcLang[srcIndex].Name }}</view>
          </picker>
        </div>
        <div class="setting-items">
          <text>翻译显示语言</text>
          <picker
            class=""
            mode="selector"
            :range="srcLang"
            range-key="Name"
            :value="desIndex"
            @change="handleChangeLang('des', $event)">
            <view class="uni-input">{{ srcLang[desIndex].Name }}</view>
          </picker>
        </div>
        <div class="setting-items">
          <text>字幕显示双语</text>
          <switch />
        </div>
      </div>

      <div class="header">
        <div class="icon">
          <text>语音识别设置</text>
          <uni-icons
            type="videocam"
            size="20"
            color="#1ba035"
            class="icons"></uni-icons>
        </div>

        <div class="setting-items">
          <text>行业领域</text>
          <switch />
        </div>

        <div class="setting-items">
          <text>自定义热词</text>
          <switch />
        </div>
      </div>

      <div class="header">
        <div class="icon">
          <text>成员权限</text>
          <uni-icons
            type="chat"
            size="20"
            color="#007aff"
            class="icons"></uni-icons>
        </div>
        <div class="setting-items">
          <text>开启和停止文字转写</text>
          <switch checked @change="" />
        </div>

        <div class="setting-items">
          <text>使用字幕功能</text>
          <switch checked @change="" />
        </div>

        <div class="setting-items">
          <text>修改声源语言</text>
          <switch checked @change="" />
        </div>

        <div class="setting-items">
          <text>修改行业领域</text>
          <switch checked @change="" />
        </div>
      </div>
    </div>
  </scroll-view>
</template>

<script>
import { srcLang } from "../../../utils/translate";
import { useTranSettingStore } from "../../../stores/modules/tranSetting";
import { useBasicStore } from "../../TUIRoom/stores/basic";
export default {
  data() {
    return {
      srcLang: srcLang,
      tranSettingStore: useTranSettingStore(),
      basicStore: useBasicStore(),
    };
  },
  computed: {
    srcIndex() {
      return this.tranSettingStore.srcLangIndex;
    },
    desIndex() {
      return this.tranSettingStore.desLangIndex;
    },
  },
  methods: {
    switch1Change: function (e) {
      console.log("switch1 发生 change 事件，携带值为", e.detail.value);
    },
    switch2Change: function (e) {
      console.log("switch2 发生 change 事件，携带值为", e.detail.value);
    },
    handleChangeLang: function (from, e) {
      if (from === "src") {
        this.tranSettingStore.setSrcLangIndex(e.detail.value);
      } else this.tranSettingStore.setDesLangIndex(e.detail.value);
    },
    handleSubtitle(e) {
      this.basicStore.setRealtimeTranslation(e.detail.value);
      uni.showToast({
        title: e.detail.value ? "实时翻译已开启" : "实时翻译已关闭",
        icon: "none",
        duration: 1000,
      });
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
