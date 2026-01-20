"use client";

import { useState, useEffect, useRef } from "react";

export function useMicLevel(stream: MediaStream | null) {
  const [level, setLevel] = useState(0);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    if (!stream) {
      return;
    }

    audioContext.current = new AudioContext();
    analyser.current = audioContext.current.createAnalyser();
    analyser.current.fftSize = 256;

    const source = audioContext.current.createMediaStreamSource(stream);
    source.connect(analyser.current);

    const dataArray = new Uint8Array(analyser.current.frequencyBinCount);

    const updateLevel = () => {
      if (!analyser.current) return;

      analyser.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setLevel(average / 255);

      animationFrame.current = requestAnimationFrame(updateLevel);
    };

    animationFrame.current = requestAnimationFrame(updateLevel);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
      setLevel(0);
    };
  }, [stream]);

  return level;
}
