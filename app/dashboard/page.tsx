import { getDailyScanCount } from "@/lib/models/scan-limits";
import { getUserSubscription } from "@/lib/models/subscription";
import { getUserAccessInfo } from "@/lib/models/user-access";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import DashboardClient from "./dashboard-client";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  "use server"
  const session = await auth.api.getSession({
    headers: await headers()
  });

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