"use client";

import { useState, useCallback } from "react";

export interface Transcript {
  role: "user" | "assistant";
  text: string;
}

export function useTranscripts() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);

  const addTranscript = useCallback((role: "user" | "assistant", text: string) => {
    setTranscripts((prev) => [...prev, { role, text }]);
  }, []);

  const clearTranscripts = useCallback(() => {
    setTranscripts([]);
  }, []);

  const handleDataChannelMessage = useCallback(
    (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      console.log("Received event:", data);

      if (data.type === "conversation.item.input_audio_transcription.completed") {
        addTranscript("user", data.transcript);
      }

      if (data.type === "response.audio_transcript.done") {
        addTranscript("assistant", data.transcript);
      }

      if (data.type === "response.content_part.done" && data.part?.type === "audio" && data.part?.transcript) {
        addTranscript("assistant", data.part.transcript);
      }

      // Handle text response
      if (data.type === "response.text.done") {
        addTranscript("assistant", data.text);
      }
    },
    [addTranscript]
  );

  return {
    transcripts,
    addTranscript,
    clearTranscripts,
    handleDataChannelMessage,
  };
}
