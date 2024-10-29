import { getMediaSources } from "@/lib/utils";
import React from "react";

export type SourceDeviceStateProps = {
  displays?: {
    appIcon: null;
    display_id: string;
    id: string;
    name: string;
    thumbnail: unknown[];
  }[];
  audioInputs?: {
    deviceId: string;
    kind: string;
    label: string;
    groupId: string;
  }[];
  error?: string | null;
  isPending: boolean;
};

type DispalyDeviceActionProps = {
  type: "GET_DEVICES";
  payload: SourceDeviceStateProps;
};

export const useMediaSources = () => {
  const [state, action] = React.useReducer(
    (state: SourceDeviceStateProps, action: DispalyDeviceActionProps) => {
      switch (action.type) {
        case "GET_DEVICES":
          return {
            ...state,
            ...action.payload,
          };
        default:
          return state;
      }
    },
    {
      displays: [],
      audioInputs: [],
      error: null,
      isPending: true,
    }
  );

  const fetchMediaResources = async () => {
    action({
      type: "GET_DEVICES",
      payload: {
        isPending: true,
      },
    });
    getMediaSources()
      .then((sources) =>
        action({
          type: "GET_DEVICES",
          payload: {
            displays: sources.displays,
            audioInputs: sources.audio,
            isPending: false,
          },
        })
      )
      .catch((error) => {
        console.error(error);
      });
  };

  return {
    state,
    fetchMediaResources,
  };
};
