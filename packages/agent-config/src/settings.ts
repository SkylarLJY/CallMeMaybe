export type Voice = "alloy" | "ash" | "ballad" | "coral" | "echo" | "sage" | "shimmer" | "verse";

export type Modality = "text" | "audio";

export interface SessionConfig {
  model: string;
  voice: Voice;
  modalities: Modality[];
  input_audio_transcription: {
    model: string;
  } | null;
  turn_detection: {
    type: "server_vad";
    threshold?: number;
    prefix_padding_ms?: number;
    silence_duration_ms?: number;
  } | null;
}

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  model: "gpt-4o-realtime-preview",
  voice: "verse",
  modalities: ["text", "audio"],
  input_audio_transcription: {
    model: "whisper-1",
  },
  turn_detection: {
    type: "server_vad",
    threshold: 0.5,
    prefix_padding_ms: 300,
    silence_duration_ms: 500,
  },
};

export const TEXT_ONLY_SESSION_CONFIG: SessionConfig = {
  ...DEFAULT_SESSION_CONFIG,
  modalities: ["text"],
  input_audio_transcription: null,
  turn_detection: null,
};
