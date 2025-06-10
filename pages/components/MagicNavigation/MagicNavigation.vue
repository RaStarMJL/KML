<template>
    <div class="navigation">
      <ul>
        <li
          v-for="(item, index) in navigationItems"
          :key="index"
          class="list"
          :class="{ active: activeIndex === index }"
          @click="setActive(index)"
        >
          <a href="#">
            <span class="icon">
              <ion-icon :name="item.icon"></ion-icon>
            </span>
            <span class="text">{{ item.text }}</span>
          </a>
        </li>
        <div class="indicator"></div>
      </ul>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref } from "vue";
  
  interface NavigationItem {
    icon: string;
    text: string;
  }
  
  export default defineComponent({
    name: "MagicNavigation",
    setup() {
      const navigationItems = ref<NavigationItem[]>([
        { icon: "home-outline", text: "首页" },
        { icon: "person-outline", text: "我的" },
        { icon: "chatbubble-outline", text: "消息" },
      //   { icon: "camera-outline", text: "图片" },
      //   { icon: "settings-outline", text: "设置" },
      ]);
  
      const activeIndex = ref(0);
  
      const setActive = (index: number) => {
        activeIndex.value = index;
      };
  
      return {
        navigationItems,
        activeIndex,
        setActive,
      };
    },
  });
  </script>
  
  <style lang="scss" scoped>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  .navigation {
    --itemNum: 3;
    --totalWidth: 100vw;
    --ulWidth: calc(var(--totalWidth));
    --liWidth: calc(var(--ulWidth) / var(--itemNum));
    --iconSize: 1em;
    --textSize: calc(var(--iconSize) / 2);
    --ballWidth: 60px;
    --indicatorTranslateWidth: calc(var(--ulWidth) / var(--itemNum));
    --indicatorTranslateoffset: calc((var(--indicatorTranslateWidth) - var(--ballWidth)) / 2);
    position: relative;
    width: var(--totalWidth);
    height: var(--ballWidth);
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 10px;
  
    ul {
      display: flex;
      width: var(--ulWidth);
  
      li {
        position: relative;
        list-style: none;
        width: var(--liWidth);
        height: var(--ballWidth);
        z-index: 1;
        z-index: 1;
  
        a {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          width: 100%;
          text-align: center;
          font-weight: 500;
  
          .icon {
            position: relative;
            display: block;
            line-height: calc(var(--ballWidth) * 1.1);
            font-size: var(--iconSize);
            text-align: center;
            transition: 0.5s;
            color: var(--clr);
          }
  
          .text {
            position: absolute;
            color: var(--clr);
            font-weight: 400;
            font-size: var(--textSize);
            letter-spacing: 0.05em;
            transition: 0.5s;
            opacity: 0;
            transform: translateY(20px);
          }
        }
  
        &.active a {
          .icon {
            transform: translateY(-32px);
          }
  
          .text {
            opacity: 1;
            transform: translateY(10px);
          }
        }
  
        &:nth-child(1).active ~ .indicator {
          transform: translateX(calc(var(--indicatorTranslateWidth) * 0 + var(--indicatorTranslateoffset)));
        }
  
        &:nth-child(2).active ~ .indicator {
          transform: translateX(calc(var(--indicatorTranslateWidth) * 1 + var(--indicatorTranslateoffset)));
        }
  
        &:nth-child(3).active ~ .indicator {
          transform: translateX(calc(var(--indicatorTranslateWidth) * 2 + var(--indicatorTranslateoffset)));
        }
  
        &:nth-child(4).active ~ .indicator {
          transform: translateX(calc(var(--indicatorTranslateWidth) * 3 + var(--indicatorTranslateoffset)));
        }
  
        &:nth-child(5).active ~ .indicator {
          transform: translateX(calc(var(--indicatorTranslateWidth) * 4 + var(--indicatorTranslateoffset)));
        }
      }
  
      .indicator {
        position: absolute;
        top: -50%;
        width: var(--ballWidth);
        height: var(--ballWidth);
        background: #29fd53;
        border-radius: 50%;
        border: 6px solid var(--clr);
        transition: 0.5s;
  
        &::before {
          content: "";
          position: absolute;
          top: 50%;
          left: -22px;
          width: 20px;
          height: 20px;
          background: transparent;
          border-top-right-radius: 20px;
          box-shadow: 1px -10px 0 0 var(--clr);
        }
  
        &::after {
          content: "";
          position: absolute;
          top: 50%;
          right: -22px;
          width: 20px;
          height: 20px;
          background: transparent;
          border-top-left-radius: 20px;
          box-shadow: -1px -10px 0 0 var(--clr);
        }
      }
    }
  }
  </style>
  