import { http } from "/src/utils/http";

// 获取最新的SDKAPPID和SDKSECRETKEY
export const GETSdkAppIdSDKSECRETKEY = () => {
  return http({
    method: "GET",
    url: "/getSdkAppIdSDKSECRETKEY",
  });
};
