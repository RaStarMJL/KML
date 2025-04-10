import { http } from "/src/utils/http";

//登录
export const login = (data: any) => {
  return http({
    url: "login",
    method: "GET",
    data,
  });
};

// 注册接口
export const register = (data: any) => {
  return http({
    url: "login",
    method: "POST",
    data,
  });
};

// 根据会议号获取会议数据
export const getMeetingData = (meetingId: string) => {
  return http({
    url: `meetMessage?meetId=${meetingId}`,
    method: "GET",
  });
};

// 根据用户id获取推荐会议列表
export const getRecommendList = (userId: string) => {
  return http({
    url: `recommend?userId=${userId}`,
    method: "GET",
  });
};

// 获取最新的SDKAPPID和SDKSECRETKEY
export const getLatest_SdkAppId_SDKSECRETKEY = () => {
  return http({
    method: "GET",
    url: "tencent",
  });
};

// 修改用户的相关信息
export const change_userInfo = (data: any) => {
  return http({
    url: "user",
    method: "PUT",
    data,
  });
};

// 文档创作
export const aicheckout = (data: any) => {
  return http({
    url: "aiFile/agentFileSearch",
    method: "POST",
    data,
  });
};

// 获取本地签名
export const get_localsign = (data: any) => {
  return http({
    url: `Sig?key=${data.key}&secret=${data.secret}`,
    method: "GET",
    data,
  });
};



export const get_message = (data: any) => {
  return http({
    url: `PushNotification/getmessage?UserId=${data.UserId}`,
    method: "GET",
  });
};

export const aimanage = (data: any) => {
  return http({
    url: "ai/execute",
    method: "POST",
    data,
  });
};

// 获取轮播图数据
export const getSwiperData = () => {
  return http({
    method: "GET",
    url: "recommend/Slideshow",
  });
};

// 用户报名会议
export const userSignUpMeeting = (data: any) => {
  return http({
    method: "POST",
    url: "user/joinmeetings",
    data,
  });
};

export const getSearchResult = (data: any) => {
  return http({
    method: "POST",
    url: "usersearch",
    data,
  });
};

export const getHistoryList = (userId: string) => {
  return http({
    method: "GET",
    url: "usersearch?UserId=" + userId,
  });
};

export const getSuggestList = (userId: string) => {
  return http({
    method: "GET",
    url: "usersearch?UserId=" + userId,
  });
};

export const getHotList = () => {
  return http({
    method: "GET",
    url: "recommend/getHot",
  });
};

export const deleteHistory = (userId: string) => {
  return http({
    method: "DELETE",
    url: "usersearch/deleteUserSearchHistory?UserId=" + userId,
  });
};

// 增加会议点击量-热度
export const incrementClickCount = (meetingId: string) => {
  return http({
    method: "PUT",
    url: "meetingoperation/incrementClickCount?meetingId=" + meetingId,
  });
};

// 增加会议报名量-热度
export const incrementJoinCount = (meetingId: string) => {
  return http({
    method: "PUT",
    url: "meetingoperation/incrementJoinCount?meetingId=" + meetingId,
  });
};

export const get_avatar = (userId: string) => {
  return http({
    method: "GET",
    url: "user/getAvatar?userId=" + userId,
  });
};

export const api_getNoteList = (userId: string) => {
  return http({
    method: "GET",
    url: "meetingnote?UserId=" + userId,
  });
};

export const api_deleteNote = (noteId: string) => {
  return http({
    method: "DELETE",
    url: "meetingnote/deletenote?noteId=" + noteId,
  });
};

export const api_getNoteDetail = (noteId: string) => {
  return http({
    method: "GET",
    url: "meetingnote/getnote?noteId=" + noteId,
  });
};

export const api_uploadDocument = async (data: any) => {
  return await http({
    method: "POST",
    url: "aiFile/infoFile",
    data,
  });
};

export const getPathPlanning = (obj) => {
  const { from, to } = obj;
  const query = `请你帮我规划从${from}到${to}怎么走`;
  const data = {
    app_id: "a892b528-55a4-4f51-b0a4-e8a01ea3066e",

    query,

    conversation_id: "44a385c0-687f-4a31-9e08-1081654b3dad",

    stream: false,
  };
  return uni.request({
    method: "POST",
    url: "https://qianfan.baidubce.com/v2/app/conversation/runs",
    header: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer bce-v3/ALTAK-ZWM3Ql8RXmnKtMGtGeGeP/e87b462d49f5525513d80af3fd55d3d33135a661",
    },
    data,
  });
};

// 修改会议状态
export const updateMeetingStatus = (obj) => {
  const { status, meetingId } = obj;
  return http({
    method: "GET",
    url: `user/updateMeetingStatus?status=${status}&meetingId=${meetingId}`,
  });
};

// 主持人获取会议签到状态
export const getSignStatus = (meetingId) => {
  return http({
    method: "GET",
    url: `meetingSign?meetingId=${meetingId}`,
  });
};

// 提交请假说明
export const submitLeaveReason = (obj) => {
  const { meetingId, participantUid, absenceReason } = obj;
  return http({
    url: "meetingSign/updateAbsence",
    method: "POST",
    data: {
      meetingId,
      participantUid,
      absenceReason,
    },
  });
};

// 主持人发起签到
export const hostStartSign = (data) => {
  const { meetingId, hostId, signInStartTime, signInEndTime } = data;
  return http({
    url: "meetCheck/insertMeetingCheckIn",
    method: "POST",
    data: {
      meetingId,
      hostId,
      signInStartTime,
      signInEndTime,
    },
  });
};

// 获取签到剩余时间
export const getRemainingTime = (meetingId) => {
  return http({
    url: `meetCheck/getCheckTime?meetingId=${meetingId}`,
    method: "GET",
  });
};

// 用户加入会议时调用日志接口
export const logUserJoinMeeting = (data) => {
  const { operatorUid, operationType, meetingUid } = data;
  return http({
    url: "user/infoUserRec",
    method: "POST",
    data: {
      operatorUid,
      operationType,
      meetingUid,
    },
  });
};

// 保存会议笔记
export const api_saveMeetingNotes = (data) => {
  /**
   * @param {string} data.meetingId 会议ID
   * @param {string} data.userId 用户ID
   * @param {string} data.subtitleContent 字幕内容
   * @param {string} data.content 笔记内容
   * @param {string} data.noteType 笔记类型
   */
  return http({
    url: "meetingnote/info",
    method: "POST",
    data,
  });
};

// 获取历史参加会议
export const api_getHistoryMeetings = (userId) => {
  return http({
    url: `user/meets?UserId=${userId}`,
    method: "GET",
  });
};

// 获取用户举办的会议
export const api_getUserHostedMeetings = (userId) => {
  return http({
    url: `user/hostmeets?UserId=${userId}`,
    method: "GET",
  });
};

// 处理签到
export const api_handleSignIn = (data) => {
  /**
   * @param {string} data.meetingId 会议ID
   * @param {string} data.userId 用户ID
   * @param {string} data.signInTime 签到时间
   *
   **/
  return http({
    url: "meetingSign/updateSign",
    method: "POST",
    data,
  });
};

// 获取签到状态
export const api_getSignStatus = (meetingId) => {
  return http({
    url: `meetingSign?meetingId=${meetingId.value}`,
    method: "GET",
  });
};

// 提交请假说明
export const api_submitAbsence = (data) => {
  /**
   * @param {string} data.meetingId 会议ID
   * @param {string} data.participantUid 用户ID
   * @param {string} data.absenceReason 请假原因
   *
   **/
  return http({
    url: "meetingSign/updateAbsence",
    method: "POST",
    data,
  });
};

// 删除消息
export const api_deleteMessage = (id) => {
  return http({
    url: "PushNotification/deleteUserMessageReceive?id=" + id,
    method: "DELETE",
  });
};

// 创建笔记
export const api_createNote = (data) => {
  return http({
    url: "meetingnote/info",
    method: "POST",
    data,
  });
};

// 获取云端会议回放列表
export const api_getCloudVideoList = (meetingId) => {
  return http({
    url: "api/trtc/getreplaylist",
    method: "GET",
  });
};


export const api_getMeetingDetail = (meetingId) => {
  return http({
    url: `aiFile/getFile?meetingId=${meetingId}`,
    method: "GET",
  });
};


// 下载文件
export const api_downloadFile = (fileId: string, localsign: string) => {
  console.log('本地签名', localsign);
  return http({
    url: 'https://www.das-ai.com/open/api/v2/agent/file/download',
    method: "POST",
    headers: {
      Accept: 'application/octet-stream',
      appKey: 'hengnaozYW3SnQJNy5hIzs2pp8w',
      sign: localsign,
    },
    body: {
      fileId,
    },
  });
};

