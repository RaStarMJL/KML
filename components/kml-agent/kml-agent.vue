<template>
  <view
    v-if="isShow && userInfoStore.isLoggedIn"
    id="drag_view"
    class="drag"
    :style="'left: ' + left + 'px; top:' + top + 'px;'"
    @touchstart="touchstart"
    @touchmove.stop.prevent="touchmove"
    @touchend="touchend"
    @click="openPopup"
    :class="{ transition: isDock && !isMoveing }">
    <view
      v-if="outContent !== ''"
      class="outContent"
      @click.stop="() => {}"
      :class="{ left: dockDirection, right: !dockDirection }">
      <text>{{ outContent }}</text>
    </view>
    <image
      src="/src/static/images/agent.gif"
      style="width: 80px; height: 80px" />
  </view>
  <uni-popup :is-mask-click="false" ref="popup" type="bottom">
    <view class="popup-container">
      <!-- 头部 -->
      <view class="header">
        <view class="item1">
          <uni-icons
            v-if="!isDialoging"
            type="more-filled"
            color=""
            size="20" />
          <uni-icons
            v-else
            type="arrow-left"
            color=""
            size="24"
            @tap="goBack" />
        </view>
        <view class="item2"><text class="title">智能会议小助手</text></view>
        <view class="item3">
          <view
            ><image
              src="/src/static/icons/common/amplify.png"
              mode="scaleToFill"
              style="width: 20px; height: 20px"
          /></view>
          <view
            ><uni-icons
              type="closeempty"
              color=""
              size="20"
              @tap="closePopup" />
          </view>
        </view>
      </view>

      <!-- 主要内容 -->
      <view class="main-content">
        <view class="content" v-if="showContent">
          <view class="text-header">
            <text class="greeting"
              >{{ userName }} 您好，\n欢迎使用“会议助手智能体”</text
            >
            <!-- <text class="sub-title">每小时{{ limitCount }}次</text> -->
          </view>
          <!-- 自动问答提示列表 -->
          <view class="func-list">
            <view
              class="func-item"
              v-for="(item, index) in funcItems"
              @tap="sendQuickMessage(item.content)"
              :key="item.id">
              {{ item.content }}
            </view>
          </view>
        </view>
        <!-- 聊天内容区域 -->
        <scroll-view
          scroll-y
          class="chat-messages"
          :scroll-top="scrollTop"
          @scrolltolower="onScrollToLower"
          :scroll-with-animation="true"
          :show-scrollbar="false"
          ref="messagesScroll"
          id="chat-scroll">
          <view class="chat-list" id="chat-list">
            <!-- 遍历所有消息，不再通过v-if区分类型 -->
            <view
              v-for="(message, index) in messages"
              :key="message.type + '-' + index"
              :class="[
                'message',
                message.type === 'ai' ? 'ai-message' : 'user-message',
              ]">
              <!-- AI消息的头像 -->
              <image
                v-if="message.type === 'ai'"
                class="avatar"
                :src="aiAvatar"
                mode="aspectFill"></image>

              <view class="message-content">
                <view class="message-bubble">
                  <image
                    class="loading-image"
                    v-if="message.loading"
                    src="/src/static/images/loading.gif"
                    mode="scaleToFill" />
                  <text v-else>{{ message.content }}</text>
                </view>

                <!-- 仅AI消息显示操作按钮 -->
                <view v-if="message.type === 'ai'" class="message-actions">
                  <view
                    class="action-btn"
                    @click="copyMessage(message.content)">
                    <uni-icons
                      type="upload"
                      size="16"
                      color="#8a8a8a"></uni-icons>
                  </view>
                  <view class="action-btn" @click="likeMessage(index)">
                    <uni-icons
                      type="hand-up"
                      size="16"
                      :color="
                        message.liked ? '#4080FF' : '#8a8a8a'
                      "></uni-icons>
                  </view>
                  <view class="action-btn" @click="dislikeMessage(index)">
                    <uni-icons
                      type="hand-down"
                      size="16"
                      :color="
                        message.disliked ? '#ff6666' : '#8a8a8a'
                      "></uni-icons>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 底部说明 -->
      <view class="footer">
        <!-- 搜索提示 -->
        <view class="search-tip">
          <view
            class="item"
            v-for="item in agentList"
            :key="item.id"
            @tap="switchAgent(item.id)"
            :class="{ active: curAgentId === item.id && isDialoging }"
            >{{ item.name }}</view
          >
        </view>
        <view class="search-main">
          <view class="ipt-left">
            <uni-icons
              class="soundBtn"
              type="sound"
              :color="dialogueMode !== 'text' ? '#007aff' : ''"
              size="24"
              @tap="changeDialogueMode" />
          </view>
          <view
            class="ipt-mid"
            :class="{
              text: isFocus && dialogueMode === 'text',
              voice: dialogueMode === 'voice',
            }"
            :style="{
              width: searchIpt !== '' ? '450rpx' : '520rpx',
            }">
            <textarea
              class="ipt"
              @focus="handleFoucs"
              @blur="isFocus = false"
              auto-height="ture"
              v-model="searchIpt"
              :placeholder="placeholder" />
          </view>
          <view class="ipt-right">
            <view
              class="sendBtn"
              v-if="this.searchIpt.length > 0"
              @tap="sendMessage(searchIpt)"
              >发送</view
            >
            <!-- <uni-icons
              class="sendBtn"
              type="paperplane"
              color=""
              size="24"
              @tap="sendMessage(searchIpt)" /> -->
          </view>
        </view>
      </view>
      <text class="tip-text">所有内容由 AI 生成，仅供参考。</text>
    </view>
  </uni-popup>
</template>

<script>
import { useUserInfoStore } from "@/src/stores/modules/userInfo";
import { getPathPlanning, aimanage } from "../../src/services/api";
import { throttle } from "/src/roomkit/TUIRoom/utils/utils.ts";
import { baseURL } from "../../src/utils/http";
import { baiduTranslate } from "../../src/assets/config/config";
// #ifdef APP-PLUS
import * as SpeechRealTimeTrans from "../../uni_modules/bsf-baidu-realtime-speech-trans";
// #endif
export default {
  name: "kml-agent",
  props: {
    isDock: {
      //是否自动回到距离最近的边界（自动吸边）
      type: Boolean,
      default: true,
    },
    existTabBar: {
      //页面是否存在底部tabbar
      type: Boolean,
      default: false,
    },
    x: {
      //初始化坐标x
      type: Number,
      default: 0,
    },
    y: {
      //初始化坐标y
      type: Number,
      default: 200,
    },
  },
  created() {
    const app = getApp();
    this.outContent = app.globalData.outContent;
    setTimeout(() => {
      app.globalData.outContent = "";
    }, 3000);
  },
  data() {
    return {
      dockDirection: 0, //自动吸边的方向，0代表右边，1代表左边
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      pageInX: 0,
      pageInY: 0,
      pageInLeft: 0,
      pageInTop: 0,
      windowWidth: 0,
      windowHeight: 0,
      isMoveing: true, //是否正在被拖动中
      edge: 10, //自动黏贴边界后的距离gap空隙,单位px
      scrollTop: 0, // 滚动条位置
      funcItems: [
        {
          id: 1,
          content: "快速创建一个会议",
        },
        {
          id: 2,
          content: "快速开始会议",
        },
        {
          id: 3,
          content: "快速加入会议",
        },
        {
          id: 4,
          content: "参会提醒",
        },
      ],
      aiAvatar: "/src/static/images/agent.png", // AI 头像
      loading: false, // 加载状态
      placeholder: "有什么想了解的吗？",
      messages: [],
      outContent: "", // 外部内容
      searchIpt: "",
      isShow: true, // 控制智能体机器人是否显示
      userInfoStore: useUserInfoStore(), // 引入用户信息store
      customBorderStyle: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      },
      isDialoging: false, // 对话中
      dialogueMode: "text",
      isFocus: false,
      curAgentId: 0, // 智能助手索引
      agentList: [
        {
          id: 1001,
          name: "通用助手",
          icon: "",
        },
        {
          id: 1002,
          name: "文档助手",
          icon: "",
        },
      ], // 智能助手列表
    };
  },
  mounted() {
    const sys = uni.getSystemInfoSync();
    this.windowWidth = sys.windowWidth;
    this.windowHeight = sys.windowHeight;
    // #ifdef APP-PLUS
    this.existTabBar && (this.windowHeight -= 50);
    // #endif
    if (sys.windowTop) {
      this.windowHeight += sys.windowTop;
    }
    let query = uni.createSelectorQuery().in(this);
    query
      .select("#drag_view")
      .boundingClientRect((data) => {
        this.width = data.width;
        this.height = data.height;
        this.left = this.x
          ? this.edge + this.x
          : this.windowWidth - this.width - this.edge;
        this.top = this.y
          ? this.edge + this.y
          : this.windowHeight - this.height - this.edge;
      })
      .exec();
  },
  methods: {
    // 播放音频
    playAudioInApp(text) {
      const audioUrl = `${baseURL}ai/audioDataToFile?text=${text}`;

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
    // 返回
    goBack() {
      this.messages = [];
      this.isDialoging = false;
    },
    switchAgent(agentId) {
      switch (agentId) {
        case 1001: {
          this.curAgentId = agentId;
          this.switchGeneral();
          console.log("切换到通用助手", this.curAgentId === agentId);
          break;
        }
        case 1002: {
          this.curAgentId = agentId;
          this.switchDocunemt();
          break;
        }
        default: {
          break;
        }
      }
    },
    // 切换到通用助手
    switchGeneral() {
      uni.showToast({
        title: "正在切换到通用助手",
        icon: "loading",
        duration: 500,
      });
      setTimeout(() => {
        this.messages = [
          {
            type: "ai",
            content: "您好！我是通用智能助手，可以协助您快速创建、加入会议。",
            liked: false,
            disliked: false,
            time: new Date(),
          },
        ];
        this.isDialoging = true;
      }, 500);
    },
    switchDocunemt() {
      uni.showToast({
        title: "正在切换到文档助手",
        icon: "loading",
        duration: 500,
      });
      setTimeout(() => {
        this.messages = [
          {
            type: "ai",
            content:
              "您好！我是文档智能助手，可以协助您快速检索、总结和创建会议文档。",
            liked: false,
            disliked: false,
            time: new Date(),
          },
        ];
        this.isDialoging = true;
      }, 500);
    },
    // 处理输入框获取到焦点的逻辑
    handleFoucs() {
      this.isFocus = true;
      if (this.dialogueMode === "voice") {
        this.dialogueMode = "text";
      }
    },
    // 伪流式输出
    pseudoStreamOutput(content) {
      const loadingIndex = this.messages.length - 1;
      let index = 0;
      this.messages[loadingIndex].loading = false;
      const interval = setInterval(() => {
        if (index < content.length) {
          this.messages[loadingIndex].content += content[index];
          index++;
          this.chatScrollTop();
        } else {
          clearInterval(interval); // 停止定时器
        }
      }, 20);
    },
    // 获取路径规划
    async handleGetPathPlanning() {
      console.log("正在获取路径规划");
      const res = await getPathPlanning({
        from: "上海东方明珠",
        to: "上海陆家嘴",
      });
      return res.data;
    },
    // 回答超出高度时自动滑动到底部(使用节流函数)
    chatScrollTop: throttle(function () {
      this.$nextTick(() => {
        const query = uni.createSelectorQuery();
        query.select(".chat-messages").boundingClientRect();
        query.select(".chat-list").boundingClientRect();
        query.exec((res) => {
          const scrollViewHeight = res[0].height;
          const scrollContentHeight = res[1].height;
          if (scrollContentHeight > scrollViewHeight) {
            const scrollTop = scrollContentHeight - scrollViewHeight;
            this.scrollTop = scrollTop;
          }
        });
      });
    }, 1000),
    // 发送快速问答
    async sendQuickMessage(question) {
      // 创建用户消息并添加到列表
      const userMessage = {
        type: "user",
        content: question,
        time: new Date(),
      };
      this.messages = [...this.messages, userMessage];
      this.isDialoging = true;
      switch (question) {
        case "快速创建一个会议": {
          const content =
            "快速创建会议需要包含以下信息：\n 1.会议名称：xxx\n 2.会议主题：xxx\n 3.会议时间：xxxx年xx月xx日xx时xx分\n 4.会议地点：xxx\n 5.会议内容：xxx\n 6.会议人数：xxx\n 7.会议备注：xxx\n 请按照以上格式填写信息，我会帮您快速创建会议。";
          // 创建AI回复消息对象
          const aiMessage = {
            type: "ai",
            loading: false,
            content: content,
            liked: false,
            disliked: false,
            time: new Date(),
          };
          this.messages = [...this.messages, aiMessage];
          break;
        }
        case "快速开始会议": {
          const content = "快速开始会议需要包含以下信息\n 会议名称";
          // 创建AI回复消息对象
          const aiMessage = {
            type: "ai",
            loading: false,
            content: content,
            liked: false,
            disliked: false,
            time: new Date(),
          };
          this.messages = [...this.messages, aiMessage];
          break;
        }
        case "快速加入会议": {
          const content = "快速加入会议需要包含以下信息\n 会议名称";
          // 创建AI回复消息对象
          const aiMessage = {
            type: "ai",
            loading: false,
            content: content,
            liked: false,
            disliked: false,
            time: new Date(),
          };
          this.messages = [...this.messages, aiMessage];
          break;
        }
        case "参会提醒": {
          const content = "参会提醒需要包含以下信息\n 会议名称";
          // 创建AI回复消息对象
          const aiMessage = {
            type: "ai",
            loading: false,
            content: content,
            liked: false,
            disliked: false,
            time: new Date(),
          };
          this.messages = [...this.messages, aiMessage];
          break;
        }
      }
    },
    // 发送消息
    async sendMessage(value) {
      console.log("发送消息:", value);
      this.dialogueMode = "text";
      this.placeholder = "有什么想了解的吗？";
      if (!this.searchIpt.trim()) return;

      // 创建用户消息并添加到列表
      const userMessage = {
        type: "user",
        content: this.searchIpt.trim(),
        time: new Date(),
      };
      this.messages = [...this.messages, userMessage];
      this.isDialoging = true;

      // 清空输入框
      const userInput = this.searchIpt.trim();
      this.searchIpt = "";

      // 立即滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      // 加载状态
      this.loading = true;
      // 创建AI回复消息对象
      const aiMessage = {
        type: "ai",
        loading: true,
        content: "", // 初始内容为空，等待API响应
        liked: false,
        disliked: false,
        time: new Date(),
      };
      this.messages = [...this.messages, aiMessage];
      const userInfoStore = useUserInfoStore();
      const userId = userInfoStore.userInfo?.userId;
      const res = await aimanage({
        sid: "550e8400-e29b-41d4-a716-446655440000",
        id: "ec6ed326-ab26-4aa2-87ac-fac05e622409",
        input: `用户uid:${userId}` + userInput,
      });
      try {
        // 安全地解析返回内容
        const str = res.data.answer;
        console.log("原始响应:", str);

        if (str) {
          try {
            // 检查响应格式并提取内容
            if (str) {
              const content = str;
              console.log("AI举办会议结果内容:", content);

              // 成功解析到内容，更新AI消息内容并取消加载状态
              this.pseudoStreamOutput(content);

              this.playAudioInApp(content);

              // 再次滚动到底部
              this.$nextTick(() => {
                this.scrollToBottom();
              });
              // 如果是自动参加会议操作
              if (res.data.userRequest === "用户参加会议") {
                // 解构出 meetingId 和 meetingName
                const { meetingId, meetingName } = res.data;
                this.$nextTick(() => {
                  uni.showToast({
                    title: `正在加入会议: ${meetingName}`,
                    icon: "loading",
                    duration: 1500,
                  });
                  setTimeout(() => {
                    // 跳转到对应的meetingshow页面
                    uni.navigateTo({
                      url: `/pages/recommend/meetingshow?meetingId=${meetingId}&autoJoin=autoJoin`,
                    });
                  }, 1500);
                });
              } else if (res.data.userRequest === "用户开始会议") {
                // 解构出 meetingId 和 meetingName
                const { meetingId, meetingName } = res.data;
                // 如果 meetingId 不存在，则表示不是会议举办人或者会议不存在
                if (!meetingId) {
                  return;
                }
                this.$nextTick(() => {
                  uni.showToast({
                    title: `正在开始会议: ${meetingName}`,
                    icon: "loading",
                    duration: 1500,
                  });
                  setTimeout(() => {
                    // 跳转到对应的meetingshow页面
                    uni.navigateTo({
                      url: `/pages/recommend/meetingshow?meetingId=${meetingId}&autoStart=autoStart`,
                    });
                  }, 1500);
                });
              }
            } else {
              throw new Error("AI举办会议结果格式不正确");
            }
          } catch (error) {
            // 处理文档检索过程中的错误
            console.error("AI举办会议过程错误:", error);
            uni.hideLoading();

            // 创建错误消息
            const errorMessage = {
              type: "ai",
              content:
                "很抱歉AI举办会议过程中遇到了问题: " +
                (error.message || "未知错误"),
              liked: false,
              disliked: false,
              time: new Date(),
            };

            // 添加错误消息到列表
            this.messages = [...this.messages, errorMessage];

            // 再次滚动到底部
            this.$nextTick(() => {
              this.scrollToBottom();
            });
          }
        }
      } catch (error) {
        console.error("处理消息错误:", error);

        // 创建错误消息
        const errorMessage = {
          type: "ai",
          content: "很抱歉，处理您的请求时遇到了问题，请稍后再试。",
          liked: false,
          disliked: false,
          time: new Date(),
        };

        // 添加错误消息到列表
        this.messages = [...this.messages, errorMessage];

        // 再次滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    copyMessage(content) {
      uni.setClipboardData({
        data: content,
        success: () => {
          uni.showToast({
            title: "已复制到剪贴板",
            icon: "none",
          });
        },
      });
    },
    likeMessage(index) {
      if (this.messages[index].type === "ai") {
        this.messages[index].liked = !this.messages[index].liked;
        if (this.messages[index].liked) {
          this.messages[index].disliked = false;
          // uni.showToast({
          //   title: "感谢您的反馈",
          //   icon: "none",
          // });
        }
      }
    },
    dislikeMessage(index) {
      if (this.messages[index].type === "ai") {
        this.messages[index].disliked = !this.messages[index].disliked;
        if (this.messages[index].disliked) {
          this.messages[index].liked = false;
          // uni.showToast({
          //   title: "已收到您的反馈",
          //   icon: "none",
          // });
        }
      }
    },
    changeDialogueMode() {
      if (this.dialogueMode === "text") {
        this.dialogueMode = "voice";
        this.searchIpt = "";
        this.placeholder = "正在聆听中...";
      } else {
        this.dialogueMode = "text";
        this.placeholder = "有什么想了解的吗？";
      }
    },
    openPopup() {
      this.$refs.popup.open();
      this.isShow = false;
    },
    closePopup() {
      this.$refs.popup.close();
      this.isShow = true;
    },
    handleClick(e) {
      this.$refs.popup.open("bottom");
    },
    touchstart(e) {
      // if (isOutContent) return;
      this.pageInX = e.touches[0].pageX;
      this.pageInY = e.touches[0].pageY;
      this.pageInLeft = this.left;
      this.pageInTop = this.top;
      // this.$emit("touchstart", e);
    },
    touchmove(e) {
      if (e.touches.length !== 1) {
        // 单指触摸
        return false;
      }
      this.isMoveing = true;
      this.left = this.pageInLeft + e.touches[0].pageX - this.pageInX;
      this.top = this.pageInTop + e.touches[0].pageY - this.pageInY;
      // #ifdef H5
      // clientY += this.height;
      // #endif
      // let edgeBottom = this.windowHeight - this.height - this.edge;

      // 上下触及边界
      // if (clientY < this.edge) {
      // 	this.top = this.edge;
      // } else if (clientY > edgeBottom) {
      // 	this.top = edgeBottom;
      // } else {
      // 	this.top = clientY
      // }
      // this.top = clientY

      // this.$emit("touchmove", e);
    },
    touchend(e) {
      if (this.isDock) {
        let edgeRigth = this.windowWidth - this.width - this.edge;
        let edgeBottom = this.windowHeight - this.height - this.edge;
        if (this.left < this.windowWidth / 2 - this.width / 2) {
          this.left = this.edge;
          this.dockDirection = 1;
          console.log("靠近左边");
        } else {
          this.left = edgeRigth;
          this.dockDirection = 0;
          console.log("靠近右边");
        }
        if (this.top < 0) {
          //拖动到nav顶部并且超出屏幕外
          this.top = this.edge;
        } else if (this.top + this.height + this.edge - this.windowHeight > 0) {
          //拖动到屏幕底部，并且超出屏幕外
          this.top = edgeBottom;
        }
      }
      this.isMoveing = false;
      // this.$emit("touchend", e);
    },
  },
  computed: {
    userName() {
      return this.userInfoStore.userInfo?.userName || "用户";
    },
    // 控制猜你想问内容显示
    showContent() {
      return this.messages.length === 0;
    },
  },
  watch: {
    // #ifdef APP-PLUS
    async dialogueMode(newVal) {
      if (newVal === "voice") {
        // 请求录音权限
        await SpeechRealTimeTrans.requestRecordingPermission();
        SpeechRealTimeTrans.start({
          url: "wss://aip.baidubce.com/ws/realtime_speech_trans", // WebSocket服务地址
          appId: baiduTranslate.appid, // 百度应用的AppID
          appKey: baiduTranslate.appkey, // 百度应用的AppKey
          samplingRate: 16000, // 音频采样率
          fromLan: "zh", // 源语言
          toLan: "en", // 目标语言
          isReturnTts: true, // 是否返回TTS语音
          ttsSpeaker: "woman", // TTS发音人
          // 开始失败回调
          onStartFailure: (code, msg) => {
            console.log("百度翻译启动失败", code, msg);
          },
          // WebSocket连接成功回调
          onWebsocketConnected: () => {
            console.log("百度翻译WebSocket已连接");
          },
          // WebSocket断开连接回调
          onWebsocketDisconnect: (code, reason) => {
            console.log("百度翻译WebSocket断开连接", code, reason);
          },
          // 接收文本消息回调
          onReceiveTextMessage: (message) => {
            const res = JSON.parse(message);
            const sentence = res.data.result.sentence;
            if (sentence === "") {
              return;
            }
            this.searchIpt += sentence;
          },
          // 接收TTS语音回调
          onReceiveTtsMessage: (audioPath) => {
            console.log("收到TTS音频文件路径", audioPath);
          },
          // 接收消息失败回调
          onReceiveMessageFailure: (error) => {
            console.log("接收消息失败", error);
          },
        });
      } else {
        console.log("结束百度实时翻译");
        // 停止百度实时翻译以及断开服务器的WebSocket连接
        SpeechRealTimeTrans.stop();
      }
    },
    // #endif
  },
};
</script>

<style lang="scss" scoped>
.drag {
  display: flex;
  justify-content: center;
  align-items: center;
  color: $uni-text-color-inverse;
  font-size: $uni-font-size-sm;
  position: fixed;
  z-index: 999999;
  &.transition {
    transition: left 0.3s ease, top 0.3s ease;
  }
  .outContent {
    color: #fff;
    position: absolute;
    padding: 10rpx;
    overflow: scroll;
    border-radius: 10px;
    width: 150px;
    height: 40px;
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.9);
    animation: fadeIn2 1.5s ease-out 3s forwards;
    @keyframes fadeIn2 {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
    @keyframes fadeOut {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    &.left {
      // animation: fadeIn2 3s ease-out;
      transform: translateX(70%) translateY(-40px);
    }
    &.right {
      // animation: fadeOut 3s ease-out;
      transform: translateX(-70%) translateY(-40px);
    }
    &::after {
      content: "";
    }
  }
}
.popup-container {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 16px;
  box-sizing: border-box;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  flex-direction: row;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #eee;
  justify-content: space-between;
  align-items: center;
  .item1 {
    flex: 1;
  }
  .item2 {
    text-align: center;
    flex: 3;
    .title {
      font-size: 36rpx;
      font-weight: 600;
      color: #333;
    }
  }
  .item3 {
    display: flex;
    flex: 1;
    justify-content: space-around;
  }
  .sub-title {
    font-size: 24rpx;
    color: #666;
    margin-top: 8rpx;
    display: block;
  }
}

.main-content {
  height: 50vh;
  .content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    overflow-y: auto;
    padding: 24rpx 0;
    .text-header {
      font-size: 38rpx;
      font-weight: 600;
      .greeting {
        color: #333;
        line-height: 1.5;
        white-space: pre-wrap;
        margin-bottom: 32rpx;
      }
    }
    .func-list {
      margin-top: 24rpx;
      display: flex;
      flex-direction: column;
      gap: 20rpx;
      .func-item {
        font-weight: 500;
        padding: 34rpx;
        background: #f5f5f5;
        border-radius: 16rpx;
        font-size: 28rpx;
        color: #333;
        line-height: 1.4;
      }
    }
  }
}

/* 聊天消息区域 */
.chat-messages {
  height: 50vh;
  padding: 10rpx;
  box-sizing: border-box;
  position: relative;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.message {
  display: flex;
  margin-bottom: 20rpx;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ai-message {
  align-self: flex-start;
  min-height: 50rpx;
  justify-content: flex-start;
  margin-right: 60rpx;
}

.user-message {
  align-self: flex-end;
  justify-content: flex-end;
  margin-left: 60rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  flex-shrink: 0;
  border: 2rpx solid #fff;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.message-content {
  display: flex;
  flex-direction: column;
}

.message-bubble {
  min-height: 40rpx;
  max-width: 70vw;
  padding: 24rpx 30rpx;
  border-radius: 18rpx;
  font-size: 28rpx;
  line-height: 1.6;
  word-break: break-word;
  position: relative;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.loading-image {
  position: absolute;
  transform: translateY(-15px) translateX(-12px);
  width: 100rpx;
  height: 100rpx;
}

.ai-message .message-bubble {
  background-color: #fff;
  color: #333;
  border-top-left-radius: 4rpx;
}

.ai-message .message-bubble::before {
  content: "";
  position: absolute;
  left: -12rpx;
  top: 20rpx;
  border: 6rpx solid transparent;
  border-right-color: #fff;
}

.user-message .message-bubble {
  background-color: #4080ff;
  color: #fff;
  border-top-right-radius: 4rpx;
  align-self: flex-end;
}

.user-message .message-bubble::before {
  content: "";
  position: absolute;
  right: -12rpx;
  top: 20rpx;
  border: 6rpx solid transparent;
  border-left-color: #4080ff;
}

.message-actions {
  display: flex;
  gap: 30rpx;
  margin-top: 12rpx;
  padding-left: 10rpx;
}

.action-btn {
  opacity: 0.7;
  transition: opacity 0.2s, transform 0.2s;
  padding: 6rpx;
}

.action-btn:active {
  opacity: 1;
  transform: scale(1.1);
}

.footer {
  position: relative;
  border-radius: 25rpx;
  margin-bottom: 20rpx;
  .search-tip {
    border: 1rpx solid #eee;
    border-radius: 25rpx 25rpx 0 0;
    border-bottom: none;
    padding: 20rpx 10rpx 0 10rpx;
    // text-indent: 20rpx;
    display: flex;
    gap: 20rpx;
    align-items: center;
    background-color: #fff;
    font-size: 30rpx;
    .item {
      flex: 1;
      padding: 10rpx 0;
      font-size: 20rpx;
      max-width: 180rpx;
      text-align: center;
      border-radius: 20rpx;
      background-color: #f7f8fa;
      &.active {
        background-color: #007aff;
        color: #fff;
      }
    }
  }
  .search-main {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
    padding: 20rpx 20rpx;
    border: 1rpx solid #eee;
    border-top: none;
    border-radius: 0 0 25rpx 25rpx;
    .ipt-left {
      margin-bottom: 10rpx;
      .soundBtn {
      }
    }
    .ipt-mid {
      background: rgba(0, 0, 0, 0);
      background-color: #f7f8fa;
      display: flex;
      padding: 15rpx;
      align-items: flex-end;
      border: 1.5px solid transparent;
      border-radius: 15rpx;
      width: 450rpx;
      .ipt {
        font-size: 14px;
      }
      &.text {
        border: 1.5px solid #007aff;
      }
      &.voice {
        /*         border: 1.5px solid;
        border-image: linear-gradient(
          45deg,
          hsl(0deg 100% 80%),
          hsl(60deg 100% 80%),
          hsl(120deg 100% 80%),
          hsl(180deg 100% 80%),
          hsl(240deg 100% 80%),
          hsl(300deg 100% 80%),
          hsl(360deg 100% 80%)
        );
        border-image-slice: 1;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background: rgba(0, 0, 0, 0);
        animation: border-animate 2s infinite linear; */
        transition: border linear 0.2s, box-shadow linear;
        -moz-transition: border linear 0.2s, -moz-box-shadow linear 0.5s;
        -webkit-transition: border linear 0.2s, -webkit-box-shadow linear 0.5s;
        outline: none;
        border-color: rgba(93, 149, 242, 0.75);
        box-shadow: 0 0 8px rgba(93, 149, 242, 0.105);
        -moz-box-shadow: 0 0 8px rgba(93, 149, 242, 0.5);
        -webkit-box-shadow: 0 0 8px rgba(93, 149, 242, 3);
      }
    }
    .ipt-right {
      margin-bottom: 5rpx;
      .sendBtn {
        text-align: center;
        background-color: #007aff;
        font-size: 10px;
        color: #fff;
        padding: 15rpx;
        border-radius: 15rpx;
        width: 60rpx;
        height: 40rpx;
      }
    }
    @keyframes border-animate {
      from {
        filter: hue-rotate(0deg);
      }
      to {
        filter: hue-rotate(360deg);
      }
    }
  }
}

.tip-text {
  // position: absolute;
  // width: 50vw;
  // bottom: 10rpx;
  // left: calc(50% - 25vw);
  // font-size: 14rpx !important;
  // transform: scale(0.8); // 缩放为原本大小的0.1-1倍
  // // transform-origin: 0 0; // 这个可不要，但建议搭配使用，作用是不因缩放导致位置有所偏移
  // color: #999;
  position: absolute;
  font-size: 14rpx !important;
  width: 50vw;
  bottom: 10rpx;
  left: 50%;
  transform: translateX(-50%); // 水平居中
  color: #999;
}
</style>
