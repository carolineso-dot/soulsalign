import { ConnectionType, Gender, InterestedIn } from "./matching";

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "nonbinary", label: "Non-binary" },
];

export const INTERESTED_IN_OPTIONS: { value: InterestedIn; label: string }[] = [
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "everyone", label: "Everyone" },
];

export const CONNECTION_OPTIONS: { value: ConnectionType; label: string }[] = [
  { value: "romance", label: "Romance" },
  { value: "friendship", label: "Friendship" },
  { value: "both", label: "Both" },
];

export function genderLabel(g?: string | null): string {
  return GENDER_OPTIONS.find((o) => o.value === g)?.label ?? "—";
}
export function interestedInLabel(v?: string | null): string {
  return INTERESTED_IN_OPTIONS.find((o) => o.value === v)?.label ?? "—";
}
export function connectionLabel(v?: string | null): string {
  return CONNECTION_OPTIONS.find((o) => o.value === v)?.label ?? "—";
}
