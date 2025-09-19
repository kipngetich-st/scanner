"use client";

import { ScanHistory } from "@/components/dashboard/scan-history";
import { ScanForm } from "@/components/dashboard/scan-form";
import { SubscriptionCard } from "@/components/dashboard/subscription-card";
import { Shield, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardClient({
    session,
    role,
    isPro,
    subscription,
    dailyScanCount,
}: any) {
  

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Security Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Welcome  {session.user.name || session.user.email}! Monitor
                and protect your websites.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Today&apos;s Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {dailyScanCount}
                {role === "free" && (
                  <span className="text-sm font-normal text-blue-600"> / 3</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Plan Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100 capitalize">
                {isPro ? "pro" : role}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Active Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  Online
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                  &lt;2min
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* ScanForm is client component and handles its own refresh */}
            <ScanForm userRole={role} dailyScanCount={dailyScanCount} />

            {/* ScanHistory can also trigger refresh internally */}
            <ScanHistory userRole={role} />
          </div>

          <div className="space-y-8">
            <SubscriptionCard
              userRole={role}
              subscription={{
                status: subscription?.status ?? "unknown",
                currentPeriodEnd: subscription?.currentPeriodEnd
                  ? subscription.currentPeriodEnd.toISOString()
                  : undefined,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}