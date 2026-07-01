/** Builds the prompt + a graceful fallback for the personal alignment story. */

export type StoryInput = {
  viewerName: string;
  targetName: string;
  viewerSun: string | null;
  viewerElement: string | null;
  viewerAnimal: string | null;
  targetSun: string | null;
  targetElement: string | null;
  targetAnimal: string | null;
  tierName: string;
  score: number;
  /** All five, in display order. */
  dimensions: { label: string; score: number }[];
};

export function buildStorySystem(): string {
  return `You are the narrating voice of Souls Align, a premium destiny-based matching app. You write a short, warm, editorial reflection on why two people align — a story beyond the numbers.

RULES
- 2–3 sentences, roughly 45–65 words. One short paragraph.
- Write in second person, addressing the viewer about the other person by name.
- Weave in their natures naturally — sun signs, five-element (Ba Zi) natures, and Chinese zodiac animals — and lean on the strongest compatibility dimensions to explain the draw.
- Tone: considered, optimistic, hopeful, quietly poetic. Structured, not mystical — a reading, never a prophecy or fortune-telling.
- Do NOT quote raw numbers or scores. Do NOT use lists, headings, or emojis. Do NOT be sycophantic or generic. Make it feel specific to these two.
- Return only the reflection text, nothing else.`;
}

export function buildStoryUser(input: StoryInput): string {
  const dims = [...input.dimensions]
    .sort((a, b) => b.score - a.score)
    .map((d) => `${d.label} ${d.score}`)
    .join(", ");
  return `The viewer is ${input.viewerName} — sun ${input.viewerSun ?? "unknown"}, ${input.viewerElement ?? "unknown"} nature, ${input.viewerAnimal ?? "unknown"} in the Chinese zodiac.
The other person is ${input.targetName} — sun ${input.targetSun ?? "unknown"}, ${input.targetElement ?? "unknown"} nature, ${input.targetAnimal ?? "unknown"} in the Chinese zodiac.
Overall alignment tier: ${input.tierName}.
Compatibility dimensions (strongest first): ${dims}.

Write the reflection about why ${input.viewerName} and ${input.targetName} align.`;
}

/** Deterministic, on-brand fallback when the AI service is unavailable. */
export function fallbackStory(input: StoryInput): string {
  const top = [...input.dimensions].sort((a, b) => b.score - a.score);
  const strongest = top[0]?.label?.toLowerCase() ?? "quiet";
  const second = top[1]?.label?.toLowerCase() ?? "steady";
  const tier = input.tierName.toLowerCase();

  const elementLine =
    input.viewerElement && input.targetElement
      ? input.viewerElement === input.targetElement
        ? `Two ${input.viewerElement.toLowerCase()} natures, you move to the same inner rhythm`
        : `${input.viewerElement} and ${input.targetElement} meet in you both — one nourishing the other`
      : "Your natures find an easy accord";

  return `You and ${input.targetName} read as a ${tier} alignment — and it shows most in your ${strongest} connection, with a ${second} current running beneath it. ${elementLine}, while ${input.viewerAnimal ?? "your"} and ${input.targetAnimal ?? "their"} temperaments keep good company. Not a certainty, but an honest, promising place to begin.`;
}
