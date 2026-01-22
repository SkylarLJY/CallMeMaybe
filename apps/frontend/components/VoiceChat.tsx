"use client";

import { Phone, PhoneOff, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TranscriptDisplay } from "@/components/TranscriptDisplay";
import { useAudioConnection } from "@/hooks/useAudioConnection";
import { useMicLevel } from "@/hooks/useMicLevel";
import type { AgentPersona } from "@callmemaybe/agent-config";

interface VoiceChatProps {
  persona: AgentPersona;
}

export default function VoiceChat({ persona }: VoiceChatProps) {
  const { isConnected, isConnecting, status, transcripts, mediaStream, connect, disconnect } =
    useAudioConnection(persona);
  const micLevel = useMicLevel(mediaStream);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Voice Assistant
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`} />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <TranscriptDisplay transcripts={transcripts} status={status} />

        {isConnected ? (
          <>
            <div className="flex items-center justify-center gap-2">
              <Mic className="w-4 h-4 text-muted-foreground" />
              <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 transition-all duration-75" style={{ width: `${micLevel * 100}%` }} />
              </div>
            </div>
            <Button onClick={disconnect} variant="destructive" size="lg" className="w-full gap-2">
              <PhoneOff className="w-4 h-4" /> Stop
            </Button>
          </>
        ) : (
          <Button onClick={connect} disabled={isConnecting} size="lg" className="w-full gap-2">
            <Phone className="w-4 h-4" /> {isConnecting ? "Connecting..." : "Start"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
