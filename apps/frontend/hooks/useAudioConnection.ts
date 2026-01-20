"use client";

import { useState, useRef, useCallback } from "react";
import { useTranscripts } from "./useTranscripts";

export function useAudioConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState("Click Start to begin");
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);

  const { transcripts, clearTranscripts, handleDataChannelMessage } = useTranscripts();

  const cleanup = useCallback(() => {
    dataChannel.current?.close();
    dataChannel.current = null;

    peerConnection.current?.close();
    peerConnection.current = null;

    setMediaStream((ms) => {
      ms?.getTracks().forEach((track) => track.stop());
      return null;
    });

    if (audioElement.current) {
      audioElement.current.srcObject = null;
      audioElement.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setStatus("Fetching token...");

      const tokenResponse = await fetch("/api/token");
      const data = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(data.error || "Failed to get token");
      }

      const ephemeralKey = data.value;
      setStatus("Creating connection...");

      const pc = new RTCPeerConnection();
      peerConnection.current = pc;

      // Audio output
      audioElement.current = document.createElement("audio");
      audioElement.current.autoplay = true;
      pc.ontrack = (e) => {
        if (audioElement.current) {
          audioElement.current.srcObject = e.streams[0];
        }
      };

      // Audio input (microphone)
      setStatus("Requesting microphone access...");
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(ms);
      pc.addTrack(ms.getTracks()[0]);

      // Data channel for events
      const dc = pc.createDataChannel("oai-events");
      dataChannel.current = dc;
      dc.onopen = () => setStatus("Connected - speak now");
      dc.onmessage = handleDataChannelMessage;
      dc.onclose = () => setStatus("Connection closed");

      // WebRTC handshake
      setStatus("Establishing WebRTC session...");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        console.error("SDP error:", errorText);
        throw new Error("Failed to establish WebRTC session");
      }

      await pc.setRemoteDescription({ type: "answer", sdp: await sdpResponse.text() });
      setIsConnected(true);
    } catch (error) {
      console.error("Connection error:", error);
      setStatus(`Error: ${error instanceof Error ? error.message : "Connection failed"}`);
      cleanup();
    } finally {
      setIsConnecting(false);
    }
  }, [handleDataChannelMessage, cleanup]);

  const disconnect = useCallback(() => {
    cleanup();
    setIsConnected(false);
    clearTranscripts();
    setStatus("Click Start to begin");
  }, [cleanup, clearTranscripts]);

  return {
    isConnected,
    isConnecting,
    status,
    transcripts,
    mediaStream,
    connect,
    disconnect,
  };
}
