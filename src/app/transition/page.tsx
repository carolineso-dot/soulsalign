import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Transition } from "./Transition";

export default async function TransitionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // New members go to onboarding; returning members to Discover.
  const destination = user.onboardingComplete ? "/discover" : "/onboarding";
  return <Transition destination={destination} />;
}
