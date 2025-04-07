import { url } from "inspector";
import { http } from "/src/utils/http";

//登录
export const login = (data: any) => {
  return http({
    url: "login",
    method: "GET",
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
