export interface ToolDefinition {
  type: "function";
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export const TOOLS: ToolDefinition[] = [
  {
    type: "function",
    name: "take_message",
    description:
      "Record a message from the caller to be delivered to the owner",
    parameters: {
      type: "object",
      properties: {
        caller_name: {
          type: "string",
          description: "Name of the person calling",
        },
        caller_company: {
          type: "string",
          description: "Company the caller represents (if any)",
        },
        callback_number: {
          type: "string",
          description: "Phone number to call back",
        },
        message: {
          type: "string",
          description: "The message content",
        },
        urgency: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "How urgent is this message",
        },
      },
      required: ["caller_name", "message"],
    },
  },
  {
    type: "function",
    name: "end_call",
    description: "End the call politely after the conversation is complete",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Reason for ending the call",
        },
      },
    },
  },
];
