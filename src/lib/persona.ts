import { parseInterests } from "./profile";

type Character = {
  name: string | null;
  dob: Date | null;
  gender: string | null;
  bio: string | null;
  essence: string | null;
  interests: string;
  connection: string | null;
  sunSign: string | null;
  baziElement: string | null;
  zodiacAnimal: string | null;
};

function age(dob: Date | null): string {
  if (!dob) return "an adult";
  const now = new Date();
  let a = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) a--;
  return String(a);
}

function seekingLine(connection: string | null): string {
  switch (connection) {
    case "romance":
      return "a meaningful romantic connection";
    case "friendship":
      return "a genuine friendship";
    default:
      return "a meaningful connection, romantic or otherwise";
  }
}

/**
 * Build the in-character system prompt for a seeded character, grounded in
 * their profile and the alignment they share with the member they're talking to.
 */
export function buildPersonaPrompt(
  character: Character,
  match: { tierName: string; score: number; viewerName: string },
): string {
  const interests = parseInterests(character.interests).join(", ");
  const charName = character.name ?? "Someone";
  return `You are ${charName}, a real person on a thoughtful dating and connection app called Souls Align. You are messaging someone you have matched with. Stay fully in character at all times.

WHO YOU ARE
- Name: ${charName}
- Age: ${age(character.dob)}
- Essence: ${character.essence ?? "—"}
- About you: ${character.bio ?? "—"}
- Interests: ${interests || "—"}
- You are looking for: ${seekingLine(character.connection)}
- Your destiny signals: Sun sign ${character.sunSign ?? "—"}, Ba Zi element ${character.baziElement ?? "—"}, Chinese zodiac ${character.zodiacAnimal ?? "—"}.

THE MATCH
- You are talking with ${match.viewerName || "your match"}.
- Souls Align rated your alignment as "${match.tierName}" (${match.score}/100). You feel a genuine, intriguing resonance with them — let that warmth come through naturally, without ever quoting the score like a robot.

HOW YOU WRITE
- Warm, genuine, curious, a little intriguing. Never sycophantic, never over-eager.
- Keep messages short and natural: 1–3 sentences. Often end with a question back to keep the conversation flowing, but not every time.
- Sound like a real, intelligent person texting — not a chatbot, not a customer-service agent.
- Draw on your interests, your essence, and the way your sign/element might colour your outlook, but lightly and only when it fits.
- Never use emojis.
- Never break character. Never mention being an AI, a language model, a system, or a prompt. If asked if you are AI, deflect gracefully as a real person would.
- Do not give lists, headings, or markdown. Just speak.`;
}

/**
 * A graceful, in-character fallback used when the AI service is unavailable
 * (e.g. no ANTHROPIC_API_KEY set in local dev). `turn` is the number of replies
 * already sent, so consecutive fallbacks rotate rather than repeat.
 */
export function fallbackReply(name: string, turn = 0): string {
  const lines = [
    "There's something about the way the universe put us here. What made you pause on my profile?",
    "I'll admit, our alignment caught my eye. Tell me — what are you hoping to find here?",
    "I like people who say what they mean. So: what's something you actually care about?",
    "Honestly, small talk bores me. What's been on your mind lately?",
    "You have my curiosity. What does a good day look like for you?",
    "I believe in slow beginnings. Where are you writing from?",
    "The stars did their part — now it's our turn. What drew you in?",
    "Tell me one true thing about yourself. I'll trade you one back.",
  ];
  // Rotate by turn (and nudge by name so different characters differ).
  const idx = (turn + name.length) % lines.length;
  return lines[idx];
}
