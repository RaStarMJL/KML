<template>
  <view class="chat-container">
    <!-- 顶部导航栏 -->
    <!-- 子标题区域 -->
    <!-- <view class="subtitle-bar">
			<view class="subtitle-content">
				<text class="subtitle-text">文档管理AI助手</text>
				<view class="more-options">
					<uni-icons type="more-filled" size="20" color="#333333"></uni-icons>
				</view>
			</view>
		</view> -->

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
              <zero-markdown-view
                class="markdown-content"
                v-if="message.type === 'ai'"
                :markdown="message.content"></zero-markdown-view>
              <text v-else>{{ message.content }}</text>
            </view>

            <!-- 仅AI消息显示操作按钮 -->
            <view v-if="message.type === 'ai'" class="message-actions">
              <view class="action-btn" @click="copyMessage(message.content)">
                <uni-icons type="upload" size="16" color="#8a8a8a"></uni-icons>
              </view>
              <view class="action-btn" @click="likeMessage(index)">
                <uni-icons
                  type="hand-up"
                  size="16"
                  :color="message.liked ? '#4080FF' : '#8a8a8a'"></uni-icons>
              </view>
              <view class="action-btn" @click="dislikeMessage(index)">
                <uni-icons
                  type="hand-down"
                  size="16"
                  :color="message.disliked ? '#ff6666' : '#8a8a8a'"></uni-icons>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部输入区域 -->
    <view class="input-area">
      <view class="input-container">
        <input
          type="text"
          v-model="inputMessage"
          class="message-input"
          placeholder="请输入您的问题..."
          placeholder-style="color: #999;"
          confirm-type="send"
          @confirm="sendMessage" />
        <view
          class="send-btn"
          :class="{ active: inputMessage.trim() }"
          @click="sendMessage">
          <uni-icons
            type="paperplane-filled"
            size="20"
            color="#fff"></uni-icons>
        </view>
      </view>

      <!-- 底部工具栏 -->
      <view class="toolbar">
        <view class="toolbar-item">
          <uni-icons type="folder" size="20" color="#666"></uni-icons>
          <text>文件</text>
        </view>
        <view class="toolbar-item">
          <uni-icons type="calendar" size="20" color="#666"></uni-icons>
          <text>日程</text>
        </view>
        <view class="toolbar-item" @click="startNewChat">
          <uni-icons type="refresh" size="20" color="#666"></uni-icons>
          <text>新会话</text>
        </view>
        <view class="toolbar-item">
          <uni-icons type="gear" size="20" color="#666"></uni-icons>
          <text>设置</text>
        </view>
      </view>
    </view>

    <!-- 调试信息，测试完成后可移除 -->
    <view v-if="debug" class="debug-info">
      <text>消息数: {{ messages.length }}</text>
      <text>滚动位置: {{ scrollTop }}</text>
    </view>
  </view>
</template>

<script>
import { aicheckout } from "@/src/services/api";
import { get_localsign } from "@/src/services/api";
import { baseURL } from "/src/utils/http";
export default {
  data() {
    return {
      aiAvatar: "/src/static/images/aicheckout.png",
      inputMessage: "",
      scrollTop: 0,
      messages: [
        {
          type: "ai",
          content:
            "您好！我是文档管理型AI助手。我可以帮您：\n1. 查看和总结会议相关文档 \n2. 解答文档内容相关的问题 \n3. 提供文档重点内容分析 \n请告诉我您想查看的会议名称和具体文档名称，我来帮您处理。\n\n例如：'我想了解XX会议的YY文档内容'",
          liked: false,
          disliked: false,
          time: new Date(),
        },
      ],
      debug: false, // 调试模式开关
    };
  },
  mounted() {
    this.scrollToBottom();

    // 打印初始消息列表，用于调试
    console.log("初始消息列表：", JSON.stringify(this.messages));
  },
  methods: {
    // 生成符合UUID格式的随机sid
    generateUUID() {
      // 生成16个随机字节并转换为36个字符的UUID
      const hexDigits = "0123456789abcdef";
      let uuid = "";

      for (let i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
          uuid += "-";
        } else if (i === 14) {
          // 版本4的UUID第14位是4
          uuid += "4";
        } else if (i === 19) {
          // 第19位是8,9,a,b中的一个
          uuid += hexDigits[((Math.random() * 4) | 0) + 8];
        } else {
          uuid += hexDigits[(Math.random() * 16) | 0];
        }
      }
      return uuid;
    },
    async sendMessage() {
      if (!this.inputMessage.trim()) return;

      const sid = this.generateUUID();
      const res = await aicheckout({
        sid: sid,
        id: "d996448e-b319-459e-9e55-c1ca41caa0b3",
        input: this.inputMessage,
      });

      // 创建用户消息并添加到列表
      const userMessage = {
        type: "user",
        content: this.inputMessage.trim(),
        time: new Date(),
      };
      this.messages = [...this.messages, userMessage];

      // 清空输入框
      const userInput = this.inputMessage.trim();
      this.inputMessage = "";

      // 立即滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });

      try {
        // 安全地解析返回内容
        let str = res.data.session.messages[1].content;
        console.log("原始响应:", str);

        let req = null;
        try {
          // 尝试解析JSON
          req = JSON.parse(str);
          console.log("解析后的请求:", req);
        } catch (parseError) {
          console.error("JSON解析错误:", parseError);
          // 如果不是JSON格式，创建一个简单对象用于后续处理
          req = { request: null, meetingname: null };
        }

        // 检查是否是文档检索请求
        if (req && req.request === "检索文件内容返回问答") {
          // 显示加载状态
          uni.showLoading({
            title: "正在检索文档...",
          });

          try {
            // 获取本地签名
            const signRes = await get_localsign({
              key: "hengnaozYW3SnQJNy5hIzs2pp8w",
              secret: "ytr013e66pdjdf5fns5j0ca8u2c5hu41",
            });

            if (!signRes || !signRes.data) {
              throw new Error("获取签名失败");
            }

            const localsign = signRes.data;
            console.log("成功获取到签名.....");

            // 使用UUID格式生成sid
            const sid = this.generateUUID();
            console.log("sid:", sid);

            // #region ---------------------- 非流式请求 start ------------------
            // 调用文档检索接口
            const res2 = await uni.request({
              url: "https://www.das-ai.com/open/api/v2/document/chat",
              method: "POST",
              header: {
                "Content-Type": "application/json",
                "Content-Length": "100",
                Host: "www.das-ai.com",
                "User-Agent":
                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                appKey: "hengnaozYW3SnQJNy5hIzs2pp8w",
                sign: localsign,
              },
              enableChunked: true,
              // responseType: "text", // 指定响应的数据类型
              data: {
                sid: sid,
                query: userInput,
                stream: false,
              },
            });
            // 隐藏加载状态
            uni.hideLoading();

            console.log("文档检索响应:", res2);

            // 检查响应格式并提取内容
            if (res2.data && res2.data.data && res2.data.data.content) {
              const content = res2.data.data.content;
              console.log("文档检索结果内容:", content);

              // 创建AI回复消息对象
              const aiMessage = {
                type: "ai",
                content: content,
                liked: false,
                disliked: false,
                time: new Date(),
              };

              // 添加AI回复到列表
              this.messages = [...this.messages, aiMessage];

              // 再次滚动到底部
              this.$nextTick(() => {
                this.scrollToBottom();
              });
            } else {
              throw new Error("文档检索结果格式不正确");
            }
            // #endregion ------------------- 非流式请求 end --------------------

            // #region ---------------------- 流式请求 start ------------------
            /* const response = await fetch(
              "https://www.das-ai.com/open/api/v2/document/chat",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  appKey: "hengnaozYW3SnQJNy5hIzs2pp8w",
                  sign: localsign,
                },
                body: JSON.stringify({
                  sid: sid,
                  query: userInput,
                  stream: true, // 启用流式
                }),
              }
            );

            // 隐藏加载状态
            uni.hideLoading();
            // 创建AI回复消息对象
            const aiMessage = {
              type: "ai",
              content: '',
              liked: false,
              disliked: false,
              time: new Date(),
            };
            this.messages = [...this.messages, aiMessage];
            let index = this.messages.length - 1;
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = ""; // 用于累积不完整的 JSON 数据

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value); // 拼接到 buffer

              // 尝试解析 buffer（假设 JSON 以 \n 分隔）
              const lines = buffer.split("\n");
              buffer = lines.pop(); // 剩余未解析的数据放回 buffer

              for (const line of lines) {
                if (!line.trim()) continue; // 跳过空行
                try {
                  const data = JSON.parse(line.slice(5)); // 转成json数据，但是要去除掉前五个字符data:后才是json数据
                  this.messages[index].content += data.data.content; // 提取 content
                } catch (e) {
                  console.warn("JSON 解析失败（可能是不完整数据）:", line);
                }
              }
            }

            // 最后检查 buffer 是否还有未解析的数据
            if (buffer.trim()) {
              console.warn("未解析的剩余数据:", buffer);
            } */
            // #endregion -------------------流式请求代码 end --------------------
          } catch (error) {
            // 处理文档检索过程中的错误
            console.error("文档检索过程错误:", error);
            uni.hideLoading();

            // 创建错误消息
            const errorMessage = {
              type: "ai",
              content:
                "很抱歉，文档检索过程中遇到了问题: " +
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
        } else if (req && req.request === "文档内容创作") {
          uni.showLoading({
            title: "正在执行文档内容创作...",
          });

          try {
            // 获取本地签名
            const signRes = await get_localsign({
              key: "hengnaozYW3SnQJNy5hIzs2pp8w",
              secret: "ytr013e66pdjdf5fns5j0ca8u2c5hu41",
            });

            if (!signRes || !signRes.data) {
              throw new Error("获取签名失败");
            }

            const localsign = signRes.data;
            console.log("成功获取到签名.....");

            // 使用UUID格式生成sid
            const sid = this.generateUUID();
            console.log("sid:", sid);

            // 调用文档创作接口
            const res2 = await uni.request({
              url: baseURL + "aiFile/creation",
              timeout: 60000, // 设置60秒超时
              method: "POST",
              // header: {
              // 	'Content-Type': 'application/json',
              // 	'Content-Length': '1000',
              // 	'Host': 'www.das-ai.com',
              // 	'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              // 	'appKey': 'hengnaozYW3SnQJNy5hIzs2pp8w',
              // 	'sign': localsign
              // },
              data: {
                // "sid": sid,
                // "prompt": "你是个会议秘书顾问，可以根据对应要求整理成，个会议指南",
                // "chunks": [this.inputMessage],
                // "stream": false
                sid: sid,
                id: "4d5d2220-aabb-4ff0-bf81-fb63afe5c08a",
                input: userInput,
              },
            });

            // 隐藏加载状态
            uni.hideLoading();

            console.log("文档内容创作响应:", res2);

            // 检查响应格式并提取内容
            if (res2.data && res2.data.data) {
              const content = res2.data.data.session.messages[1].content;
              console.log("文档内容创作结果内容:", content);

              // 创建AI回复消息对象
              const aiMessage = {
                type: "ai",
                content: content,
                liked: false,
                disliked: false,
                time: new Date(),
              };

              // 添加AI回复到列表
              this.messages = [...this.messages, aiMessage];

              // 再次滚动到底部
              this.$nextTick(() => {
                this.scrollToBottom();
              });
            } else {
              throw new Error("返回结果格式不正确");
            }
          } catch (error) {
            // 处理文档检索过程中的错误
            console.error("文档内容创作过程错误:", error);
            uni.hideLoading();

            // 创建错误消息
            const errorMessage = {
              type: "ai",
              content:
                "很抱歉，文档内容创作过程中遇到了问题: " +
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
        } else if (req && req.request === "文档语言翻译") {
          uni.showLoading({
            title: "正在执行文档语言翻译...",
          });

          try {
            // 获取本地签名
            const signRes = await get_localsign({
              key: "hengnaozYW3SnQJNy5hIzs2pp8w",
              secret: "ytr013e66pdjdf5fns5j0ca8u2c5hu41",
            });

            if (!signRes || !signRes.data) {
              throw new Error("获取签名失败");
            }

            const localsign = signRes.data;
            console.log("成功获取到签名.....");

            // 使用UUID格式生成sid
            const sid = this.generateUUID();
            console.log("sid:", sid);

            // 调用文档语言翻译接口
            const res2 = await uni.request({
              url: "https://www.das-ai.com/open/api/v2/document/translate",
              method: "POST",
              header: {
                appKey: "hengnaozYW3SnQJNy5hIzs2pp8w",
                sign: localsign,
              },
              data: {
                sid: sid,
                content: userInput,
                translate: "EN",
                stream: false,
              },
            });

            // 隐藏加载状态
            uni.hideLoading();

            console.log("文档语言翻译响应:", res2);

            // 检查响应格式并提取内容
            if (res2.data && res2.data.data && res2.data.data.transContent) {
              const content = res2.data.data.transContent;
              console.log("文档语言翻译结果内容:", content);

              // 创建AI回复消息对象
              const aiMessage = {
                type: "ai",
                content: content,
                liked: false,
                disliked: false,
                time: new Date(),
              };

              // 添加AI回复到列表
              this.messages = [...this.messages, aiMessage];

              // 再次滚动到底部
              this.$nextTick(() => {
                this.scrollToBottom();
              });
            } else {
              throw new Error("返回结果格式不正确");
            }
          } catch (error) {
            // 处理文档检索过程中的错误
            console.error("文档语言翻译过程错误:", error);
            uni.hideLoading();

            // 创建错误消息
            const errorMessage = {
              type: "ai",
              content:
                "很抱歉，文档语言翻译过程中遇到了问题: " +
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
        } else {
          // 非文档检索请求，使用aicheckout返回的结果作为响应
          let aiResponse = "我不知道哈哈哈，你个笨蛋";

          // 创建AI回复消息对象
          const aiMessage = {
            type: "ai",
            content: aiResponse,
            liked: false,
            disliked: false,
            time: new Date(),
          };

          // 添加AI回复到列表
          this.messages = [...this.messages, aiMessage];

          // 再次滚动到底部
          this.$nextTick(() => {
            this.scrollToBottom();
          });
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
    scrollToBottom() {
      // 使用更可靠的方式计算滚动位置
      setTimeout(() => {
        const query = uni.createSelectorQuery().in(this);
        query
          .select("#chat-list")
          .boundingClientRect((data) => {
            if (data) {
              console.log("聊天列表高度:", data.height);
              // 设置一个足够大的值确保滚动到底部
              this.scrollTop = data.height * 2;
            }
          })
          .exec();
      }, 100);
    },
    onScrollToLower() {
      console.log("已滚动到底部");
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
          uni.showToast({
            title: "感谢您的反馈",
            icon: "none",
          });
        }
      }
    },
    dislikeMessage(index) {
      if (this.messages[index].type === "ai") {
        this.messages[index].disliked = !this.messages[index].disliked;
        if (this.messages[index].disliked) {
          this.messages[index].liked = false;
          uni.showToast({
            title: "已收到您的反馈",
            icon: "none",
          });
        }
      }
    },
    startNewChat() {
      uni.showModal({
        title: "开启新会话",
        content: "确定要开启新会话吗？当前对话内容将不会保存。",
        confirmText: "确定",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            this.messages = [
              {
                type: "ai",
                content:
                  "您好！我是功能用例智能助手，可以协助您规划和设计产品功能用例。请问您需要针对哪个产品或功能进行规划？",
                liked: false,
                disliked: false,
                time: new Date(),
              },
            ];
            this.scrollToBottom();
          }
        },
      });
    },
  },
  computed: {
    // 流式输出时代码块处理 , 这时候请使用 msgContent 传入组件中
    msgContent() {
      let len = this.messages.length - 1;
      if (!this.messages[len].content) {
        return;
      }
      let htmlString = "";
      // 判断markdown中代码块标识符的数量是否为偶数
      if (this.messages[len].content.split("```").length % 2) {
        let content = this.messages[len].content;
        if (content[content.length - 1] != "\n") {
          content += "\n";
        }
        htmlString = content;
      } else {
        htmlString = this.messages[len].content;
      }
      return htmlString;
    },
  },
};
</script>

<script module="stream" lang="renderjs">
   export default {
       data() {
           return {
           }
       },
       methods: {
              async fetchStreamResult() {
                console.log('hhhh')
              },
        }
}
</script>
<style lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f9fc;
  position: relative;
}

/* 顶部导航栏 */
.navbar {
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  background: linear-gradient(135deg, #4080ff, #5b6aff);
  position: relative;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn:active {
  opacity: 0.7;
}

.title {
  font-size: 36rpx;
  font-weight: 500;
  color: #ffffff;
  letter-spacing: 2rpx;
  text-align: center;
  flex: 1;
}

.right-placeholder {
  width: 60rpx;
  height: 60rpx;
}

/* 子标题区域 */
.subtitle-bar {
  padding: 20rpx 30rpx;
  background-color: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.subtitle-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subtitle-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #333333;
}

.more-options {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.more-options:active {
  background-color: #f5f5f5;
}

/* 聊天消息区域 */
.chat-messages {
  flex: 1;
  padding: 30rpx;
  box-sizing: border-box;
  position: relative;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
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

.markdown-content {
}

.message-bubble {
  max-width: 70vw;
  border-radius: 18rpx;
  font-size: 28rpx;
  line-height: 1.6;
  word-break: break-word;
  position: relative;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
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
  padding: 24rpx 30rpx;

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

/* 底部输入区域 */
.input-area {
  background-color: #fff;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 20rpx 30rpx 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.03);
}

.input-container {
  display: flex;
  align-items: center;
  height: 80rpx;
  margin-bottom: 20rpx;
}

.message-input {
  flex: 1;
  height: 80rpx;
  background-color: #f5f5f7;
  border-radius: 40rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  color: #333;
  box-shadow: inset 0 1rpx 4rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.message-input:focus {
  background-color: #fff;
  box-shadow: inset 0 1rpx 6rpx rgba(0, 0, 0, 0.1);
}

.send-btn {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #4080ff, #1a60d6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20rpx;
  opacity: 0.8;
  transition: all 0.3s;
  box-shadow: 0 4rpx 12rpx rgba(64, 128, 255, 0.3);
}

.send-btn.active {
  opacity: 1;
  transform: scale(1.05);
}

.send-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 6rpx rgba(64, 128, 255, 0.3);
}

/* 底部工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 20rpx;
  border-top: 1px solid #f0f0f0;
}

.toolbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx 20rpx;
  transition: all 0.2s;
}

.toolbar-item:active {
  transform: scale(0.95);
}

.toolbar-item text {
  font-size: 22rpx;
  color: #666;
  margin-top: 6rpx;
}

/* 调试信息样式 */
.debug-info {
  position: absolute;
  bottom: 200rpx;
  right: 20rpx;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10rpx;
  border-radius: 8rpx;
  font-size: 20rpx;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}
</style>