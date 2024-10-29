import { updateStudioSettingsSchema } from "@/schemas/studio-setting-schema";
import { useZodForm } from "./useZodForm";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateStudioSettings } from "@/lib/utils";
import { toast } from "sonner";

export const useStudioSettings = (
  id: string,
  screen?: string | null,
  audio?: string | null,
  preset?: "HD" | "SD",
  plan?: "PRO" | "FREE"
) => {
  const [onPresent, setOnPresent] = useState<"HD" | "SD" | undefined>();
  const { register, watch } = useZodForm(updateStudioSettingsSchema, {
    // @ts-ignore
    screen: screen!,
    audio: audio!,
    preset: preset!,
  });
  const { mutate, isPending } = useMutation({
    mutationKey: ["update-studio"],
    mutationFn: (data: {
      screen: string;
      id: string;
      audio: string;
      preset: "HD" | "SD";
    }) => updateStudioSettings(data.id, data.screen, data.audio, data.preset),
    onSuccess: (data) => {
      return toast(data.status === 200 ? "Success" : "Error", {
        description: data.Message,
      });
    },
  });

  useEffect(() => {
    if (screen && audio) {
      console.log(screen, audio);

      window.ipcRenderer.send("media-sources", {
        screen,
        id: id,
        audio,
        preset,
      });
    }
  }, [screen, audio]); // Added id and preset to dependencies

  useEffect(() => {
    const subscribe = watch((values) => {
      setOnPresent(values.preset);
      mutate({
        screen: values.screen!,
        audio: values.audio!,
        preset: values.preset!,
        id,
      });
      window.ipcRenderer.send("media-sources", {
        screen: values.screen,
        id,
        audio: values.audio,
        preset: values.preset,
        plan,
      });
    });
    return () => subscribe.unsubscribe();
  }, [watch]);

  return { register, onPresent, isPending };
};
