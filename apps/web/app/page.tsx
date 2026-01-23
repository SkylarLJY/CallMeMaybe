"use client";

import { Mic, MessageSquare, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VoiceChat from "@/components/VoiceChat";
import TextChat from "@/components/TextChat";
import SettingsPanel from "@/components/SettingsPanel";
import { usePersona } from "@/hooks/usePersona";

export default function Home() {
  const { persona, isConfigured, savePersona } = usePersona();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-2">CallMeMaybe</h1>
      <p className="text-muted-foreground mb-8">AI Voice Assistant</p>

      <Tabs defaultValue={isConfigured ? "voice" : "settings"} className="w-full max-w-2xl">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="voice" className="gap-2">
            <Mic className="w-4 h-4" /> Voice
          </TabsTrigger>
          <TabsTrigger value="text" className="gap-2">
            <MessageSquare className="w-4 h-4" /> Text
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="w-4 h-4" /> Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent value="voice">
          {isConfigured ? (
            <VoiceChat persona={persona} />
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Please configure your settings first
            </p>
          )}
        </TabsContent>
        <TabsContent value="text">
          {isConfigured ? (
            <TextChat persona={persona} />
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Please configure your settings first
            </p>
          )}
        </TabsContent>
        <TabsContent value="settings">
          <SettingsPanel persona={persona} onSave={savePersona} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
