// hooks/useNotificationOpen.ts
import { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { toast } from "sonner";

import { useMarkNotificationRead } from "@/hooks/notification.hooks";
import { SelectionStatus } from "@/shared/shared.models";
import PracticeRespondModal from "./practiceRespondModal/PracticeRespondModal";
import AdminReviewSubmissionModal from "@/components/assets/AdminReviewSubmissionModal";
import { useSelectionById } from "@/hooks/selection.hooks";
import { NotificationRow } from "@/models/notification.models";
import StaleNotificationModal from "./StaleNotificationModal";

export function useNotificationOpen() {
  // which notification are we interacting with right now?
  const [activeNotification, setActiveNotification] =
    useState<NotificationRow | null>(null);

  // we also separately remember "the one the user just clicked"
  // so we can show a loader badge/spinner on that card while resolving
  const [openingId, setOpeningId] = useState<string | null>(null);

  // live selection data (from query)
  const [selectionData, setSelectionData] = useState<any | null>(null);

  // which modal to show
  const [modalVariant, setModalVariant] = useState<
    "practiceRespond" | "adminReview" | "stale" | null
  >(null);

  // modal open/close
  const [opened, { open, close }] = useDisclosure(false);

  const { mutate: markRead } = useMarkNotificationRead();

  // query live selection based on the active notification
  const {
    data: liveSelection,
    isLoading,
    isFetching,
  } = useSelectionById(activeNotification?.selection_id ?? null);

  // once the selection query resolves, decide which modal to show and open it
  useEffect(() => {
    if (!activeNotification) return;

    // still loading -> not ready yet
    if (isLoading || isFetching) return;

    // we've finished loading (either success or error) so we can clear UI spinner state
    setOpeningId(null);

    const sel = liveSelection ?? null;
    const currentStatus: SelectionStatus | null = sel?.status ?? null;

    let variant: "practiceRespond" | "adminReview" | "stale";

    if (activeNotification.type === SelectionStatus.Requested) {
      if (currentStatus === SelectionStatus.Requested) {
        variant = "practiceRespond";
      } else {
        variant = "stale";
      }
    } else if (activeNotification.type === SelectionStatus.InProgress) {
      variant = "adminReview";
    } else {
      variant = "stale";
    }

    setModalVariant(variant);
    setSelectionData(sel ?? null);

    if (activeNotification.id) {
      markRead(
        { notificationId: activeNotification.id },
        {
          onError: () => {
            /* non-blocking */
          },
        }
      );
    }

    open();
  }, [
    activeNotification,
    isLoading,
    isFetching,
    liveSelection,
    markRead,
    open,
  ]);

  // click handler from the list
  function handleOpenNotification(n: NotificationRow, isAdminView: boolean) {
    try {
      // mark which card is being opened (for spinner UI)
      setOpeningId(n.id);

      // IMPORTANT FIX:
      // always create a new object reference so React treats it
      // as a state change, even if it's "the same" notification
      setActiveNotification({ ...n });

      // (if something blows up mid-flight we'll clear below in catch)
    } catch {
      toast.error("Couldn't open notification");
      setOpeningId(null);
    }
  }

  // rendered modal
  function NotificationModalRenderer() {
    if (!opened || !activeNotification || !modalVariant) return null;

    if (modalVariant === "practiceRespond") {
      return (
        <PracticeRespondModal
          opened={opened}
          onClose={close}
          notification={activeNotification}
        />
      );
    }

    if (modalVariant === "adminReview") {
      return (
        <AdminReviewSubmissionModal
          opened={opened}
          onClose={close}
          notification={activeNotification}
          selection={selectionData}
        />
      );
    }

    return (
      <StaleNotificationModal
        opened={opened}
        onClose={close}
        notification={activeNotification}
        selection={selectionData}
      />
    );
  }

  // expose:
  // - openingId: which notification is "in flight"
  // - isOpening: true if we're currently fetching live status for that notification
  //   (only meaningful if openingId === that card's id)
  const isOpening = Boolean(openingId) && (isLoading || isFetching);

  return {
    handleOpenNotification,
    NotificationModalRenderer,
    openingId,
    isOpening,
  };
}
