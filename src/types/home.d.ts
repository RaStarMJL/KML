/** 首页-广告区域数据类型 */
export type BannerItem = {
  /** 跳转链接 */
  hrefUrl: string;
  /** id */
  id: string;
  /** 图片链接 */
  imgUrl: string;
  /** 跳转类型 */
  type: number;
};

/** 猜你喜欢-商品类型 */
export type GuessItem = {
  /** 商品描述 */
  desc: string;
  /** 商品折扣 */
  discount: number;
  /** id */
  id: string;
  /** 商品名称 */
  name: string;
  /** 商品已下单数量 */
  orderNum: number;
  /** 商品图片 */
  picture: string;
  /** 商品价格 */
  price: number;
};
