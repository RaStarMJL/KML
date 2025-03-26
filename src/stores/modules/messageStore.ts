import { defineStore } from 'pinia';

interface Message {
    id: string;
    messageType: string;
    messageContent: string;
    messageTime: string;
    read: boolean;
}

const STORAGE_KEY = 'message_read_status';

export const useMessageStore = defineStore('message', {
    state: () => ({
        messages: [] as Message[],
        meetingMessages: [] as Message[],
        systemMessages: [] as Message[],
        readStatus: {} as Record<string, boolean>, // 存储消息的已读状态
    }),

    actions: {
        // 初始化已读状态
        initReadStatus() {
            try {
                const storedStatus = uni.getStorageSync(STORAGE_KEY);
                if (storedStatus) {
                    this.readStatus = JSON.parse(storedStatus);
                }
            } catch (error) {
                console.error('读取消息已读状态失败:', error);
            }
        },

        // 保存已读状态到本地存储
        saveReadStatus() {
            try {
                uni.setStorageSync(STORAGE_KEY, JSON.stringify(this.readStatus));
            } catch (error) {
                console.error('保存消息已读状态失败:', error);
            }
        },

        // 设置消息列表
        setMessages(messages: Message[]) {
            // 初始化已读状态
            this.initReadStatus();

            // 处理消息，恢复已读状态
            const processedMessages = messages.map(msg => ({
                ...msg,
                read: this.readStatus[msg.id] || false,
                title: msg.messageType,
                body: msg.messageContent,
                time: msg.messageTime,
                type: msg.messageType === '会议提醒' ? 'meeting' : 'system'
            }));

            this.messages = processedMessages;
            // 根据消息类型分类
            this.meetingMessages = processedMessages.filter(msg => msg.messageType === '会议提醒');
            this.systemMessages = processedMessages.filter(msg => msg.messageType !== '会议提醒');
        },

        // 标记单条消息为已读
        markAsRead(messageId: string) {
            const message = this.messages.find(msg => msg.id === messageId);
            if (message) {
                message.read = true;
                this.readStatus[messageId] = true;
                // 更新分类数组中的消息状态
                const meetingMsg = this.meetingMessages.find(msg => msg.id === messageId);
                const systemMsg = this.systemMessages.find(msg => msg.id === messageId);
                if (meetingMsg) meetingMsg.read = true;
                if (systemMsg) systemMsg.read = true;
                // 保存到本地存储
                this.saveReadStatus();
            }
        },

        // 标记所有消息为已读
        markAllAsRead() {
            this.messages.forEach(msg => {
                msg.read = true;
                this.readStatus[msg.id] = true;
            });
            this.meetingMessages.forEach(msg => msg.read = true);
            this.systemMessages.forEach(msg => msg.read = true);
            // 保存到本地存储
            this.saveReadStatus();
        },

        // 删除单条消息
        deleteMessage(messageId: string) {
            this.messages = this.messages.filter(msg => msg.id !== messageId);
            this.meetingMessages = this.meetingMessages.filter(msg => msg.id !== messageId);
            this.systemMessages = this.systemMessages.filter(msg => msg.id !== messageId);
            // 删除已读状态
            delete this.readStatus[messageId];
            // 保存到本地存储
            this.saveReadStatus();
        },

        // 清空所有消息
        clearAllMessages() {
            this.messages = [];
            this.meetingMessages = [];
            this.systemMessages = [];
            this.readStatus = {};
            // 保存到本地存储
            this.saveReadStatus();
        }
    },

    getters: {
        // 获取未读消息数量
        unreadCount: (state) => state.messages.filter(msg => !msg.read).length,

        // 获取未读会议提醒数量
        unreadMeetingCount: (state) => state.meetingMessages.filter(msg => !msg.read).length,

        // 获取未读系统消息数量
        unreadSystemCount: (state) => state.systemMessages.filter(msg => !msg.read).length,
    }
}); 