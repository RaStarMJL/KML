<template>
  <div>
    <subTitle
      v-if="showSubtitle"
      :text="subtitleText"
      :initialPosition="{ x: 50, y: 150 }"
      :initialSize="{ width: 300, height: 80 }"
      class="subtitle-layer"
      @close="showSubtitle = false" />

    <button v-if="!showSubtitle" @click="showSubtitle = true">显示字幕</button>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoomStore } from "../../../src/roomkit/TUIRoom/stores/room";
import subTitle from "../customSubtitle/index.vue";

export default {
  components: {
    subTitle,
  },
  setup() {
    const roomStore = useRoomStore();
    const { userVolumeObj, localUser } = storeToRefs(roomStore);

    const subtitleText = ref("等待发言...");
    const showSubtitle = ref(true);
    const currentSpeakerId = ref(null);
    const recorderManager = uni.getRecorderManager();
    let isRecording = false;

    // 配置录音参数
    const recordOptions = {
      duration: 5000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: "mp3",
      frameSize: 50,
    };

    // 监听录音结束事件
    recorderManager.onStop((res) => {
      isRecording = false;
      const { tempFilePath } = res;
      console.log("录音文件:", tempFilePath);

      // 模拟语音识别和翻译过程
      // 实际应用中应调用语音识别和翻译API
      simulateRecognitionAndTranslation(currentSpeakerId.value);
    });

    // 监听用户音量变化
    watch(
      () => userVolumeObj.value,
      (volumes) => {
        // 寻找当前音量最大的用户
        let maxVolume = 20; // 设置音量阈值
        let speakerId = null;

        Object.entries(volumes).forEach(([userId, volume]) => {
          if (volume > maxVolume) {
            maxVolume = volume;
            speakerId = userId;
          }
        });

        // 如果找到发言人且不是当前正在处理的发言人
        if (speakerId && speakerId !== currentSpeakerId.value && !isRecording) {
          currentSpeakerId.value = speakerId;

          // 获取发言人信息
          const speaker =
            roomStore.remoteUserObj[speakerId] ||
            (speakerId === localUser.value.userId ? localUser.value : null);

          if (speaker && speaker.hasAudioStream) {
            // 如果发言人麦克风打开，开始录音
            isRecording = true;
            recorderManager.start(recordOptions);

            // 在字幕上显示正在识别
            subtitleText.value = `正在识别 ${
              speaker.userName || speakerId
            } 的发言...`;
          }
        }
      },
      { deep: true }
    );

    // 模拟语音识别和翻译过程
    function simulateRecognitionAndTranslation(speakerId) {
      const speaker =
        roomStore.remoteUserObj[speakerId] ||
        (speakerId === localUser.value.userId ? localUser.value : null);

      if (!speaker) return;

      // 模拟延迟
      setTimeout(() => {
        // 模拟翻译结果 - 实际应用中应替换为真实翻译结果
        const translatedText = `${
          speaker.userName || speakerId
        } 说: 这是一个模拟的翻译结果，实际应用中这里应该是翻译API返回的文本。`;
        subtitleText.value = translatedText;
      }, 1000);
    }

    return {
      subtitleText,
      showSubtitle,
    };
  },
};
</script>

<style scoped>
.subtitle-layer {
  z-index: 1500;
  pointer-events: auto;
}
</style>
