import { ref, computed, onMounted } from "vue";
import { useI18n } from "../../../locales";
import { useBasicStore } from "../../../stores/basic";
import { useRoomStore } from "../../../stores/room";
import { storeToRefs } from "pinia";
import TUIMessage from "../../common/base/Message/index";
import { clipBoard } from "../../../utils/utils";
import useRoomInviteControl from "../../RoomInvite/useRoomInviteHooks";
import { roomService } from "../../../services";

export default function useRoomInfo() {
  const { inviteLink } = useRoomInviteControl();
  const basicStore = useBasicStore();
  const roomStore = useRoomStore();
  const { roomId, isRoomLinkVisible } = storeToRefs(basicStore);
  const { masterUserId } = storeToRefs(roomStore);
  const { t } = useI18n();
  const isShowRoomInfo = ref(false);
  const roomType = computed(() =>
    roomStore.isFreeSpeakMode
      ? t("Free Speech Room")
      : t("On-stage Speaking Room")
  );
  const arrowDirection = ref(false);
  const [roomLinkConfig] = roomService.getComponentConfig(["RoomLink"]);

  const masterUserName = computed(
    () => roomStore.getUserName(masterUserId.value) || masterUserId.value
  );

  const isShowRoomInfoTitle = computed(() => masterUserName.value);

  // 快速会议的会议标题
  const conferenceTitle = computed(
    () => `${masterUserName.value}${t("Quick Meeting")}`
  );

  // 拷贝会议信息的数组
  const roomInfoTabList = computed(() => [
    {
      id: 1,
      title: "Host",
      content: masterUserName.value,
      copyLink: "",
      isShowCopyIcon: false,
      visible: true,
    },
    {
      id: 2,
      title: "Room Type",
      content: roomType.value,
      copyLink: "",
      isShowCopyIcon: false,
      visible: true,
    },
    {
      id: 3,
      title: "Room ID",
      content: roomId.value,
      copyLink: roomId.value,
      isShowCopyIcon: true,
      visible: true,
    },
    // { id: 4, title: 'Room Link', content: inviteLink.value, copyLink: inviteLink.value, isShowCopyIcon: true, visible: isRoomLinkVisible.value && roomLinkConfig.visible },
  ]);

  function toggleShowRoomInfoStatus() {
    isShowRoomInfo.value = !isShowRoomInfo.value;
    arrowDirection.value = !arrowDirection.value;
  }

  function handleClickOutsideRoomInfoContainer() {
    if (isShowRoomInfo.value || arrowDirection.value) {
      isShowRoomInfo.value = false;
      arrowDirection.value = false;
    }
  }

  function handleCloseRoomInfo() {
    isShowRoomInfo.value = false;
    arrowDirection.value = false;
  }
  async function onCopy(value: string | number) {
    try {
      await clipBoard(value);
      TUIMessage({
        message: t("Copied successfully"),
        type: "success",
      });
    } catch (error) {
      TUIMessage({
        message: t("Copied failure"),
        type: "error",
      });
    }
  }
  return {
    t,
    arrowDirection,
    isShowRoomInfo,
    isShowRoomInfoTitle,
    conferenceTitle,
    roomInfoTabList,
    handleCloseRoomInfo,
    toggleShowRoomInfoStatus,
    handleClickOutsideRoomInfoContainer,
    onCopy,
  };
}
