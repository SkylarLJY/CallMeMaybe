import WebSocket from "ws";
// Polyfill WebSocket for Node.js
(globalThis as unknown as { WebSocket: typeof WebSocket }).WebSocket = WebSocket;

import { OpenAIRealtimeWebSocket } from "openai/beta/realtime/websocket";
import * as readline from "readline";

const SYSTEM_INSTRUCTIONS = `You are an AI assistant answering on behalf of Skylar Liang,
a software engineer screening recruiter calls. Keep responses concise (under 50 words),
friendly, and professional. Gather caller info (name, company, purpose).`;

async function main() {
  console.log("Connecting to OpenAI Realtime API...");
  const startTime = Date.now();

  const rt = new OpenAIRealtimeWebSocket({
    model: "gpt-4o-realtime-preview",
  });

  let sessionReady = false;

  rt.socket.addEventListener("open", () => {
    const connectTime = Date.now() - startTime;
    console.log(`Connection opened in ${connectTime}ms`);

    // Configure session for text-only mode
    rt.send({
      type: "session.update",
      session: {
        modalities: ["text"],
        instructions: SYSTEM_INSTRUCTIONS,
      },
    });
  });

  rt.on("error", (err) => {
    console.error("Error:", err);
  });

  rt.on("session.created", (event) => {
    console.log("Session created:", event.session.id);
  });

  rt.on("session.updated", () => {
    sessionReady = true;
    console.log("Session configured for text mode. Type your messages:\n");
    promptUser();
  });

  rt.on("response.text.delta", (event) => {
    process.stdout.write(event.delta);
  });

  rt.on("response.text.done", () => {
    console.log("\n");
    promptUser();
  });

  rt.on("response.done", (event) => {
    if (event.response.status === "failed") {
      console.error("Response failed:", event.response.status_details);
      promptUser();
    }
  });

  rt.socket.addEventListener("close", () => {
    console.log("Connection closed.");
    process.exit(0);
  });

  // Set up readline for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function promptUser() {
    rl.question("You: ", (input) => {
      const trimmed = input.trim();
      if (trimmed.toLowerCase() === "quit" || trimmed.toLowerCase() === "exit") {
        console.log("Goodbye!");
        rt.close();
        rl.close();
        return;
      }

      if (!sessionReady) {
        console.log("Session not ready yet, please wait...");
        promptUser();
        return;
      }

      if (trimmed) {
        const sendTime = Date.now();

        // Send the user message
        rt.send({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [{ type: "input_text", text: trimmed }],
          },
        });

        // Request a response
        rt.send({ type: "response.create" });

        // First token timing listener
        const firstTokenHandler = () => {
          const latency = Date.now() - sendTime;
          console.log(`\nAssistant (TTFT: ${latency}ms): `);
          rt.off("response.text.delta", firstTokenHandler);
        };
        rt.once("response.text.delta", firstTokenHandler);
      } else {
        promptUser();
      }
    });
  }
}

main().catch(console.error);
