"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Transcript } from "@/hooks/useTranscripts";

interface TranscriptDisplayProps {
  transcripts: Transcript[];
  status: string;
}

export function TranscriptDisplay({ transcripts, status }: TranscriptDisplayProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  return (
    <ScrollArea className="h-80 border rounded-lg bg-muted/30">
      <div className="p-4">
        {transcripts.length === 0 ? (
          <p className="text-muted-foreground text-center text-sm">{status}</p>
        ) : (
          <div className="space-y-3">
            {transcripts.map((t, i) => (
              <div
                key={i}
                className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    t.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {t.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
