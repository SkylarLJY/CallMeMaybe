"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TranscriptDisplay } from "@/components/TranscriptDisplay";
import { useTextConnection } from "@/hooks/useTextConnection";

export default function TextChat() {
  const [textInput, setTextInput] = useState("");
  const { isConnected, status, transcripts, sendTextMessage } = useTextConnection();

  const handleSend = () => {
    if (!textInput.trim()) return;
    sendTextMessage(textInput);
    setTextInput("");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Text Chat
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`} />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <TranscriptDisplay transcripts={transcripts} status={status} />

        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
          <Input
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Type a message..."
          />
          <Button type="submit" size="icon" disabled={!textInput.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
