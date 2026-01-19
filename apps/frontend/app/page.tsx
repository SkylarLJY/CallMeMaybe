import VoiceChat from "@/components/VoiceChat";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-2">CallMeMaybe</h1>
      <p className="text-muted-foreground mb-8">AI Voice Assistant</p>
      <VoiceChat />
    </main>
  );
}
