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
