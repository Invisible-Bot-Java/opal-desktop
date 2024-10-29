import {
  onStopRecording,
  selectSoources,
  StartRecording,
} from "@/lib/recorder";
import { cn, resizeWindow, videoRecodingTime } from "@/lib/utils";
import { Cast, Pause, Square } from "lucide-react";
import React from "react";

const StudioTray = () => {
  const initial = new Date().getTime();
  const [preview, setPreview] = React.useState<boolean>(false);
  const [onTimer, setOnTimer] = React.useState<string>("00:00:00");
  const [recording, setRecording] = React.useState<boolean>(false);
  const [count, setCount] = React.useState<number>(0);
  const [onSources, setOnSources] = React.useState<
    | {
        screen: string;
        id: string;
        audio: string;
        preset: "HD" | "SD";
        plan: "PRO" | "FREE";
      }
    | undefined
  >(undefined);
  window.ipcRenderer.on("profile-recieved", (event, payload) => {
    setOnSources(payload);
  });

  const clearTime = () => {
    setOnTimer("00:00:00");
    setCount(0);
  };
  React.useEffect(() => {
    resizeWindow(preview);
    return () => resizeWindow(preview);
  }, [preview]);
  React.useEffect(() => {
    if (onSources && onSources.screen) selectSoources(onSources, videoElement);

    return () => {
      selectSoources(onSources!, videoElement);
    };
  }, [onSources]);
  React.useEffect(() => {
    if (!recording) return;
    const recordTimeInterval = setInterval(() => {
      let time = count + (new Date().getTime() - initial);
      setCount(time);
      const recordingTime = videoRecodingTime(time);
      if (onSources?.plan === "FREE" && recordingTime.minute == "05") {
        setRecording(false);
        clearTime();
        onStopRecording();
      }
      setOnTimer(recordingTime.length);
      if (time <= 0) {
        setOnTimer("00:00:00");
        clearInterval(recordTimeInterval);
      }
    }, 1);
    return () => clearInterval(recordTimeInterval);
  }, [recording]);
  const videoElement = React.useRef<HTMLVideoElement | null>(null);
  return !onSources ? (
    <></>
  ) : (
    <div className="flex flex-col justify-end gap-y-5 h-screen">
      {preview && (
        <video
          ref={videoElement}
          autoPlay
          className={cn("w-6/12 self-end bg-white")}
        />
      )}
      <div className="flex rounded-full justify-around items-center h-20 w-full border-2 bg-[#171717] draggable border-white/40">
        <div
          {...(onSources && {
            onClick: () => {
              setRecording(true);
              StartRecording(onSources);
            },
          })}
          className={cn(
            "non-draggable rounded-full cursor-pointer relative hover:opacity-80",
            recording ? "bg-red-500 w-6 h-6" : "bg-red-400 w-8 h-8"
          )}
        >
          {recording && (
            <span className="absolute -right-16 top-1/2 transform -translate-y-1/2 text-white">
              {onTimer}
            </span>
          )}
        </div>
        {!recording ? (
          <Pause
            size={32}
            fill="white"
            stroke="none"
            className="non-draggable opacity-50"
          />
        ) : (
          <Square
            size={32}
            className="non-draggable cursor-pointer hover:scale-110 transform transition duration-150"
            fill="white"
            stroke="white"
            onClick={() => {
              setRecording(false);
              clearTime();
              onStopRecording();
            }}
          />
        )}
        <Cast
          size={32}
          className="non-draggable cursor-pointer hover:opacity-60"
          fill="white"
          stroke="white"
          onClick={() => setPreview((prev) => !prev)}
        />
      </div>
    </div>
  );
};

export default StudioTray;
