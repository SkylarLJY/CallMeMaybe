import { NextRequest, NextResponse } from "next/server";
import { buildSystemInstructions, DEFAULT_PERSONA, type AgentPersona } from "@callmemaybe/agent-config";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  // Get persona from request body
  let persona: AgentPersona = DEFAULT_PERSONA;
  try {
    const body = await request.json();
    if (body.persona?.ownerName) {
      persona = body.persona;
    }
  } catch {
    // Use default persona
  }

  const sessionConfig = {
    session: {
      type: "realtime",
      model: "gpt-realtime",
      instructions: buildSystemInstructions(persona),
      audio: {
        input: {
          transcription: {
            model: "whisper-1",
          },
        },
        output: {
          voice: "shimmer",
        },
      },
    },
  };

  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionConfig),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `OpenAI API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
