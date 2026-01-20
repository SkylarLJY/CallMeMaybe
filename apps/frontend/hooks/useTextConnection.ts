"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranscripts } from "./useTranscripts";

export function useTextConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState("Type a message to start");

  const ws = useRef<WebSocket | null>(null);
  const { transcripts, addTranscript, clearTranscripts } = useTranscripts();

  const connect = useCallback(async () => {
    if (ws.current?.readyState === WebSocket.OPEN) return;
    if (isConnecting) return;

    try {
      setIsConnecting(true);
      setStatus("Connecting...");

      const tokenResponse = await fetch("/api/token");
      const data = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(data.error || "Failed to get token");
      }

      const socket = new WebSocket(
        "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
        ["realtime", `openai-insecure-api-key.${data.value}`]
      );

      socket.onopen = () => {
        setStatus("Ready");
        setIsConnected(true);
        setIsConnecting(false);
      };

      socket.onmessage = (e) => {
        const event = JSON.parse(e.data);

        if (event.type === "response.text.done" || event.type === "response.output_text.done") {
          addTranscript("assistant", event.text);
        }

        if (event.type === "error") {
          setStatus(`Error: ${event.error?.message || "Unknown error"}`);
        }
      };

      socket.onerror = () => {
        setStatus("Connection error - retrying...");
        setIsConnecting(false);
      };

      socket.onclose = () => {
        setIsConnected(false);
        ws.current = null;
      };

      ws.current = socket;
    } catch (error) {
      console.error("Connection error:", error);
      setStatus(`Error: ${error instanceof Error ? error.message : "Connection failed"}`);
      setIsConnecting(false);
    }
  }, [isConnecting, addTranscript]);

  const disconnect = useCallback(() => {
    ws.current?.close();
    ws.current = null;
    setIsConnected(false);
    clearTranscripts();
  }, [clearTranscripts]);

  const sendTextMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    if (ws.current?.readyState !== WebSocket.OPEN) {
      await connect();
      // Wait for connection
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (ws.current?.readyState === WebSocket.OPEN) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      });
    }

    addTranscript("user", text);

    ws.current?.send(JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [{ type: "input_text", text }],
      },
    }));

    ws.current?.send(JSON.stringify({
      type: "response.create",
      response: { output_modalities: ["text"] },
    }));
  }, [connect, addTranscript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ws.current?.close();
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    status,
    transcripts,
    connect,
    disconnect,
    sendTextMessage,
  };
}
