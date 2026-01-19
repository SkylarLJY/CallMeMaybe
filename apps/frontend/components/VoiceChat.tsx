"use client";

import { useState } from "react";
import { Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function VoiceChat() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Voice Assistant</span>
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Transcript area */}
        <div className="border rounded-lg p-4 h-80 overflow-y-auto bg-muted/30">
          <p className="text-muted-foreground text-center text-sm">
            Click Start to begin
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          {!isConnected ? (
            <Button
              onClick={() => setIsConnected(true)}
              size="lg"
              className="gap-2"
            >
              <Phone className="w-4 h-4" />
              Start
            </Button>
          ) : (
            <Button
              onClick={() => setIsConnected(false)}
              variant="destructive"
              size="lg"
              className="gap-2"
            >
              <PhoneOff className="w-4 h-4" />
              Stop
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
