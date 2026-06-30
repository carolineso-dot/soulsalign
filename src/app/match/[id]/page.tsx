import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProfileView } from "@/lib/profileView";
import { Celebration } from "./Celebration";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const view = await getProfileView(user, id);
  if (!view) redirect("/discover");
  // Only celebrate genuine mutual matches.
  if (!view.isMutual) redirect(`/profile/${id}`);

  return (
    <Celebration
      targetId={view.id}
      targetName={view.name}
      tierName={view.alignment.tier.name}
      tierNote={view.alignment.tier.note}
      tierColor={view.alignment.tier.color}
    />
  );
}
