"use client";

import { Mic, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VoiceChat from "@/components/VoiceChat";
import TextChat from "@/components/TextChat";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-2">CallMeMaybe</h1>
      <p className="text-muted-foreground mb-8">AI Voice Assistant</p>

      <Tabs defaultValue="voice" className="w-full max-w-2xl">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="voice" className="gap-2">
            <Mic className="w-4 h-4" /> Voice
          </TabsTrigger>
          <TabsTrigger value="text" className="gap-2">
            <MessageSquare className="w-4 h-4" /> Text
          </TabsTrigger>
        </TabsList>
        <TabsContent value="voice">
          <VoiceChat />
        </TabsContent>
        <TabsContent value="text">
          <TextChat />
        </TabsContent>
      </Tabs>
    </main>
  );
}
