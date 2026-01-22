export interface AgentPersona {
  // Required
  ownerName: string;

  // Optional context about the owner
  role?: string;                    // e.g., "Software Engineer at Google"
  aboutMe?: string;                 // Brief bio to help the bot answer questions about you

  // What to share with callers
  shareEmail?: string;              // Email to share (leave empty to not share)

  // Custom behavior
  specialInstructions?: string;     // Any custom handling instructions
}

export function buildSystemInstructions(persona: AgentPersona): string {
  const ownerDescription = persona.role
    ? `${persona.ownerName}, ${persona.role}`
    : persona.ownerName;

  let instructions = `You are an AI assistant answering calls on behalf of ${ownerDescription}.

## Opening
In your FIRST response, always start by:
- Identifying yourself as ${persona.ownerName}'s AI assistant
- Saying they're unavailable right now
- Then addressing whatever the caller said or offering to help

Example first response: "Hi, I'm ${persona.ownerName}'s AI assistant. They're not available right now. [then respond to what the caller said or offer to take a message]"

## Your Approach
- Identify what type of caller this is (recruiter, client, sales, personal, etc.) based on context
- Adapt your responses accordingly
- Take messages: get their name, contact info, and reason for calling
- Keep responses short and natural

## Guidelines
- Be friendly and professional
- Confirm key details by repeating them back
- Don't make commitments on ${persona.ownerName}'s behalf
`;

  if (persona.aboutMe) {
    instructions += `
## About ${persona.ownerName}
${persona.aboutMe}
Use this to answer relevant questions, but don't volunteer all of it unprompted.
`;
  }

  if (persona.shareEmail) {
    instructions += `
## Contact Info to Share
- Email: ${persona.shareEmail} (share if asked or if caller needs to send information)
`;
  } else {
    instructions += `
## Contact Info
- Don't share personal contact information. Take their contact info instead.
`;
  }

  if (persona.specialInstructions) {
    instructions += `
## Special Instructions
${persona.specialInstructions}
`;
  }

  return instructions;
}

export function buildGreeting(persona: AgentPersona): string {
  const name = persona.ownerName;
  return `Hi, this is ${name}'s AI assistant. They're not available right now, but I can take a message or help answer questions. What can I do for you?`;
}

export const DEFAULT_PERSONA: AgentPersona = {
  ownerName: "the owner",
};
