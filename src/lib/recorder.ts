import { hidePluginWindow } from "./utils";
import { v4 as uuid } from "uuid";
import io from "socket.io-client";

let videoTransferFileName: string | undefined;
let mediaRecorder: MediaRecorder;
let userId: string;

const socket = io(import.meta.env.VITE_SOCKET_URL as string);

export const StartRecording = (onSources: {
  screen: string;
  id: string;
  audio: string;
}) => {
  hidePluginWindow(true);
  videoTransferFileName = `${uuid()}-${onSources?.id.slice(0, 8)}.webm`;
  mediaRecorder.start(1000);
};

export const onStopRecording = () => mediaRecorder.stop();

export const onDataAvailable = async (e: BlobEvent) => {
  socket.emit("video-chunks", {
    chunks: e.data,
    filename: videoTransferFileName,
  });
};

const stopRecording = async () => {
  hidePluginWindow(false);
  socket.emit("process-video", {
    filename: videoTransferFileName,
    userId,
  });
};

export const selectSoources = async (
  onSources: {
    screen: string;
    id: string;
    audio: string;
    preset: "HD" | "SD";
  },
  videoElement: React.RefObject<HTMLVideoElement>
) => {
  if (onSources && onSources.screen && onSources.audio && onSources.id) {
    const constraints: any = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: "desktop",
          chromeMediaSourceId: onSources?.id,
          minWidth: onSources.preset === "HD" ? 1920 : 1280,
          maxWidth: onSources.preset === "HD" ? 1920 : 1280,
          minHeight: onSources.preset === "HD" ? 1080 : 720,
          maxHeight: onSources.preset === "HD" ? 1080 : 720,
          frameRate: 30,
        },
      },
    };
    userId = onSources.id;
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const audioStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: {
        deviceId: {
          exact: onSources.audio,
        },
      },
    });
    console.log("videoElement.current");

    if (videoElement && videoElement.current) {
      console.log(videoElement.current);

      videoElement.current.srcObject = stream;
      await videoElement.current.play();
    }
    const combinedStream = new MediaStream([
      ...stream.getVideoTracks(),
      ...audioStream.getAudioTracks(),
    ]);

    mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: "video/webm; codecs=vp9",
    });
    mediaRecorder.ondataavailable = onDataAvailable;
    mediaRecorder.onstop = stopRecording;
  }
};
