'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, Zap, Star, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionCardProps {
  userRole: string;
  subscription?: {
    status: string;
    currentPeriodEnd?: string;
  };
}

export function SubscriptionCard({ userRole, subscription }: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create checkout session. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: 'Error',
          description: 'Failed to access billing portal. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  };

  const isPro = userRole === 'pro' || userRole === 'admin';
  const isActive = subscription?.status === 'active';

  return (
    <Card className={`${isPro ? 'border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20' : 'border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isPro ? (
            <>
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Pro Plan
              </span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Free Plan
              </span>
            </>
          )}
          <Badge variant={isPro ? 'default' : 'secondary'} className={isPro ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' : ''}>
            {isPro ? 'Active' : 'Current'}
          </Badge>
        </CardTitle>
        <CardDescription>
          {isPro 
            ? 'Complete security protection with unlimited scans'
            : 'Basic security scanning with daily limits'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPro && (
          <div className="flex items-center gap-2 p-3 bg-yellow-100 dark:bg-yellow-950/30 rounded-lg">
            <Star className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Premium Protection Active
            </span>
          </div>
        )}
        
        <div className="space-y-2">
          <h4 className="font-medium">Plan Features:</h4>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              {isPro ? 'Unlimited daily scans' : '3 scans per day'}
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              {isPro ? 'Advanced vulnerability detection' : 'Basic vulnerability detection'}
            </li>
            <li className="flex items-center gap-2">
              <Check className={`h-4 w-4 ${isPro ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={!isPro ? 'text-gray-400' : ''}>
                Malware & backdoor detection
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Check className={`h-4 w-4 ${isPro ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={!isPro ? 'text-gray-400' : ''}>
                PDF & CSV report exports
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Check className={`h-4 w-4 ${isPro ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={!isPro ? 'text-gray-400' : ''}>
                Compliance monitoring
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Check className={`h-4 w-4 ${isPro ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={!isPro ? 'text-gray-400' : ''}>
                Priority support
              </span>
            </li>
          </ul>
        </div>

        {subscription?.currentPeriodEnd && (
          <div className="text-sm text-muted-foreground">
            {isActive ? 'Renews' : 'Expires'} on{' '}
            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
          </div>
        )}

        <div className="pt-4">
          {isPro ? (
            <Button 
              variant="outline" 
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              {isLoading ? 'Loading...' : 'Manage Subscription'}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button 
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                {isLoading ? 'Loading...' : 'Upgrade to Pro - $29/month'}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                ✨ 7-day free trial • Cancel anytime • No commitments
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}