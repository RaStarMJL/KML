<script>
import { baseURL } from "/src/utils/http";
export default {
  globalData: {
    // 全局变量
    outContent: "你好呀，我是你的智能会议小助手，有什么想了解的吗？", // 智能体要全局显示的外部内容
  },
  data() {
    return {};
  },
  methods: {
    playAudioInApp(text) {
      const audioUrl = baseURL + `ai/audioDataToFile?text=${text}`;

      // 直接播放远程音频
      const audioCtx = uni.createInnerAudioContext();
      audioCtx.src = audioUrl;
      audioCtx.play();

      audioCtx.onPlay(() => console.log("开始播放"));
      audioCtx.onError((err) => {
        console.error("播放失败", err);
        uni.showToast({ title: "播放失败", icon: "none" });
      });
    },
  },
};
</script>

<style></style>
