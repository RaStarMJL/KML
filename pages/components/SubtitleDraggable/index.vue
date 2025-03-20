<template>
  <view class="content">
    <view class="result-area">
      <view class="result-box">
        <text class="result-label">识别结果：</text>
        <text class="result-text">{{ originText }}</text>
      </view>
      <view class="result-box">
        <text class="result-label">翻译结果：</text>
        <text class="result-text">{{ translatedText }}</text>
      </view>
    </view>

    <view
      class="down-ui"
      v-if="downed"
      :style="{ backgroundColor: downtime == -1 ? '#e43d33' : '#1acf3b' }">
      <!-- 效果显示 -->
      <view v-if="downtime == -1"> 建立连接中 </view>
      <view v-else>
        语音倒计时
        <text style="color: red">{{ downtime }} </text>
      </view>
    </view>
    <button
      class="btn-bottom"
      :disabled="disabled"
      @touchstart.stop="start"
      @touchend.stop="end">
      按下说话
    </button>

    <yueasrxf
      ref="yueAsrRefs"
      :options="optionsxf"
      @countDown="countDown"
      @result="resultMsg"
      @onStop="onStop"
      @onOpen="onOpen"
      @change="change"></yueasrxf>
  </view>
</template>

<script>
import crypto from "crypto-js";
import yueasrxf from "/uni_modules/yue-asr-xf/components/yue-asr-xf/yue-asr-xf.vue";
export default {
  data() {
    return {
      title: "Hello",
      msg: "转文字",
      optionsxf: {
        receordingDuration: this.second,
        APPID: "5ec48c09",
        API_SECRET: "012c79882f38864458e483a4f95d6c74",
        API_KEY: "5b22b6e819d6a72b476b19083a854ddc",
      },
      downtime: -1, //默认-1
      downed: false,
      disabled: false,
      second: 60,
      translationConfig: {
        host: "itrans.xfyun.cn",
        path: "/v2/its",
        apiKey: "f9c246b2d8353252b0ef705771d8df22", // 替换为翻译API Key
        apiSecret: "NDJmYWRjYTBkYmI1YTE0MWZjZDM4MTMw", // 替换为翻译API Secret
      },
      originText: "等待识别...", // 原识别文本
      translatedText: "等待翻译...", // 翻译结果文本
      socketTask: null,
    };
  },
  onLoad() {
    // #ifdef APP
    plus.android.requestPermissions(
      ["android.permission.RECORD_AUDIO"],
      (e) => {},
      (e) => {}
    );
    // #endif

    this.socketTask = uni.connectSocket({
      url: "ws://192.168.31.115:5000/socket",
      complete: () => {},
    });
    this.socketTask.onMessage((res) => {
      console.log("收到消息:", res.data);
    });
  },
  methods: {
    resumeUi() {
      this.downed = false;
      this.downtime = -1;
      this.disabled = false;
      this.downtime = this.second;
    },

    start() {
      if (this.disabled) {
        return;
      }
      console.log("开始");
      this.downed = true;
      this.$refs.yueAsrRefs.start();
      this.disabled = true;
      //建立连接
    },
    end() {
      console.log("结束");
      this.$refs.yueAsrRefs.end();
    },
    countDown(e) {
      console.log("countDown", e);
      this.downtime = e;
    },
    onStop(e) {
      console.log("onStop", e);
      this.resumeUi();
    },
    onOpen(e) {
      console.log("onOpen", e);
    },
    change(e) {
      console.log("change", e);
    },
    async resultMsg(e) {
      this.originText = e;
      try {
        const translated = await this.translateText(e, "en", "cn");
        this.translatedText = translated;
      } catch (err) {
        console.error("翻译失败:", err);
        this.translatedText = "翻译失败";
      }
      // 构造协议数据
      const payload = JSON.stringify({
        type: "subtitle",
        zimu: this.originText,
        timestamp: Date.now(),
        meetingId: "123211",
        attendeesUid: '["U88888"]',
      });
      this.socketTask.send({ data: payload });

      console.log(this.originText);
    },

    // 新增翻译方法
    async translateText(text, from, to) {
      const { host, path, apiKey, apiSecret } = this.translationConfig;

      // 1. 准备请求数据
      const body = {
        common: { app_id: "e79198f1" }, // 使用翻译的APPID
        business: { from, to },
        data: { text: this.base64Encode(text) },
      };

      // 2. 生成鉴权头
      const date = new Date().toUTCString();
      const digest = this.generateDigest(body);
      const signature = this.generateSignature(
        host,
        path,
        date,
        digest,
        apiSecret
      );

      // 3. 发送请求
      const res = await uni.request({
        url: `https://${host}${path}`,
        method: "POST",
        header: {
          "Content-Type": "application/json",
          Host: host,
          Date: date,
          Digest: digest,
          Authorization: `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line digest", signature="${signature}"`,
        },
        data: body,
      });

      // 4. 处理响应
      if (res.data.code === 0) {
        return res.data.data.result.trans_result.dst;
      } else {
        throw new Error(`翻译错误 ${res.data.code}: ${res.data.message}`);
      }
    },

    // 生成Digest
    generateDigest(body) {
      const str = JSON.stringify(body);
      const hash = crypto.SHA256(str);
      return `SHA-256=${crypto.enc.Base64.stringify(hash)}`;
    },

    // 生成签名
    generateSignature(host, path, date, digest, secret) {
      const signatureOrigin = [
        `host: ${host}`,
        `date: ${date}`,
        `POST ${path} HTTP/1.1`,
        `digest: ${digest}`,
      ].join("\n");

      const signature = crypto.HmacSHA256(signatureOrigin, secret);
      return crypto.enc.Base64.stringify(signature);
    },

    // Base64编码
    base64Encode(text) {
      return crypto.enc.Base64.stringify(crypto.enc.Utf8.parse(text));
    },
  },
  components: {
    yueasrxf,
  },
};
</script>

<style scoped>
.content {
  position: absolute;
  top: 100px;
}

.btn-bottom {
  width: 100vw;
}

.inputarea {
  text-align: left;
  color: red;
  height: 200rpx;
  border: 1px solid #ccc;
  margin: 10rpx;
  border-radius: 10rpx;
  padding: 5rpx;
  overflow-y: scroll;
}

.down-ui {
  height: 100px;
  width: 100%;

  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
