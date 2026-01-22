"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTranscripts } from "./useTranscripts";
import type { AgentPersona } from "@callmemaybe/agent-config";

export function useTextConnection(persona: AgentPersona) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState("Type a message to start");

  const ws = useRef<WebSocket | null>(null);
  const sessionReady = useRef(false);
  const { transcripts, addTranscript, clearTranscripts } = useTranscripts();

  const connect = useCallback(async () => {
    if (ws.current?.readyState === WebSocket.OPEN) return;
    if (isConnecting) return;

    try {
      setIsConnecting(true);
      setStatus("Connecting...");

      const tokenResponse = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona }),
      });
      const data = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(data.error || "Failed to get token");
      }

      const socket = new WebSocket(
        "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
        ["realtime", `openai-insecure-api-key.${data.value}`]
      );

      socket.onopen = () => {
        sessionReady.current = true;
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
          console.error("OpenAI error:", event.error);
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
  }, [persona, isConnecting, addTranscript]);

  const disconnect = useCallback(() => {
    ws.current?.close();
    ws.current = null;
    sessionReady.current = false;
    setIsConnected(false);
    clearTranscripts();
  }, [clearTranscripts]);

  const sendTextMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    if (!sessionReady.current) {
      await connect();
      // Wait for session to be configured
      await new Promise<void>((resolve) => {
        const check = setInterval(() => {
          if (sessionReady.current) {
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
