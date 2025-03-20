/*
 * @Description: Basic information configuration for TUIRoomKit applications
 * @Description: TUIRoomKit 应用的基础信息配置
 */

import LibGenerateTestUserSig from "./lib-generate-test-usersig-es.min";

import { getLatest_SdkAppId_SDKSECRETKEY } from "/src/services/api";

/**
 * Tencent Cloud SDKAppId, which should be replaced with user's SDKAppId.
 * Enter Tencent Cloud TRTC [Console] (https://console.cloud.tencent.com/trtc ) to create an application,
 * and you will see the SDKAppId.
 * It is a unique identifier used by Tencent Cloud to identify users.
 *
 * 腾讯云 SDKAppId，需要替换为您自己账号下的 SDKAppId。
 * 进入腾讯云实时音视频[控制台](https://console.cloud.tencent.com/rav ) 创建应用，即可看到 SDKAppId，
 * 它是腾讯云用于区分客户的唯一标识。
 */

export let SDKAPPID = Number(0);

/**
 * Encryption key for calculating signature, which can be obtained in the following steps:
 *
 * Step1. Enter Tencent Cloud TRTC [Console](https://console.cloud.tencent.com/rav ),
 * and create an application if you don't have one.
 * Step2. Click your application to find "Quick Start".
 * Step3. Click "View Secret Key" to see the encryption key for calculating UserSig,
 * and copy it to the following variable.
 *
 * Notes: this method is only applicable for debugging Demo. Before official launch,
 * please migrate the UserSig calculation code and key to your backend server to avoid
 * unauthorized traffic use caused by the leakage of encryption key.
 * Document: https://intl.cloud.tencent.com/document/product/647/35166#Server
 *
 * 计算签名用的加密密钥，获取步骤如下：
 *
 * step1. 进入腾讯云实时音视频[控制台](https://console.cloud.tencent.com/rav )，如果还没有应用就创建一个，
 * step2. 单击“应用配置”进入基础配置页面，并进一步找到“帐号体系集成”部分。
 * step3. 点击“查看密钥”按钮，就可以看到计算 UserSig 使用的加密的密钥了，请将其拷贝并复制到如下的变量中
 *
 * 注意：该方案仅适用于调试Demo，正式上线前请将 UserSig 计算代码和密钥迁移到您的后台服务器上，以避免加密密钥泄露导致的流量盗用。
 * 文档：https://cloud.tencent.com/document/product/647/17275#Server
 */
export let SDKSECRETKEY = String("");

/**
 * Signature expiration time, which should not be too short
 * Time unit: second
 * Default time: 7 * 24 * 60 * 60 = 604800 = 7days
 *
 * 签名过期时间，建议不要设置的过短
 * 时间单位：秒
 * 默认时间：7 x 24 x 60 x 60 = 604800 = 7 天
 */
export const EXPIRETIME = 604800;

/**
 * Set user information on the push side
 *
 * 设置推流端用户信息
 */
export const userInfo = {
  // 用户Id
  userId: `user_${Math.ceil(Math.random() * 100000)}`,
  // 用户昵称
  userName: `user_${Math.ceil(Math.random() * 10)}`,
  // 用户头像
  avatarUrl: "",
};

// 从服务器上获取最新的SDKAPPID和SDKSECRETKEY
const handleGetLatest_SdkAppId_SDKSECRETKEY = async () => {
  let res;
  try {
    res = await getLatest_SdkAppId_SDKSECRETKEY();
  } catch (err) {
    console.log("获取sdk失败");
  }
  console.log("aksfhjoanf:", res);
  if (!res) {
    uni.showToast({
      title: "sdk初始化失败,使用本地sdk",
      duration: 1000,
    });
    res = {
      data: {
        sdkId: 1600077775,
        sdkSecret:
          "b8072812ad37a9ebcedc473007719e1f46ce4403e52ade443ab52313ac045dfb",
      },
    };
  }
  SDKAPPID = Number(res.data.sdkId);
  SDKSECRETKEY = String(res.data.sdkSecret);
};
export const getBasicInfo = async () => {
  await handleGetLatest_SdkAppId_SDKSECRETKEY();
  console.log("handleGetLatest_SdkAppId_SDKSECRETKEY:", SDKAPPID, SDKSECRETKEY);

  if (SDKAPPID === Number(0) || SDKSECRETKEY === String("")) {
    alert("Please configure your SDKAPPID in config/basic-info-config.js");
    return;
  }
  const generator = new LibGenerateTestUserSig(
    SDKAPPID,
    SDKSECRETKEY,
    EXPIRETIME
  );
  const userSig = generator.genTestUserSig(userInfo.userId);
  const { userId, userName, avatarUrl } = userInfo;
  return {
    sdkAppId: SDKAPPID,
    userId,
    userSig,
    userName,
    avatarUrl,
  };
};
