import { getDailyScanCount } from "@/lib/models/scan-limits";
import { getUserSubscription } from "@/lib/models/subscription";
import { getUserAccessInfo } from "@/lib/models/user-access";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";
import { getSession } from "@/lib/actions/auth-actions";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/signin");
  }

  const { role, isPro } = await getUserAccessInfo(session.user.id);
  const subscription = await getUserSubscription(session.user.id);
  const dailyScanCount = await getDailyScanCount(session.user.id);

  return (
    <div>
      <DashboardClient
        session={session}
        role={role}
        isPro={isPro}
        subscription={subscription}
        dailyScanCount={dailyScanCount}
      />
    </div>
  )
}